import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const key = `rate-limit:${ip}`;
  const limit = 100; // 100 requests per minute
  const window = 60;

  try {
    const current = await redis.get(key);
    
    if (current && parseInt(current) >= limit) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later.'
      });
    }

    const multi = redis.multi();
    multi.incr(key);
    if (!current) {
      multi.expire(key, window);
    }
    await multi.exec();
    
    next();
  } catch (error) {
    console.error('Redis Rate Limiter Error:', error);
    next(); // Fallback to allowing request if Redis fails
  }
};
