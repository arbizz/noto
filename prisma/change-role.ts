import { prisma } from '@/lib/prisma'
import { UserRole } from '@/generated/prisma/enums'

async function main() {
  const email = 'aryabilalazzurri00@gmail.com'

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true }
  })

  if (!user) {
    console.log('❌ User not found. Please login first to create the user.')
    return
  }

  const newRole = user.role === UserRole.admin ? UserRole.user : UserRole.admin

  await prisma.user.update({
    where: { email },
    data: { role: newRole }
  })

  console.log('✅ Role changed successfully!')
  console.log('━'.repeat(50))
  console.log(`📧 Email: ${user.email}`)
  console.log(`👤 Name: ${user.name || 'N/A'}`)
  console.log(`🔄 Old Role: ${user.role.toUpperCase()}`)
  console.log(`✨ New Role: ${newRole.toUpperCase()}`)
  console.log('━'.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })