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
LOGIN PAGE :-

<img width="1916" height="940" alt="image" src="https://github.com/user-attachments/assets/5d1fdf8a-cb38-4a7f-a54d-e53d279f5cb2" />

CONFORMATION LINK FOR NEW USERS :-

<img width="1914" height="984" alt="image" src="https://github.com/user-attachments/assets/172b01f3-f97c-4e79-8118-c26ba74d84cc" />

USER DASHBOARD PAGE :-

<img width="1919" height="943" alt="image" src="https://github.com/user-attachments/assets/93a0d105-9fa4-4801-8e5a-2ecaa80d4886" />

USER HOME PAGE :-

<img width="1918" height="990" alt="image" src="https://github.com/user-attachments/assets/76741d4e-914d-4a1e-ab6f-9e0e642b3894" />

NEW TRIP :-

<img width="1917" height="989" alt="image" src="https://github.com/user-attachments/assets/c3ff8241-212c-49b8-917c-6d05e08b53ce" />

<img width="1916" height="994" alt="image" src="https://github.com/user-attachments/assets/12b2263f-3f5a-4dcc-a316-bbed81f54dae" />

<img width="1910" height="942" alt="image" src="https://github.com/user-attachments/assets/02c50edf-18a6-4080-98bb-8ac5d6c14ed6" />

<img width="1913" height="945" alt="image" src="https://github.com/user-attachments/assets/c372620e-2119-4362-bfec-d9ae0e2ee884" />

<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/1e22b1f4-b0ea-418e-bda2-02089d985543" />

<img width="1916" height="945" alt="image" src="https://github.com/user-attachments/assets/caf08d7a-603a-4301-8325-854c0874bc61" />

TRIP DASHBOARD :-

<img width="1914" height="947" alt="image" src="https://github.com/user-attachments/assets/6c4ce9b3-8e3e-423d-ad14-31bfe4ffdd8a" />

TRIP ITINERARY :-

<img width="1912" height="939" alt="image" src="https://github.com/user-attachments/assets/1e60e931-57ad-482f-bb7e-30aaed49bae1" />

TRIP ROADMAP :-

<img width="1910" height="944" alt="image" src="https://github.com/user-attachments/assets/fcd965ec-fe45-43a7-bcb1-f16236259628" />

TRIP EXPENSES INVOINCE :-

<img width="1915" height="946" alt="image" src="https://github.com/user-attachments/assets/bf1996df-0c32-42c6-b9fb-0899adb67ffc" />

GUIDE REGISTRATION PAGE :-

<img width="1907" height="992" alt="image" src="https://github.com/user-attachments/assets/9cf96c74-d1e6-437d-800d-469c7add9cb6" />

GUIDE DASHBOARD [BEFORE BOOKINGS] :-

<img width="1915" height="990" alt="image" src="https://github.com/user-attachments/assets/4f1b7e1b-a70b-4e81-9984-56024240a6c0" />

UPDATED TRIP DASHBOARD FOR BOOKINGS :-

<img width="1916" height="939" alt="image" src="https://github.com/user-attachments/assets/8da280ea-8671-4dc6-a89e-15f96e8236c8" />

<img width="1917" height="942" alt="image" src="https://github.com/user-attachments/assets/b40d769f-78a2-4618-b938-748b976c1d4e" />

<img width="1917" height="947" alt="image" src="https://github.com/user-attachments/assets/0511ba02-72a6-464e-a725-e1cfed1a9be9" />

GUIDE LOGIN PAGE :-

<img width="1915" height="936" alt="image" src="https://github.com/user-attachments/assets/781e08c2-afd5-48d2-b410-5b473cb3ddce" />

UPDATED GUIDE DASHBOARD :-

<img width="1916" height="944" alt="image" src="https://github.com/user-attachments/assets/d737bf3a-502a-4109-ae3f-9eadff130eee" />

GUIDE ACCEPTANCE PAGE :-

<img width="1918" height="991" alt="image" src="https://github.com/user-attachments/assets/9e63d67b-6a34-4508-8513-62b708aba416" />

CONFORMATION GUIDE DASHBOARD :-

<img width="1915" height="985" alt="image" src="https://github.com/user-attachments/assets/45046881-ad29-4673-b138-3e70e97ccd77" />

EDITABLE GUIDE SPECS :-

<img width="1918" height="990" alt="image" src="https://github.com/user-attachments/assets/32bb0713-47fd-4099-8cdc-b068a71df0c3" />

NON-STATIC SEARCH BAR :-

<img width="1916" height="991" alt="image" src="https://github.com/user-attachments/assets/12a70d44-36c7-4937-a4a2-be082792d6eb" />

CITY DISCOVERY :-

<img width="1915" height="988" alt="image" src="https://github.com/user-attachments/assets/c20a3a76-660e-46be-b76a-6653c2fa4a62" />

WORKIG FILTERS :-  

<img width="1908" height="982" alt="image" src="https://github.com/user-attachments/assets/f7872465-c45c-4150-bbe4-66da61797e51" />   

REAL-TIME DESTINATION COMPARISION FOR THE USERS :-

<img width="1914" height="989" alt="image" src="https://github.com/user-attachments/assets/6f2676ae-7cd2-4ba1-90fb-0e3343469813" />

DYNAMIC-REAL-TIME CARDS FOR EACH CITY AND THIER POPULAR EXPERIENCES :- [WISHLIST OPTIONS INCLUDED]

<img width="1916" height="989" alt="image" src="https://github.com/user-attachments/assets/39ea78eb-9aec-4c79-8e10-76fac919cf2e" />

<img width="1918" height="989" alt="image" src="https://github.com/user-attachments/assets/a79099d3-d2ee-4c70-8599-0738a8ce8df6" />

COMUNITY TAB FOR ALL USERS :-

<img width="1916" height="989" alt="image" src="https://github.com/user-attachments/assets/679605d1-50af-4cc2-a026-1024ce19bad9" />

HOW TO PUBLISH UR OWN STORIES :-

<img width="1910" height="987" alt="image" src="https://github.com/user-attachments/assets/77cbb18d-fbd3-4911-8955-03f2d15ff2ea" />

WISHLISTS UPDATING IN REAL-TIME :-

<img width="1914" height="981" alt="image" src="https://github.com/user-attachments/assets/9acd3217-2aa0-4d8d-b769-7d93defe996b" />

REAL-TIME AI SUGGESTED AND DYNAMIC PACKING TOOL FOR USERS :-

<img width="1916" height="977" alt="image" src="https://github.com/user-attachments/assets/ce2593a8-006d-40e4-bf1f-0b00ee4408e7" />

ADMIN PORTAL LOGIN PAGE :- [admin@2026] , WITH REFRESH BUTTON

<img width="1911" height="987" alt="image" src="https://github.com/user-attachments/assets/209be730-6d6c-4426-ada8-17e24534f5e2" />

REAL-TIME ADMIN PORTAL :-

<img width="1917" height="991" alt="image" src="https://github.com/user-attachments/assets/34ee79cd-f3e0-4b5d-a470-419fd5aaec78" />

<img width="1919" height="972" alt="image" src="https://github.com/user-attachments/assets/82b4caeb-de09-4322-bd16-75a406510c9b" />

<img width="1911" height="987" alt="image" src="https://github.com/user-attachments/assets/70551cee-ad0f-4733-b8a1-63b824a29ea2" />

<img width="1914" height="860" alt="image" src="https://github.com/user-attachments/assets/73e4f14b-4853-4d1b-aae2-5fab09b28ee8" />

<img width="1916" height="986" alt="image" src="https://github.com/user-attachments/assets/417b7781-e337-4b55-a9b6-553e59137b5c" />




































