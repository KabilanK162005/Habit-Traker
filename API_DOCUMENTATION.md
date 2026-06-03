# API Documentation - SaaS Habit Tracker REST APIs

All API endpoints require the standard header `Content-Type: application/json`.
Protected API endpoints require `Authorization: Bearer <Access_JWT_Token>`.

---

## 1. Authentication Module (`/api/auth`)

### POST `/api/auth/register`
Creates a new user account.
* **Request Body:**
```json
{
  "name": "Arun Kumar",
  "email": "arun.kumar@example.com",
  "password": "Password123!"
}
```
* **Response (201 Created):**
```json
{
  "message": "User registered successfully.",
  "userId": "60d5ec49e4b0c9f1a23a1a01"
}
```

---

### POST `/api/auth/login`
Authenticates a user and returns JWT access and refresh tokens.
* **Request Body:**
```json
{
  "email": "arun.kumar@example.com",
  "password": "Password123!"
}
```
* **Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh...",
  "tokenType": "Bearer",
  "user": {
    "id": "60d5ec49e4b0c9f1a23a1a01",
    "name": "Arun Kumar",
    "email": "arun.kumar@example.com",
    "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    "themePreference": "DARK"
  }
}
```

---

### POST `/api/auth/refresh`
Generates a new access token using a valid refresh token.
* **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh..."
}
```
* **Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newAccess..."
}
```

---

### POST `/api/auth/logout`
Revokes/blacklists user JWT tokens.
* **Request Body:** None (Requires Bearer authorization)
* **Response (200 OK):**
```json
{ "message": "Logged out successfully." }
```

---

## 2. Habits Module (`/api/habits`) [PROTECTED]

### GET `/api/habits`
Lists all habits for the logged-in user with filters and sorting.
* **Query Parameters:**
  * `category` (optional): `FITNESS`, `READING`, `MEDITATION`, etc.
  * `isArchived` (optional): `true`, `false` (default: `false`)
  * `sortBy` (optional): `name`, `streak`, `newest`, `oldest` (default: `newest`)
* **Response (200 OK):**
```json
[
  {
    "id": "60d5ec49e4b0c9f1a23a1a02",
    "name": "Morning Yoga",
    "description": "Daily yoga stretching.",
    "category": "FITNESS",
    "color": "#6D5DFE",
    "icon": "self_improvement",
    "frequency": "DAILY",
    "goal": 20,
    "goalUnit": "minutes",
    "reminderTime": "07:00",
    "startDate": "2026-06-01",
    "currentStreak": 5,
    "longestStreak": 14,
    "totalCompletions": 28,
    "isArchived": false
  }
]
```

---

### POST `/api/habits`
Creates a new habit.
* **Request Body:**
```json
{
  "name": "Read 15 Pages",
  "description": "Read productive books before bed.",
  "category": "READING",
  "color": "#8B5CF6",
  "icon": "menu_book",
  "frequency": "DAILY",
  "goal": 15,
  "goalUnit": "pages",
  "reminderTime": "22:00",
  "startDate": "2026-06-01"
}
```
* **Response (201 Created):** Successful habit object.

---

### PUT `/api/habits/{id}`
Updates a habit's configurations.
* **Response (200 OK):** Updated habit object.

---

### DELETE `/api/habits/{id}`
Deletes a habit and all associated logs.
* **Response (204 No Content)**

---

### POST `/api/habits/{id}/log`
Logs a check-in status (COMPLETE, SKIP, or PEND) for a specific date.
* **Request Body:**
```json
{
  "date": "2026-06-01",
  "status": "COMPLETED", // COMPLETED, SKIPPED, PENDING
  "loggedValue": 15
}
```
* **Response (200 OK):**
```json
{
  "habitId": "60d5ec49e4b0c9f1a23a1a02",
  "date": "2026-06-01",
  "status": "COMPLETED",
  "loggedValue": 15,
  "newStreak": 6,
  "longestStreak": 14
}
```

---

## 3. Schedules Module (`/api/schedules`) [PROTECTED]

### GET `/api/schedules`
Lists planner events within a start and end date.
* **Query Parameters:**
  * `startDate` (format: `YYYY-MM-DD`)
  * `endDate` (format: `YYYY-MM-DD`)
* **Response (200 OK):**
```json
[
  {
    "id": "60d5ec49e4b0c9f1a23a1a04",
    "title": "Morning Yoga Event",
    "description": "Daily workout slot",
    "type": "WORKOUT",
    "startTime": "2026-06-01T07:00:00Z",
    "endTime": "2026-06-01T07:20:00Z",
    "allDay": false,
    "color": "#22C55E",
    "isCompleted": true,
    "habitId": "60d5ec49e4b0c9f1a23a1a02"
  }
]
```

---

### POST `/api/schedules`
Creates a new event in the schedule planner.
* **Request Body:** Same properties as above (excluding `id`).
* **Response (201 Created):** Created event object.

---

### PUT `/api/schedules/{id}`
Updates an existing event. Supports marking the event completed or changing times.
* **Response (200 OK):** Updated event object.

---

### DELETE `/api/schedules/{id}`
Deletes an event from the planner.
* **Response (204 No Content)**

---

## 4. Dashboard & Analytics Module (`/api/dashboard`, `/api/analytics`) [PROTECTED]

### GET `/api/dashboard`
Returns the high-level KPI cards and stats.
* **Response (200 OK):**
```json
{
  "totalHabits": 12,
  "activeHabits": 8,
  "completedHabits": 6,
  "missedHabits": 2,
  "successRate": 75.0,
  "totalStreak": 5,
  "longestStreak": 14
}
```

---

### GET `/api/analytics`
Returns detailed performance datasets, including progress trends, category distribution, achievements list, and heatmap grids.
* **Response (200 OK):**
```json
{
  "weeklyProgress": [
    { "day": "Mon", "rate": 72 },
    { "day": "Tue", "rate": 69 },
    { "day": "Wed", "rate": 80 },
    { "day": "Thu", "rate": 75 },
    { "day": "Fri", "rate": 85 },
    { "day": "Sat", "rate": 88 },
    { "day": "Sun", "rate": 74 }
  ],
  "categoryPerformance": [
    { "category": "FITNESS", "completionRate": 85 },
    { "category": "READING", "completionRate": 70 }
  ],
  "heatmapData": [
    { "date": "2026-05-30", "count": 2 },
    { "date": "2026-05-31", "count": 4 },
    { "date": "2026-06-01", "count": 6 }
  ]
}
```
