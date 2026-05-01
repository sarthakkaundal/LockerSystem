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
import VaultaLogo from "../components/VaultaLogo";

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
    className="relative group p-8 rounded-none bg-white border border-gray-200 hover:border-orange-500 transition-colors duration-300 shadow-sm"
  >
    <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="w-14 h-14 bg-orange-100 flex items-center justify-center mb-6 text-orange-600 transition-transform duration-300">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-heading font-semibold text-black mb-3">{title}</h3>
      <p className="text-gray-600 font-sans leading-relaxed">{description}</p>
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
    <div className="min-h-screen bg-white text-gray-800 font-sans overflow-hidden selection:bg-orange-200 selection:text-black">
      {/* Abstract Background Elements - Hidden for YC style to keep it clean */}
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white border-b border-gray-200 py-4 shadow-sm" : "bg-white border-b border-gray-100 py-4"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <VaultaLogo size={30} />
          

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-tech font-medium text-gray-600 hover:text-orange-600 transition-colors hidden sm:block">
              Login
            </Link>
            <Link to="/login" className="px-5 py-2 rounded-none bg-orange-500 text-white text-sm font-tech font-semibold hover:bg-orange-600 transition-all border border-orange-600 shadow-sm">
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
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 mb-8 rounded-none">
              <span className="flex h-2 w-2 rounded-none bg-orange-500"></span>
              <span className="text-xs font-tech font-bold tracking-wide text-orange-600">VAULTA OS 2.0 IS LIVE</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight text-black leading-[1.1] mb-8 max-w-5xl"
            >
              Smart Locker <br className="hidden md:block" />
              <span className="text-orange-500">
                Management, Reinvented
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12 font-sans leading-relaxed"
            >
              Automate assignments, enforce security, and boost efficiency with the most advanced locker management platform built for modern teams.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white font-tech font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-sm rounded-none border border-orange-600">
                Get Started <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 border-t border-gray-200 bg-[#f6f6ef]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-3xl md:text-5xl text-black mb-6">Built for precision.</h2>
              <p className="font-tech text-gray-600 text-lg max-w-2xl mx-auto">Everything you need to seamlessly orchestrate storage resources at scale.</p>
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
                  <h2 className="font-heading font-bold text-4xl md:text-5xl text-black mb-6">
                    See the big picture.
                  </h2>
                  <p className="font-sans text-gray-600 text-lg mb-8 leading-relaxed">
                    Our intuitive visual interface lets you monitor and manage your locker infrastructure as if you were standing right in front of it.
                  </p>
                  
                  <ul className="space-y-4">
                    {[
                      "Interactive spatial mapping",
                      "One-click assignments",
                      "Instant maintenance flagging"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-800 font-tech">
                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
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
                  className="relative p-2 rounded-none bg-orange-500 border border-orange-600"
                >
                  <div className="bg-white rounded-none border border-gray-200 overflow-hidden shadow-xl">
                    {/* Fake Browser Header */}
                    <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="mx-auto px-4 h-6 rounded-none bg-white border border-gray-200 flex items-center">
                        <span className="text-[10px] text-gray-500 font-tech">vaulta.app/dashboard</span>
                      </div>
                    </div>
                    {/* Fake Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="w-32 h-6 bg-gray-200 rounded-none"></div>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-none bg-gray-200"></div>
                          <div className="w-8 h-8 rounded-none bg-orange-100"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 mb-6">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className={`h-20 rounded-none border ${i % 3 === 0 ? 'bg-orange-50 border-orange-200' : i % 5 === 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}></div>
                        ))}
                      </div>
                      <div className="w-full h-24 bg-gray-50 rounded-none border border-gray-200"></div>
                    </div>
                  </div>
                  
                  {/* Decorative float element */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-6 -left-6 p-4 rounded-none bg-white border border-gray-200 shadow-xl flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-none bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-heading font-semibold text-black">Locker #A-42</div>
                      <div className="text-xs text-gray-500 font-tech">Assigned successfully</div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-24 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-none bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                  <Zap size={32} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-black mb-3">Faster Allocation</h3>
                <p className="text-gray-600 font-sans leading-relaxed">Reduce manual assignment time by up to 80% with our intelligent auto-allocation engine.</p>
              </motion.div>
              
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-none bg-orange-50 flex items-center justify-center text-orange-600 mb-6">
                  <Layers size={32} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-black mb-3">Reduced Manual Effort</h3>
                <p className="text-gray-600 font-sans leading-relaxed">Self-service workflows allow users to request and manage their own spaces automatically.</p>
              </motion.div>

              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-none bg-orange-50 flex items-center justify-center text-orange-600 mb-6">
                  <LayoutDashboard size={32} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-black mb-3">Transparent Audit Logs</h3>
                <p className="text-gray-600 font-sans leading-relaxed">Every action is tracked and recorded, ensuring complete accountability across your facility.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA / Trust Section */}
        <section className="py-32 relative overflow-hidden bg-[#f6f6ef] border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            >
              <h2 className="font-heading font-bold text-4xl md:text-6xl text-black mb-6">Ready to upgrade your space?</h2>
              <p className="font-tech text-gray-700 text-xl mb-10">Join forward-thinking teams using Vaulta.</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-10 py-4 rounded-none bg-orange-500 text-white font-tech font-bold text-lg hover:bg-orange-600 transition-colors shadow-sm border border-orange-600">
                Start your free trial <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <VaultaLogo size={24} />
          <div className="flex gap-8">
            <a href="#" className="text-gray-500 hover:text-orange-600 font-tech text-sm transition-colors">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-orange-600 font-tech text-sm transition-colors">Terms</a>
            <a href="#" className="text-gray-500 hover:text-orange-600 font-tech text-sm transition-colors">Support</a>
          </div>
          <p className="text-gray-400 font-tech text-sm">© {new Date().getFullYear()} Vaulta Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
