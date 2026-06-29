# Nethro Labs — Client Portal Backend Guide

## Project Structure

```
nethro-backend/
├── src/
│   ├── index.js                  ← Entry point, Express app
│   ├── config/
│   │   └── db.js                 ← MongoDB connection
│   ├── models/
│   │   ├── User.js               ← Clients, admins, staff
│   │   ├── Project.js            ← Projects + milestones
│   │   ├── Ticket.js             ← Support tickets + replies
│   │   ├── Invoice.js            ← Invoices + line items
│   │   └── Notification.js       ← In-app notifications
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   ├── projectController.js
│   │   ├── invoiceController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   ├── projects.js
│   │   ├── invoices.js
│   │   ├── notifications.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── auth.js               ← JWT protect + role authorize
│   │   ├── validate.js           ← express-validator errors
│   │   ├── upload.js             ← Multer file handling
│   │   └── errorHandler.js       ← Global error handler
│   └── utils/
│       ├── jwt.js                ← Sign/verify tokens
│       ├── email.js              ← Nodemailer helpers
│       └── apiResponse.js        ← Consistent JSON responses
├── uploads/                      ← File storage (add to .gitignore)
├── .env.example                  ← Copy to .env and fill in
└── package.json
```

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 2. Install & configure
```bash
cd nethro-backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, SMTP credentials
```

### 3. Run
```bash
npm run dev      # development (auto-reload)
npm start        # production
```

### 4. Test the health check
```bash
curl http://localhost:5000/health
# → { "success": true, "status": "OK" }
```

---

## API Reference

### Auth  `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Register new client |
| POST | `/login` | — | Login, returns accessToken |
| POST | `/refresh` | — | Refresh access token via cookie |
| POST | `/logout` | ✅ | Invalidate refresh token |
| GET | `/me` | ✅ | Get current user profile |
| PUT | `/me` | ✅ | Update name, company, phone, prefs |
| PUT | `/change-password` | ✅ | Change password |
| POST | `/forgot-password` | — | Send reset email |
| POST | `/reset-password/:token` | — | Reset password with token |
| GET | `/verify-email/:token` | — | Verify email address |

**Login response:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Ada", "email": "ada@co.com", "role": "client" },
    "accessToken": "eyJhbG..."
  }
}
```
> refreshToken is set as an httpOnly cookie automatically.

**Authentication header for all protected routes:**
```
Authorization: Bearer <accessToken>
```

---

### Tickets  `/api/tickets`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | all | List tickets (clients see only theirs) |
| GET | `/:id` | ✅ | all | Get ticket detail with replies |
| POST | `/` | ✅ | all | Create ticket (supports file upload) |
| POST | `/:id/replies` | ✅ | all | Add reply (supports file upload) |
| PATCH | `/:id/status` | ✅ | admin/staff | Change status |
| PATCH | `/:id/assign` | ✅ | admin | Assign to staff member |

**Create ticket:**
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer <token>" \
  -F "subject=Can't access dashboard" \
  -F "description=Getting 403 on login" \
  -F "priority=high" \
  -F "category=technical" \
  -F "attachments=@screenshot.png"
```

**Query params:** `?status=open&priority=high&category=billing&search=login&page=1&limit=10`

**Statuses:** `open` → `in_progress` → `waiting` → `resolved` → `closed`

---

### Projects  `/api/projects`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | all | List projects |
| GET | `/:id` | ✅ | all | Project detail with milestones |
| POST | `/` | ✅ | admin/staff | Create project |
| PUT | `/:id` | ✅ | admin/staff | Update project |
| DELETE | `/:id` | ✅ | admin | Delete project |
| PATCH | `/:id/milestones/:milestoneId` | ✅ | admin/staff | Update milestone status |

**Create project body:**
```json
{
  "title": "Website Redesign",
  "description": "Full rebrand and rebuild",
  "client": "<userId>",
  "assignedTo": ["<staffId>"],
  "priority": "high",
  "startDate": "2026-07-01",
  "dueDate": "2026-09-30",
  "budget": 12000,
  "milestones": [
    { "title": "Discovery", "dueDate": "2026-07-15" },
    { "title": "Design", "dueDate": "2026-08-15" },
    { "title": "Build", "dueDate": "2026-09-15" },
    { "title": "Launch", "dueDate": "2026-09-30" }
  ]
}
```
> `progress` auto-calculates from completed milestones (0–100%).

---

### Invoices  `/api/invoices`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/summary` | ✅ | all | Total billed/paid/unpaid/overdue |
| GET | `/` | ✅ | all | List invoices |
| GET | `/:id` | ✅ | all | Invoice detail |
| POST | `/` | ✅ | admin/staff | Create invoice |
| PUT | `/:id` | ✅ | admin/staff | Edit invoice |
| PATCH | `/:id/pay` | ✅ | admin | Mark as paid |

**Create invoice body:**
```json
{
  "client": "<userId>",
  "project": "<projectId>",
  "dueDate": "2026-07-31",
  "taxRate": 8.5,
  "lineItems": [
    { "description": "UI/UX Design", "quantity": 40, "unitPrice": 150 },
    { "description": "Frontend Dev", "quantity": 80, "unitPrice": 120 }
  ],
  "notes": "Net 30. Bank transfer preferred."
}
```
> `subtotal`, `taxAmount`, and `total` are computed automatically on save.

---

### Notifications  `/api/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get notifications (`?unread=true&page=1`) |
| POST | `/read` | Mark as read (`{ ids: [...] }` or empty for all) |
| DELETE | `/:id` | Delete a notification |

---

### Admin  `/api/admin`  *(admin + staff only)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Stats + recent tickets & invoices |
| GET | `/clients` | List all clients (`?search=acme`) |
| PUT | `/clients/:id` | Update client (activate/deactivate, change role) |

---

## Role System

| Role | Can see | Can create/edit | Admin actions |
|------|---------|-----------------|---------------|
| `client` | Own tickets, projects, invoices | Create tickets, reply | ❌ |
| `staff` | All tickets, projects, invoices | Create projects, reply, update status | ❌ |
| `admin` | Everything | Everything | Assign, delete, mark paid, manage users |

---

## Error Format

All errors return:
```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": [{ "field": "email", "msg": "Valid email required" }]
}
```

Common HTTP codes:
- `400` Bad input  
- `401` Not authenticated  
- `403` Not authorized (wrong role)  
- `404` Not found  
- `409` Duplicate (e.g. email already exists)  
- `413` File too large  
- `422` Validation failed  
- `429` Rate limited  

---

## File Uploads

Tickets and replies support file attachments via `multipart/form-data`.

- **Field name:** `attachments`
- **Max files:** 5 per request
- **Max size:** 25 MB per file (configurable via `MAX_FILE_SIZE_MB`)
- **Allowed types:** jpg, png, gif, pdf, doc, docx, xls, xlsx, zip, txt
- **Served at:** `GET /uploads/<filename>`

---

## Rate Limits

| Route | Window | Max requests |
|-------|--------|-------------|
| `/api/auth/*` | 15 min | 20 |
| `/api/*` | 15 min | 200 |

---

## Common Issues

**`ECONNREFUSED` on startup**  
MongoDB isn't running. Start it: `mongod --dbpath /data/db` or use MongoDB Atlas.

**JWT errors (`invalid signature` / `jwt malformed`)**  
`JWT_SECRET` in your `.env` doesn't match the token's secret. Clear tokens and log in again.

**Emails not sending**  
Check `SMTP_*` vars. For development, use [Mailtrap](https://mailtrap.io) — set `SMTP_HOST=sandbox.smtp.mailtrap.io`.

**File upload `ENOENT`**  
The `uploads/` directory doesn't exist. Create it: `mkdir uploads`

**`Cannot use import statement` error**  
Make sure `"type": "module"` is in `package.json` and you're on Node.js 18+.

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong random `JWT_SECRET` (32+ chars)
- [ ] Use MongoDB Atlas with auth enabled
- [ ] Put uploads on S3/R2 (swap `multer.diskStorage` for `multer-s3`)
- [ ] Add HTTPS (Nginx/Caddy reverse proxy)
- [ ] Enable `trust proxy` if behind a load balancer
- [ ] Set `CLIENT_URL` to your real domain (CORS + email links)
