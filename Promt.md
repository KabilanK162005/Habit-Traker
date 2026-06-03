HABIT TRACKER WEB APPLICATION - MASTER DEVELOPMENT PROMPT
ROLE

You are a world-class team consisting of:

Senior Product Manager
Senior UI/UX Designer
Senior React.js Developer
Senior Spring Boot Developer
Senior MongoDB Architect
Senior DevOps Engineer
Senior Security Engineer
Senior QA Engineer

Your task is to design and build a production-ready Habit Tracker Web Application with a premium modern UI/UX inspired by high-quality productivity applications.

The application must feel like a real SaaS product and not a student project.

PROJECT OVERVIEW

Build a complete Habit Tracker Web Application that helps users:

Create habits
Track daily habits
Monitor consistency
Schedule activities
View analytics
Track streaks
Improve productivity
Visualize progress

The application must contain:

Habit Monitor Page
Schedule Page
Dashboard Page

similar to the provided reference design but significantly more modern and professional.

TECHNOLOGY STACK
Frontend

Use:

React.js
Vite
React Router DOM
Axios
Context API
Redux Toolkit (optional)
Framer Motion
React Query
Recharts
React Hook Form
Material UI
Tailwind CSS

Do not use Bootstrap.

Backend

Use:

Java 21
Spring Boot 3.x
Spring Security
JWT Authentication
Spring Data MongoDB
Lombok
MapStruct
Maven
Database

Use:

MongoDB

Collections:

users
habits
habit_logs
schedules
notifications
achievements
analytics
UI DESIGN REQUIREMENTS

Create a modern UI inspired by:

Notion
Linear
Todoist
TickTick
Habitify
GitHub
Apple Health

Design Style:

Glassmorphism
Soft Shadows
Clean Cards
Modern Typography
Smooth Animations
Premium Dashboard
COLOR SYSTEM

Primary:

#6D5DFE

Secondary:

#8B5CF6

Success:

#22C55E

Danger:

#EF4444

Warning:

#F59E0B

Background:

#F8FAFC

Dark Background:

#0F172A

Text:

#1E293B

RESPONSIVENESS

Must support:

Mobile

320px+

Tablet

768px+

Laptop

1024px+

Desktop

1440px+

Everything must be fully responsive.

No horizontal scrolling.

AUTHENTICATION MODULE

Implement:

User Registration

Fields:

Name
Email
Password
User Login

Fields:

Email
Password
JWT Authentication

Features:

Access Token
Refresh Token
Secure Routes
Forgot Password
Reset Password
Logout
LANDING PAGE

Create a premium SaaS landing page.

Sections:

Hero Section
Catchy headline
CTA button
Features
Screenshots
Statistics
Testimonials
Pricing
FAQ
Footer
HABIT MONITOR PAGE

This is the main page.

Design similar to modern productivity apps.

Habit Card

Each card contains:

Habit Icon
Habit Name
Category
Completion Status
Progress Indicator
Current Streak
Longest Streak
Reminder Time
Habit Actions

Users can:

Add Habit
Edit Habit
Delete Habit
Archive Habit
Complete Habit
Skip Habit
Habit Types

Support:

Daily
Weekly
Monthly
Custom
Categories

Examples:

Fitness
Reading
Meditation
Water Intake
Study
Coding
Journal
Sleep
Diet
ADD HABIT MODAL

Fields:

Habit Name
Description
Category
Color
Icon
Frequency
Goal
Reminder Time
Start Date
End Date

Modern modal design.

STREAK SYSTEM

Implement:

Current Streak
Longest Streak
Total Completions
Completion Rate
Success Percentage
CALENDAR VIEW

Create:

Monthly Calendar

Features:

Completed Days
Missed Days
Current Day
Heatmap View

Similar to GitHub Contribution Graph.

SCHEDULE PAGE

This page acts like a planner.

Schedule Features

Users can:

Add Event
Edit Event
Delete Event
Drag and Drop Event
Schedule Types
Habit
Meeting
Study Session
Workout
Personal Task
Views
Day View
Week View
Month View
Timeline View

Display events by time slots.

Example:

07:00 AM - Workout

09:00 AM - Reading

11:00 AM - Study

DASHBOARD PAGE

The dashboard should be visually stunning.

DASHBOARD METRICS

Display:

Total Habits
Active Habits
Completed Habits
Missed Habits
Success Rate
Total Streak
Longest Streak
ANALYTICS SECTION

Use Recharts.

Charts:

Weekly Progress Chart
Monthly Progress Chart
Yearly Progress Chart
Habit Completion Trend
Category Performance
Streak Analysis
Productivity Score
HEATMAP

Create GitHub-style heatmap.

Show:

Daily Activity
Monthly Activity
Yearly Activity
ACHIEVEMENT SYSTEM

Gamification Features:

First Habit
7 Day Streak
30 Day Streak
100 Completions
Productivity Master
NOTIFICATION SYSTEM

Support:

Browser Notifications
Reminder Notifications
Daily Summary
Weekly Summary
Streak Warning
PROFILE PAGE

User can:

Update Profile
Change Password
Upload Avatar
View Statistics
Export Data
SETTINGS PAGE

Options:

Theme
Language
Timezone
Notification Settings
Privacy Settings
DARK MODE

Implement complete dark mode.

Requirements:

Smooth Toggle
Persist Preference
Dark Charts
Dark Cards
SEARCH FUNCTIONALITY

Global Search.

Search:

Habits
Schedules
Categories
FILTERS

Filter by:

Status
Category
Date
Completion Rate
SORTING

Sort by:

Newest
Oldest
Completion Rate
Streak
Name
EXPORT FEATURES

Export:

PDF
CSV
Excel
API DESIGN

Create REST APIs.

Examples:

POST /api/auth/register

POST /api/auth/login

GET /api/habits

POST /api/habits

PUT /api/habits/{id}

DELETE /api/habits/{id}

GET /api/dashboard

GET /api/analytics

GET /api/schedules

POST /api/schedules

DATABASE DESIGN

User Collection

Habit Collection

HabitLog Collection

Schedule Collection

Achievement Collection

Notification Collection

Analytics Collection

Create complete schema definitions.

SECURITY

Implement:

JWT Authentication
Password Encryption
Role Based Access
Input Validation
Rate Limiting
XSS Protection
CSRF Protection
Secure Headers
PERFORMANCE OPTIMIZATION

Implement:

Lazy Loading
Code Splitting
Image Optimization
API Caching
Pagination
Virtual Scrolling
ANIMATION REQUIREMENTS

Use Framer Motion.

Animations:

Page Transition
Card Hover
Modal Open
Button Interaction
Loading Skeletons
FOLDER STRUCTURE

Generate complete production-grade folder structure.

Frontend Structure:

src/
components/
pages/
layouts/
hooks/
services/
context/
store/
utils/
assets/
routes/

Backend Structure:

controller/
service/
repository/
dto/
entity/
config/
security/
exception/
mapper/

DEVELOPMENT OUTPUT REQUIREMENTS

Generate:

Complete System Architecture
UI/UX Wireframe Description
MongoDB Schema Design
Spring Boot Architecture
React Architecture
API Documentation
Folder Structure
Component Breakdown
Database Relationships
Authentication Flow
Dashboard Design Plan
Habit Monitor Design Plan
Schedule Design Plan
Responsive Design Strategy
Deployment Strategy
Docker Configuration
Production Best Practices

Always provide enterprise-level code and architecture decisions suitable for a real-world SaaS Habit Tracker platform.