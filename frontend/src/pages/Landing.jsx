import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  QrCode,
  ArrowRight, 
  CheckCircle2, 
  Clock,
  MapPin,
  Lock,
  LayoutDashboard,
  Box,
  User
} from "lucide-react";
import VaultaLogo from "../components/VaultaLogo";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white"} border-b border-gray-200`}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex justify-between items-center">
          <VaultaLogo size={26} />
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link to="/login" className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-14">
        {/* Hero — compact, left-aligned */}
        <section className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
            <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
              {/* Text */}
              <div className="lg:w-5/12 flex-shrink-0">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span className="text-xs font-medium text-orange-600">Open source</span>
                </div>
                <h1 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-gray-900 leading-[1.2] mb-4">
                  Smart locker management for campuses
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md">
                  Assign lockers, generate access codes, and track usage — all from one dashboard. Built for university campuses.
                </p>
                <div className="flex items-center gap-3">
                  <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
                    Try it now <ArrowRight size={15} />
                  </Link>
                  <Link to="/login" className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Product preview — locker grid */}
              <motion.div 
                initial="hidden" animate="visible" variants={fadeIn}
                className="lg:w-7/12 w-full"
              >
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-1.5 shadow-sm">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Mock header bar */}
                    <div className="h-10 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="px-3 py-0.5 bg-gray-50 rounded-md border border-gray-200 text-[10px] text-gray-400">vaulta.app/lockers</div>
                      </div>
                    </div>
                    {/* Mock sidebar + content */}
                    <div className="flex">
                      {/* Mini sidebar */}
                      <div className="hidden sm:flex w-36 border-r border-gray-100 flex-col py-3 px-2 bg-white">
                        <div className="flex items-center gap-2 px-2 mb-4">
                          <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
                            <Lock size={10} className="text-white" />
                          </div>
                          <span className="text-xs font-semibold text-gray-800">Vaulta</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 text-[11px]">
                          <LayoutDashboard size={12} /> <span>Dashboard</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 text-orange-600 bg-orange-50 rounded text-[11px] font-medium">
                          <Box size={12} /> <span>Lockers</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 text-[11px]">
                          <User size={12} /> <span>My Booking</span>
                        </div>
                      </div>
                      {/* Content area */}
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 h-7 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-2">
                            <span className="text-[10px] text-gray-400">Search lockers...</span>
                          </div>
                          <div className="h-7 px-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                            <span className="text-[10px] text-gray-400">All Locations</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "L-101", loc: "Library Block", status: "Available" },
                            { id: "L-102", loc: "Library Block", status: "Available" },
                            { id: "L-103", loc: "Library Block", status: "Maintenance" },
                            { id: "L-201", loc: "CSE Block", status: "Available" },
                            { id: "L-202", loc: "CSE Block", status: "Available" },
                            { id: "L-203", loc: "CSE Block", status: "Available" },
                            { id: "L-301", loc: "Admin Block", status: "Available" },
                            { id: "L-302", loc: "Admin Block", status: "Available" },
                          ].map((l) => (
                            <div key={l.id} className="border border-gray-200 rounded-lg p-2.5 flex flex-col">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-semibold text-gray-800">{l.id}</span>
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                                  l.status === "Available" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${l.status === "Available" ? "bg-green-500" : "bg-orange-500"}`}></span>
                                  {l.status}
                                </span>
                              </div>
                              <span className="text-[9px] text-gray-400 mb-2 flex items-center gap-0.5">
                                <MapPin size={7} /> {l.loc}
                              </span>
                              <div className={`text-center py-1 rounded text-[9px] font-medium ${
                                l.status === "Available" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                              }`}>
                                {l.status === "Available" ? "Assign Locker" : "Unavailable"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it works — 3 steps */}
        <section className="border-b border-gray-100 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <h2 className="font-heading font-semibold text-xl text-gray-900 mb-8">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Browse available lockers", desc: "Filter by location and status. Pick any available locker from the grid." },
                { step: "2", title: "Reserve with one click", desc: "Choose your duration, add a note, and confirm. Your locker is assigned instantly." },
                { step: "3", title: "Access via OTP or QR", desc: "Get a one-time passcode and QR code. Scan it at the terminal to unlock." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-semibold flex items-center justify-center mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Active Booking preview */}
        <section className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-16">
              {/* Mock booking UI */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                className="lg:w-7/12 w-full order-2 lg:order-1"
              >
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-1.5 shadow-sm">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex">
                      {/* Booking panel */}
                      <div className="flex-1 p-6">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-medium border border-orange-200 mb-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                          Active
                        </div>
                        <div className="mb-4">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">Time Remaining</p>
                          <p className="text-3xl font-semibold font-mono tracking-tight text-gray-900 tabular-nums">01:59:45</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">Resource ID</p>
                            <p className="text-lg font-semibold text-gray-900">L-301</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">One-Time Passcode</p>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 inline-block">
                              <p className="text-lg font-mono tracking-[0.15em] font-semibold text-gray-900">3200</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-xs text-gray-600 font-medium">+ Extend +1hr</div>
                          <div className="flex-1 text-center py-2 border border-red-200 rounded-lg text-xs text-red-500 font-medium">Release Locker</div>
                        </div>
                      </div>
                      {/* QR section */}
                      <div className="hidden sm:flex w-48 border-l border-gray-100 flex-col items-center justify-center p-4 bg-gray-50/50">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <QrCode size={48} className="text-gray-400" />
                        </div>
                        <p className="text-[10px] font-semibold text-gray-700 mb-0.5">Access Token</p>
                        <p className="text-[9px] text-gray-400 text-center leading-snug">Scan this QR code at the terminal to unlock</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Text */}
              <div className="lg:w-5/12 order-1 lg:order-2">
                <h2 className="font-heading font-semibold text-xl text-gray-900 mb-3">
                  Real-time booking dashboard
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  Once you reserve a locker, you get a live countdown timer, a one-time passcode, and a QR code for physical access.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Live countdown timer",
                    "One-time passcode for each session",
                    "QR code for terminal access",
                    "Extend or release anytime"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} className="text-orange-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Feature highlights — compact grid */}
        <section className="border-b border-gray-100 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <h2 className="font-heading font-semibold text-xl text-gray-900 mb-8">Built for campus use</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Zap, title: "Instant assignment", desc: "Pick a locker, set duration, done. No paperwork." },
                { icon: ShieldCheck, title: "Secure access", desc: "JWT authentication and per-session OTP codes." },
                { icon: Clock, title: "Time-based booking", desc: "1, 2, or 4 hour slots with auto-expiry." },
                { icon: QrCode, title: "QR code unlock", desc: "Scan at the terminal. No keys needed." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 mb-3">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-heading font-semibold text-xl text-gray-900 mb-1">Ready to try Vaulta?</h2>
              <p className="text-sm text-gray-500">Sign up and reserve your first locker in under a minute.</p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <VaultaLogo size={22} />
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} Vaulta. Built as a student project.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
