const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schoolCount = await prisma.school.count();
  if (schoolCount === 0) {
    const newSchool = await prisma.school.create({
      data: {
        name: 'Demo School',
        address: '123 Edu Lane',
        contactInfo: 'admin@demoschool.com'
      }
    });
    console.log('Created Demo School:', newSchool.id);
  } else {
    console.log('School already exists');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
