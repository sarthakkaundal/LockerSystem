import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  Settings, 
  LockKeyhole, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Smartphone, 
  Activity, 
  LayoutDashboard
} from "lucide-react";
import vaultaLogo from "../assets/logos/vaulta_logo.png";

// Fade in animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <motion.div 
    variants={fadeInUp}
    className="relative group p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors duration-300"
  >
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-heading font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 font-sans leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[150px]" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-800/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={vaultaLogo} alt="Vaulta Logo" className="h-8 w-auto" />
            <span className="font-heading font-bold text-2xl tracking-tight text-white">Vaulta</span>
          </div>
          


          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-tech font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Login
            </Link>
            <Link to="/login" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-tech font-semibold hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 lg:pt-48">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pb-24 lg:pb-32 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-tech font-medium tracking-wide text-indigo-300">VAULTA OS 2.0 IS LIVE</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[1.1] mb-8 max-w-5xl"
            >
              Smart Locker <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
                Management, Reinvented
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-sans font-light leading-relaxed"
            >
              Automate assignments, enforce security, and boost efficiency with the most advanced locker management platform built for modern teams.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-tech font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                Get Started <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-3xl md:text-5xl text-white mb-6">Built for precision.</h2>
              <p className="font-tech text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to seamlessly orchestrate storage resources at scale.</p>
            </div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <FeatureCard 
                icon={Activity} 
                title="Real-time Availability" 
                description="Instant visibility into which lockers are occupied, reserved, or available across your entire floor plan." 
              />
              <FeatureCard 
                icon={Zap} 
                title="Smart Assignment" 
                description="Algorithmic allocation logic ensures optimal space utilization and minimal walking distance." 
              />
              <FeatureCard 
                icon={Settings} 
                title="Admin Control Panel" 
                description="Comprehensive oversight with manual overrides, bulk assignments, and detailed reporting." 
              />
              <FeatureCard 
                icon={ShieldCheck} 
                title="Secure Auth (JWT)" 
                description="Enterprise-grade security backing every request, ensuring data integrity and user privacy." 
              />
            </motion.div>
          </div>
        </section>

        {/* Interactive Preview Section */}
        <section id="preview" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="w-full lg:w-1/2">
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-6">
                    See the big picture.
                  </h2>
                  <p className="font-sans text-slate-400 text-lg mb-8 leading-relaxed">
                    Our intuitive visual interface lets you monitor and manage your locker infrastructure as if you were standing right in front of it.
                  </p>
                  
                  <ul className="space-y-4">
                    {[
                      "Interactive spatial mapping",
                      "One-click assignments",
                      "Instant maintenance flagging"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-300 font-tech">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <CheckCircle2 size={14} />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Mock UI */}
              <div className="w-full lg:w-1/2">
                <motion.div 
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative p-2 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/5 border border-white/10 backdrop-blur-sm"
                >
                  <div className="bg-slate-900 rounded-[1.75rem] border border-white/5 overflow-hidden shadow-2xl">
                    {/* Fake Browser Header */}
                    <div className="h-12 bg-white/[0.02] border-b border-white/5 flex items-center px-4 gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                      </div>
                      <div className="mx-auto px-4 h-6 rounded-md bg-white/5 border border-white/5 flex items-center">
                        <span className="text-[10px] text-slate-500 font-tech">vaulta.app/dashboard</span>
                      </div>
                    </div>
                    {/* Fake Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="w-32 h-6 bg-white/10 rounded-md"></div>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/5"></div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 mb-6">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className={`h-20 rounded-xl border ${i % 3 === 0 ? 'bg-indigo-500/10 border-indigo-500/30' : i % 5 === 0 ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'}`}></div>
                        ))}
                      </div>
                      <div className="w-full h-24 bg-white/5 rounded-xl border border-white/10"></div>
                    </div>
                  </div>
                  
                  {/* Decorative float element */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-heading font-semibold text-white">Locker #A-42</div>
                      <div className="text-xs text-slate-400 font-tech">Assigned successfully</div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                  <Zap size={32} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">Faster Allocation</h3>
                <p className="text-slate-400 font-sans leading-relaxed">Reduce manual assignment time by up to 80% with our intelligent auto-allocation engine.</p>
              </motion.div>
              
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                  <Layers size={32} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">Reduced Manual Effort</h3>
                <p className="text-slate-400 font-sans leading-relaxed">Self-service workflows allow users to request and manage their own spaces automatically.</p>
              </motion.div>

              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                  <LayoutDashboard size={32} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">Transparent Audit Logs</h3>
                <p className="text-slate-400 font-sans leading-relaxed">Every action is tracked and recorded, ensuring complete accountability across your facility.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA / Trust Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20" />
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            >
              <h2 className="font-heading font-bold text-4xl md:text-6xl text-white mb-6">Ready to upgrade your space?</h2>
              <p className="font-tech text-slate-300 text-xl mb-10">Join forward-thinking teams using Vaulta.</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-black font-tech font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
                Start your free trial <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={vaultaLogo} alt="Vaulta Logo" className="h-6 w-auto" />
            <span className="font-heading font-bold text-xl text-white">Vaulta</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-white font-tech text-sm transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-white font-tech text-sm transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-white font-tech text-sm transition-colors">Support</a>
          </div>
          <p className="text-slate-500 font-tech text-sm">© {new Date().getFullYear()} Vaulta Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
