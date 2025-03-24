import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'account@thecasualtech.com' },
    update: {},
    create: {
      email: 'account@thecasualtech.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      name: 'Super Admin',
      phone: 'N/A',
    },
  });

  console.log('Super admin user created/updated:', superAdmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
