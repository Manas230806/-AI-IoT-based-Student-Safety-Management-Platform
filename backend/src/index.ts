import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import apiRoutes from './routes/api.routes';
import iotRoutes from './routes/iot.routes';
import { prisma } from './config/prisma';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/iot', iotRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// WebSocket connection for real-time features
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
  
  socket.on('busLocationUpdate', (data) => {
    // Broadcast bus location
    io.emit('busLocation', data);
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('Database connected successfully');
    
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
