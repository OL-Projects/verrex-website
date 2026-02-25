"use client"

import Image from "next/image"

interface CertItem {
  name: string
  src: string
  darkSrc?: string
}

const certs: CertItem[] = [
  { name: "ENERGY STAR", src: "/images/certifications/energy-star.svg" },
  { name: "NFRC", src: "/images/certifications/nfrc.svg" },
  { name: "CSA", src: "/images/certifications/csa-light.svg", darkSrc: "/images/certifications/csa-dark.svg" },
  { name: "CE", src: "/images/certifications/ce-light.svg", darkSrc: "/images/certifications/ce-dark.svg" },
]

interface CertificationsBarProps {
  variant?: "compact" | "full"
  className?: string
}

export function CertificationsBar({ variant = "compact", className = "" }: CertificationsBarProps) {
  const isCompact = variant === "compact"
  const imgH = isCompact ? "h-8 w-auto" : "h-12 w-auto"
  const gap = isCompact ? "gap-6" : "gap-10"

  return (
    <div className={`flex flex-wrap items-center justify-center ${gap} ${className}`}>
      {certs.map((cert) => (
        <div key={cert.name} className={`flex flex-col items-center ${isCompact ? "gap-1" : "gap-2"} opacity-80 hover:opacity-100 transition-opacity`}>
          {cert.darkSrc ? (
            <>
              <Image src={cert.src} alt={cert.name} width={isCompact ? 48 : 64} height={isCompact ? 32 : 48} className={`${imgH} block dark:hidden`} />
              <Image src={cert.darkSrc} alt={cert.name} width={isCompact ? 48 : 64} height={isCompact ? 32 : 48} className={`${imgH} hidden dark:block`} />
            </>
          ) : (
            <Image src={cert.src} alt={cert.name} width={isCompact ? 48 : 64} height={isCompact ? 32 : 48} className={imgH} />
          )}
          {!isCompact && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{cert.name}</span>
          )}
        </div>
      ))}
    </div>
  )
}
