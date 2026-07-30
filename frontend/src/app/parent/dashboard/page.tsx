"use client";

import { motion } from "framer-motion";
import { Bus, Clock, MapPin, CheckCircle2, AlertTriangle, ShieldCheck, Shield } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

export default function ParentDashboard() {
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [parentName, setParentName] = useState("Parent");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    let userId = null;
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        setUserId(storedUser.id);
        setParentName(storedUser.firstName);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/attendance/parent/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRecentEvents(data.slice(0, 3)); // Only show top 3 on dashboard
      }
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAttendance();

      const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
      socket.on("attendanceUpdate", (newRecord) => {
        console.log("Dashboard real-time update received!", newRecord);
        fetchAttendance();
      });

      const interval = setInterval(fetchAttendance, 30000);
      return () => {
        clearInterval(interval);
        socket.disconnect();
      };
    }
  }, [userId, fetchAttendance]);



  const stats = [
    { label: "Status", value: recentEvents.length > 0 ? (recentEvents[0].type === 'BOARDED' ? 'In Transit' : 'In School') : 'Unknown', icon: Bus, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Latest Scan", value: recentEvents.length > 0 ? new Date(recentEvents[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--', icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Attendance", value: recentEvents.length > 0 ? "Present" : "No Data", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Good morning, {parentName}</h1>
        <p className="text-gray-400">Here's the latest overview of your child's journey today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Map Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" /> Live Tracking
            </h2>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex-1 min-h-[400px] bg-[#111] relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
            <div className="text-center z-10">
              <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Interactive Map Integration Ready</p>
              <p className="text-xs text-gray-600 mt-2">(Awaiting IoT GPS Module in Phase 2)</p>
            </div>
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
              <path d="M 100 300 Q 300 200 400 300 T 700 200" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="8 8" />
            </svg>
          </div>
        </motion.div>

        {/* Timeline & Alerts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Recent Events */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold mb-6">Today's Journey</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              
              {recentEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No activity recorded today yet.</p>
              ) : (
                recentEvents.map((event, index) => (
                  <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-indigo-500/20 text-indigo-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {event.type === 'BOARDED' ? <Bus className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-white/10 bg-white/5 shadow">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-medium text-emerald-400 text-sm">{event.type}</div>
                        <time className="text-xs font-medium text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {event.student.firstName} scanned at {event.bus ? `Bus ${event.bus.registration}` : 'Kiosk'}.
                      </div>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
