`<div align="center">
  <img src="https://img.icons8.com/color/120/000000/shield.png" alt="EduGuard Logo" width="100"/>
  
  # EduGuard Safety System
  **Next-Generation AI Facial Recognition & Student Tracking Platform**

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
</div>

<br />

## 🌟 About The Project

**EduGuard** is an advanced, automated school safety platform designed to provide real-time tracking of students using cutting-edge AI facial recognition. When a student boards a bus or enters the school, the EduGuard Kiosk instantly scans their face, logs the event, and dispatches an automated email alert to their parents—all in less than 2 seconds.

Our platform consists of three main interfaces:
1. **The AI Kiosk:** A lightning-fast facial recognition terminal running directly in the browser.
2. **The Admin Portal:** A comprehensive dashboard for school staff to manage enrollments and view live attendance logs.
3. **The Parent Portal:** A secure space for parents to view their children's real-time safety status.

---

## ✨ Key Features

- 🚀 **Lightning Fast AI Recognition:** Uses `face-api.js` with a finely tuned distance threshold for instantaneous, highly-secure student identification.
- 📧 **Real-Time Automated Alerts:** Parents receive instant email notifications the exact moment their child is verified, utilizing asynchronous Node.js workers to prevent bottlenecks.
- 📊 **Live Activity Feeds:** Admins and parents can monitor live, Excel-style searchable tracking tables that update in real-time.
- 🔐 **Secure Role-Based Access:** Dedicated portals for School Administrators and Parents, ensuring strict data privacy and isolation.
- 🎨 **Premium UI/UX:** Built with TailwindCSS and Framer Motion for a stunning, glassmorphism-inspired aesthetic with buttery-smooth micro-animations.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **AI/ML:** [Face-api.js](https://justadudewhohacks.github.io/face-api.js/docs/index.html)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend
- **Framework:** [Express.js](https://expressjs.com/) (Node.js)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** SQLite (Easily scalable to PostgreSQL)
- **Authentication:** JWT & bcrypt
- **Mailing:** Nodemailer (via SMTP)

---

## 🚀 Getting Started

Follow these steps to set up the EduGuard ecosystem on your local machine.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Database & Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Initialize Prisma Database
npx prisma generate
npx prisma db push

# Create a .env file and add your SMTP credentials (for emails)
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password

# Start the backend server (runs on port 5000)
npm run dev
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend server (runs on port 3000)
npm run dev
```

### 3. Accessing the Portals
Once both servers are running, navigate to the following localhost URLs:
- **Landing Page:** [http://localhost:3000](http://localhost:3000)
- **Kiosk Scanner:** [http://localhost:3000/kiosk](http://localhost:3000/kiosk)
- **Admin Dashboard:** [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
- **Parent Portal:** [http://localhost:3000/parent/profile](http://localhost:3000/parent/profile)

---

## 🤝 Contributing
Contributions, issues, and feature requests are always welcome! 
Feel free to check out the [issues page](#) if you want to contribute.

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

<br />

<div align="center">
  <b>Built with ❤️ for the safety of the next generation.</b>
</div>
`