"use client";

import { useEffect, useState } from "react";
import { User, Mail, Shield, BookOpen, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ParentProfile {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  phoneNumber: string;
  students: Array<{
    student: {
      id: string;
      firstName: string;
      lastName: string;
      class: string;
      section: string;
      photoUrl: string;
      rollNumber: string;
    }
  }>;
}

export default function ParentProfilePage() {
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUserStr = localStorage.getItem('user');
      if (!storedUserStr) {
        setLoading(false);
        return;
      }
      
      try {
        const storedUser = JSON.parse(storedUserStr);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/parents/${storedUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <User className="w-16 h-16 text-gray-500" />
        <h2 className="text-2xl font-bold text-gray-300">Profile Not Found</h2>
        <p className="text-gray-500">We could not load your parent profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your account and view your registered students.</p>
      </header>

      {/* Parent Info Card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 flex-shrink-0">
            <div className="w-full h-full bg-[#0A0A0A] rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {profile.students.length > 0 
                  ? profile.students.map(s => `${s.student.firstName} ${s.student.lastName}`).join(' & ') 
                  : `${profile.user.firstName} ${profile.user.lastName}`}
              </h2>
              <div className="flex items-center gap-2 text-indigo-400 font-medium bg-indigo-500/10 w-fit px-3 py-1 rounded-full text-sm border border-indigo-500/20">
                <Shield className="w-4 h-4" /> Parent Account
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>{profile.user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold tracking-tight pt-4">Registered Students</h3>
      
      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile.students.length === 0 ? (
          <div className="col-span-full p-12 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-gray-400">No students are currently linked to your account.</p>
          </div>
        ) : (
          profile.students.map(({ student }, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-colors group"
            >
              <div className="aspect-square relative overflow-hidden bg-black/50">
                {student.photoUrl ? (
                  <img 
                    src={student.photoUrl} 
                    alt={student.firstName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-20 h-20 text-gray-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-2xl font-bold text-white shadow-sm">
                    {student.firstName} {student.lastName}
                  </h4>
                  <p className="text-gray-300 text-sm font-medium">Roll No: {student.rollNumber}</p>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Class</p>
                    <p className="font-semibold">{student.class} - Section {student.section}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <p className="font-semibold text-emerald-400">Active & Enrolled</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
