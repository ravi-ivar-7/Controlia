
import ScrollUp from "@/components/Common/ScrollUp";

import Hero from "@/components/Hero";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "XploreX - Fully Autonomous Travel Concierge | Smart Travel PlanningS",
  description: "Experience seamless road trip planning with XploreX.travel, your AI-powered travel concierge. Get personalized recommendations for food, stays, and attractions with real-time updates for weather and traffic.",
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
    </>
  );
}
