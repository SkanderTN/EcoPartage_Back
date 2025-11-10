# ÉcoPartage – Backend (NestJS + PostgreSQL)

Robust API for ÉcoPartage — a circular-economy platform to reduce waste and give items a second life. This service powers authentication, listings (annonces), AI-assisted posting, reservations, real-time chat, and the cart/checkout flow.

## ✨ Features

- **JWT Auth**: signup/signin, profile, secure routes.
- **Listings CRUD**: create, read, update, delete with filters (type, category, status, location).
- **AI Assistance**: price estimation from image, smart title suggestions, rich description generation, quantity/unit detection.
- **Reservations**: status lifecycle — `AVAILABLE → RESERVED → COMPLETED` (+ cancel).
- **Real-time Chat**: Socket.io gateway, rooms per listing, history & delivery confirmation.
- **Cart & Checkout**: add/remove items, group reservation with checkout.
- **Categories**: predefined & custom categories.
- **Media**: Image handling via Cloudinary (main + additional photos).

> High-level architecture, features, and flows are summarized from the project report.

## 🧰 Tech Stack

- **Runtime / Framework**: Node.js, **NestJS** (TypeScript, modular architecture)  
- **DB / ORM**: **PostgreSQL** + TypeORM  
- **Auth / Security**: **JWT**, bcrypt  
- **Real-time**: **Socket.io** (WebSocket gateway)  
- **AI**: Hugging Face Vision model (Qwen2.5-VL-7B-Instruct) via a dedicated AI module  
- **Media**: Cloudinary  
- **Tooling**: Docker, Postman, Jest (tests), GitHub Actions (recommended)

## 🗂️ Modules (example)
- `AuthModule`, `PostsModule` (posts + categories), `AiModule`, `ChatModule`, `CartModule`, `CloudinaryModule`

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18 (LTS recommended)  
- PostgreSQL ≥ 14  
- npm or pnpm  
- (Optional) Docker & Docker Compose

### Environment

Create a `.env` file at the project root (example values — DO NOT put real secrets in the repo):

```env
# Server
PORT=4000
CORS_ORIGIN=http://localhost:5173

# PostgreSQL (either one format)
DATABASE_URL=postgres://user:password@localhost:5432/ecopartage

# OR:
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASS=password
DB_NAME=ecopartage

# Auth
JWT_SECRET=your_jwt_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=xxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxx

# AI (Hugging Face)
HUGGINGFACE_API_KEY=hf_xxxxxxxxx
HF_MODEL=Qwen2.5-VL-7B-Instruct
```

> Replace placeholders with values stored securely (CI secrets / environment).

### Install & Run (local)

1. Install dependencies  
2. (Optional) Start DB via Docker compose  
3. Run migrations (if used)  
4. Start dev server

Example script names (adapt if package.json differs):
- start:dev — runs the dev server
- build & start:prod — production

**API Base URL:** http://localhost:4000

## 📚 API Reference (summary)

### Auth
- POST /auth/signup — { email, password, firstName, lastName }  
- POST /auth/signin — { email, password }  
- GET /auth/profile — bearer token  
- PATCH /auth/profile — bearer token + body

### Posts / Listings
- GET /posts — filters: type, category, status, location  
- POST /posts — body: CreatePostDto, files: images[]  
- GET /posts/:id  
- PATCH /posts/:id  
- DELETE /posts/:id  
- POST /posts/:id/reserve — bearer token

### Cart & Chat
- GET /cart — bearer token  
- POST /cart/add — { postId } + bearer token  
- DELETE /cart/:itemId — bearer token  
- POST /cart/checkout — bearer token  
- GET /chat/:postId — bearer token (history)  
- WS /socket.io — events: joinRoom, sendMessage

For full request/response examples, import the Postman collection in `/docs` (if present).

## 🧱 Data Model (primary entities)
User, Post, Category, Message, Cart (+ items), reservation status on Post

## 🧪 Testing
Run unit and integration tests where configured:

```bash
npm run test
npm run test:e2e
```

## 🖼️ Screenshots
Add images under `/docs/screenshots` and reference them here:
- Home, Auth, Create Listing w/ AI, Post Detail, Profile, Cart, About

## 🗺️ Roadmap
- Ratings & reviews  
- Moderation & reporting  
- Notifications center  
- Advanced search (semantic)

## 📝 License
MIT.
