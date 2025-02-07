"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  const steps = [
    {
      title: "Route Optimization",
      titleColor: "text-cyan-400",
      borderColor: "hover:border-cyan-400",
      features: ["Real Time Route Analysis", "Predictive Travel Patterns", "Smart Waypoint Selection"],
    },
    {
      title: "Dynamic Adaptation",
      titleColor: "text-purple-400",
      borderColor: "hover:border-purple-500",
      features: ["Real-time Route Adjustments", "Contextual Recommendations", "Intelligent Risk Assessment"],
    },
    {
      title: "Experience Enhancement",
      titleColor: "text-blue-400",
      borderColor: "hover:border-blue-500",
      features: ["Curated Discoveries", "Personalized Insights", "Community Integration"],
    },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden px-6 pt-28">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#0a0a0a,_#050505,_#000000)] animate-pulse-slow" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Neon Moving Borders */}
      <motion.div
        className="absolute inset-0 border-[3px] border-transparent rounded-xl"
        animate={{
          borderColor: [
            "rgba(0,255,255,0.2)",
            "rgba(0,0,255,0.3)",
            "rgba(255,0,255,0.2)",
            "rgba(0,255,255,0.2)",
          ],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
      />

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-4xl mx-auto text-center z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Elevate Your <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text animate-glow">
            Travel Experience
          </span>
        </h1>
        <div className="inline-block mb-4 px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-cyan-500/50 transition-all duration-500">
          <p className="text-xl text-white animate-moveRight"> Fully Autonomous Travel Concierge</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/journey">
            <motion.button
              className="relative px-10 py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white rounded-full font-semibold transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              Begin Your Journey
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Grid Section with Features */}
      <motion.div
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-center text-white z-10 px-4 md:px-0"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        {steps.map((step, index) => (
          <div
            key={index}
            className={`p-6 md:p-8 border border-white/10 rounded-lg backdrop-blur-md transition-all duration-300 ${step.borderColor}`}
          >
            <h3 className={`text-xl font-semibold mb-4 ${step.titleColor}`}>{step.title}</h3>
            <ul className="text-white space-y-2">
              {step.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default Hero;