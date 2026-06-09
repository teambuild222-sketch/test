# Zenex Backend Architecture

Zenex uses a modern backend architecture designed to support event discovery, social interaction, real-time communication, and location-based services. The backend is intended to use Node.js and Express.js, with PostgreSQL serving as the primary database and PostGIS enabling advanced geospatial queries for event exploration and map-based functionality.

The system follows a modular architecture where each major feature is separated into dedicated modules such as Authentication, Users, Events, Discover Feed, Chat, Rewards, and Notifications. This structure improves maintainability, scalability, and future feature expansion.

## Authentication Module
The Authentication Service manages user registration, login, logout, password recovery, and profile access. JWT-based authentication secures all protected routes, while bcrypt is used to securely hash passwords before storing them in the database.

Features:

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Password Reset
- Profile Management

## User Management Module
The User Module handles profile information, interests, connections, rewards, badges, and user preferences.

Features:

- User Profiles
- Avatar Management
- Bio and City Information
- Interest Management
- User Connections
- Reward Points
- Achievement Badges

Database Tables:

- users
- user_interests
- user_connections
- user_badges

## Event Management Module
The Event Module is the core functionality of Zenex. Users can create, join, discover, and manage sports and entertainment events.

Features:

- Create Events
- Join Events
- Leave Events
- Event Capacity Tracking
- Event Status Management
- Event Discovery

Database Tables:

- events
- event_members

## Explore Module
The Explore Module integrates OpenStreetMap and PostGIS to provide location-based event discovery.

Features:

- Interactive Maps
- Event Markers
- Nearby Event Search
- Location-Based Filtering
- Sports & Entertainment Event Discovery

PostGIS enables:

- Radius Search
- Distance Calculations
- Geographic Queries

## Discover Feed Module
The Discover Module acts as the content-sharing platform within Zenex.

Features:

- Image Posts
- Event Promotion Posts
- Sports Content
- Entertainment Content
- Feed Generation

Database Tables:

- home_posts
- discover_posts

## Real-Time Chat Module
Zenex uses Socket.IO to enable real-time communication between users.

Features:

- Direct Messages
- Event Group Chats
- Community Conversations
- Read Receipts
- Online Presence

Database Tables:

- chat_rooms
- room_members
- messages

## Rewards & Badge System
The Rewards Module encourages platform engagement through points, levels, and achievements.

Features:

- Reward Points
- Badge Unlocks
- User Levels
- Activity Tracking

Database Tables:

- badges
- user_badges
- reward_events

## Notification Module
The Notification Service keeps users informed about important activities.

Features:

- Event Invitations
- Connection Requests
- New Messages
- Badge Unlock Alerts
- Event Reminders

## Security Layer
The backend implements multiple security mechanisms.

Features:

- JWT Authentication
- bcrypt Password Hashing
- Input Validation
- Rate Limiting
- Helmet Security Headers
- CORS Protection
- Environment Variable Management

## Database Layer
Database:

- PostgreSQL

Geospatial Extension:

- PostGIS

Primary Functions:

- User Management
- Event Storage
- Geographic Event Discovery
- Content Storage
- Messaging Data

## Future Scalability
The architecture is designed to support future enhancements including:

- AI Event Recommendations
- Push Notifications
- Premium Memberships
- Event Analytics Dashboard
- Event Matching Algorithms
- Recommendation Engine
- Mobile Application APIs
- Microservices Migration

## Backend Flow
Frontend (React)
↓
Express API Layer
↓
Controllers
↓
Services
↓
PostgreSQL + PostGIS
↓
Socket.IO Server
↓
Real-Time Updates

> Note: The current `backend/main.py` is a FastAPI placeholder. This document captures the intended Zenex backend architecture and the future Node.js/Express implementation plan.
