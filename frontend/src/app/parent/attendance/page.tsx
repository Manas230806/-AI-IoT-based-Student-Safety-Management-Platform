"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bus, CheckCircle2, MapPin, Calendar, Clock, Loader2, Camera, X } from "lucide-react";
import { io } from "socket.io-client";

interface AttendanceRecord {
  id: string;
  studentId: string;
  busId: string;
  type: string;
  timestamp: string;
  verifiedBy: string;
  photoUrl?: string;
  bus?: {
    registration: string;
  };
  student?: {
    firstName: string;
    lastName: string;
  };
}

export default function ParentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Read user from localStorage
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        setUserId(storedUser.id);
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/v1/attendance/parent/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAttendance();
      
      const socket = io("http://localhost:5000");
      socket.on("attendanceUpdate", (newRecord) => {
        console.log("Real-time update received!", newRecord);
        fetchAttendance();
      });

      const interval = setInterval(fetchAttendance, 30000); // Backoff polling to 30s since we have sockets
      return () => {
        clearInterval(interval);
        socket.disconnect();
      };
    }
  }, [userId, fetchAttendance]);

  const getStatusIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BOARDED': return <Bus className="w-5 h-5 text-blue-400" />;
      case 'LEFT': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'CHECK_IN': return <MapPin className="w-5 h-5 text-indigo-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BOARDED': return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      case 'LEFT': return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case 'CHECK_IN': return "bg-indigo-500/20 text-indigo-400 border-indigo-500/20";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Activity & Attendance</h1>
        <p className="text-gray-400">Track your child's daily travel and school attendance history.</p>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Recent Activity
          </h2>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center items-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>No activity records found for today.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">
                  <th className="p-4 font-medium">Activity</th>
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Photo</th>
                  <th className="p-4 font-medium">Date & Day</th>
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Location / Bus</th>
                  <th className="p-4 font-medium">Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((record, i) => (
                  <motion.tr 
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${getStatusColor(record.type)}`}>
                          {getStatusIcon(record.type)}
                        </div>
                        <span className="font-medium capitalize">{record.type.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-white">
                      {record.student ? `${record.student.firstName} ${record.student.lastName}` : 'Unknown Student'}
                    </td>
                    <td className="p-4">
                      {record.photoUrl ? (
                        <div 
                          className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setActivePhotoUrl(record.photoUrl || null)}
                        >
                          <img src={record.photoUrl} alt="Scan Snapshot" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                          <Camera className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-300">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{new Date(record.timestamp).toLocaleDateString(undefined, { weekday: 'long' })}</span>
                        <span className="text-xs text-gray-400">{new Date(record.timestamp).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-emerald-400 font-medium">
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-gray-300">
                      {record.bus ? `Bus ${record.bus.registration}` : 'School Campus'}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {record.verifiedBy}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal (WhatsApp DP Style) */}
      {activePhotoUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setActivePhotoUrl(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10"
            onClick={() => setActivePhotoUrl(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            src={activePhotoUrl} 
            alt="Full size snapshot" 
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
