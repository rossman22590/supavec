import type { Metadata } from "next";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { FeaturedSection } from "@/components/sections/featured-section";
import { WhyIBuit } from "@/components/sections/why-i-built";
import { WhatIsRag } from "@/components/sections/what-is-rag";
import { WhyChooseUs } from "@/components/sections/why-supavec";
import { HowToUse } from "@/components/sections/how-to-use";
import { Testimonials } from "@/components/sections/testimonials";
import { Community } from "@/components/sections/community";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { Pricing } from "@/components/sections/pricing";
import { SenjaTestimonials } from "@/components/sections/senja-testimonials";
import { Statistics } from "@/components/sections/statistics";

export const metadata: Metadata = {
  description:
    "Build powerful RAG applications with any data source, at any scale.",
};

export default async function Home() {
  return (
    <main>
      <Header />
      <Hero />
      {/* <FeaturedSection /> */}
      {/* <WhyIBuit /> */}
      <WhatIsRag />
      <WhyChooseUs />
      {/* <SenjaTestimonials /> */}
      {/* <HowToUse /> */}
      <Statistics />
      <Testimonials />
      <Pricing className="mt-[-49px] bg-background relative z-10" />
      <Community />
      <CTA />
      <Footer />
    </main>
  );
}
