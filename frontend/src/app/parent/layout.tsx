"use client";

import { Shield, Home, Map, Bell, User, LogOut, Calendar, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/parent/dashboard", icon: Home },
    { name: "Live Tracking", href: "/parent/tracking", icon: Map },
    { name: "Attendance", href: "/parent/attendance", icon: Calendar },
    { name: "Notifications", href: "/parent/notifications", icon: Bell },
    { name: "Profile", href: "/parent/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/50 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
            <span className="font-semibold tracking-tight text-sm">EduGuard Parent</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-black/80 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
            <span className="font-semibold tracking-tight text-lg">EduGuard</span>
          </div>
          <button 
            className="text-gray-400 hover:text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              />
              
              {/* Menu Panel */}
              <motion.nav 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-16 right-0 bottom-0 w-3/4 max-w-sm bg-[#111] border-l border-white/10 z-50 flex flex-col md:hidden shadow-2xl"
              >
                <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                          isActive 
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-base">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-white/10">
                  <Link href="/login" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-base">Sign Out</span>
                  </Link>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
