# Swimlane Pro - Design Guidelines

## Brand Identity

**Purpose**: A professional swimming competition tracker that provides real-time race data, results, and athlete information for swimming enthusiasts, coaches, and competitors worldwide.

**Tone**: Bold/striking with athletic precision. Think stadium scoreboards meets refined sports analytics. High contrast, crisp legibility, instant information recognition. This is a performance tool that respects its audience's expertise.

**Memorable Element**: The live race visualization—a dynamic, real-time lane tracker showing swimmer positions as colored indicators moving across the screen with split times. This transforms abstract timing data into visceral racing drama.

**Differentiation**: Unlike generic sports apps, this celebrates the precision of swimming—every hundredth matters. Sharp typography, data-forward design, and real-time updates that feel immediate, not laggy.

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs with floating action button)
- **Meets** (Home) - Browse upcoming/live competitions
- **Live** - Currently active races (disabled if no live meets)
- **Profile** - User preferences and saved favorites
- **FAB (center)**: Quick access to search all meets/swimmers

## Screen-by-Screen Specifications

### 1. Meets Screen (Home Tab)
**Purpose**: Browse and filter swimming competitions by country and date.

**Layout**:
- Header: Transparent with title "Meets" (left) and filter icon (right)
- Root view: ScrollView with top inset of headerHeight + Spacing.xl
- Country filter pills (horizontal scroll): Norway, Sweden, Denmark, International
- Meet cards in vertical list
- Bottom inset: tabBarHeight + Spacing.xl

**Components**:
- Filter pills: Rounded capsules, selected state with accent color fill
- Meet cards: Large, high-contrast with meet name, dates, location, organizer, pool info
- "LIVE" badge overlay for active meets (pulsing red indicator)
- Meet logo image (fallback to pool icon)
- Each card tappable → Meet Details Screen

**Empty State**: "No upcoming meets" with empty-pool.png illustration

### 2. Meet Details Screen (Stack Modal)
**Purpose**: View all information about a specific competition.

**Layout**:
- Header: Default navigation with back button (left), meet name (center), bookmark icon (right)
- Root view: ScrollView
- Top section: Meet banner image, dates, location details
- Tab selector: Overview, Events, Schedule, Documents, Results
- Content area scrolls within selected tab
- Bottom inset: insets.bottom + Spacing.xl

**Components**:
- Banner image with gradient overlay for text legibility
- Segmented control for tab switching
- Event list items: Event number, distance, stroke, gender, time
- Document links with PDF icon
- Schedule timeline with time markers
- Results table with rank, name, club, time

### 3. Event Details / Heat List Screen (Stack)
**Purpose**: View heats and start lists for a specific event.

**Layout**:
- Header: Default with event name (e.g., "100m Freestyle Men")
- Root view: List of heat cards
- Each heat card expandable to show lane assignments
- Top inset: Spacing.xl, bottom inset: insets.bottom + Spacing.xl

**Components**:
- Heat cards: Heat number, scheduled time, status badge
- Lane list: Lane number, swimmer name, club, seed time
- Status badges: Upcoming (gray), Live (red pulse), Finished (green)
- Tap finished heat → Results modal
- Tap live heat → Live Race Screen

### 4. Live Race Screen (Stack Modal)
**Purpose**: Real-time race tracking with swimmer positions.

**Layout**:
- Header: Transparent with race info (e.g., "Heat 2 - 100m Free")
- Pool visualization: Horizontal lanes showing swimmer positions
- Below pool: Real-time split times and ranking
- Auto-refresh every 500ms when race is active
- Top inset: headerHeight + Spacing.xl, bottom inset: insets.bottom + Spacing.xl

**Components**:
- Lane indicators: Colored circles (assigned per lane) moving horizontally
- Split time markers at 25m intervals
- Swimmer name labels above each lane
- Live time counter at top
- Final results overlay when race completes

### 5. Live Tab Screen
**Purpose**: Quick access to all currently active races.

**Layout**:
- Header: Transparent with title "Live Now"
- Root view: ScrollView with live race cards
- Auto-refresh for real-time status updates
- Top inset: headerHeight + Spacing.xl, bottom inset: tabBarHeight + Spacing.xl

**Components**:
- Live race cards: Meet name, event, heat, time remaining estimate
- Pulsing "LIVE" badge
- Tap card → Live Race Screen
- Empty state: "No live races" with empty-lanes.png

### 6. Swimmer Profile Screen (Stack Modal)
**Purpose**: View swimmer details, recent results, and personal bests.

**Layout**:
- Header: Default with swimmer name
- Root view: ScrollView
- Profile section: Avatar (generated or club logo), name, birth year, club, country
- Tabs: Results, Personal Bests, Upcoming Events
- Bottom inset: insets.bottom + Spacing.xl

**Components**:
- Large avatar circle at top
- Club logo badge overlay
- Result cards: Event, time, date, rank
- Personal best cards with progress indicators

### 7. Profile/Settings Screen (Tab)
**Purpose**: User preferences without authentication.

**Layout**:
- Header: Transparent with title "Profile"
- Root view: ScrollView
- User avatar (customizable), display name
- Settings sections: Notifications, Theme, Default Country Filter, About
- Top inset: headerHeight + Spacing.xl, bottom inset: tabBarHeight + Spacing.xl

**Components**:
- Large editable avatar at top
- Settings list with chevrons
- Toggle switches for notifications
- Theme picker: Light, Dark, System

## Color Palette
- **Primary**: #0066CC (Electric Blue - water/competitive)
- **Accent**: #FF3B30 (Racing Red - for live indicators)
- **Background**: #FFFFFF (Light), #000000 (Dark)
- **Surface**: #F5F5F7 (Light), #1C1C1E (Dark)
- **Text Primary**: #000000 (Light), #FFFFFF (Dark)
- **Text Secondary**: #6C6C70
- **Success**: #34C759 (Finished races)
- **Border**: #E5E5EA (Light), #38383A (Dark)

## Typography
- **Font**: SF Pro Display (system) - maintains iOS native precision
- **Type Scale**:
  - H1 (Screen Titles): 34pt Bold
  - H2 (Section Headers): 28pt Bold
  - H3 (Card Titles): 20pt Semibold
  - Body: 17pt Regular
  - Caption (Times/Details): 15pt Regular
  - Small (Labels): 13pt Medium

## Visual Design
- High contrast for instant legibility (black text on white cards)
- Subtle shadows only on floating action button
- Live indicators use pulsing animation
- Race position indicators are solid colored circles
- Use SF Symbols for navigation icons (trophy, timer, person, magnifyingglass)

## Assets to Generate

1. **icon.png** - App icon with stylized swimming lane marker (blue/white)
2. **splash-icon.png** - Same as app icon for launch screen
3. **empty-meets.png** - Empty pool illustration for no meets available
4. **empty-lanes.png** - Empty lane markers for no live races
5. **empty-results.png** - Clipboard with checkmark for no results yet
6. **empty-swimmers.png** - Generic swimmer silhouette for no athlete search results
7. **avatar-preset.png** - Default user avatar (swimming cap silhouette)

All illustrations should use Primary blue color with minimal line-art style, transparent backgrounds.