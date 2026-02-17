"use client"

import React from "react"

/**
 * LIGHTWEIGHT MOTION COMPONENTS
 * Replaced heavy Framer Motion whileInView with CSS animations.
 * Only uses Intersection Observer for the hero section.
 * All other animations use pure CSS with animation-delay.
 */

// Simple fade-in using CSS animation classes
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  const delayClass = delay <= 0 ? "animate-fade-in" :
    delay <= 0.15 ? "animate-fade-in-delay-1" :
    delay <= 0.3 ? "animate-fade-in-delay-2" :
    "animate-fade-in-delay-3"

  return (
    <div className={`${delayClass} ${className}`}>
      {children}
    </div>
  )
}

// Fade in from left - simplified to regular fade
export function FadeInLeft({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  )
}

// Fade in from right - simplified to regular fade
export function FadeInRight({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div className={`animate-fade-in-delay-2 ${className}`}>
      {children}
    </div>
  )
}

// Scale in - simplified
export function ScaleIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  )
}

// Stagger container - now just a simple div (no Intersection Observer)
export function StaggerContainer({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Stagger item - now just a simple div
export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Animated counter - simple span
export function AnimatedCounter({
  value,
  suffix = "",
  className = "",
}: {
  value: string
  suffix?: string
  className?: string
}) {
  return (
    <span className={className}>
      {value}{suffix}
    </span>
  )
}

// Hover card - pure CSS hover instead of Framer Motion
export function HoverCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`transition-transform duration-200 hover:-translate-y-1 ${className}`}>
      {children}
    </div>
  )
}

// Section wrapper - simple div with no Intersection Observer
export function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      {children}
    </section>
  )
}

// Page transition wrapper - simple div
export function PageTransition({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  )
}
