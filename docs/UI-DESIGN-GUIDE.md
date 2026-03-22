# Sampark - UI Design Guide & API Reference

> A Professional, Lightweight Design System for React Native with NativeWind

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Scheme](#color-scheme)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Library](#component-library)
6. [Screen Designs](#screen-designs)
7. [API Reference](#api-reference)
8. [Implementation Guide](#implementation-guide)

---

## Brand Identity

### App Name: **Sampark** (संपर्क / صمبرك)
*Meaning: Connection/Contact in Hindi/Sanskrit*

### Brand Values
- **Trust** - Secure, privacy-first communication
- **Simplicity** - Minimal, intuitive interface
- **Safety** - Emergency-ready, reliable
- **Regional** - Middle East market focused (UAE, Saudi, Qatar)

### Logo Concept
```
    ┌─────────────────┐
    │    📍          │
    │   ╱  ╲         │
    │  │ 🚗 │        │
    │   ╲__╱         │
    │                │
    │  SAMPARK       │
    └─────────────────┘
```
- Location pin merged with car silhouette
- Clean, geometric design
- Works in single color for QR tags

---

## Color Scheme

### Primary Palette

```
┌────────────────────────────────────────────────────────────────────┐
│  SAMPARK COLOR SYSTEM - Professional & Trustworthy                 │
└────────────────────────────────────────────────────────────────────┘

PRIMARY COLORS (Brand Identity)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┐  Primary Blue        #1E3A8A (Blue-900)
│              │  - Main brand color
│   PRIMARY    │  - Headers, primary buttons
│              │  - Trust & professionalism
└──────────────┘  RGB: 30, 58, 138

┌──────────────┐  Primary Light       #3B82F6 (Blue-500)
│              │  - Interactive elements
│   ACCENT     │  - Links, highlights
│              │  - Active states
└──────────────┘  RGB: 59, 130, 246

┌──────────────┐  Primary Dark        #1E40AF (Blue-800)
│              │  - Pressed states
│   PRESSED    │  - Dark mode primary
│              │  - Emphasis text
└──────────────┘  RGB: 30, 64, 175


SECONDARY COLORS (Supporting)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┐  Teal Accent         #0D9488 (Teal-600)
│              │  - Success states
│   SUCCESS    │  - Verified badges
│              │  - Positive actions
└──────────────┘  RGB: 13, 148, 136

┌──────────────┐  Amber Warning       #F59E0B (Amber-500)
│              │  - Warnings
│   WARNING    │  - Pending states
│              │  - Attention needed
└──────────────┘  RGB: 245, 158, 11

┌──────────────┐  Rose Error          #E11D48 (Rose-600)
│              │  - Errors
│   DANGER     │  - Destructive actions
│              │  - Emergency alerts
└──────────────┘  RGB: 225, 29, 72


NEUTRAL COLORS (UI Foundation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┐  Background          #FFFFFF
│   SURFACE    │  Card backgrounds    #F8FAFC (Slate-50)
│              │  Page background     #F1F5F9 (Slate-100)
└──────────────┘

┌──────────────┐  Text Primary        #0F172A (Slate-900)
│    TEXT      │  Text Secondary      #475569 (Slate-600)
│              │  Text Muted          #94A3B8 (Slate-400)
└──────────────┘

┌──────────────┐  Border Light        #E2E8F0 (Slate-200)
│   BORDER     │  Border Default      #CBD5E1 (Slate-300)
│              │  Divider             #F1F5F9 (Slate-100)
└──────────────┘
```

### Dark Mode Palette

```
DARK MODE COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background           #0F172A (Slate-900)
Surface              #1E293B (Slate-800)
Surface Elevated     #334155 (Slate-700)

Text Primary         #F8FAFC (Slate-50)
Text Secondary       #CBD5E1 (Slate-300)
Text Muted           #64748B (Slate-500)

Border               #334155 (Slate-700)

Primary              #60A5FA (Blue-400)
Primary Light        #93C5FD (Blue-300)
```

### Tailwind/NativeWind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        // Semantic Colors
        success: '#0D9488',
        warning: '#F59E0B',
        danger: '#E11D48',
        info: '#0EA5E9',
      },
    },
  },
};
```

### Color Usage Guidelines

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| App Background | `slate-100` | `slate-900` |
| Card Background | `white` | `slate-800` |
| Primary Button | `brand-900` | `brand-500` |
| Primary Button Text | `white` | `white` |
| Secondary Button | `brand-100` | `brand-900/30` |
| Secondary Button Text | `brand-900` | `brand-300` |
| Input Background | `white` | `slate-800` |
| Input Border | `slate-300` | `slate-600` |
| Placeholder | `slate-400` | `slate-500` |
| Link | `brand-600` | `brand-400` |
| Divider | `slate-200` | `slate-700` |

---

## Typography

### Font Family

```
Primary:    Inter (Sans-serif) - Clean, modern, excellent readability
Arabic:     IBM Plex Sans Arabic - For RTL support
Monospace:  JetBrains Mono - OTP codes, vehicle plates
```

### Type Scale

```
┌─────────────────────────────────────────────────────────────────┐
│  TYPOGRAPHY SCALE                                               │
└─────────────────────────────────────────────────────────────────┘

Display     32px / 40px LH / -0.02em    Hero text, splash screens
H1          28px / 36px LH / -0.02em    Screen titles
H2          24px / 32px LH / -0.01em    Section headers
H3          20px / 28px LH / -0.01em    Card titles
H4          18px / 26px LH              Subsection headers

Body Large  17px / 26px LH              Primary content
Body        15px / 24px LH              Default text
Body Small  13px / 20px LH              Secondary text

Caption     12px / 16px LH              Labels, hints
Overline    11px / 16px LH / 0.05em     Category labels (uppercase)
```

### Font Weights

```
Regular     400    Body text, descriptions
Medium      500    Buttons, labels, emphasis
SemiBold    600    Subheadings, important values
Bold        700    Headers, primary actions
```

### NativeWind Typography Classes

```javascript
// Typography utility classes
const typography = {
  display: 'text-3xl font-bold tracking-tight',
  h1: 'text-2xl font-bold tracking-tight',
  h2: 'text-xl font-semibold tracking-tight',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',
  bodyLarge: 'text-base leading-relaxed',
  body: 'text-sm leading-normal',
  bodySmall: 'text-xs leading-normal',
  caption: 'text-xs text-slate-500',
  overline: 'text-xs uppercase tracking-widest font-medium',
};
```

---

## Spacing & Layout

### Spacing Scale

```
┌─────────────────────────────────────────────────────────────────┐
│  8-POINT SPACING SYSTEM                                         │
└─────────────────────────────────────────────────────────────────┘

0     0px      -
0.5   2px      Hairline gaps
1     4px      Tight spacing
2     8px      Default gap
3     12px     Component padding
4     16px     Section gaps
5     20px     Card padding
6     24px     Large gaps
8     32px     Section spacing
10    40px     Page margins
12    48px     Large sections
16    64px     Hero spacing
```

### Screen Layout

```
┌──────────────────────────────────────┐
│ ← Status Bar (System)               │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐   │  ← 16px horizontal padding
│  │         Header Area          │   │
│  │    Title / Navigation        │   │  ← 56px height
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │                              │   │
│  │       Content Area           │   │
│  │     (Scrollable)             │   │
│  │                              │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
├──────────────────────────────────────┤
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐    │  ← Bottom Tab Bar
│  │Home│  │Cars│  │Scan│  │More│    │  ← 64px height
│  └────┘  └────┘  └────┘  └────┘    │
└──────────────────────────────────────┘
```

### Safe Areas

```javascript
// Safe area insets for different devices
const safeAreas = {
  top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
  bottom: Platform.OS === 'ios' ? 34 : 0,
  horizontal: 16,
};
```

---

## Component Library

### Buttons

```
┌─────────────────────────────────────────────────────────────────┐
│  BUTTON VARIANTS                                                 │
└─────────────────────────────────────────────────────────────────┘

PRIMARY BUTTON (Main CTA)
┌─────────────────────────────────┐
│         Add Vehicle             │   Height: 52px
└─────────────────────────────────┘   Radius: 12px
bg-brand-900 text-white              Padding: 16px 24px
font-semibold                        Shadow: sm

SECONDARY BUTTON
┌─────────────────────────────────┐
│           Cancel                │   Same dimensions
└─────────────────────────────────┘
bg-brand-100 text-brand-900
border border-brand-200

OUTLINE BUTTON
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│         View Details            │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
bg-transparent border-brand-300
text-brand-700

GHOST BUTTON
          Skip for now               No background/border
text-slate-600 underline             Text only

DANGER BUTTON
┌─────────────────────────────────┐
│        Delete Vehicle           │
└─────────────────────────────────┘
bg-rose-600 text-white

ICON BUTTON
    ┌────┐
    │ ＋ │                           Size: 48x48
    └────┘                           Radius: 12px
```

### Button States

```
Normal    →  opacity-100
Pressed   →  opacity-80, scale-98
Disabled  →  opacity-50
Loading   →  Show spinner, disable interaction
```

### Input Fields

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT VARIANTS                                                  │
└─────────────────────────────────────────────────────────────────┘

DEFAULT INPUT
┌─────────────────────────────────┐
│  Vehicle Name                   │   Label (above)
├─────────────────────────────────┤
│  My Honda Civic                 │   Height: 52px
└─────────────────────────────────┘   Radius: 12px
                                      Border: slate-300
                                      Focus: brand-500

WITH PREFIX
┌─────────────────────────────────┐
│  🇦🇪 │ +971 │ 50 123 4567      │   Country flag + code
└─────────────────────────────────┘

WITH ERROR
┌─────────────────────────────────┐
│  ⚠️  Invalid phone number       │   Red border + message
└─────────────────────────────────┘
border-rose-500 text-rose-600

OTP INPUT (6 digits)
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 4 │ │ 2 │ │ 8 │ │   │ │   │ │   │
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘
Each: 48x56px, mono font
```

### Cards

```
┌─────────────────────────────────────────────────────────────────┐
│  CARD STYLES                                                     │
└─────────────────────────────────────────────────────────────────┘

VEHICLE CARD
┌──────────────────────────────────────┐
│  ┌────┐                              │
│  │ 🚗 │   Honda Civic 2022           │
│  └────┘   ABC 1234 • Dubai           │
│           ───────────────            │
│           ● Active  │  3 Tags        │
│                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ Edit │  │ Tags │  │ QR   │       │
│  └──────┘  └──────┘  └──────┘       │
└──────────────────────────────────────┘
bg-white rounded-2xl shadow-sm p-5
border border-slate-100


ALERT CARD
┌──────────────────────────────────────┐
│  🔔  Someone scanned your QR         │
│      Honda Civic • 2 min ago         │
│      ─────────────────────           │
│      📍 Dubai Mall Parking           │
│                                      │
│             [ View Details ]         │
└──────────────────────────────────────┘
Unread: bg-brand-50 border-brand-200
Read: bg-white border-slate-100


STAT CARD (Dashboard)
┌──────────────────┐
│        3         │
│    Vehicles      │
│                  │
│    ● Active      │
└──────────────────┘
bg-white rounded-xl p-4
text-center
```

### Bottom Sheet

```
┌──────────────────────────────────────┐
│                                      │
│          (Overlay - 50%)             │
│                                      │
├──────────────────────────────────────┤
│          ═══════════                 │  ← Handle (32x4px)
│                                      │
│         Sheet Content                │
│         ─────────────                │  rounded-t-3xl
│                                      │  bg-white
│  ┌──────────────────────────────┐   │
│  │         Primary Action       │   │
│  └──────────────────────────────┘   │
│                                      │
│           Cancel                     │
│                                      │
└──────────────────────────────────────┘
```

### Navigation

```
BOTTOM TAB BAR
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   🏠        🚗        📷        👤                      │
│  Home    Vehicles    Scan    Profile                    │
│   ●                                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
Active: brand-600 + dot indicator
Inactive: slate-400
Height: 64px + safe area
bg-white border-t border-slate-100


TOP HEADER
┌──────────────────────────────────────────────────────────┐
│   ←        My Vehicles                          ＋       │
└──────────────────────────────────────────────────────────┘
Height: 56px
Back: 24x24 icon
Title: h3, centered
Action: icon or text button
```

---

## Screen Designs

### 1. Splash Screen

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│                                      │
│            ┌────────┐                │
│            │   📍   │                │
│            │  ╱  ╲  │                │
│            │ │🚗 │ │                │
│            │  ╲__╱  │                │
│            └────────┘                │
│                                      │
│            SAMPARK                   │
│     Connect. Protect. Respond.       │
│                                      │
│                                      │
│                                      │
│            ● ● ●                     │
│         Loading...                   │
│                                      │
└──────────────────────────────────────┘
bg-brand-900
Logo + tagline: white
```

### 2. Onboarding Screen

```
┌──────────────────────────────────────┐
│                                Skip  │
│                                      │
│     ┌────────────────────────┐       │
│     │                        │       │
│     │   [Illustration]       │       │
│     │   QR code scanning     │       │
│     │                        │       │
│     └────────────────────────┘       │
│                                      │
│         Privacy First                │
│                                      │
│     Your phone number stays          │
│     hidden. Communicate safely       │
│     through our masked relay.        │
│                                      │
│          ●  ○  ○                     │
│                                      │
│  ┌──────────────────────────────┐   │
│  │         Get Started          │   │
│  └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

### 3. Phone Login Screen

```
┌──────────────────────────────────────┐
│   ←                                  │
│                                      │
│                                      │
│         Welcome Back                 │
│                                      │
│     Enter your phone number          │
│     to continue                      │
│                                      │
│                                      │
│     Phone Number                     │
│  ┌──────────────────────────────┐   │
│  │  🇦🇪  +971  │  50 123 4567   │   │
│  └──────────────────────────────┘   │
│                                      │
│     We'll send you a 6-digit         │
│     verification code                │
│                                      │
│                                      │
│                                      │
│                                      │
│  ┌──────────────────────────────┐   │
│  │        Send OTP              │   │
│  └──────────────────────────────┘   │
│                                      │
│     By continuing, you agree to      │
│     our Terms & Privacy Policy       │
│                                      │
└──────────────────────────────────────┘
```

### 4. OTP Verification Screen

```
┌──────────────────────────────────────┐
│   ←                                  │
│                                      │
│                                      │
│         Verify Phone                 │
│                                      │
│     Enter the code sent to           │
│     +971 50 *** **67                 │
│                                      │
│                                      │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ 4 │ │ 2 │ │ 8 │ │   │ │   │ │   ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                      │
│         02:45 remaining              │
│                                      │
│                                      │
│     Didn't receive code?             │
│          Resend OTP                  │
│                                      │
│                                      │
│  ┌──────────────────────────────┐   │
│  │          Verify              │   │
│  └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

### 5. Home Dashboard

```
┌──────────────────────────────────────┐
│     Good Morning, Ahmed ☀️           │
│     ─────────────────                │
│                                      │
│  ┌──────────┐ ┌──────────┐          │
│  │    2     │ │    5     │          │
│  │ Vehicles │ │   Tags   │          │
│  │  ● Active│ │ ● Active │          │
│  └──────────┘ └──────────┘          │
│                                      │
│  Recent Alerts                  All →│
│  ─────────────────                   │
│  ┌──────────────────────────────┐   │
│  │ 🔔  QR Scanned • 2m ago      │   │
│  │     Honda Civic              │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ ✓  Session Resolved • 1h    │   │
│  │     Toyota Camry             │   │
│  └──────────────────────────────┘   │
│                                      │
│  Quick Actions                       │
│  ─────────────                       │
│  ┌────────┐ ┌────────┐ ┌────────┐   │
│  │ ＋ Add │ │ 📷Scan │ │ 🆘SOS │   │
│  │Vehicle │ │   QR   │ │  Help │   │
│  └────────┘ └────────┘ └────────┘   │
│                                      │
├──────────────────────────────────────┤
│  🏠      🚗       📷       👤       │
│  Home  Vehicles  Scan   Profile     │
│   ●                                 │
└──────────────────────────────────────┘
```

### 6. Vehicles List Screen

```
┌──────────────────────────────────────┐
│        My Vehicles              ＋   │
│                                      │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
│  │  🔍  Search vehicles...      │   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ ┌────┐                       │   │
│  │ │ 🚗 │  Honda Civic 2022     │   │
│  │ └────┘  ABC 1234 • Dubai     │   │
│  │         ● Active  │  3 Tags  │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ │   │
│  │  │ Edit │ │ Tags │ │  QR  │ │   │
│  │  └──────┘ └──────┘ └──────┘ │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ ┌────┐                       │   │
│  │ │ 🚙 │  Toyota Camry 2021    │   │
│  │ └────┘  XYZ 5678 • Abu Dhabi │   │
│  │         ● Active  │  2 Tags  │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ │   │
│  │  │ Edit │ │ Tags │ │  QR  │ │   │
│  │  └──────┘ └──────┘ └──────┘ │   │
│  └──────────────────────────────┘   │
│                                      │
├──────────────────────────────────────┤
│  🏠      🚗       📷       👤       │
└──────────────────────────────────────┘
```

### 7. Add/Edit Vehicle Screen

```
┌──────────────────────────────────────┐
│   ←      Add Vehicle                 │
│                                      │
│     Vehicle Details                  │
│     ───────────────                  │
│                                      │
│     Vehicle Name                     │
│  ┌──────────────────────────────┐   │
│  │  My Honda Civic              │   │
│  └──────────────────────────────┘   │
│                                      │
│     License Plate                    │
│  ┌──────────────────────────────┐   │
│  │  ABC 1234                    │   │
│  └──────────────────────────────┘   │
│                                      │
│     Emirate                          │
│  ┌──────────────────────────────┐   │
│  │  Dubai                     ▼ │   │
│  └──────────────────────────────┘   │
│                                      │
│     Make (Optional)                  │
│  ┌──────────────────────────────┐   │
│  │  Honda                       │   │
│  └──────────────────────────────┘   │
│                                      │
│     Model (Optional)                 │
│  ┌──────────────────────────────┐   │
│  │  Civic                       │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │       Save Vehicle           │   │
│  └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

### 8. QR Scanner Screen

```
┌──────────────────────────────────────┐
│   ✕       Scan QR                    │
│                                      │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │                              │   │
│  │    ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │   │
│  │    │                 │      │   │
│  │    │   SCAN AREA     │      │   │
│  │    │                 │      │   │
│  │    │    ═══════      │      │   │
│  │    │                 │      │   │
│  │    └ ─ ─ ─ ─ ─ ─ ─ ─ ┘     │   │
│  │                              │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
│     Point your camera at a           │
│     Sampark QR code                  │
│                                      │
│  ┌────────┐          ┌────────┐     │
│  │        │          │        │     │
│  │  📸    │          │  🔦    │     │
│  │ Gallery│          │ Flash  │     │
│  │        │          │        │     │
│  └────────┘          └────────┘     │
│                                      │
└──────────────────────────────────────┘
```

### 9. Contact Session Screen (Public - After QR Scan)

```
┌──────────────────────────────────────┐
│                                      │
│            SAMPARK                   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │         🚗                   │   │
│  │                              │   │
│  │      Vehicle Found           │   │
│  │      ─────────────           │   │
│  │      ABC 1234                │   │
│  │      Dubai                   │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
│     Select a reason to contact:      │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  🚨  Emergency               │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  💡  Lights On               │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  🚗  Blocking                │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  💬  Other                   │   │
│  └──────────────────────────────┘   │
│                                      │
│     Your identity remains private    │
│                                      │
└──────────────────────────────────────┘
```

### 10. Alerts List Screen

```
┌──────────────────────────────────────┐
│          Alerts              Mark All│
│                                      │
│     Today                            │
│     ─────                            │
│  ┌──────────────────────────────┐   │
│  │ 🔴 Someone scanned your QR   │   │
│  │    Honda Civic • 2 min ago   │   │
│  │    📍 Dubai Mall Parking     │   │
│  │           [ View Details ]   │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 🟢 Session Resolved          │   │
│  │    Toyota Camry • 1 hour ago │   │
│  │    Reason: Lights On         │   │
│  └──────────────────────────────┘   │
│                                      │
│     Yesterday                        │
│     ─────────                        │
│  ┌──────────────────────────────┐   │
│  │ ⚪ Tag Activated             │   │
│  │    Honda Civic • 1 day ago   │   │
│  └──────────────────────────────┘   │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  🏠      🚗       📷       👤       │
└──────────────────────────────────────┘

🔴 = Unread (bg-brand-50 border-brand-200)
🟢 = Resolved (teal accent)
⚪ = Read (neutral)
```

### 11. Profile Screen

```
┌──────────────────────────────────────┐
│          Profile                     │
│                                      │
│           ┌────────┐                 │
│           │        │                 │
│           │  👤    │                 │
│           │        │                 │
│           └────────┘                 │
│           Ahmed Hassan               │
│        +971 50 *** **67              │
│                                      │
│  ─────────────────────────────────   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  👤  Edit Profile          → │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  🔔  Notifications         → │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  🌙  Dark Mode            ○  │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  🌐  Language: English    → │   │
│  └──────────────────────────────┘   │
│                                      │
│  ─────────────────────────────────   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  📄  Terms & Privacy       → │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  ❓  Help & Support        → │   │
│  └──────────────────────────────┘   │
│                                      │
│          [ Log Out ]                 │
│                                      │
│        Version 1.0.0                 │
│                                      │
├──────────────────────────────────────┤
│  🏠      🚗       📷       👤       │
└──────────────────────────────────────┘
```

---

## API Reference

### Base URL
```
Production:  https://api.sampark.app/api/v1
Staging:     https://staging-api.sampark.app/api/v1
Local:       http://localhost:3000/api/v1
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

---

### Authentication APIs

#### 1. Request OTP
```http
POST /auth/otp/request
```

**Request:**
```json
{
  "phoneNumber": "+971501234567"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expiresIn": 300
  }
}
```

**Errors:**
- `400` - Invalid phone format
- `429` - Too many requests (rate limited)

---

#### 2. Verify OTP
```http
POST /auth/otp/verify
```

**Request:**
```json
{
  "phoneNumber": "+971501234567",
  "otp": "428591"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "dGhpc...",
    "expiresIn": 900,
    "isNewUser": false
  }
}
```

**Errors:**
- `400` - Invalid OTP format
- `401` - Incorrect OTP / Expired
- `403` - Too many failed attempts (locked)

---

#### 3. Refresh Token
```http
POST /auth/refresh
```

**Request:**
```json
{
  "refreshToken": "dGhpc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

---

### User APIs

#### 4. Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "phoneNumber": "+971501234567",
    "displayName": "Ahmed Hassan",
    "preferredLanguage": "en",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 5. Update User Profile
```http
PATCH /users/me
Authorization: Bearer <token>
```

**Request:**
```json
{
  "displayName": "Ahmed Hassan",
  "preferredLanguage": "ar"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "displayName": "Ahmed Hassan",
    "preferredLanguage": "ar"
  }
}
```

---

### Vehicle APIs

#### 6. List Vehicles
```http
GET /vehicles
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20

**Response (200):**
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "vehicle-uuid",
        "nickname": "My Honda Civic",
        "licensePlate": "ABC 1234",
        "emirate": "dubai",
        "make": "Honda",
        "model": "Civic",
        "year": 2022,
        "color": "white",
        "tagCount": 3,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

#### 7. Create Vehicle
```http
POST /vehicles
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nickname": "My Honda Civic",
  "licensePlate": "ABC 1234",
  "emirate": "dubai",
  "make": "Honda",
  "model": "Civic",
  "year": 2022,
  "color": "white"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "vehicle-uuid",
    "nickname": "My Honda Civic",
    "licensePlate": "ABC 1234",
    "emirate": "dubai",
    "make": "Honda",
    "model": "Civic",
    "year": 2022,
    "color": "white",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

#### 8. Get Vehicle Details
```http
GET /vehicles/:vehicleId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "vehicle-uuid",
    "nickname": "My Honda Civic",
    "licensePlate": "ABC 1234",
    "emirate": "dubai",
    "make": "Honda",
    "model": "Civic",
    "year": 2022,
    "color": "white",
    "tags": [
      {
        "id": "tag-uuid",
        "state": "active",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "emergencyProfile": {
      "preferredChannel": "call",
      "bloodType": "O+"
    }
  }
}
```

---

#### 9. Update Vehicle
```http
PATCH /vehicles/:vehicleId
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nickname": "Honda Civic - Wife",
  "color": "silver"
}
```

---

#### 10. Delete Vehicle
```http
DELETE /vehicles/:vehicleId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Vehicle archived successfully"
  }
}
```

---

### Tag APIs

#### 11. List User Tags
```http
GET /tags
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "tag-uuid",
        "vehicleId": "vehicle-uuid",
        "vehicleNickname": "My Honda Civic",
        "state": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "activatedAt": "2024-01-16T08:00:00Z"
      }
    ]
  }
}
```

---

#### 12. Create Tag
```http
POST /tags
Authorization: Bearer <token>
```

**Request:**
```json
{
  "vehicleId": "vehicle-uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "tag-uuid",
    "vehicleId": "vehicle-uuid",
    "qrToken": "smp_abc123xyz...",
    "qrDataUrl": "data:image/png;base64,...",
    "state": "provisioned",
    "createdAt": "2024-01-20T15:45:00Z"
  }
}
```

---

#### 13. Activate Tag
```http
POST /tags/:tagId/activate
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "tag-uuid",
    "state": "active",
    "activatedAt": "2024-01-20T16:00:00Z"
  }
}
```

---

#### 14. Resolve QR Token (PUBLIC)
```http
POST /public/tags/resolve
```

**Request:**
```json
{
  "qrToken": "smp_abc123xyz..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "vehicleId": "vehicle-uuid",
    "licensePlate": "ABC 1234",
    "emirate": "dubai",
    "make": "Honda",
    "model": "Civic"
  }
}
```

**Errors:**
- `404` - Tag not found
- `410` - Tag revoked/inactive
- `429` - Rate limited

---

### Contact Session APIs

#### 15. Create Contact Session (PUBLIC)
```http
POST /public/contact-sessions
```

**Request:**
```json
{
  "qrToken": "smp_abc123xyz...",
  "reason": "lights_on",
  "message": "Your headlights are on in parking level B2"
}
```

**Contact Reasons:**
- `emergency` - Urgent/emergency situation
- `lights_on` - Vehicle lights left on
- `blocking` - Vehicle is blocking
- `damage` - Vehicle damage noticed
- `other` - Other reason

**Response (201):**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "status": "pending",
    "message": "The vehicle owner has been notified"
  }
}
```

---

#### 16. List Contact Sessions
```http
GET /contact-sessions
Authorization: Bearer <token>
```

**Query Parameters:**
- `vehicleId` (optional): Filter by vehicle
- `status` (optional): Filter by status
- `page`, `limit`: Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-uuid",
        "vehicleId": "vehicle-uuid",
        "vehicleNickname": "My Honda Civic",
        "reason": "lights_on",
        "message": "Your headlights are on",
        "status": "pending",
        "createdAt": "2024-01-20T15:45:00Z"
      }
    ]
  }
}
```

---

#### 17. Resolve Contact Session
```http
PATCH /contact-sessions/:sessionId/resolve
Authorization: Bearer <token>
```

**Request:**
```json
{
  "resolution": "acknowledged"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "status": "resolved",
    "resolvedAt": "2024-01-20T16:00:00Z"
  }
}
```

---

### Alert APIs

#### 18. List Alerts
```http
GET /alerts
Authorization: Bearer <token>
```

**Query Parameters:**
- `read` (optional): Filter by read status (true/false)
- `page`, `limit`: Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-uuid",
        "type": "qr_scanned",
        "title": "Someone scanned your QR",
        "body": "Honda Civic - Dubai Mall Parking",
        "vehicleId": "vehicle-uuid",
        "sessionId": "session-uuid",
        "read": false,
        "createdAt": "2024-01-20T15:45:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

**Alert Types:**
- `qr_scanned` - QR code was scanned
- `contact_request` - Contact session created
- `session_resolved` - Session marked resolved
- `tag_activated` - Tag was activated

---

#### 19. Mark Alert as Read
```http
PATCH /alerts/:alertId/read
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "alert-uuid",
    "read": true,
    "readAt": "2024-01-20T16:00:00Z"
  }
}
```

---

### Emergency Profile APIs

#### 20. Get Emergency Profile
```http
GET /vehicles/:vehicleId/emergency-profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "vehicleId": "vehicle-uuid",
    "preferredChannel": "call",
    "bloodType": "O+",
    "medicalConditions": "None",
    "emergencyContact": {
      "name": "Fatima Hassan",
      "relationship": "spouse",
      "phone": "+971501234568"
    }
  }
}
```

---

#### 21. Update Emergency Profile
```http
PUT /vehicles/:vehicleId/emergency-profile
Authorization: Bearer <token>
```

**Request:**
```json
{
  "preferredChannel": "call",
  "bloodType": "O+",
  "medicalConditions": "None",
  "emergencyContact": {
    "name": "Fatima Hassan",
    "relationship": "spouse",
    "phone": "+971501234568"
  }
}
```

---

### System APIs

#### 22. Health Check
```http
GET /health
```

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T15:45:00Z"
}
```

---

#### 23. Readiness Check
```http
GET /ready
```

**Response (200):**
```json
{
  "status": "ready",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## Implementation Guide

### Project Setup

```bash
# Create new Expo project
npx create-expo-app sampark-app --template expo-template-blank-typescript

# Install dependencies
cd sampark-app
npm install nativewind tailwindcss
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install expo-router expo-secure-store
npm install @tanstack/react-query zustand
npm install react-i18next i18next
npm install expo-camera expo-barcode-scanner
npm install react-native-reanimated
```

### Folder Structure

```
sampark-app/
├── app/                          # Expo Router
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Phone login
│   │   ├── otp.tsx              # OTP verification
│   │   └── onboarding.tsx
│   ├── (main)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Home dashboard
│   │   ├── vehicles/
│   │   │   ├── index.tsx        # Vehicle list
│   │   │   ├── [id].tsx         # Vehicle details
│   │   │   └── add.tsx          # Add vehicle
│   │   ├── scan.tsx             # QR scanner
│   │   ├── alerts.tsx           # Alerts list
│   │   └── profile.tsx
│   ├── public/
│   │   └── contact.tsx          # Public contact form
│   └── _layout.tsx              # Root layout
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── OTPInput.tsx
│   │   └── BottomSheet.tsx
│   └── feature/
│       ├── VehicleCard.tsx
│       ├── AlertItem.tsx
│       └── QuickActions.tsx
├── services/
│   ├── api.ts                   # Axios instance
│   ├── auth.ts                  # Auth service
│   └── storage.ts               # Secure storage
├── stores/
│   ├── authStore.ts             # Auth state (Zustand)
│   └── alertStore.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useVehicles.ts           # TanStack Query
│   └── useAlerts.ts
├── i18n/
│   ├── en.json
│   └── ar.json
├── utils/
│   ├── constants.ts
│   └── helpers.ts
├── tailwind.config.js
└── app.json
```

### NativeWind Setup

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['Inter'],
        mono: ['JetBrainsMono'],
      },
    },
  },
  plugins: [],
};
```

### Sample Component Implementation

```tsx
// components/ui/Button.tsx
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const variants = {
    primary: 'bg-brand-900 active:bg-brand-800',
    secondary: 'bg-brand-100 active:bg-brand-200',
    outline: 'bg-transparent border-2 border-brand-300',
    danger: 'bg-rose-600 active:bg-rose-700',
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-brand-900',
    outline: 'text-brand-700',
    danger: 'text-white',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        h-[52px] rounded-xl px-6 items-center justify-center
        ${variants[variant]}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#1E3A8A' : '#FFF'} />
      ) : (
        <Text className={`font-semibold text-base ${textVariants[variant]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

```tsx
// components/feature/VehicleCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VehicleCardProps {
  vehicle: {
    id: string;
    nickname: string;
    licensePlate: string;
    emirate: string;
    tagCount: number;
  };
  onEdit: () => void;
  onTags: () => void;
  onQR: () => void;
}

export function VehicleCard({ vehicle, onEdit, onTags, onQR }: VehicleCardProps) {
  return (
    <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 bg-brand-100 rounded-xl items-center justify-center mr-3">
          <Ionicons name="car" size={24} color="#1E3A8A" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-slate-900">
            {vehicle.nickname}
          </Text>
          <Text className="text-sm text-slate-500">
            {vehicle.licensePlate} • {vehicle.emirate}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-4">
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-teal-500 rounded-full mr-1.5" />
          <Text className="text-xs text-slate-500">Active</Text>
        </View>
        <Text className="text-xs text-slate-300 mx-2">|</Text>
        <Text className="text-xs text-slate-500">{vehicle.tagCount} Tags</Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={onEdit}
          className="flex-1 h-9 bg-slate-100 rounded-lg items-center justify-center"
        >
          <Text className="text-sm font-medium text-slate-700">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onTags}
          className="flex-1 h-9 bg-slate-100 rounded-lg items-center justify-center"
        >
          <Text className="text-sm font-medium text-slate-700">Tags</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onQR}
          className="flex-1 h-9 bg-brand-900 rounded-lg items-center justify-center"
        >
          <Text className="text-sm font-medium text-white">QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

---

## Quick Reference Card

### Colors (Copy-Paste Ready)

```
Primary:      #1E3A8A
Accent:       #3B82F6
Success:      #0D9488
Warning:      #F59E0B
Danger:       #E11D48

Background:   #F1F5F9
Surface:      #FFFFFF
Text:         #0F172A
Text Muted:   #94A3B8
Border:       #E2E8F0
```

### Dimensions

```
Button Height:        52px
Input Height:         52px
Card Radius:          16px
Button Radius:        12px
Tab Bar Height:       64px
Header Height:        56px
Horizontal Padding:   16px
```

### API Endpoints Quick List

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/auth/otp/request` | No |
| POST | `/auth/otp/verify` | No |
| POST | `/auth/refresh` | No |
| GET | `/users/me` | Yes |
| PATCH | `/users/me` | Yes |
| GET | `/vehicles` | Yes |
| POST | `/vehicles` | Yes |
| GET | `/vehicles/:id` | Yes |
| PATCH | `/vehicles/:id` | Yes |
| DELETE | `/vehicles/:id` | Yes |
| GET | `/tags` | Yes |
| POST | `/tags` | Yes |
| POST | `/tags/:id/activate` | Yes |
| POST | `/public/tags/resolve` | No |
| POST | `/public/contact-sessions` | No |
| GET | `/contact-sessions` | Yes |
| PATCH | `/contact-sessions/:id/resolve` | Yes |
| GET | `/alerts` | Yes |
| PATCH | `/alerts/:id/read` | Yes |
| GET | `/vehicles/:id/emergency-profile` | Yes |
| PUT | `/vehicles/:id/emergency-profile` | Yes |
| GET | `/health` | No |
| GET | `/ready` | No |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-19 | Initial design system and API documentation |

---

*Document generated for Sampark - Vehicle Contact Platform*
*Target Market: UAE, Saudi Arabia, Qatar*
