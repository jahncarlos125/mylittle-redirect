import InviteOverlay from '@/components/InviteOverlay'
import Landing from '@/components/Landing'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Manifesto from '@/components/Manifesto'
import HowItWorks from '@/components/HowItWorks'

export default function Home() {
  return (
    <>
      <InviteOverlay />
      <Landing>
        <Nav />
        <main id="conteudo" className="landing">
          <Hero />
          <Manifesto />
          <HowItWorks />
          {/* Demais secoes da landing entram nas proximas tasks (T6) */}
        </main>
      </Landing>
    </>
  )
}
