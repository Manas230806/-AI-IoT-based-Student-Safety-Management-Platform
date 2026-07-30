"use client";

import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Shield, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface ScanLog {
  id: string;
  name: string;
  time: string;
  status: "SUCCESS" | "FAILED";
}

export default function KioskPage() {
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [labeledDescriptors, setLabeledDescriptors] = useState<faceapi.LabeledFaceDescriptors[]>([]);
  const [scanResult, setScanResult] = useState<"IDLE" | "SUCCESS" | "FAILED">("IDLE");
  const [personName, setPersonName] = useState<string>("");
  const [recentScans, setRecentScans] = useState<ScanLog[]>([]);
  
  // 1. Load models
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

  // 2. Fetch enrolled students from DB
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/students');
        if (!response.ok) return;
        const students = await response.json();
        
        const descriptors: faceapi.LabeledFaceDescriptors[] = [];
        
        for (const student of students) {
          if (student.faceEmbedding) {
            try {
              const embeddingArray = JSON.parse(student.faceEmbedding);
              const float32Array = new Float32Array(embeddingArray);
              descriptors.push(
                new faceapi.LabeledFaceDescriptors(`${student.id}|${student.firstName} ${student.lastName}`, [float32Array])
              );
            } catch (e) {
              console.error("Failed to parse embedding for", student.firstName);
            }
          }
        }
        
        setLabeledDescriptors(descriptors);
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };
    
    // Fetch immediately, then poll every 10 seconds to get new registrations
    fetchStudents();
    const intervalId = setInterval(fetchStudents, 10000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Continuous Scanning
  useEffect(() => {
    // We proceed even if descriptors are 0 to allow FAILED scans
    if (!modelsLoaded) return;

    let scanInterval: NodeJS.Timeout;
    
    const scan = async () => {
      if (!webcamRef.current || !webcamRef.current.video || scanResult === "SUCCESS") return;
      
      const video = webcamRef.current.video;
      if (video.readyState !== 4) return;

      const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
      
      if (detection) {
        // Only attempt match if we have descriptors, otherwise it's an automatic fail
        let bestMatch = { label: "unknown" };
        if (labeledDescriptors.length > 0) {
          // Changed threshold to 0.53: 0.45 was too strict for normal lighting/angles, 0.6 was too loose
          const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.53);
          bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        }
        
        if (bestMatch.label !== "unknown") {
          let studentId = "";
          let studentName = bestMatch.label;
          if (bestMatch.label.includes('|')) {
            const parts = bestMatch.label.split('|');
            studentId = parts[0];
            studentName = parts[1];
          }

          setScanResult("SUCCESS");
          setPersonName(studentName);
          
          addRecentScan(studentName, "SUCCESS");
          
          const photoUrl = webcamRef.current?.getScreenshot() || null;

          // Trigger backend notification Fire-and-Forget style for real-time speed
          fetch('http://localhost:5000/api/iot/face-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: studentName, 
              status: 'SUCCESS',
              studentId: studentId, 
              activityType: 'BOARDED',
              photoUrl: photoUrl
            })
          }).catch(e => console.error("API error", e));

          // Reset after just 1.5 seconds for extremely fast sequential scanning
          setTimeout(() => {
            setScanResult("IDLE");
            setPersonName("");
          }, 1500);
        } else {
          setScanResult("FAILED");
          addRecentScan("Unknown Face", "FAILED");
          setTimeout(() => setScanResult("IDLE"), 2000);
        }
      }
    };

    scanInterval = setInterval(scan, 1000); // scan every second
    return () => clearInterval(scanInterval);
  }, [modelsLoaded, labeledDescriptors, scanResult]);

  const addRecentScan = (name: string, status: "SUCCESS" | "FAILED") => {
    const log: ScanLog = {
      id: Math.random().toString(),
      name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status
    };
    setRecentScans(prev => [log, ...prev].slice(0, 8)); // Keep last 8
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row">
      {/* Sidebar / Statistics */}
      <div className="w-full md:w-80 bg-black/50 border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-6 h-6 text-indigo-500" />
          <span className="font-semibold text-lg">EduGuard Scanning Terminal</span>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
          <h3 className="font-medium mb-2 text-sm text-gray-300">System Status</h3>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${modelsLoaded ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            {modelsLoaded ? 'AI Models Loaded' : 'Loading AI Models...'}
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            {labeledDescriptors.length} Students Enrolled
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="font-medium mb-4 text-sm text-gray-300 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Live Scan Feed
          </h3>
          <div className="flex-1 space-y-3 overflow-hidden">
            {recentScans.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Waiting for scans...</p>
            ) : (
              recentScans.map(scan => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={scan.id} 
                  className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {scan.status === "SUCCESS" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                    <span className="text-sm font-medium">{scan.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{scan.time}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Terminal View */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-4xl relative aspect-video bg-black rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
          
          <Webcam 
            ref={webcamRef}
            audio={false}
            mirrored={true}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            className="w-full h-full object-cover brightness-110 contrast-110"
          />

          {/* UI Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
            <div className="flex justify-between items-start">
              <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-white/70 border border-white/10">
                TERMINAL-01 / ACTIVE
              </div>
              <div className="flex gap-2">
                <div className="w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
              </div>
            </div>
            
            {/* Center Scan Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/20 flex flex-col items-center justify-center">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500" />
              
              {/* Scanning Animation */}
              {scanResult === "IDLE" && (
                <motion.div 
                  className="w-full h-1 bg-indigo-500/50 blur-[2px]"
                  animate={{ y: [-128, 128] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              )}
              
              {/* Instructions */}
              <div className="absolute -bottom-12 whitespace-nowrap text-white/80 text-sm font-medium bg-black/60 px-4 py-1.5 rounded-full backdrop-blur border border-white/10 shadow-lg">
                Please ensure proper lighting & look at camera
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex gap-2">
                <div className="w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-indigo-500" />
              </div>
              <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-white/70 border border-white/10">
                EDUGUARD AI SCANNER
              </div>
            </div>
          </div>

          {/* Success/Fail Overlay */}
          {scanResult === "SUCCESS" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-emerald-500 z-20"
            >
              <CheckCircle2 className="w-24 h-24 text-emerald-400 mb-4" />
              <h2 className="text-4xl font-bold text-white mb-2">Access Granted</h2>
              <p className="text-xl text-emerald-100">Welcome, {personName}</p>
            </motion.div>
          )}

          {scanResult === "FAILED" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-rose-500/20 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-rose-500 z-20"
            >
              <AlertTriangle className="w-24 h-24 text-rose-400 mb-4" />
              <h2 className="text-4xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-xl text-rose-100">Unknown Face Detected</p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
