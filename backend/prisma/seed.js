/**
 * NO SEED DATA - Rent-a-Car policy
 *
 * Users and cars are created ONLY through the application:
 * - Users: POST /api/auth/register (creates company + first user as OWNER)
 * - Cars:  POST /api/cars (authenticated)
 *
 * This script does not insert any predefined data. The database starts empty
 * after migrations (db push / migrate). Do not add default users or cars here.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('No seed data inserted. Users and cars are created via API only.');
}

main()
  .finally(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
