"use client";

import { Users, Bus, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    let schoolId = null;
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        schoolId = storedUser.schoolId;
      } catch (e) {
        console.error(e);
      }
    }

    if (!schoolId) return;

    const fetchAttendance = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/v1/attendance/school/${schoolId}`);
        if (response.ok) {
          const data = await response.json();
          // The data is ordered by name then time, we should probably just grab latest for feed.
          // Since it's a feed, we want time descending globally. 
          // Assuming the endpoint returns it ordered by time desc when not grouped, but we grouped by name.
          // For the feed, let's just sort it by timestamp here to show chronological feed.
          const sorted = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRecentEvents(sorted.slice(0, 5)); 
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAttendance();
    const interval = setInterval(fetchAttendance, 10000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    { label: "Total Students Enrolled", value: recentEvents.length > 0 ? "Tracking" : "0", icon: Users, color: "text-blue-400" },
    { label: "Active Buses", value: "12 / 15", icon: Bus, color: "text-emerald-400" },
    { label: "SOS Alerts", value: "0", icon: AlertTriangle, color: "text-rose-400" },
    { label: "Security Checks", value: "100%", icon: ShieldCheck, color: "text-indigo-400" }
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h1>
          <p className="text-gray-400">Live school operations and transportation metrics.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-500 font-medium">System Online</span>
        </div>
      </header>

      <div className="grid md:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-400">{kpi.label}</p>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-3xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col min-h-[400px]">
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Live Event Feed
          </h2>
          <div className="flex-1 space-y-4">
            {recentEvents.length === 0 ? (
              <p className="text-gray-400 text-sm">No activity recorded today.</p>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    event.type === 'BOARDED' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {event.type === 'BOARDED' ? <Bus className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-semibold">Match Success</span> - {event.student.firstName} {event.student.lastName}</p>
                    <p className="text-xs text-gray-500">
                      {event.bus ? `Bus ${event.bus.registration}` : 'Kiosk Terminal'} • {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-semibold mb-6">IoT Device Health</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/10 bg-black/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">Face Recognition Terminals</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">Online</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-black/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">GPS Trackers</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">Online</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
