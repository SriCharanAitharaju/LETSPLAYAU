# Anurag University Sports Complex Tracker - Design Guidelines

## Design Approach: Material Design (Utility-Focused)

**Rationale**: This is a functional, real-time status tracking application requiring clarity, immediate comprehension, and reliability. Material Design provides the perfect framework for information-dense interfaces with strong visual feedback and status indication.

**Key Principles**:
- Instant status recognition through clear visual hierarchy
- Scannable layout for quick availability checks
- Responsive grid system for 14 sports facilities
- Real-time update visibility without confusion

---

## Typography System

**Font Stack**: Google Fonts - Inter (primary) + Roboto Mono (timers/numbers)

**Hierarchy**:
- Page Title: text-3xl md:text-4xl font-bold (e.g., "Anurag University Sports Complex")
- Section Headers: text-xl md:text-2xl font-semibold (sport category names)
- Card Titles: text-base font-medium (court/board names)
- Status Text: text-sm font-medium uppercase tracking-wide
- Timer Display: text-lg font-mono font-semibold
- Body/Helper Text: text-sm
- Availability Counts: text-2xl font-bold (for dashboard totals)

---

## Layout System & Spacing

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**

**Core Spacing Patterns**:
- Card padding: p-6
- Card gaps in grid: gap-6
- Section spacing: mb-12
- Page margins: px-4 md:px-8
- Header/Footer padding: py-6
- Button padding: px-6 py-3

**Grid Structure**:
- Mobile (base): Single column grid
- Tablet (md:): 2-column grid for courts
- Desktop (lg:): 3-4 column grid for cards
- Container max-width: max-w-7xl mx-auto

**Responsive Breakpoints**:
- Mobile: Full-width cards, stacked layout
- Tablet: 2-column grid, compact spacing
- Desktop: Multi-column grid, generous whitespace

---

## Component Library

### 1. Navigation Header
- Sticky top navigation: sticky top-0 z-50
- University logo left-aligned
- App title centered or left-adjacent to logo
- Total availability summary (e.g., "12/14 Available") right-aligned
- Shadow on scroll for depth: shadow-md

### 2. Category Filter/Tabs
- Horizontal scrollable tabs on mobile
- Pill-style buttons with active state distinction
- Show count badges for each sport (e.g., "Badminton (2)")
- All/Clear filter option
- Sticky below header: sticky top-[72px]

### 3. Sport Category Sections
Each sport gets a dedicated section:
- Section header with sport icon + name
- Availability count: "Available: 2/2"
- Grid of court cards below
- Collapsible on mobile (optional expand/collapse)

### 4. Court/Board Status Cards
**Card Structure**:
- Elevated cards: shadow-lg hover:shadow-xl transition
- Rounded corners: rounded-xl
- Status indicator: Full-width top border (border-t-4) or colored badge
- Court identifier: Large, centered text
- Status badge: Pill shape with icon (✓ Available / ● Occupied)
- Timer display (when occupied): Prominent countdown
- Action button: Full-width at bottom
- Subtle pulse animation for "Available" state

**Card States**:
- Available: Bright, elevated, inviting interaction
- Occupied: Muted appearance, timer visible, checkout button
- Transitioning: Brief loading state during check-in/out

### 5. Check-In/Check-Out Flow
**Available State Button**: 
- Text: "Check In"
- Full-width: w-full
- Icon: Add/plus icon

**Occupied State Display**:
- Timer: Large, centered countdown (MM:SS format)
- Progress bar showing time remaining
- "Check Out" button below timer
- Small text: "Auto checkout in XX:XX"

### 6. Dashboard Summary Panel (Top of Page)
- Quick stats grid: 3-column on desktop, 1-column mobile
- Total courts available vs occupied
- Most popular sport (real-time)
- Current active users count
- Prominent visual treatment: bg-gradient or elevated card

### 7. Notification/Toast System
- Bottom-right positioned: fixed bottom-4 right-4
- Slide-in animation for reminders
- Types: 
  - "10 minutes remaining" warning
  - "Session ending soon" alert
  - "Checked out successfully" confirmation
- Auto-dismiss after 5 seconds
- Stack multiple notifications

### 8. Empty/Loading States
- Loading: Skeleton screens for cards during initial load
- Empty state: Centered illustration + "All courts occupied" message
- Offline state: Clear indicator with retry button

### 9. Footer
- Compact footer with contact info
- Support hours
- Emergency contact for sports complex
- Last updated timestamp for data freshness

---

## Interaction Patterns

**Real-Time Updates**:
- Smooth transitions when status changes (0.3s ease)
- Brief highlight flash on newly available courts
- Subtle shake animation for auto-checkout notifications

**Button Interactions**:
- Standard Material Design ripple effect
- Disabled state while processing check-in/out
- Loading spinner replaces button text during action

**Responsive Behavior**:
- Cards resize fluidly
- Touch-friendly targets (min 44px height)
- Swipe gestures for category switching on mobile

---

## Accessibility

- High contrast status indicators
- ARIA labels for all interactive elements
- Keyboard navigation for entire interface
- Screen reader announcements for status changes
- Focus visible states on all buttons/cards
- Color-blind safe status indicators (use icons + text, not just color)

---

## Images & Visual Assets

**Icon Library**: Material Icons (via CDN)
- Sport-specific icons for each category header
- Status icons (checkmark, clock, warning)
- Navigation icons

**No Hero Image**: This is a dashboard/utility app - jump straight to functionality

**Sport Icons**: Use filled Material Icons for:
- Badminton: sports_tennis
- Volleyball: sports_volleyball  
- Carrom: games
- Basketball: sports_basketball
- Football: sports_soccer
- Tennis: sports_tennis

---

## Performance Considerations

- Minimize animations to status changes only
- Lazy load sport category sections if needed
- Optimize real-time listeners to prevent excessive re-renders
- Cache court data locally for instant UI updates