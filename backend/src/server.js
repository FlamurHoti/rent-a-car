const app    = require('./app');
const config = require('./config');
const { rawPrisma }              = require('./database');
const { setupGracefulShutdown }  = require('./lib/gracefulShutdown');

// app.listen() returns a Node http.Server — we need the reference to call
// server.close() during graceful shutdown.
const server = app.listen(config.port, () => {
  console.log(
    `[Server] Rent-a-Car API running on port ${config.port} [${config.nodeEnv}]`
  );
});

// Register SIGTERM, SIGINT, uncaughtException, unhandledRejection handlers.
// Pass rawPrisma (the base PrismaClient) — it owns the actual connection pool.
setupGracefulShutdown(server, rawPrisma);
