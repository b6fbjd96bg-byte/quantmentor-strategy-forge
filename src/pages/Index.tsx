import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Performance from '@/components/Performance';
import Security from '@/components/Security';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import DisclaimerBanner from '@/components/DisclaimerBanner';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DisclaimerBanner />
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Performance />
      <Security />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
