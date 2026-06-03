# Database Design - SaaS Habit Tracker

This document details the MongoDB collection schemas, indexes, and document relationships for the Habit Tracker application.

---

## 1. Document Schema Definitions

### Collection: `users`
Represents the user account credentials and general profile settings.
```json
{
  "_id": { "$oid": "60d5ec49e4b0c9f1a23a1a01" },
  "name": "Arun Kumar",
  "email": "arun.kumar@example.com",
  "password": "$2a$10$eImiTxAk4tW710892283u.Osg8gq1M6/xK24g6aH1a0391xS",
  "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
  "themePreference": "DARK", // DARK, LIGHT
  "languagePreference": "en",
  "timezone": "Asia/Kolkata",
  "createdAt": { "$date": "2026-06-01T10:00:00Z" },
  "updatedAt": { "$date": "2026-06-01T10:00:00Z" }
}
```
**Indexes:**
* `{ "email": 1 }` (Unique Index)

---

### Collection: `habits`
Represents the habits configured by users.
```json
{
  "_id": { "$oid": "60d5ec49e4b0c9f1a23a1a02" },
  "userId": { "$oid": "60d5ec49e4b0c9f1a23a1a01" },
  "name": "Morning Yoga",
  "description": "Daily yoga stretching for back health and core strength.",
  "category": "FITNESS", // FITNESS, READING, MEDITATION, WATER_INTAKE, STUDY, CODING, JOURNAL, SLEEP, DIET
  "color": "#6D5DFE", // Theme color for habit card
  "icon": "self_improvement", // Material Design Icon identifier
  "frequency": "DAILY", // DAILY, WEEKLY, MONTHLY, CUSTOM
  "customDays": [], // e.g. ["MON", "WED", "FRI"] if CUSTOM
  "goal": 20, // Numeric target
  "goalUnit": "minutes", // Target metric (minutes, glasses, pages)
  "reminderTime": "07:00", // HH:MM format
  "startDate": { "$date": "2026-06-01T00:00:00Z" },
  "endDate": null,
  "isArchived": false,
  "currentStreak": 5,
  "longestStreak": 14,
  "totalCompletions": 28,
  "createdAt": { "$date": "2026-06-01T10:00:00Z" },
  "updatedAt": { "$date": "2026-06-01T10:00:00Z" }
}
```
**Indexes:**
* `{ "userId": 1 }`
* `{ "userId": 1, "isArchived": 1 }`

---

### Collection: `habit_logs`
Tracks the individual daily completions and skip events for each habit.
```json
{
  "_id": { "$oid": "60d5ec49e4b0c9f1a23a1a03" },
  "habitId": { "$oid": "60d5ec49e4b0c9f1a23a1a02" },
  "userId": { "$oid": "60d5ec49e4b0c9f1a23a1a01" },
  "date": { "$date": "2026-06-01T00:00:00Z" }, // Date of entry (without time)
  "status": "COMPLETED", // COMPLETED, SKIPPED, PENDING
  "loggedValue": 20, // Number completed (e.g. 20 out of 20 min)
  "createdAt": { "$date": "2026-06-01T07:15:00Z" }
}
```
**Indexes:**
* `{ "habitId": 1, "date": 1 }` (Unique Index to prevent duplicate logs per habit per day)
* `{ "userId": 1, "date": 1 }` (Used heavily for building calendar popups and heatmap stats)

---

### Collection: `schedules`
Stores events for the user's interactive planner/schedule page.
```json
{
  "_id": { "$oid": "60d5ec49e4b0c9f1a23a1a04" },
  "userId": { "$oid": "60d5ec49e4b0c9f1a23a1a01" },
  "title": "Morning Yoga Event",
  "description": "Daily workout slot",
  "type": "WORKOUT", // HABIT, MEETING, STUDY_SESSION, WORKOUT, PERSONAL_TASK
  "startTime": { "$date": "2026-06-01T07:00:00Z" },
  "endTime": { "$date": "2026-06-01T07:20:00Z" },
  "allDay": false,
  "color": "#22C55E",
  "isCompleted": true,
  "habitId": { "$oid": "60d5ec49e4b0c9f1a23a1a02" }, // Reference to habit if linked
  "createdAt": { "$date": "2026-06-01T10:00:00Z" },
  "updatedAt": { "$date": "2026-06-01T10:00:00Z" }
}
```
**Indexes:**
* `{ "userId": 1, "startTime": 1, "endTime": 1 }` (For listing events in calendar ranges)

---

### Collection: `notifications`
Stores system messages and browser-push triggers for user accounts.
```json
{
  "_id": { "$oid": "60d5ec49e4b0c9f1a23a1a05" },
  "userId": { "$oid": "60d5ec49e4b0c9f1a23a1a01" },
  "title": "Streak Master!",
  "message": "Congratulations! You have kept up 'Morning Yoga' for 5 days straight!",
  "type": "STREAK_WARNING", // REMINDER, DAILY_SUMMARY, WEEKLY_SUMMARY, STREAK_WARNING, ACHIEVEMENT
  "isRead": false,
  "createdAt": { "$date": "2026-06-01T10:05:00Z" }
}
```
**Indexes:**
* `{ "userId": 1, "isRead": 1 }`

---

### Collection: `achievements`
Gamified awards unlocked by active users.
```json
{
  "_id": { "$oid": "60d5ec49e4b0c9f1a23a1a06" },
  "userId": { "$oid": "60d5ec49e4b0c9f1a23a1a01" },
  "title": "Productivity Master",
  "description": "Unlocked by keeping a 30-day streak on any habit.",
  "type": "STREAK_30", // FIRST_HABIT, STREAK_7, STREAK_30, COMPLETIONS_100, PRODUCTIVITY_MASTER
  "unlockedAt": { "$date": "2026-06-01T10:00:00Z" }
}
```
**Indexes:**
* `{ "userId": 1, "type": 1 }` (Unique to prevent earning the same achievement multiple times)

---

### Collection: `analytics`
Caches aggregated metrics for fast dashboard rendering.
```json
{
  "_id": { "$oid": "60d5ec49e4b0c9f1a23a1a07" },
  "userId": { "$oid": "60d5ec49e4b0c9f1a23a1a01" },
  "totalHabits": 12,
  "activeHabits": 8,
  "completedHabits": 6,
  "missedHabits": 2,
  "successRate": 75.0,
  "totalStreak": 5,
  "longestStreak": 14,
  "lastUpdated": { "$date": "2026-06-01T19:10:00Z" }
}
```
**Indexes:**
* `{ "userId": 1 }` (Unique Index)

---

## 2. Logical Entity Relationships

```
+-----------+          1:N         +------------+         N:1         +------------+
|   users   | -------------------> |   habits   | <----------------- | habit_logs |
+-----------+                      +------------+                    +------------+
      |                                   |
      | 1:N                               | 1:0..1 (optional link)
      v                                   v
+-----------+                      +------------+
| schedules | <------------------- |  schedules |
+-----------+                      +------------+
```

* **One-to-Many Relationships**:
  * A `user` has many `habits`.
  * A `user` has many `schedules` (planner events).
  * A `user` has many `notifications`.
  * A `user` has many `achievements`.
  * A `habit` has many `habit_logs` (tracked entries).
* **One-to-One Relationships**:
  * A `user` has one `analytics` profile (cached summary).
* **Self/Optional References**:
  * A `schedule` event of type `HABIT` optionally references its source `habitId` for interactive checked-status syncing.
