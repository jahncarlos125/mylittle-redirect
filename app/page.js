import InviteOverlay from '@/components/InviteOverlay'
import Landing from '@/components/Landing'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Manifesto from '@/components/Manifesto'
import HowItWorks from '@/components/HowItWorks'
import Features from '@/components/Features'
import ContactForm from '@/components/ContactForm'
import Faq from '@/components/Faq'
import Footer from '@/components/Footer'
import { SITE_TITLE, SITE_DESCRIPTION } from '@/lib/site'

export const metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
}

export default function Home() {
  return (
    <>
      <InviteOverlay />
      <Landing>
        <Nav />
        <main id="conteudo">
          <Hero />
          <Manifesto />
          <HowItWorks />
          <Features />
          <ContactForm />
          <Faq />
        </main>
        <Footer />
      </Landing>
    </>
  )
}
