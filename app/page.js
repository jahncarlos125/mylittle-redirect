import InviteOverlay from '@/components/InviteOverlay'

export default function Home() {
  return (
    <>
      <InviteOverlay />
      <main id="conteudo" className="landing">
        <h1 style={{ color: 'var(--teal)', padding: '64px' }}>Meu Cuidado</h1>
        {/* Secoes da landing entram nas proximas tasks (T3-T6) */}
      </main>
    </>
  )
}
