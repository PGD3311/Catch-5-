# Catch 5 Card Game - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based (Card Game UI Patterns)
Drawing inspiration from modern digital card games (Hearthstone, Solitaire apps, Poker platforms) combined with clean, minimal game interfaces like chess.com and boardgamearena.com.

**Key Principles:**
- Clarity over decoration - every element serves gameplay
- Immediate visual feedback for game state
- Intuitive spatial relationships (your hand vs. opponents)
- Focused attention on active gameplay area

## Typography

**Font Stack:**
- Primary: 'Inter' or 'DM Sans' (Google Fonts) - Clean, readable for UI elements, player names, scores
- Display: 'Righteous' or 'Bangers' (Google Fonts) - Bold, playful for game titles, winning announcements
- Monospace: 'JetBrains Mono' - For scores and numeric displays

**Hierarchy:**
- Game title/phase headers: text-4xl to text-5xl, font-bold (display font)
- Player names: text-lg, font-semibold
- Card text/values: text-base to text-lg, font-medium
- Game info/help text: text-sm
- Scores: text-2xl to text-3xl, font-bold (monospace)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section gaps: gap-6, gap-8
- Card spacing: space-x-2, space-y-2
- Major layout margins: m-8, m-12

**Game Board Structure:**
```
┌─────────────────────────────────────────────┐
│  Game Header (phase, trump, scores)         │
├─────────────────────────────────────────────┤
│                                             │
│  Opponent Players (top row - 3 CPU)        │
│  [Player 2] [Player 3] [Player 4]          │
│                                             │
│        Trick Area (center)                  │
│     [played cards in circle/row]           │
│                                             │
│  Human Player Area (bottom)                 │
│     Your Hand (fanned cards)                │
│     [Action Buttons]                        │
└─────────────────────────────────────────────┘
```

## Component Library

### Core Game Components

**1. Game Header Bar** (fixed top, h-16 to h-20)
- Left: Current game phase badge (e.g., "BIDDING", "TRICK 3/6")
- Center: Trump suit indicator (large icon when set, with suit name)
- Right: Quick score summary, settings icon

**2. Player Cards** (for all 4 players)
- Compact card: w-32 to w-40, rounded-xl, shadow-lg
- Contains: Player name, current score, bid amount (when applicable), avatar placeholder
- CPU players: Smaller, arranged horizontally at top (flex row, justify-evenly)
- Human player: Larger, bottom center
- Active player indicator: border-4 with animation (pulse or glow effect)

**3. Playing Cards**
- Standard size: w-20 h-28 for opponent hands (back showing)
- Human hand: w-24 h-32 (larger, interactive)
- Trick area: w-20 h-28, positioned in circle formation or horizontal row
- Card design: rounded-lg, shadow-md
- Hover state (human cards only): -translate-y-2, shadow-xl
- Selected state: -translate-y-4, ring-4

**4. Hand Display**
- Human hand: Fanned arrangement using CSS transforms or flexbox with slight overlap (overlap by 25%)
- Cards slightly rotated for fan effect: rotate-[-6deg] to rotate-[6deg]
- Container: flex justify-center items-end, min-h-40

**5. Trick Area**
- Central play area: w-full max-w-2xl mx-auto, min-h-48
- Cards arranged in cross pattern or row (depending on trick)
- Each played card labeled with player name (text-xs, absolute positioning)

**6. Bidding Interface Modal**
- Full-screen overlay with backdrop-blur-sm
- Center modal: max-w-lg, rounded-2xl, p-8
- Large bid buttons: Grid of bid values (2-9) + Pass button
- Each button: min-w-16 h-16, text-2xl, rounded-xl
- Pass button: Distinct styling, full width at bottom

**7. Trump Selection Modal**
- Similar overlay structure
- Four large suit buttons: 2x2 grid on desktop, 4 rows on mobile
- Each button: w-32 h-32, displays suit icon (from icon library)
- Button labels: Suit names below icons

**8. Deck Color Selector** (Settings Panel)
- Toggle panel: Slide-in from right or modal
- Color swatches: Grid of 6-8 preset deck backs
- Each swatch: w-16 h-24 card-shaped preview, rounded-lg
- Active selection: ring-4 indicator

**9. Score Display Panel**
- End-of-hand modal: max-w-2xl, p-8, rounded-2xl
- Breakdown table: Rows for High, Low, Jack, Game, Five
- Each row: flex justify-between, text-lg
- Total scores: text-3xl, font-bold, mt-6
- Bidder result: Special callout box (p-4, rounded-lg, text-xl)

**10. Action Buttons**
- Primary actions (Play Card, Confirm): px-8 py-3, rounded-lg, text-lg, font-semibold
- Secondary (Pass, Cancel): px-6 py-2, rounded-md, text-base
- Fixed bottom bar (mobile): sticky bottom-0, flex gap-4, p-4

### Navigation & Controls

**Settings Overlay:**
- Icon button: top-right of header, w-10 h-10, rounded-full
- Panel: Slide-in drawer, w-80, p-6
- Options: Deck color, sound toggle, rules button, new game
- Each option: py-3, flex items-center justify-between

**Game Rules Modal:**
- Accessible via settings
- Scrollable content: max-h-96, overflow-y-auto, p-6
- Sections: Headings (text-xl), body text (text-base, leading-relaxed)

## Interactions & States

**Card Interactions:**
- Clickable human cards: cursor-pointer
- Disabled cards (can't play): opacity-50, cursor-not-allowed
- Playing animation: Transform to trick area (use CSS transitions, duration-500)

**Game State Indicators:**
- Loading new hand: Spinner overlay
- Waiting for CPU: Subtle animation on active CPU player card
- Win/lose announcement: Full-screen overlay with large text (text-6xl), fade-in

**Responsive Behavior:**
- Desktop (lg:): All players visible, spacious layout
- Tablet (md:): Compact player cards, maintain trick area prominence  
- Mobile (base): Stack layout, bottom drawer for hand, collapsible opponent area

## Animations

**Use Sparingly:**
- Card dealing: Stagger animation (delay-100, delay-200, etc.)
- Trick winner reveal: Brief scale-110 pulse
- Score changes: Number counter animation
- Modal appearances: Fade + slide (duration-300)

**No Animations:**
- Continuous background effects
- Distracting particle systems
- Excessive hover effects

## Images

**No large hero image required.**

**Icon Usage:**
- Suit icons: Use Font Awesome (hearts, diamonds, clubs, spades) via CDN
- UI icons: Heroicons for settings, close, help
- All icons: Inline, size-6 to size-8

**Card Back Designs:**
- Use CSS patterns/gradients for deck color variations
- Simple geometric patterns (stripes, dots, diamonds)
- User selects from 6-8 preset options

## Layout Specifications

**Container:** max-w-7xl mx-auto, px-4
**Game board:** min-h-screen flex flex-col
**Responsive padding:** p-4 md:p-6 lg:p-8
**Component gaps:** gap-4 to gap-8 throughout

This design creates a clean, functional card game interface that prioritizes gameplay clarity while maintaining visual appeal through thoughtful spacing, clear typography hierarchy, and intuitive component organization.