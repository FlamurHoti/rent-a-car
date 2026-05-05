/**
 * Graceful Shutdown module
 *
 * Handles SIGTERM (Render redeploy) and SIGINT (Ctrl+C / local dev) cleanly.
 * Shutdown sequence:
 *   1. Set shuttingDown flag so health/ready returns 503 (load balancer drains)
 *   2. Close idle keep-alive connections immediately (Node 18+)
 *   3. server.close() — stop accepting new TCP connections
 *   4. Wait up to 25s for in-flight requests to finish
 *   5. Disconnect Prisma connection pool
 *   6. Run any registered extra cleanup callbacks
 *   7. Exit 0
 *
 * Safety net: force SIGKILL at 28s so Render never reaches its own 30s limit
 * with an ungraceful kill that could corrupt writes.
 */

'use strict';

let shuttingDown = false;
let shutdownAlreadyTriggered = false;

/** Returns true after a shutdown signal has been received. */
function isShuttingDown() {
  return shuttingDown;
}

/**
 * Registers graceful shutdown handlers on the given HTTP server + Prisma client.
 *
 * @param {import('http').Server} server        - The Node http.Server instance
 * @param {import('@prisma/client').PrismaClient} prisma - The base PrismaClient (rawPrisma)
 * @param {Array<() => Promise<void>>} [extras] - Optional extra cleanup callbacks
 */
function setupGracefulShutdown(server, prisma, extras = []) {
  async function shutdown(signal) {
    // Guard: if two signals arrive fast (e.g. SIGTERM + SIGINT), run shutdown once
    if (shutdownAlreadyTriggered) return;
    shutdownAlreadyTriggered = true;
    shuttingDown = true;

    console.log(`[Shutdown] Signal received: ${signal}. Initiating graceful shutdown...`);

    // Force-kill guard: if we have not exited in 28s, something is stuck.
    // .unref() ensures this timer does not prevent the event loop from exiting
    // on its own if everything completes sooner.
    const forceKill = setTimeout(() => {
      console.error('[Shutdown] TIMEOUT — forced kill after 28s. Exiting with code 1.');
      process.exit(1);
    }, 28_000);
    forceKill.unref();

    try {
      // ── Step 1: Close idle keep-alive connections ──────────────────────────
      // server.close() alone does not terminate keep-alive connections that are
      // idle (between requests). closeIdleConnections() handles those immediately.
      // Available since Node.js 18.2 — we are on Node 19.
      if (typeof server.closeIdleConnections === 'function') {
        server.closeIdleConnections();
        console.log('[Shutdown] Idle keep-alive connections closed.');
      }

      // ── Step 2: Stop accepting new TCP connections ─────────────────────────
      // server.close() fires the callback once all active requests have ended,
      // or when our 25s timeout fires — whichever comes first.
      await new Promise((resolve) => {
        // Timeout: do not wait longer than 25s for in-flight requests.
        // Render gives us 30s total; we keep a 5s margin.
        const waitTimeout = setTimeout(() => {
          console.warn('[Shutdown] 25s wait elapsed — forcing close of remaining connections.');
          if (typeof server.closeAllConnections === 'function') {
            server.closeAllConnections(); // Node 18.2+ — destroy remaining connections
          }
          resolve();
        }, 25_000);
        waitTimeout.unref();

        server.close((err) => {
          clearTimeout(waitTimeout);
          if (err) {
            // EADDRINUSE or similar — log but keep going
            console.warn('[Shutdown] server.close() error (non-fatal):', err.message);
          } else {
            console.log('[Shutdown] HTTP server closed — all in-flight requests finished.');
          }
          resolve();
        });
      });

      // ── Step 3: Disconnect Prisma ──────────────────────────────────────────
      // Must use the base PrismaClient (rawPrisma), not the $extends wrapper.
      console.log('[Shutdown] Disconnecting Prisma connection pool...');
      await prisma.$disconnect();
      console.log('[Shutdown] Prisma disconnected.');

      // ── Step 4: Run extra cleanup callbacks ───────────────────────────────
      // Future: cron jobs, Redis clients, WebSocket servers, etc.
      for (const cleanupFn of extras) {
        try {
          await cleanupFn();
        } catch (cleanupErr) {
          console.error('[Shutdown] Extra cleanup error (non-fatal):', cleanupErr.message);
        }
      }

      // ── Done ───────────────────────────────────────────────────────────────
      clearTimeout(forceKill);
      console.log('[Shutdown] Complete. Exiting with code 0.');
      process.exit(0);

    } catch (err) {
      console.error('[Shutdown] Unexpected error during shutdown:', err);
      clearTimeout(forceKill);
      process.exit(1);
    }
  }

  // ── Signal handlers ──────────────────────────────────────────────────────
  process.on('SIGTERM', () => shutdown('SIGTERM')); // Render redeploy, Docker stop
  process.on('SIGINT',  () => shutdown('SIGINT'));  // Ctrl+C in local dev

  // ── Crash guards ─────────────────────────────────────────────────────────
  // These catch bugs that would otherwise silently kill the process mid-request,
  // leaving Prisma transactions open and HTTP responses unset.

  process.on('uncaughtException', (err) => {
    // After uncaughtException the process is in an undefined state.
    // We log and shut down immediately rather than trying to serve more requests.
    console.error('[Process] UNCAUGHT EXCEPTION — process is unstable:', err);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Process] UNHANDLED PROMISE REJECTION:', reason, 'Promise:', promise);
    shutdown('unhandledRejection');
  });

  console.log('[Shutdown] Handlers registered (SIGTERM, SIGINT, uncaughtException, unhandledRejection).');
}

module.exports = { setupGracefulShutdown, isShuttingDown };
