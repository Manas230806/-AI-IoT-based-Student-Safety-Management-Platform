"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bus, CheckCircle2, MapPin, Calendar, Clock, Loader2, Users } from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  busId: string;
  type: string;
  timestamp: string;
  verifiedBy: string;
  student: Student;
  bus?: {
    registration: string;
  };
}

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Read user from localStorage
    const storedUserStr = localStorage.getItem('user');
    let schoolId = null;
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        schoolId = storedUser.schoolId;
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }

    const fetchAttendance = async () => {
      try {
        const url = schoolId 
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/attendance/school/${schoolId}`
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/attendance/school/all`;
          
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch school attendance records');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setRecords(data);
        } else {
          setRecords([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
    const interval = setInterval(fetchAttendance, 10000);
    return () => clearInterval(interval);
  }, []);

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
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">School Attendance Log</h1>
          <p className="text-gray-400">Comprehensive view of all student activities across the school.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/20">
          <Users className="w-4 h-4" />
          <span className="font-medium">Live Feed</span>
        </div>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Daily Activity Feed
          </h2>
          <input 
            type="text"
            placeholder="Search student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
          />
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center items-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (() => {
          const filteredRecords = records.filter(record => 
            `${record.student?.firstName} ${record.student?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
          );
          
          if (filteredRecords.length === 0) {
            return (
              <div className="p-12 text-center text-gray-400">
                <p>{searchQuery ? 'No matching students found.' : 'No activity records found for today.'}</p>
              </div>
            );
          }

          return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">
                  <th className="p-4 font-medium">Student Name</th>
                  <th className="p-4 font-medium">Class / Sec</th>
                  <th className="p-4 font-medium">Latest Activity</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.map((record, i) => (
                  <motion.tr 
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-200">
                        {record.student?.firstName} {record.student?.lastName}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">
                      {record.student?.class} - {record.student?.section}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md border ${getStatusColor(record.type)}`}>
                          {getStatusIcon(record.type)}
                        </div>
                        <span className="font-medium capitalize text-sm">{record.type.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {record.bus ? `Bus ${record.bus.registration}` : 'School Campus'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          );
        })()}
      </div>
    </div>
  );
}
