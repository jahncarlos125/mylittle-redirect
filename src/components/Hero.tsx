import { motion, useReducedMotion, type Variants } from 'framer-motion'
import './Hero.css'

const CONTAINER_VARIANTS: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
}

const ITEM_VARIANTS_REDUCED: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion()
  const item = prefersReducedMotion ? ITEM_VARIANTS_REDUCED : ITEM_VARIANTS

  return (
    <>
      <div className="hero-glow" aria-hidden="true" />
      <motion.section
        className="hero"
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="show"
      >
        <div className="hero-left">
          <motion.span className="hero-badge" variants={item}>
            <span className="hero-badge-dot" aria-hidden="true" />
            Em teste fechado · Android
          </motion.span>
          <motion.h1 variants={item}>
            Nunca esqueça um remédio — o seu e o de{' '}
            <span className="hero-hl">quem você ama</span>.
          </motion.h1>
          <motion.p className="hero-sub" variants={item}>
            Lembretes na hora certa, agenda do dia e o cuidado da família inteira num só app.
          </motion.p>
          <motion.div className="hero-cta" variants={item}>
            <a className="hero-btn1" href="#testar">
              Quero testar →
            </a>
            <a className="hero-btn2" href="#como-funciona">
              Como funciona
            </a>
          </motion.div>
          <motion.div className="hero-stat" variants={item}>
            <div>
              <b>3 toques</b>
              <span>pra cadastrar</span>
            </div>
            <div>
              <b>Família</b>
              <span>num só lugar</span>
            </div>
            <div>
              <b>Claro/escuro</b>
              <span>do seu jeito</span>
            </div>
          </motion.div>
        </div>
        <div className="hero-right">
          <motion.div className="hero-phone-wrap" variants={item}>
            <img
              className="hero-phone-img"
              src="/screenshots/hoje-light.webp"
              alt='Tela "Hoje" do app Meu Cuidado, com a lista de lembretes de remédios do dia'
              width={272}
              height={605}
            />
          </motion.div>
        </div>
      </motion.section>
    </>
  )
}
