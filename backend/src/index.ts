import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
try { var compression = require('compression'); } catch(e) { var compression: any = null; }
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.routes';
import cityRoutes from './routes/city.routes';
import activityRoutes from './routes/activity.routes';
import tripRoutes from './routes/trip.routes';
import adminRoutes from './routes/admin.routes';
import guideRoutes from './routes/guide.routes';
import communityRoutes from './routes/community.routes';
import wishlistRoutes from './routes/wishlist.routes';
import buddyRoutes from './routes/buddy.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Request Processing
if (compression) app.use(compression()); // gzip all responses
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_SECRET || 'traveloop-session-secret', resave: false, saveUninitialized: false, cookie: { maxAge: 86400000 } }));
app.use(passport.initialize());
app.use(passport.session());
if (process.env.NODE_ENV !== 'production') app.use(morgan('tiny'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/buddy', buddyRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Traveloop Backend running on port ${PORT}`);
});
