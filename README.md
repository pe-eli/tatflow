# TatFlow — Tattoo Request & Studio Management Platform

A full-stack SaaS MVP that streamlines communication between tattoo artists and clients. Clients submit structured request forms; artists manage quotes, appointments, and a visual calendar — all in one place.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, TypeScript, Vite          |
| Styling    | TailwindCSS                         |
| Backend    | Node.js, Express, TypeScript        |
| Database   | PostgreSQL                          |
| ORM        | Prisma                              |
| Auth       | JWT (bcryptjs)                      |
| File Uploads | Multer                            |

---

## Project Structure

```
TatFlow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB models: User, TattooRequest, Quote, Appointment
│   ├── src/
│   │   ├── controllers/           # Business logic per resource
│   │   │   ├── auth.controller.ts
│   │   │   ├── request.controller.ts
│   │   │   ├── quote.controller.ts
│   │   │   └── appointment.controller.ts
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT authentication middleware
│   │   ├── routes/                # Express route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── request.routes.ts
│   │   │   ├── quote.routes.ts
│   │   │   └── appointment.routes.ts
│   │   └── index.ts               # App entry point
│   ├── uploads/                   # Uploaded reference images (gitignored)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   └── StatusBadge.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx     # JWT auth state (localStorage)
    │   ├── pages/
    │   │   ├── Landing.tsx         # Public homepage
    │   │   ├── Register.tsx        # Artist registration + role selector
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx       # Artist's request management hub
    │   │   ├── RequestForm.tsx     # Public client request form
    │   │   ├── RequestDetails.tsx  # Quote and appointment flow
    │   │   └── CalendarPage.tsx    # Weekly calendar of appointments
    │   ├── services/
    │   │   └── api.ts              # Axios instance + typed API calls
    │   ├── types/
    │   │   └── index.ts            # Shared TypeScript types
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a hosted instance)
- npm or yarn

---

### 1. Clone & enter the project

```bash
cd TatFlow
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/tatflow"
JWT_SECRET="pick-a-long-random-secret"
PORT=3001
CLIENT_URL="http://localhost:5173"
```

Create the database and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

Start the dev server:

```bash
npm run dev
# Running on http://localhost:3001
```

---

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
# Running on http://localhost:5173
```

The Vite dev server proxies `/api/*` → `http://localhost:3001` automatically.

---

## API Reference

### Auth
| Method | Route          | Auth | Description            |
|--------|----------------|------|------------------------|
| POST   | /auth/register | —    | Register artist account |
| POST   | /auth/login    | —    | Login, returns JWT     |
| GET    | /auth/me       | JWT  | Current user info      |

### Tattoo Requests
| Method | Route                    | Auth | Description                    |
|--------|--------------------------|------|--------------------------------|
| POST   | /requests                | —    | Client submits a request       |
| GET    | /requests                | JWT  | Artist lists all requests      |
| GET    | /requests/:id            | JWT  | Get single request details     |
| PATCH  | /requests/:id/status     | JWT  | Update request status          |

### Quotes
| Method | Route               | Auth | Description              |
|--------|---------------------|------|--------------------------|
| POST   | /quotes             | JWT  | Artist sends a quote     |
| GET    | /quotes             | JWT  | List artist's quotes     |
| PATCH  | /quotes/:id/accept  | —    | Client accepts a quote   |

### Appointments
| Method | Route               | Auth | Description               |
|--------|---------------------|------|---------------------------|
| POST   | /appointments       | JWT  | Create appointment        |
| GET    | /appointments       | JWT  | List artist's appointments|
| PATCH  | /appointments/:id   | JWT  | Update appointment        |

---

## User Flows

### Artist Flow
1. Register at `/register` (select "Tattoo Artist")
2. After login, go to Dashboard → copy your personal **client request link**
3. Share the link with clients (format: `/request/:artistId`)
4. Review incoming requests in the Dashboard
5. On any request: send a quote with estimated price + session time
6. Schedule an appointment after the quote is approved
7. View all bookings in the Calendar

### Client Flow
1. Receive the artist's request link (no account needed)
2. Fill out the tattoo request form with style, size, placement, images, and availability
3. Submit → receive confirmation message
4. The artist contacts the client via email/WhatsApp with the quote

---

## Database Models

```
User            id, name, email, password, role, studioName, city, instagram
TattooRequest   id, clientName, clientEmail, clientPhone, placement, size, style,
                description, referenceImages[], preferredDate, preferredTime,
                status, artistId
Quote           id, requestId, artistId, priceEstimate, sessionTime, message, status
Appointment     id, artistId, requestId, date, startTime, endTime, notes
```

**Request statuses:** `PENDING → QUOTED → APPROVED → SCHEDULED | REJECTED`

---

## Key Design Decisions

- **Clients don't register.** Requests are tied to the artist's ID in the URL. Simple, low friction for the client.
- **Role selector on register page.** If "Client" is selected, the form explains there's no account needed. Only artists proceed with registration.
- **File uploads via Multer.** Images stored on disk in `/uploads`, served as static files. Easy to swap for S3 later.
- **Vite proxy.** Frontend calls `/api/*`, Vite forwards to the backend during development. No CORS issues.
- **Custom calendar.** Built from scratch (weekly grid) — no heavy third-party calendar library dependency for the MVP.
