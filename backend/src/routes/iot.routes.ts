import { Router } from 'express';
import nodemailer from 'nodemailer';
import { prisma } from '../config/prisma';
import { io } from '../index';

const router = Router();

router.get('/', (req, res) => res.json({ message: 'IoT API v1' }));

router.post('/ping', (req, res) => res.json({ status: 'ok' }));

router.post('/face-scan', async (req, res) => {
  const { name, status, email, studentId, activityType = 'BOARDED', busId, photoUrl } = req.body;
  
  console.log(`[IoT Event] Face Scan: ${name} - Status: ${status} - Activity: ${activityType}`);

  let emailSent = false;

  if (status === 'SUCCESS') {
    try {
      // 1. Ensure a valid Bus exists for AttendanceRecord
      let validBusId = busId;
      if (!validBusId) {
        const firstBus = await prisma.bus.findFirst();
        if (firstBus) {
          validBusId = firstBus.id;
        } else {
          // Create a demo bus and school if they don't exist
          const school = await prisma.school.findFirst() || await prisma.school.create({
            data: { name: 'Demo School', address: 'Demo Address', contactInfo: '123' }
          });
          const newBus = await prisma.bus.create({
            data: { registration: 'DEMO-BUS-01', capacity: 40, schoolId: school.id }
          });
          validBusId = newBus.id;
        }
      }

      // 2. Save to Database
      if (studentId) {
        const attendanceRecord = await prisma.attendanceRecord.create({
          data: {
            studentId,
            busId: validBusId,
            type: activityType,
            verifiedBy: 'Kiosk Terminal',
            photoUrl: photoUrl || null,
          }
        });
        console.log(`Saved attendance record for ${name}`);
        
        // Emit real-time event for parents
        io.emit('attendanceUpdate', {
          id: attendanceRecord.id,
          studentId: studentId,
          type: activityType,
          timestamp: attendanceRecord.timestamp,
          photoUrl: attendanceRecord.photoUrl,
        });
      }

      // 3. Send Email Notification Asynchronously (Fire and Forget)
      // This allows the API to return in ~50ms so the Kiosk doesn't freeze
      (async () => {
        try {
          let recipientEmail = email;

          if (!recipientEmail && studentId) {
            const studentWithParent = await prisma.student.findUnique({
              where: { id: studentId },
              include: { parents: { include: { parent: { include: { user: true } } } } }
            });
            if (studentWithParent?.parents?.[0]?.parent?.user?.email) {
              recipientEmail = studentWithParent.parents[0].parent.user.email;
            }
          }

          if (!recipientEmail && name) {
            const parts = name.split(' ');
            const firstName = parts[0];
            const lastName = parts.slice(1).join(' ');
            const studentByName = await prisma.student.findFirst({
              where: { firstName, lastName: lastName || undefined },
              include: { parents: { include: { parent: { include: { user: true } } } } }
            });
            if (studentByName?.parents?.[0]?.parent?.user?.email) {
              recipientEmail = studentByName.parents[0].parent.user.email;
            }
          }

          if (recipientEmail) {
            let transporter;
            
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
              transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS
                }
              });
            } else {
              const testAccount = await nodemailer.createTestAccount();
              transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                  user: testAccount.user,
                  pass: testAccount.pass,
                },
              });
            }

            const actionText = activityType === 'BOARDED' ? 'boarded the bus' : 'been dropped off safely';
            const actionStatus = activityType === 'BOARDED' ? 'Access Granted & Boarding Confirmed' : 'Drop-off Confirmed';
            
            const info = await transporter.sendMail({
              from: '"EduGuard Safety System" <alerts@eduguard.com>',
              to: recipientEmail,
              subject: `✅ EduGuard Safety Alert: ${activityType} Verification`,
              text: `Hello, this is an automated alert from EduGuard Safety. ${name} has successfully ${actionText}.`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; background-color: #f4f4f5; max-width: 600px;">
                  <h2 style="color: #4f46e5;">EduGuard Safety Alert</h2>
                  <p style="font-size: 16px; color: #374151;">
                    <strong>${name}</strong> has been successfully verified via Face Recognition and has <strong>${actionText}</strong>.
                  </p>
                  <div style="margin-top: 20px; padding: 15px; background-color: #10b981; color: white; border-radius: 5px;">
                    <strong>Status:</strong> ${actionStatus}
                  </div>
                </div>
              `,
            });

            console.log("Message sent asynchronously to parent: %s", info.messageId);
          }
        } catch (emailError) {
          console.error("Error sending parent email asynchronously:", emailError);
        }
      })();
      
    } catch (error) {
      console.error("Error processing face scan event:", error);
    }
  }

  res.json({ success: true, message: 'Event logged and notifications dispatch initiated' });
});

export default router;
