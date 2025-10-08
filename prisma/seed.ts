import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if super admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.SUPER_ADMIN },
  });

  if (existingAdmin) {
    console.log('✅ Super admin already exists, skipping...');
    return;
  }

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@church.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      name: 'Super Administrator',
      phone: '+1234567890',
      mustChangePassword: false,
    },
  });

  console.log('✅ Super admin user created successfully!');
  console.log('📧 Email:', superAdmin.email);
  console.log('🔑 Password: admin123');
  console.log('👤 Role:', superAdmin.role);
  console.log('🆔 User ID:', superAdmin.id);

  // Create a default zone
  const defaultZone = await prisma.zone.create({
    data: {
      name: 'Main Zone',
      description: 'Default zone for the church',
      coordinator: {
        connect: { id: superAdmin.id },
      },
    },
  });

  console.log('✅ Default zone created:', defaultZone.name);

  // Create a default cell
  const defaultCell = await prisma.cell.create({
    data: {
      name: 'Main Cell',
      leader: {
        connect: { id: superAdmin.id },
      },
      zone: {
        connect: { id: defaultZone.id },
      },
    },
  });

  console.log('✅ Default cell created:', defaultCell.name);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
