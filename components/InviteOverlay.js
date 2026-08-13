// Markup estatico do overlay de convite. Sem comportamento aqui: a logica
// (parse do token, deep link, timer de 2500ms) roda no script inline de
// app/layout.js, que precisa executar antes da hidratacao. Ver lib/inviteToken.js
// para o formato do deep link (mylittle://invite/<token>).
//
// .invite-fallback tem role="status"+aria-live="polite": ela comeca com
// display:none e o script inline troca pra display:block apos 2500ms sem
// resposta do app (ver app/layout.js). Sem aria-live, leitor de tela nunca
// percebe que o fallback apareceu (Task 10 - auditoria a11y).
export default function InviteOverlay() {
  return (
    <div id="invite-overlay" className="invite-overlay">
      <div className="invite-spinner" aria-hidden="true" />
      <p className="invite-overlay__text">Abrindo o convite no aplicativo Meu Cuidado…</p>
      <div className="invite-fallback" role="status" aria-live="polite" style={{ display: 'none' }}>
        <p className="invite-fallback__hint">Se o aplicativo não abrir automaticamente, toque no botão abaixo:</p>
        <a id="invite-fallback" className="invite-fallback__link" href="#">Abrir no aplicativo</a>
      </div>
    </div>
  )
}
