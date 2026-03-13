import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ─── Master Admin Account ─────────────────────────────
  const rawPassword = process.env.ADMIN_SEED_PASSWORD || "VerexAdmin2026!"
  const adminPassword = await bcrypt.hash(rawPassword, 12)
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

  // ─── Clean up test / demo accounts ────────────────────
  const demoDeleted = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: "@test.com" } },
        { email: { contains: "@demo.com" } },
        { isDemo: true },
      ],
    },
  })
  if (demoDeleted.count > 0) {
    console.log(`🧹 Removed ${demoDeleted.count} test/demo accounts`)
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
