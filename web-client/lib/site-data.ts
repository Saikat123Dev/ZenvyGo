import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  CarFront,
  FileHeart,
  LockKeyhole,
  MailCheck,
  MessageSquareWarning,
  QrCode,
  ScanSearch,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

export const siteConfig = {
  name: "ZenvyGo",
  legalName: "ZenvyGo",
  tagline: "Connect. Protect. Respond.",
  description:
    "Privacy-first vehicle contact for verified owners, QR-tagged vehicles, structured public requests, owner alerts, and emergency-ready vehicle profiles.",
  author: "ZenvyGo Team",
  locale: "en_US",
  category: "Vehicle communication software",
  ogImagePath: "/opengraph-image",
  twitterImagePath: "/twitter-image",
  supportEmail: "support@zenvygo.com",
  keywords: [
    "ZenvyGo",
    "vehicle contact app",
    "privacy-first vehicle contact",
    "QR vehicle tag",
    "car owner alert system",
    "vehicle emergency profile",
    "car QR code contact",
    "parking issue notification",
    "vehicle owner dashboard",
  ],
  links: {
    app: "zenvygo://",
    website: "https://zenvygo.com",
    github: "https://github.com/zenvygo",
    twitter: "https://twitter.com/zenvygo",
  },
};

export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Trust", href: "#trust" },
];

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
}

export const featureItems: FeatureItem[] = [
  {
    icon: MailCheck,
    title: "Verified owner onboarding",
    description:
      "Owners sign up with email and password, verify with a 6-digit code, and keep account recovery and profile settings in one place.",
    detail: "Signup, verification, login, and password reset are already implemented.",
  },
  {
    icon: CarFront,
    title: "Multi-vehicle management",
    description:
      "Each owner can register multiple vehicles with plate, region, make, model, color, and year details from a single command center.",
    detail: "Vehicle records can be created, edited, and archived.",
  },
  {
    icon: QrCode,
    title: "QR tag generation and activation",
    description:
      "ZenvyGo generates unique QR tags per vehicle, gives each one a secure token, and tracks whether that tag is generated or activated.",
    detail: "Every tag resolves back to the right vehicle context.",
  },
  {
    icon: ScanSearch,
    title: "Structured public scan flow",
    description:
      "A bystander can scan a tag, choose a real incident reason like blocking access, lights on, towing risk, or damage, then add context fast.",
    detail: "Supported channels include call, SMS, WhatsApp, and in-app request logging.",
  },
  {
    icon: BellRing,
    title: "Alerts and request resolution",
    description:
      "Owners see new contact sessions, review recent alerts, and mark requests resolved without losing the history of what happened.",
    detail: "Unread states, alert history, and session status are already modeled in the app.",
  },
  {
    icon: FileHeart,
    title: "Vehicle-level emergency profiles",
    description:
      "Each vehicle can store emergency contacts, medical notes, and roadside assistance details so critical information stays tied to the car.",
    detail: "Emergency profiles are owner-managed and loaded alongside vehicle data.",
  },
];

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
  points: string[];
}

export const workflowSteps: WorkflowStep[] = [
  {
    step: "01",
    title: "Create and verify the owner account",
    description:
      "ZenvyGo starts with verified onboarding so the owner dashboard is tied to a real account before any vehicle or tag goes live.",
    points: ["Email + password signup", "6-digit email verification", "Profile, language, and recovery flows"],
  },
  {
    step: "02",
    title: "Add a vehicle and activate its QR tag",
    description:
      "Owners register their vehicles, generate a unique QR tag, and activate it when they are ready to place it on the car.",
    points: ["Plate and vehicle details", "Generated or activated tag state", "Multi-vehicle support"],
  },
  {
    step: "03",
    title: "Public users scan and submit a real issue",
    description:
      "A scan opens a guided request flow where the public selects a reason, chooses a preferred channel, and adds an optional note.",
    points: ["Blocking access, lights on, towing risk, damage", "Call, SMS, WhatsApp, or in-app channel", "Optional requester name and message"],
  },
  {
    step: "04",
    title: "Owners review alerts, sessions, and emergency data",
    description:
      "The owner dashboard brings together recent alerts, open contact requests, and vehicle-specific emergency information for faster follow-through.",
    points: ["Recent alert history", "Resolve open sessions", "Emergency contacts per vehicle"],
  },
];

export interface DashboardMetric {
  label: string;
  value: string;
  accentClass: string;
}

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Active vehicles", value: "03", accentClass: "from-blue-500/25 to-cyan-400/10 text-cyan-100" },
  { label: "Activated tags", value: "03", accentClass: "from-fuchsia-500/20 to-blue-500/10 text-fuchsia-100" },
  { label: "Open requests", value: "02", accentClass: "from-amber-500/20 to-orange-400/10 text-amber-100" },
  { label: "Emergency profiles", value: "02", accentClass: "from-emerald-500/20 to-cyan-400/10 text-emerald-100" },
];

export interface DashboardVehicle {
  plate: string;
  name: string;
  detail: string;
  tagState: string;
}

export const dashboardVehicles: DashboardVehicle[] = [
  {
    plate: "DXB A 42819",
    name: "Toyota Camry",
    detail: "QR activated · emergency profile ready",
    tagState: "Active tag",
  },
  {
    plate: "DXB C 90172",
    name: "Nissan Patrol",
    detail: "New tag generated · awaiting placement",
    tagState: "Generated",
  },
  {
    plate: "SHJ 11284",
    name: "Tesla Model 3",
    detail: "Live request resolved 14 minutes ago",
    tagState: "Resolved",
  },
];

export interface DashboardRequest {
  title: string;
  vehicle: string;
  reason: string;
  channel: string;
  timestamp: string;
  note: string;
}

export const dashboardRequests: DashboardRequest[] = [
  {
    title: "Front gate blocked",
    vehicle: "Toyota Camry",
    reason: "Blocking access",
    channel: "Call",
    timestamp: "2 min ago",
    note: "Security desk added a short note for the owner.",
  },
  {
    title: "Visitor parking tow risk",
    vehicle: "Nissan Patrol",
    reason: "Towing risk",
    channel: "WhatsApp",
    timestamp: "8 min ago",
    note: "Public request logged from the visitor lot.",
  },
];

export interface DashboardAlert {
  title: string;
  body: string;
  tone: "warning" | "info" | "success";
}

export const dashboardAlerts: DashboardAlert[] = [
  {
    title: "New vehicle contact request",
    body: "Reason: blocking_access · requested channel: call",
    tone: "warning",
  },
  {
    title: "Emergency profile updated",
    body: "Roadside assistance number saved for Toyota Camry",
    tone: "info",
  },
  {
    title: "Tag activated",
    body: "Tesla Model 3 QR tag is now live on the vehicle",
    tone: "success",
  },
];

export const scanReasons = [
  "Blocking access",
  "Lights on",
  "Window open",
  "Towing risk",
  "Accident or damage",
  "Security concern",
  "Urgent personal reason",
];

export const channelOptions = ["Call", "SMS", "WhatsApp", "In-app"];

export interface TrustPillar {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const trustPillars: TrustPillar[] = [
  {
    icon: ShieldCheck,
    title: "Private owner layer",
    description:
      "The owner area is authenticated, while the public scan flow stays limited to the exact vehicle contact task.",
  },
  {
    icon: LockKeyhole,
    title: "Controlled public entry points",
    description:
      "Public tag resolution and contact-session creation are rate-limited to reduce noisy or abusive traffic.",
  },
  {
    icon: MessageSquareWarning,
    title: "Accountable request history",
    description:
      "Every contact session is tied back to the vehicle, tag, reason, requested channel, and resolution state.",
  },
  {
    icon: TimerReset,
    title: "Fast owner response loop",
    description:
      "The dashboard keeps alerts, open requests, and emergency details close enough to act on in one pass.",
  },
];
