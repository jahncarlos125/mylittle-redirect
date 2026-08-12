import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import './Gallery.css'

interface Screen {
  src: string
  alt: string
}

const COLUMN_A: Screen[] = [
  {
    src: '/screenshots/hoje-light.webp',
    alt: 'Tela "Hoje" do app Meu Cuidado, com a lista de lembretes de remédios do dia, no tema claro',
  },
  {
    src: '/screenshots/pessoas-dark.webp',
    alt: 'Tela de pessoas cuidadas no app Meu Cuidado, no tema escuro',
  },
]

const COLUMN_B: Screen[] = [
  {
    src: '/screenshots/pessoas-light.webp',
    alt: 'Tela de pessoas cuidadas no app Meu Cuidado, com a lista de familiares acompanhados, no tema claro',
  },
  {
    src: '/screenshots/editar-light.webp',
    alt: 'Tela de edição de remédio no app Meu Cuidado, com dose e horário',
  },
]

const COLUMN_C: Screen[] = [
  {
    src: '/screenshots/remedios-light.webp',
    alt: 'Tela de remédios cadastrados no app Meu Cuidado, com doses e horários organizados',
  },
  {
    src: '/screenshots/hoje-dark.webp',
    alt: 'Tela "Hoje" do app Meu Cuidado, com a lista de lembretes de remédios do dia, no tema escuro',
  },
]

function PhoneFrame({ screen, priority = false }: { screen: Screen; priority?: boolean }) {
  return (
    <div className="phone-frame">
      <img
        src={screen.src}
        alt={screen.alt}
        width={640}
        height={1423}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  )
}

/** Vertical parallax column: offsets slightly at its own speed as the section scrolls through view. */
function ParallaxColumn({
  screens,
  speed,
  className,
}: {
  screens: Screen[]
  speed: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed])

  return (
    <motion.div ref={ref} className={`gallery__col ${className ?? ''}`} style={{ y }}>
      {screens.map((screen) => (
        <PhoneFrame key={screen.src} screen={screen} />
      ))}
    </motion.div>
  )
}

function StaticColumn({ screens, className }: { screens: Screen[]; className?: string }) {
  return (
    <div className={`gallery__col ${className ?? ''}`}>
      {screens.map((screen) => (
        <PhoneFrame key={screen.src} screen={screen} />
      ))}
    </div>
  )
}

export default function Gallery() {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const useParallax = mounted && !prefersReducedMotion

  return (
    <section className="gallery" id="galeria" aria-labelledby="gallery-title">
      <div className="gallery__intro">
        <h2 id="gallery-title">Conheça as telas</h2>
        <p>Um passeio rápido pelo app — simples, claro e feito para o dia a dia.</p>
      </div>

      <div className="gallery__viewport">
        {useParallax ? (
          <>
            <ParallaxColumn screens={COLUMN_A} speed={20} className="gallery__col--a" />
            <ParallaxColumn screens={COLUMN_B} speed={-36} className="gallery__col--b" />
            <ParallaxColumn screens={COLUMN_C} speed={16} className="gallery__col--c" />
          </>
        ) : (
          <>
            <StaticColumn screens={COLUMN_A} className="gallery__col--a" />
            <StaticColumn screens={COLUMN_B} className="gallery__col--b" />
            <StaticColumn screens={COLUMN_C} className="gallery__col--c" />
          </>
        )}
      </div>
    </section>
  )
}
