import Footer from "./footer/footer"
import Hero from "./hero/hero"
import Journey from "./journey/journey"
import Purpose from "./purpose/purpose"
import CallToAction from "./signup/cta"
import Subscription from "./subscription/subscription"
import Testimonials from "./testimonials/testimonal"


const Home = () => {
  return (
    <>
      <Hero />
      <Purpose /> 
      <Journey />
      <Subscription />
      <Testimonials />
      <CallToAction />
      <Footer />
    </>
  )
}

export default Home
