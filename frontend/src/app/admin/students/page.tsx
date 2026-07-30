"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Camera, UserPlus, Upload, ShieldCheck, Loader2, CheckCircle2, Users, Mail, GraduationCap, Edit2, Trash2, X, Save } from "lucide-react";

export default function AdminStudentsPage() {
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [section, setSection] = useState("A");
  const [parentEmail, setParentEmail] = useState("");
  
  // Result State
  const [successData, setSuccessData] = useState<{ student: any, parentPassword: string } | null>(null);

  // Student List & Edit State
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", class: "", parentEmail: "" });

  const fetchStudentsList = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/students');
      if (response.ok) {
        const data = await response.json();
        setStudentsList(data);
      }
    } catch (e) {
      console.error("Failed to fetch students list", e);
    }
  };

  const handleEditClick = (student: any, email: string) => {
    setEditingStudentId(student.id);
    setEditForm({
      firstName: student.firstName,
      lastName: student.lastName,
      class: student.class,
      parentEmail: email
    });
  };

  const handleSaveEdit = async (studentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        setEditingStudentId(null);
        fetchStudentsList();
      } else {
        alert("Failed to update student.");
      }
    } catch (e) {
      console.error("Update error", e);
    }
  };

  const handleDelete = async (studentId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/v1/students/${studentId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchStudentsList();
      } else {
        alert("Failed to delete student.");
      }
    } catch (e) {
      console.error("Delete error", e);
    }
  };

  useEffect(() => {
    fetchStudentsList();
  }, []);
  
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (e) {
        console.error("Error loading models:", e);
      }
    };
    loadModels();
  }, []);

  const submitStudentData = async (imageSrc: string | null) => {
    if (!imageSrc || !firstName || !lastName || !parentEmail) return;
    setIsRegistering(true);
    setSuccessData(null);
    
    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => { img.onload = resolve; });

      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      
      if (!detection) {
        alert("No face detected in the image. Please try again with clear lighting.");
        setIsRegistering(false);
        return;
      }
      
      // Convert Float32Array to standard array for JSON transport
      const faceEmbedding = Array.from(detection.descriptor);

      // Read user from localStorage for schoolId
      const storedUserStr = localStorage.getItem('user');
      let schoolId = "DEMO_SCHOOL_ID"; // Fallback
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          if (storedUser.schoolId) {
            schoolId = storedUser.schoolId;
          }
        } catch (e) {
          console.error("Failed to parse user from local storage", e);
        }
      }

      const response = await fetch('http://localhost:5000/api/v1/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          studentClass,
          section,
          parentEmail,
          photoUrl: imageSrc, // In production, upload to S3/Cloudinary and save URL
          faceEmbedding: JSON.stringify(faceEmbedding),
          schoolId
        })
      });

      if (!response.ok) {
        let errMsg = "Failed to save student";
        try {
          const errData = await response.json();
          errMsg = errData.details || errData.error || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const result = await response.json();
      setSuccessData({ student: result.student, parentPassword: result.parentPassword });
      fetchStudentsList(); // Refresh the list
      
      // Reset form
      setFirstName("");
      setLastName("");
      setStudentClass("");
      setSection("A");
      setParentEmail("");
      
    } catch (e: any) {
      console.error(e);
      alert(`Failed to register student. ${e.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const captureAndRegister = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    submitStudentData(imageSrc || null);
  }, [webcamRef, firstName, lastName, studentClass, section, parentEmail]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        submitStudentData(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Student Registration</h1>
        <p className="text-gray-400">Add a new student, capture facial data, and automatically create a parent portal account.</p>
      </header>

      {successData && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden mb-8">
          <div className="flex gap-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold text-emerald-400 text-lg mb-2">Registration Successful!</h3>
              <p className="text-gray-300 mb-4">
                {successData.student.firstName} has been registered and their face data is synced to the Kiosk.
              </p>
              <div className="bg-black/50 p-4 rounded-xl border border-white/10 space-y-2">
                <p className="text-sm"><span className="text-gray-400">Student ID (Roll No):</span> <strong className="text-white">{successData.student.rollNumber}</strong></p>
                <p className="text-sm"><span className="text-gray-400">Parent Login Email:</span> <strong className="text-white">{successData.student.parentEmail || "Provided Email"}</strong></p>
                <p className="text-sm"><span className="text-gray-400">Parent Password:</span> <strong className="text-white text-lg tracking-wider font-mono bg-indigo-500/20 px-2 py-1 rounded">{successData.parentPassword}</strong></p>
              </div>
              <p className="text-xs text-gray-500 mt-4">Please securely share this temporary password with the parent.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Column */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-6">
            <UserPlus className="w-5 h-5 text-indigo-400" /> Student Details
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">First Name</label>
                <input 
                  type="text" 
                  value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={lastName} onChange={e => setLastName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Class/Grade</label>
                <input 
                  type="text" 
                  value={studentClass} onChange={e => setStudentClass(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Section</label>
                <select 
                  value={section} onChange={e => setSection(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option>A</option><option>B</option><option>C</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Parent's Email (For Portal Access)</label>
              <input 
                type="email" 
                value={parentEmail} onChange={e => setParentEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Capture Column */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
          <h2 className="font-semibold flex items-center gap-2 mb-6">
            <Camera className="w-5 h-5 text-indigo-400" /> Face Enrollment
          </h2>
          
          <div className="flex-1 bg-black rounded-xl overflow-hidden relative border border-white/10 flex items-center justify-center min-h-[300px]">
            {!modelsLoaded ? (
              <div className="flex flex-col items-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                <span className="text-sm">Loading AI Models...</span>
              </div>
            ) : (
              <>
                <Webcam 
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
                
                {isRegistering && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                    <p className="text-white font-medium">Processing Biometrics...</p>
                    <p className="text-xs text-gray-400 mt-2">Generating Parent Account...</p>
                  </div>
                )}
                
                {/* Overlay guide */}
                <div className="absolute inset-0 pointer-events-none border-4 border-indigo-500/20 m-8 rounded-[100%]"></div>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={captureAndRegister}
              disabled={!firstName || !lastName || !parentEmail || isRegistering || !modelsLoaded}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-3 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Save & Enroll
            </button>
            
            <div className="relative flex-1">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                disabled={!firstName || !lastName || !parentEmail || isRegistering || !modelsLoaded}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <button 
                disabled={!firstName || !lastName || !parentEmail || isRegistering || !modelsLoaded}
                className="w-full h-full bg-white/10 hover:bg-white/20 disabled:opacity-50 py-3 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload Photo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student List Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-400" /> Registered Students Directory
        </h2>
        
        {studentsList.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
            No students registered yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {studentsList.map((student) => {
              const parentEmail = student.parents?.[0]?.parent?.user?.email || "N/A";
              
              return (
                <div key={student.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors flex gap-4 items-start relative group">
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingStudentId === student.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(student.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingStudentId(null)} className="p-1.5 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(student, parentEmail)} className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)} className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="w-16 h-16 rounded-xl bg-black/50 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} alt={student.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <UserPlus className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-16">
                    {editingStudentId === student.id ? (
                      <div className="space-y-2 mt-1">
                        <div className="flex gap-2">
                          <input type="text" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" placeholder="First Name" />
                          <input type="text" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" placeholder="Last Name" />
                        </div>
                        <input type="text" value={editForm.class} onChange={e => setEditForm({...editForm, class: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" placeholder="Class" />
                        <input type="email" value={editForm.parentEmail} onChange={e => setEditForm({...editForm, parentEmail: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white" placeholder="Parent Email" />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-white truncate">{student.firstName} {student.lastName}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> 
                            Class {student.class} - {student.section} (Roll: {student.rollNumber})
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
                            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 
                            <span className="truncate">{parentEmail}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
