"use client";
import { useState } from "react";
import Link from "next/link";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Subscribed successfully! ✅");
        setEmail("");
      } else {
        setMessage(data.error || "Subscription failed.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <footer className="bg-gradient-to-br from-[#13192E] to-[#1A1F35] text-white relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">XploreX</h3>
            <p className="text-gray-400 mb-4">Your Fully Autonomous Travel Concierge</p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-3 text-cyan-400">Quick Links</h4>
            <ul className="space-y-2 text-white/70">
              {["Home", "Contact"].map((link, idx) => (
                <li key={idx} className="hover:text-cyan-400 transition-colors duration-300">
                  <Link href={`/${link.toLowerCase()}`}>{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-3 text-blue-400">Stay Updated</h4>
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-2 border border-white/20">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-transparent focus:outline-none text-white w-full placeholder-gray-400"
              />
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 px-4 py-2 rounded-lg text-white"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {message && <p className="text-sm mt-2 text-gray-300">{message}</p>}
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-3 text-purple-400">Contact Us</h4>
            <p className="text-white/70">Email: contact@xplorex.travel</p>
            <p className="text-white/70">Phone: +91 8529204207</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm text-white/50">
          © {new Date().getFullYear()} XploreX.travel - All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;