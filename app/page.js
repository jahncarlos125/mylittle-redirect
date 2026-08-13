import InviteOverlay from '@/components/InviteOverlay'
import Landing from '@/components/Landing'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <>
      <InviteOverlay />
      <Landing>
        <Nav />
        <main id="conteudo" className="landing">
          <Hero />
          {/* Demais secoes da landing entram nas proximas tasks (T5-T6) */}
        </main>
      </Landing>
    </>
  )
}
