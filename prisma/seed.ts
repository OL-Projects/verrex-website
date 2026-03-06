import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const demoUsers = [
  { name: "Admin User", email: "admin@verex.ca", password: "admin123", role: "admin", company: "VEREX Industries" },
  { name: "Jean Tremblay", email: "client@verex.ca", password: "client123", role: "client", company: "Tremblay Residences" },
  { name: "Mike Chen", email: "contractor@verex.ca", password: "contractor123", role: "contractor", company: "Chen Construction" },
  { name: "Sarah Wilson", email: "supplier@verex.ca", password: "supplier123", role: "supplier", company: "Wilson Glass Supply" },
  { name: "David Brown", email: "partner@verex.ca", password: "partner123", role: "partner", company: "Brown Installations" },
  { name: "Lisa Park", email: "inspector@verex.ca", password: "inspector123", role: "inspector", company: "Park Quality Assurance" },
]

async function main() {
  console.log("🌱 Seeding demo users...")
  for (const user of demoUsers) {
    const hashed = await bcrypt.hash(user.password, 12)
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: hashed, name: user.name, role: user.role, company: user.company, isDemo: true },
      create: { name: user.name, email: user.email, password: hashed, role: user.role, company: user.company, isDemo: true },
    })
    console.log(`  ✅ ${user.role}: ${user.email}`)
  }
  console.log("🎉 Seed complete!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
