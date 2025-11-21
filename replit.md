# Anurag University Sports Complex Availability Tracker

## Overview
Real-time sports facility availability tracker for Anurag University Sports Complex. Allows users to check in/out of courts with automatic 1-hour session management and live updates across all connected clients.

**Purpose**: Enable students and staff to see real-time availability of 14 sports facilities and manage their usage efficiently.

**Current State**: Fully functional MVP with WebSocket-based real-time updates, automatic session management, and Material Design UI.

## Recent Changes (Nov 21, 2025)
- ✅ Implemented complete frontend with Material Design following design_guidelines.md
- ✅ Built WebSocket server for real-time synchronization
- ✅ Added automatic 1-hour checkout timers
- ✅ Created in-memory storage for courts and sessions
- ✅ Implemented check-in/check-out API endpoints
- ✅ Fixed WebSocket message handling for consistent real-time updates
- ✅ Removed duplicate client-side timer warnings
- ✅ Added comprehensive data-testid attributes for testing

## Project Architecture

### Sports Facilities (14 Total)
- 2 Badminton Courts
- 2 Volleyball Courts
- 5 Carrom Boards
- 2 Basketball Courts
- 1 Football Field
- 1 Tennis Court

### Tech Stack
- **Frontend**: React + TypeScript, TanStack Query, Wouter routing
- **UI Library**: Shadcn UI + Tailwind CSS
- **Real-time**: WebSockets (ws library)
- **Backend**: Express.js + TypeScript
- **Storage**: In-memory (MemStorage)
- **Design**: Material Design principles

### Key Features
1. **Real-time Dashboard**
   - Live availability updates via WebSocket
   - Sport category filtering
   - Summary statistics panel

2. **Check-in/Check-out System**
   - One-click check-in to available courts
   - Automatic 1-hour session timer
   - Manual checkout before time expires
   - Auto-checkout after 1 hour

3. **Session Management**
   - Live countdown timer on occupied courts
   - Progress bar showing time remaining
   - Server-side timer management
   - Automatic cleanup on expiry

4. **Real-time Synchronization**
   - WebSocket broadcasts to all clients
   - Instant status updates
   - Session expiry notifications

### Design System
**Branding**: Anurag University colors
- Primary Red: #E50914 (355, 88%, 45%)
- Secondary Blue: #0033A0 (217, 91%, 31%)
- Background: Clean white (#FFFFFF)

**Typography**: Inter (primary), Roboto Mono (timers)

**Component Style**: Material Design with elevated cards, rounded corners, and subtle shadows

## File Structure

### Frontend (`client/src/`)
- `pages/dashboard.tsx` - Main dashboard with WebSocket connection
- `components/dashboard-header.tsx` - Sticky header with availability count
- `components/dashboard-summary.tsx` - Stats summary panel
- `components/court-card.tsx` - Individual court status card with timer
- `App.tsx` - Root component with routing

### Backend (`server/`)
- `routes.ts` - WebSocket server + API endpoints
- `storage.ts` - In-memory storage for courts/sessions

### Shared (`shared/`)
- `schema.ts` - TypeScript types and data models

## API Endpoints

### GET /api/courts
Returns array of all courts with current status

### POST /api/check-in
Check in to a court
- Body: `{ courtId: string }`
- Creates session, starts 1-hour timer
- Broadcasts update to all clients

### POST /api/check-out
Check out from a court
- Body: `{ courtId: string }`
- Ends session, clears timer
- Broadcasts update to all clients

## WebSocket Protocol

**Connection**: `ws://localhost:5000/ws` (dev) or `wss://[domain]/ws` (prod)

**Message Types**:
- `court_update` - Full court list sync
- `check_in` - User checked into court
- `check_out` - User checked out
- `session_warning` - 10-minute warning (future)
- `session_expired` - Auto-checkout occurred

## Development

### Running Locally
```bash
npm run dev
```
Starts Express server on port 5000 with Vite frontend

### Storage
Uses in-memory storage (resets on restart). All 14 courts initialize as "available" on startup.

### Session Logic
- Sessions last exactly 1 hour (3600000ms)
- Auto-checkout handled server-side with setTimeout
- Timer cleared on manual checkout
- Progress bar derives from session endTime

## User Experience

### Happy Path
1. User opens dashboard → sees all 14 courts
2. Filters by sport (optional)
3. Clicks "Check In" on available court
4. Court shows timer with countdown
5. User clicks "Check Out" when done
6. Court becomes available immediately

### Auto-Checkout Flow
1. User checks in
2. Timer counts down from 60:00
3. After 1 hour, server auto-checks out
4. Court status updates across all clients
5. Toast notification appears

## Testing Coverage
All interactive elements include `data-testid` attributes for E2E testing:
- Buttons: `button-checkin-{courtId}`, `button-checkout-{courtId}`
- Status: `badge-status-{courtId}`, `text-timer-{courtId}`
- Filters: `tab-{sport}`, `badge-{sport}-count`
- Summary: `text-summary-available`, `text-summary-occupied`

## Future Enhancements
- User authentication (track who checked in)
- Reservation system (book in advance)
- Admin dashboard with analytics
- Push notifications for mobile
- Session history and usage reports
- Custom session durations per sport
