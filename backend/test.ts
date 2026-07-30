import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ include: { parentProfile: { include: { students: true } } } });
  console.log(JSON.stringify(users, null, 2));
  
  const students = await prisma.student.findMany();
  console.log('Students:', JSON.stringify(students, null, 2));
}
main();
