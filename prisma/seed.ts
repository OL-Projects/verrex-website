import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ─── Master Admin Account ─────────────────────────────
  const adminPassword = await bcrypt.hash("VerexAdmin2026!", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@verex.ca" },
    update: { role: "admin", name: "VEREX Admin" },
    create: {
      name: "VEREX Admin",
      email: "admin@verex.ca",
      password: adminPassword,
      role: "admin",
      company: "VEREX Industries Inc.",
      phone: "(514) 992-4080",
    },
  })
  console.log(`✅ Admin account: ${admin.email} (${admin.role})`)

  // ─── Ensure any existing admin@verex.ca is role=admin ─
  await prisma.user.updateMany({
    where: { email: "admin@verex.ca" },
    data: { role: "admin" },
  })

  // ─── Clean up test accounts (optional) ────────────────
  const testCount = await prisma.user.count({
    where: { email: { contains: "@test.com" } },
  })
  if (testCount > 0) {
    console.log(`⚠️  Found ${testCount} test accounts (@test.com)`)
  }

  const userCount = await prisma.user.count()
  const clientCount = await prisma.user.count({ where: { role: "client" } })
  const adminCount = await prisma.user.count({ where: { role: "admin" } })
  console.log(`📊 Total users: ${userCount} (${adminCount} admin, ${clientCount} clients)`)
  console.log("✅ Seed complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
