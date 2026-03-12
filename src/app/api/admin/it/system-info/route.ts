import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import os from "os"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const mem = process.memoryUsage()
  const uptime = process.uptime()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const cpus = os.cpus()
  const loadAvg = os.loadavg()

  // Calculate CPU usage from cpus
  const cpuUsage = cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
    const idle = cpu.times.idle
    return Math.round(((total - idle) / total) * 100)
  })
  const avgCpuUsage = Math.round(cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length)

  // Environment variables audit
  const envKeys = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "AUTH_TRUST_HOST",
    "RESEND_API_KEY",
    "NEXT_PUBLIC_BASE_URL",
    "BLOB_READ_WRITE_TOKEN",
    "NEXTAUTH_URL",
  ]
  const envStatus = envKeys.map((key) => ({
    key,
    set: !!process.env[key],
    // Show first/last 3 chars for non-secret keys, or just length
    preview: process.env[key]
      ? key.includes("SECRET") || key.includes("PASSWORD") || key.includes("TOKEN") || key.includes("API_KEY")
        ? `••• (${process.env[key]!.length} chars)`
        : process.env[key]!.length > 10
          ? `${process.env[key]!.slice(0, 6)}•••${process.env[key]!.slice(-4)}`
          : "•••"
      : "NOT SET",
  }))

  return NextResponse.json({
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptime: Math.round(uptime),
      uptimeFormatted: formatUptime(uptime),
    },
    memory: {
      rss: formatBytes(mem.rss),
      heapUsed: formatBytes(mem.heapUsed),
      heapTotal: formatBytes(mem.heapTotal),
      external: formatBytes(mem.external),
      arrayBuffers: formatBytes(mem.arrayBuffers),
      rssRaw: mem.rss,
      heapUsedRaw: mem.heapUsed,
      heapTotalRaw: mem.heapTotal,
    },
    system: {
      hostname: os.hostname(),
      osType: os.type(),
      osRelease: os.release(),
      osPlatform: os.platform(),
      cpuModel: cpus[0]?.model || "Unknown",
      cpuCores: cpus.length,
      cpuUsagePercent: avgCpuUsage,
      totalMemory: formatBytes(totalMem),
      freeMemory: formatBytes(freeMem),
      usedMemoryPercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
      loadAverage: loadAvg.map((l) => l.toFixed(2)),
    },
    environment: envStatus,
    framework: {
      nextjs: getNextVersion(),
      prisma: getPrismaVersion(),
      typescript: getTsVersion(),
    },
    timestamp: new Date().toISOString(),
  })
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(" ")
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function getNextVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require("next/package.json")
    return pkg.version || "unknown"
  } catch {
    return "unknown"
  }
}

function getPrismaVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require("@prisma/client/package.json")
    return pkg.version || "unknown"
  } catch {
    return "unknown"
  }
}

function getTsVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require("typescript/package.json")
    return pkg.version || "unknown"
  } catch {
    return "unknown"
  }
}
