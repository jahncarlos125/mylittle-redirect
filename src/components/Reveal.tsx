import { useEffect, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface RevealProps {
  children: ReactNode
  delay?: number
}

/**
 * Fade-up reveal wrapper for React islands.
 *
 * - Respects `prefers-reduced-motion`: renders children with no animation at all.
 * - Never leaves content stuck invisible: until the component has mounted on the
 *   client (i.e. during SSR output and the brief instant before hydration runs),
 *   it renders a plain, fully-visible wrapper — the `opacity:0` initial state is
 *   only applied once React has taken over in the browser, so a slow/failed
 *   hydration (e.g. under `client:visible`) never hides real content.
 */
export default function Reveal({ children, delay = 0 }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (prefersReducedMotion || !mounted) {
    return <div>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
