"use client";

import { Shield, Home, Users, Bus, Map, Settings, LogOut, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: Home },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Attendance", href: "/admin/attendance", icon: Calendar },
    { name: "Transport", href: "/admin/transport", icon: Bus },
    { name: "Live Fleet", href: "/admin/tracking", icon: Map },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      <aside className="w-64 border-r border-white/10 bg-black/50 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            <span className="font-semibold tracking-tight text-sm">EduGuard School Admin</span>
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
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
