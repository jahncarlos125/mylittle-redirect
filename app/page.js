import InviteOverlay from '@/components/InviteOverlay'
import Landing from '@/components/Landing'
import Nav from '@/components/Nav'

export default function Home() {
  return (
    <>
      <InviteOverlay />
      <Landing>
        <Nav />
        <main id="conteudo" className="landing">
          <h1 data-animate="up" style={{ color: 'var(--teal)', padding: '64px' }}>Meu Cuidado</h1>
          {/* Secoes da landing entram nas proximas tasks (T4-T6) */}
        </main>
      </Landing>
    </>
  )
}
