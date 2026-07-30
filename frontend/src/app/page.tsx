"use client";

import { motion } from "framer-motion";
import { Shield, Camera, Map, Bell, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            <span className="font-semibold text-lg tracking-tight">EduGuard Safety</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-indigo-400 transition-colors">
              Sign In
            </Link>
            <Link href="/request-demo" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
              Request Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute inset-0 bg-purple-500 rounded-full blur-[120px] mix-blend-screen translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-6 border border-indigo-500/20">
              Now entering Phase 1 Beta
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
          >
            Intelligent Safety for the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Next Generation.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            The enterprise platform for student transportation. AI face recognition, live bus tracking, and instant parent notifications—built for modern schools.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-medium transition-colors">
              View Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition-colors border border-white/10">
              Explore Features
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-white/10 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Complete Safety Infrastructure</h2>
            <p className="text-gray-400 max-w-2xl">Everything a school needs to secure transportation and manage attendance, unified in one elegant platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Camera className="w-6 h-6 text-blue-400" />}
              title="AI Face Recognition"
              description="Instantly verify students boarding and guardians during pickup. Dual-factor physical security."
            />
            <FeatureCard 
              icon={<Map className="w-6 h-6 text-purple-400" />}
              title="Live Fleet Tracking"
              description="Real-time GPS monitoring for every bus. AI route analytics to reduce delays and fuel costs."
            />
            <FeatureCard 
              icon={<Bell className="w-6 h-6 text-rose-400" />}
              title="Instant Alerts & SOS"
              description="Automated push notifications to parents and a panic button system for drivers and students."
            />
          </div>
        </div>
      </section>

      {/* Mock Dashboard Preview */}
      <section className="py-24 bg-gradient-to-b from-[#0A0A0A] to-indigo-950/20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl p-2 md:p-4 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-10" />
            <div className="aspect-[16/9] w-full rounded-xl bg-[#111] border border-white/5 overflow-hidden flex flex-col relative">
              {/* Mock Dashboard Topbar */}
              <div className="h-14 border-b border-white/10 flex items-center px-6 justify-between bg-[#0A0A0A]">
                <div className="flex gap-4">
                  <div className="w-24 h-4 bg-white/10 rounded" />
                  <div className="w-16 h-4 bg-white/10 rounded" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
              </div>
              {/* Mock Dashboard Body */}
              <div className="flex-1 p-6 grid grid-cols-4 gap-6">
                <div className="col-span-3 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 rounded-lg border border-white/5 bg-white/5 p-4 flex flex-col justify-end">
                        <div className="w-1/2 h-6 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                  {/* Map area */}
                  <div className="flex-1 h-64 rounded-lg border border-white/5 bg-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
                    <Map className="w-12 h-12 text-white/20" />
                  </div>
                </div>
                {/* Sidebar */}
                <div className="col-span-1 space-y-4">
                  <div className="h-full rounded-lg border border-white/5 bg-white/5 p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <div className="space-y-2 flex-1">
                          <div className="h-2 bg-white/10 rounded w-full" />
                          <div className="h-2 bg-white/10 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0A0A0A] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-gray-400">EduGuard Safety</span>
          </div>
          <p className="text-sm text-gray-500">© 2026 EduGuard Platform. Phase 1 Environment.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-black/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
