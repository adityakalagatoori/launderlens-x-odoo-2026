**# launderlens-x-odoo-2026
"LaunderLens — Washing away problems, one solution at a time. The lens sees what others miss. Built for Odoo x KAHE Hackathon '26."**

**TEAM MEMBERS :-**   
KALAGATOORI VAISHNAV ADITYA | Backend & Database  
SRUSHTI DAKSHINAMOORTHY | Research, Planning & Documentation  
BALACHANDAR A | Developer  
SHYAAM GANESH M.R | UI/UX & Frontend  


**Problem Statement :-**

Design and develop a complete travel planning application where users can:
- Create customized multi-city itineraries
- Assign travel dates, activities, and budgets
- Discover activities and destinations through search
- Receive cost breakdowns and visual calendars
- Share their plans publicly or with friends
The application must demonstrate proper use of relational databases to store and retrieve complex travel data such as user-specific itineraries, stops, activities, and estimated expenses. The system should also support dynamic user interfaces that adapt to each user's trip flow.

Our Solution :-

TRAVELOOP is an AI-powered smart travel planning and management platform designed to simplify multi-city travel experiences through intelligent itinerary generation, budget tracking, real-time collaboration, and personalized travel assistance.

The platform combines modern travel planning with automation, real-time updates, safety intelligence, and community-driven exploration to create a complete end-to-end travel ecosystem for solo travelers, families, groups, and travel enthusiasts.

Main Features:
• AI-powered itinerary builder
• Smart multi-step trip planning wizard
• Real-time collaborative trip management
• Magic-link and OTP-based secure authentication
• Smart city and activity discovery system
• Budget planning with expense analytics
• Receipt OCR for automatic expense tracking
• Packing checklist and travel organizer
• Community itinerary sharing and reviews
• Real-time travel notifications and alerts
• Travel safety and scam awareness system
• Carbon footprint tracking
• Weather-aware itinerary rescheduling
• Smart recommendation engine
• Responsive premium travel UI experience

The platform is built with a scalable production-grade architecture using modern cloud-native technologies and modular backend systems.
 


Tech Stack :-

Frontend:
• Next.js 14 (App Router)
• TypeScript
• Tailwind CSS
• shadcn/ui
• Framer Motion
• Zustand
• TanStack Query
• React Hook Form
• Zod

Backend:
• Node.js
• Express.js
• Prisma ORM
• PostgreSQL
• Redis
• BullMQ

Authentication:
• Better Auth
• JWT Authentication
• Google OAuth
• Apple OAuth
• Facebook OAuth
• AWS SES Magic Link Authentication
• Twilio OTP Verification

Infrastructure & Cloud:
• AWS S3
• AWS SES
• Docker
• Docker Compose
• GitHub Actions
• Nginx
• ECS Fargate

Additional Services:
• Mapbox API
• OpenAI GPT-4o
• Tesseract OCR
• Socket.io
• Sharp Image Processing


Features :-

• Secure authentication system with Magic Link, OTP, and OAuth
• AI-powered trip planning and smart recommendations
• Multi-step trip creation wizard
• Smart itinerary builder with drag-and-drop planning
• City and activity discovery engine
• Real-time collaborative travel planning
• Budget tracking and financial analytics
• OCR-based receipt scanning and auto expense extraction
• Packing checklist with smart suggestions
• Public itinerary sharing and community reviews
• Travel buddy matching and social features
• Real-time notifications and trip alerts
• Safety monitoring and scam detection system
• Carbon footprint tracking and eco insights
• Responsive mobile-first user experience
• Premium glassmorphism travel-themed UI
• Cloud-based scalable backend architecture
• Real-time API validation and secure session management


Live Demo :-

Project Structure :-
<img width="890" height="490" alt="WhatsApp Image 2026-05-10 at 16 42 37" src="https://github.com/user-attachments/assets/bb01cc45-33c7-4931-81a4-d686d9b5db1f" />


How to Run Locally :-

Commands to Run on Any Device
Step 1 — Clone the repo
bash
git clone https://github.com/adityakalagatoori/launderlens-x-odoo-2026.git
cd launderlens-x-odoo-2026
Step 2 — Setup Backend
bash
cd backend
npm install
Create your .env file (copy from example):

bash
copy .env.example .env
Then open .env and fill in your Gmail, Google OAuth keys, etc.

bash
npx prisma generate
npx prisma db push
npm run dev
Backend runs at http://localhost:5000

Step 3 — Setup Frontend (new terminal)
bash
cd frontend
npm install
npm run dev
Frontend runs at http://localhost:3000

Quick Reference (both running)
Terminal 1	Terminal 2
cd backend → npm run dev	cd frontend → npm run dev
Runs on port 5000	Runs on port 3000
Open browser → http://localhost:3000 

Screenshots :-

