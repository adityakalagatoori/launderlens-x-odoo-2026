# TRAVELOOP — PRODUCTION ARCHITECTURE v1.0

> Stack locked. Zero ambiguity. Ready for development.

---

## 1. FINAL TECH STACK

### Frontend
| Layer | Choice |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** (strict mode) |
| Styling | **Tailwind CSS** + **shadcn/ui** |
| State Management | **Zustand** (client) + **TanStack Query v5** (server state) |
| Forms | **React Hook Form** + **Zod** |
| Maps | **Mapbox GL JS** |
| Charts | **Recharts** |
| Animations | **Framer Motion** |
| Real-time | **Socket.io-client** |
| PWA | **next-pwa** |

### Backend
| Layer | Choice |
|---|---|
| Runtime | **Node.js 20 LTS** |
| Framework | **Express.js** + **TypeScript** |
| ORM | **Prisma** |
| Auth | **Passport.js** (JWT + OAuth2) |
| Real-time | **Socket.io** |
| Queue | **BullMQ** + **Redis** |
| Cache | **Redis** (ioredis) |
| File Storage | **AWS S3** (via presigned URLs) |
| Image Processing | **Sharp** |
| OCR (Receipt) | **Tesseract.js** |
| Email | **Nodemailer** + **AWS SES** |
| Validation | **Zod** (shared schemas) |

### Database
| Layer | Choice |
|---|---|
| Primary DB | **PostgreSQL 16** |
| Cache / Queue | **Redis 7** |
| Search | **PostgreSQL Full-Text Search** (pg_trgm) |
| Migrations | **Prisma Migrate** |
| Backups | **pg_dump** via cron + **AWS S3** |

### AI
| Feature | Choice |
|---|---|
| Activity Recommendations | **OpenAI GPT-4o** (via API) |
| Memory Highlights Extraction | **OpenAI GPT-4o** |
| Smart Packing Suggestions | **OpenAI GPT-4o** |
| Receipt OCR Post-processing | **Tesseract.js** + GPT-4o Vision |

### Infrastructure
| Layer | Choice |
|---|---|
| Monorepo | **Turborepo** |
| Containerization | **Docker** + **Docker Compose** |
| Cloud | **AWS** (EC2 / ECS Fargate) |
| CDN | **AWS CloudFront** |
| Reverse Proxy | **Nginx** |
| CI/CD | **GitHub Actions** |
| Monitoring | **Datadog** |
| Error Tracking | **Sentry** |
| Secret Management | **AWS Secrets Manager** |

---

## 2. MONOREPO STRUCTURE

```
traveloop/
├── apps/
│   ├── web/                        # Next.js 14 frontend
│   └── api/                        # Express.js backend
├── packages/
│   ├── shared/                     # Shared Zod schemas, types, constants
│   ├── ui/                         # Shared shadcn/ui component library
│   ├── config/                     # Shared ESLint, Tailwind, TS configs
│   └── utils/                      # Shared utility functions
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   └── docker-compose.yml
│   ├── nginx/
│   │   └── nginx.conf
│   └── scripts/
│       ├── backup-db.sh
│       └── restore-db.sh
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 3. FRONTEND STRUCTURE (`apps/web/`)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── trips/
│   │   │   ├── page.tsx                    # Trip list
│   │   │   ├── new/
│   │   │   │   └── page.tsx                # Create trip wizard
│   │   │   └── [tripId]/
│   │   │       ├── page.tsx                # Trip overview
│   │   │       ├── itinerary/
│   │   │       │   └── page.tsx            # Itinerary builder
│   │   │       ├── budget/
│   │   │       │   └── page.tsx            # Budget dashboard
│   │   │       ├── packing/
│   │   │       │   └── page.tsx            # Packing checklist
│   │   │       ├── journal/
│   │   │       │   └── page.tsx            # Trip notes
│   │   │       └── live/
│   │   │           └── page.tsx            # Live progress tracking
│   │   ├── explore/
│   │   │   ├── cities/
│   │   │   │   └── page.tsx                # City search & discovery
│   │   │   └── activities/
│   │   │       └── page.tsx                # Activity search
│   │   ├── community/
│   │   │   ├── page.tsx                    # Community feed
│   │   │   └── [itineraryId]/
│   │   │       └── page.tsx                # Public itinerary view
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                                # Next.js route handlers (proxies only)
│   │   └── auth/[...nextauth]/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── SocialLoginButtons.tsx
│   ├── trips/
│   │   ├── TripCard.tsx
│   │   ├── TripWizard/
│   │   │   ├── TripWizard.tsx
│   │   │   ├── steps/
│   │   │   │   ├── Step1BasicInfo.tsx
│   │   │   │   ├── Step2Companions.tsx
│   │   │   │   ├── Step3Budget.tsx
│   │   │   │   ├── Step4Interests.tsx
│   │   │   │   └── Step5Settings.tsx
│   │   │   └── index.ts
│   │   └── TripHeader.tsx
│   ├── itinerary/
│   │   ├── ItineraryBuilder.tsx
│   │   ├── DayCard.tsx
│   │   ├── ActivityCard.tsx
│   │   ├── TimelineView.tsx
│   │   ├── MapView.tsx
│   │   ├── RoadMapVisualization.tsx        # Animated SVG road map
│   │   └── DetourRoulette.tsx              # Surprise activity generator
│   ├── budget/
│   │   ├── BudgetDashboard.tsx
│   │   ├── ExpenseLogger.tsx
│   │   ├── ReceiptOCR.tsx
│   │   ├── BudgetChart.tsx
│   │   └── ExpenseSplitter.tsx
│   ├── explore/
│   │   ├── CitySearch.tsx
│   │   ├── CityCard.tsx
│   │   ├── CityComparison.tsx
│   │   ├── ActivitySearch.tsx
│   │   ├── ActivityCard.tsx
│   │   └── PlaceSelector.tsx               # Amazon-style add-ons
│   ├── community/
│   │   ├── PublicItineraryView.tsx
│   │   ├── TravelBuddyMatcher.tsx
│   │   ├── CommunityFeed.tsx
│   │   └── ReviewCard.tsx
│   ├── widgets/
│   │   ├── MindfulExplorerWidget.tsx       # Home screen widget
│   │   ├── BudgetTrackerRing.tsx
│   │   └── TravelStatsWidget.tsx
│   ├── safety/
│   │   └── TripSafeShield.tsx
│   ├── carbon/
│   │   └── CarbonFootprintTracker.tsx
│   ├── packing/
│   │   ├── PackingChecklist.tsx
│   │   └── PackingTemplateLibrary.tsx
│   ├── journal/
│   │   ├── JournalEntry.tsx
│   │   └── MoodTracker.tsx
│   ├── map/
│   │   ├── MapboxMap.tsx
│   │   └── RouteOptimizer.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── ConfirmDialog.tsx
│       └── PageHeader.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTrip.ts
│   ├── useItinerary.ts
│   ├── useBudget.ts
│   ├── useSocket.ts
│   ├── useGeolocation.ts
│   └── useDebounce.ts
├── lib/
│   ├── api-client.ts                       # Axios instance with interceptors
│   ├── auth.ts                             # NextAuth config
│   ├── socket.ts                           # Socket.io client init
│   ├── mapbox.ts
│   └── utils.ts
├── stores/
│   ├── authStore.ts
│   ├── tripStore.ts
│   ├── itineraryStore.ts
│   └── uiStore.ts
├── types/
│   └── index.ts                            # Frontend-specific types
├── middleware.ts                           # Auth route protection
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 4. BACKEND STRUCTURE (`apps/api/`)

```
apps/api/
├── src/
│   ├── config/
│   │   ├── database.ts                     # Prisma client singleton
│   │   ├── redis.ts                        # Redis client
│   │   ├── passport.ts                     # Passport strategies
│   │   ├── env.ts                          # Zod-validated env vars
│   │   ├── aws.ts                          # AWS S3 client
│   │   └── socket.ts                       # Socket.io server init
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts              # Zod validation schemas
│   │   ├── users/
│   │   │   ├── users.routes.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.schema.ts
│   │   ├── trips/
│   │   │   ├── trips.routes.ts
│   │   │   ├── trips.controller.ts
│   │   │   ├── trips.service.ts
│   │   │   └── trips.schema.ts
│   │   ├── itineraries/
│   │   │   ├── itineraries.routes.ts
│   │   │   ├── itineraries.controller.ts
│   │   │   ├── itineraries.service.ts
│   │   │   └── itineraries.schema.ts
│   │   ├── cities/
│   │   │   ├── cities.routes.ts
│   │   │   ├── cities.controller.ts
│   │   │   ├── cities.service.ts
│   │   │   └── cities.schema.ts
│   │   ├── activities/
│   │   │   ├── activities.routes.ts
│   │   │   ├── activities.controller.ts
│   │   │   ├── activities.service.ts
│   │   │   └── activities.schema.ts
│   │   ├── budget/
│   │   │   ├── budget.routes.ts
│   │   │   ├── budget.controller.ts
│   │   │   ├── budget.service.ts
│   │   │   └── budget.schema.ts
│   │   ├── packing/
│   │   │   ├── packing.routes.ts
│   │   │   ├── packing.controller.ts
│   │   │   └── packing.service.ts
│   │   ├── journal/
│   │   │   ├── journal.routes.ts
│   │   │   ├── journal.controller.ts
│   │   │   └── journal.service.ts
│   │   ├── community/
│   │   │   ├── community.routes.ts
│   │   │   ├── community.controller.ts
│   │   │   └── community.service.ts
│   │   ├── safety/
│   │   │   ├── safety.routes.ts
│   │   │   ├── safety.controller.ts
│   │   │   └── safety.service.ts
│   │   ├── carbon/
│   │   │   ├── carbon.routes.ts
│   │   │   ├── carbon.controller.ts
│   │   │   └── carbon.service.ts
│   │   ├── ai/
│   │   │   ├── ai.routes.ts
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts               # OpenAI wrapper
│   │   │   └── ocr.service.ts              # Tesseract + GPT-4o Vision
│   │   ├── notifications/
│   │   │   ├── notifications.routes.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── email.service.ts
│   │   ├── upload/
│   │   │   ├── upload.routes.ts
│   │   │   ├── upload.controller.ts
│   │   │   └── upload.service.ts           # S3 presigned URLs + Sharp
│   │   └── analytics/
│   │       ├── analytics.routes.ts
│   │       └── analytics.service.ts
│   ├── middleware/
│   │   ├── authenticate.ts                 # JWT verification middleware
│   │   ├── authorize.ts                    # Role-based access
│   │   ├── validate.ts                     # Zod schema validation middleware
│   │   ├── rateLimiter.ts                  # express-rate-limit + Redis
│   │   ├── errorHandler.ts                 # Global error handler
│   │   └── requestLogger.ts
│   ├── queues/
│   │   ├── emailQueue.ts
│   │   ├── notificationQueue.ts
│   │   ├── ocrQueue.ts
│   │   └── weatherRescheduleQueue.ts
│   ├── workers/
│   │   ├── emailWorker.ts
│   │   ├── notificationWorker.ts
│   │   ├── ocrWorker.ts
│   │   └── weatherWorker.ts
│   ├── sockets/
│   │   ├── handlers/
│   │   │   ├── itinerary.handler.ts        # Real-time collab
│   │   │   ├── liveTracking.handler.ts
│   │   │   └── notification.handler.ts
│   │   └── socketRegistry.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── catchAsync.ts
│   │   ├── pagination.ts
│   │   └── carbonCalculator.ts
│   ├── jobs/
│   │   ├── dbBackup.job.ts                 # Nightly pg_dump to S3
│   │   ├── priceMonitor.job.ts
│   │   └── weatherSync.job.ts
│   ├── app.ts                              # Express app setup
│   └── server.ts                           # Entry point
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.ts
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 5. DATABASE SCHEMA ORGANIZATION (`prisma/schema.prisma`)

```
Schema Groups (logical sections within schema.prisma)
│
├── ── USER DOMAIN ──
│   ├── users                       (id, email, password_hash, role, is_verified)
│   ├── user_profiles               (avatar, bio, country, travel_style)
│   ├── user_settings               (theme, language, notifications, privacy)
│   └── user_preferences            (budget_range, pace, interests[], dietary[])
│
├── ── TRIP DOMAIN ──
│   ├── trips                       (id, user_id, name, dates, type, visibility, cover_photo)
│   ├── trip_types                  (solo, couple, family, group, business)
│   ├── trip_companions             (trip_id, user_id, role, invite_status)
│   └── trip_interests              (trip_id, interest_tag)
│
├── ── ITINERARY DOMAIN ──
│   ├── itineraries                 (id, trip_id, version, is_active)
│   ├── itinerary_stops             (id, itinerary_id, city_id, order, days_count)
│   ├── itinerary_activities        (id, stop_id, activity_id, day, time_start, time_end, notes)
│   ├── itinerary_accommodations    (id, stop_id, name, check_in, check_out, cost)
│   └── itinerary_transport         (id, stop_id, mode, from_city, to_city, cost)
│
├── ── CITY DOMAIN ──
│   ├── cities                      (id, name, country, lat, lng, timezone, currency)
│   ├── city_costs                  (city_id, category, avg_low, avg_high, currency)
│   ├── city_weather                (city_id, month, avg_temp, precipitation, season_tag)
│   ├── city_reviews                (id, city_id, user_id, rating, body, photos[])
│   └── city_safety_info            (city_id, theft_risk, lgbtq_friendly, women_solo_rating, scams[])
│
├── ── ACTIVITY DOMAIN ──
│   ├── activities                  (id, city_id, name, category, duration_mins, cost, rating)
│   ├── activity_bookings           (id, activity_id, user_id, booked_at, external_ref)
│   ├── activity_combos             (id, activity_ids[], discount_pct, label)
│   └── activity_reviews            (id, activity_id, user_id, rating, body, photos[])
│
├── ── BUDGET DOMAIN ──
│   ├── expenses                    (id, trip_id, user_id, amount, currency, category, date)
│   ├── expenses_receipts           (id, expense_id, image_url, ocr_data jsonb)
│   └── budget_categories          (id, trip_id, label, allocated, spent)
│
├── ── PACKING DOMAIN ──
│   ├── packing_lists               (id, trip_id, scenario_name)
│   └── packing_items               (id, list_id, name, category, is_packed, weight_g, price)
│
├── ── JOURNAL DOMAIN ──
│   ├── notes                       (id, trip_id, user_id, day, type, body, mood, energy)
│   ├── notes_attachments           (id, note_id, url, caption, type)
│   └── note_mood_tracker           (id, trip_id, user_id, date, mood_score, energy_score)
│
├── ── COMMUNITY DOMAIN ──
│   ├── public_itineraries          (id, itinerary_id, slug, is_featured, views, copies)
│   ├── public_reviews              (id, public_itinerary_id, user_id, rating, body)
│   ├── trip_shares                 (id, trip_id, shared_by, shared_to, permission)
│   ├── community_reviews           (id, city_id|activity_id, user_id, body, rating)
│   ├── questions                   (id, target_id, target_type, user_id, body)
│   └── direct_messages             (id, from_id, to_id, body, read_at)
│
├── ── SAFETY DOMAIN ──
│   ├── safety_alerts               (id, city_id, type, body, severity, valid_until)
│   ├── scam_reports                (id, city_id, description, reported_by, verified)
│   └── verified_vendors            (id, name, type, city_id, verified_at)
│
├── ── CARBON DOMAIN ──
│   ├── carbon_emissions            (id, trip_id, transport_id, mode, kg_co2)
│   └── carbon_offsets              (id, trip_id, program, amount_kg, cost)
│
├── ── SOCIAL DOMAIN ──
│   ├── follows                     (follower_id, following_id)
│   ├── buddy_matches               (id, user_a_id, user_b_id, score, status)
│   ├── achievements                (id, user_id, badge_key, earned_at)
│   └── wishlist                    (id, user_id, city_id|activity_id, price_alert)
│
└── ── SYSTEM DOMAIN ──
    ├── admin_users                 (id, user_id, permissions[])
    ├── analytics_events            (id, user_id, event_name, properties jsonb, ts)
    ├── mindful_widget_stats        (id, user_id, date, phone_locked_mins, points)
    ├── roadmap_data                (id, trip_id, svg_data text, gems jsonb)
    └── detour_history              (id, user_id, activity_id, triggered_at, accepted)
```

---

## 6. API MODULE STRUCTURE

### Base URL: `https://api.traveloop.com/v1`

```
/v1
│
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh-token
│   ├── POST   /magic-link
│   ├── POST   /forgot-password
│   ├── POST   /reset-password
│   ├── GET    /oauth/:provider          # Google, Facebook, Apple
│   └── GET    /oauth/:provider/callback
│
├── /users
│   ├── GET    /me
│   ├── PATCH  /me
│   ├── DELETE /me
│   ├── GET    /me/analytics
│   ├── GET    /:userId/profile          # Public profile
│   └── POST   /:userId/follow
│
├── /trips
│   ├── GET    /                         # Paginated list
│   ├── POST   /
│   ├── GET    /:tripId
│   ├── PATCH  /:tripId
│   ├── DELETE /:tripId
│   ├── POST   /:tripId/companions
│   ├── DELETE /:tripId/companions/:userId
│   └── POST   /:tripId/share
│
├── /itineraries
│   ├── GET    /trips/:tripId/itinerary
│   ├── POST   /trips/:tripId/itinerary
│   ├── PATCH  /trips/:tripId/itinerary
│   ├── POST   /trips/:tripId/itinerary/stops
│   ├── PATCH  /trips/:tripId/itinerary/stops/:stopId
│   ├── DELETE /trips/:tripId/itinerary/stops/:stopId
│   ├── POST   /trips/:tripId/itinerary/stops/:stopId/activities
│   ├── PATCH  /trips/:tripId/itinerary/stops/:stopId/activities/:actId
│   ├── DELETE /trips/:tripId/itinerary/stops/:stopId/activities/:actId
│   ├── POST   /trips/:tripId/itinerary/reorder
│   └── GET    /trips/:tripId/itinerary/roadmap
│
├── /cities
│   ├── GET    /search                   # ?q=&region=&cost=&visa=
│   ├── GET    /:cityId
│   ├── GET    /:cityId/costs
│   ├── GET    /:cityId/weather
│   ├── GET    /:cityId/safety
│   ├── GET    /:cityId/reviews
│   ├── POST   /:cityId/reviews
│   └── GET    /compare                  # ?ids=a,b,c
│
├── /activities
│   ├── GET    /search                   # ?cityId=&category=&cost=&duration=
│   ├── GET    /:activityId
│   ├── GET    /:activityId/reviews
│   ├── POST   /:activityId/reviews
│   ├── POST   /:activityId/book
│   └── GET    /detour-roulette          # ?tripId=&budget=&cityId=
│
├── /budget
│   ├── GET    /trips/:tripId/budget
│   ├── PATCH  /trips/:tripId/budget
│   ├── GET    /trips/:tripId/expenses
│   ├── POST   /trips/:tripId/expenses
│   ├── PATCH  /trips/:tripId/expenses/:expId
│   ├── DELETE /trips/:tripId/expenses/:expId
│   └── POST   /trips/:tripId/expenses/:expId/receipt   # OCR trigger
│
├── /packing
│   ├── GET    /trips/:tripId/packing
│   ├── POST   /trips/:tripId/packing/lists
│   ├── POST   /trips/:tripId/packing/lists/:listId/items
│   ├── PATCH  /trips/:tripId/packing/lists/:listId/items/:itemId
│   └── DELETE /trips/:tripId/packing/lists/:listId/items/:itemId
│
├── /journal
│   ├── GET    /trips/:tripId/journal
│   ├── POST   /trips/:tripId/journal
│   ├── PATCH  /trips/:tripId/journal/:noteId
│   ├── DELETE /trips/:tripId/journal/:noteId
│   └── POST   /trips/:tripId/journal/:noteId/attachments
│
├── /community
│   ├── GET    /feed
│   ├── GET    /itineraries              # Public itineraries
│   ├── GET    /itineraries/:slug
│   ├── POST   /itineraries/:slug/copy
│   ├── POST   /itineraries/:slug/review
│   ├── GET    /buddies/matches
│   ├── POST   /buddies/request/:userId
│   ├── GET    /messages
│   └── POST   /messages/:userId
│
├── /safety
│   ├── GET    /cities/:cityId/alerts
│   ├── GET    /cities/:cityId/scams
│   ├── GET    /vendors/:vendorId/verify
│   └── POST   /scams/report
│
├── /carbon
│   ├── GET    /trips/:tripId/footprint
│   └── POST   /trips/:tripId/offset
│
├── /ai
│   ├── POST   /recommendations         # Activity recs
│   ├── POST   /journal/highlights       # Memory extraction
│   ├── POST   /packing/suggest
│   └── POST   /weather/reschedule      # Auto-reorder itinerary
│
├── /upload
│   ├── POST   /presign                 # Get S3 presigned URL
│   └── POST   /confirm                 # Confirm upload complete
│
├── /notifications
│   ├── GET    /
│   ├── PATCH  /:notifId/read
│   └── DELETE /:notifId
│
└── /admin                              # Admin-only routes
    ├── GET    /users
    ├── GET    /analytics
    ├── POST   /cities
    ├── PATCH  /cities/:cityId
    └── POST   /vendors/:vendorId/verify
```

---

## 7. INFRASTRUCTURE / DEPLOYMENT STRUCTURE

```
infrastructure/
│
├── docker/
│   ├── Dockerfile.web                  # Multi-stage: builder + runner (node:20-alpine)
│   ├── Dockerfile.api                  # Multi-stage: builder + runner (node:20-alpine)
│   └── docker-compose.yml              # Local dev: web + api + postgres + redis
│
├── nginx/
│   └── nginx.conf                      # Reverse proxy + SSL termination + rate limiting
│
└── scripts/
    ├── backup-db.sh                    # pg_dump → gzip → AWS S3 (run via cron)
    └── restore-db.sh
```

### AWS Production Architecture

```
                        ┌─────────────┐
                        │  CloudFront │  (CDN for static assets + API cache headers)
                        └──────┬──────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
      ┌───────▼──────┐                 ┌────────▼───────┐
      │  ECS Fargate  │                 │  ECS Fargate   │
      │   (Next.js)   │                 │  (Express API) │
      │   2+ tasks    │                 │   2+ tasks     │
      └───────────────┘                 └────────┬───────┘
                                                 │
                               ┌─────────────────┼──────────────┐
                               │                 │              │
                      ┌────────▼──────┐  ┌───────▼──────┐  ┌───▼────────┐
                      │  RDS Postgres  │  │  ElastiCache  │  │    S3      │
                      │  (Multi-AZ)   │  │    Redis      │  │  (uploads) │
                      └───────────────┘  └───────────────┘  └────────────┘
```

### CI/CD Pipeline (`.github/workflows/`)

```
Push to main
    │
    ├── ci.yml
    │   ├── Lint (ESLint + TypeScript check)
    │   ├── Unit tests (Vitest)
    │   ├── Integration tests
    │   └── Build check
    │
    └── deploy.yml (on merge to main)
        ├── Build Docker images
        ├── Push to AWS ECR
        ├── Run Prisma migrations (prisma migrate deploy)
        ├── Deploy to ECS Fargate (rolling update)
        └── Notify Slack
```

### Backup & Recovery

```
Schedule: Daily 2 AM UTC
  pg_dump traveloop_prod | gzip > traveloop_$(date +%Y%m%d).sql.gz
  aws s3 cp → s3://traveloop-backups/db/$(date +%Y/%m/%d)/

Retention:
  - Daily: 30 days
  - Weekly: 12 weeks
  - Monthly: 12 months

Recovery:
  aws s3 cp s3://traveloop-backups/db/... backup.sql.gz
  gunzip | psql traveloop_prod
```

---

## 8. ARCHITECTURE PATTERNS

| Pattern | Application |
|---|---|
| **Module pattern** | Each domain = routes → controller → service → prisma. No cross-module DB access. |
| **Repository pattern** | All DB queries inside `*.service.ts`. Controllers call services only. |
| **Shared Zod schemas** | `packages/shared` exports schemas used by both frontend and backend. Single source of truth for types. |
| **Middleware chain** | `authenticate → authorize → validate(schema) → controller`. Validation never reaches business logic unsanitized. |
| **Queue-first for async** | Email, OCR, weather sync, notifications — never blocking the HTTP request. BullMQ processes in background. |
| **Socket namespaces** | `/itinerary` for collab, `/live` for tracking, `/notifications` for real-time alerts. Isolated. |
| **Redis caching** | City data, activity lists, public itineraries cached with TTL. Invalidated on write via service layer. |
| **Turborepo caching** | Build cache for CI. Only rebuilds changed packages. |
| **Feature flags** | `user_settings.feature_flags jsonb` — toggle advanced features per user without deploys. |
| **ApiError class** | All errors are `throw new ApiError(status, message, code)`. Global handler formats response uniformly. |

---

*Traveloop Architecture v1.0 — Complete. Ready for development.*
