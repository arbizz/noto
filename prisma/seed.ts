// import { prisma } from "@/lib/prisma"
// import bcrypt from "bcryptjs"

// async function main() {
//   const hashedAdmin = await bcrypt.hash("noteasypass", 10)
//   const hashedPass = await bcrypt.hash("securepass", 10)

//   await prisma.user.createMany({
//     data: [
//       {
//         name: "Azzurri",
//         email: "admin@gmail.com",
//         password: hashedAdmin,
//         role: "admin"
//       },
//       {
//         name: "PlayerOne",
//         email: "chosenone@gmail.com",
//         password: hashedPass
//       }
//     ]
//   })
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })