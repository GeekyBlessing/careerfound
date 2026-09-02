import { Compass, Map, FolderGit2, MessageCircle } from "lucide-react";

/**
 * Shared source of truth for marketing copy that appears both as a
 * homepage teaser section and as its own standalone route (extracted
 * rather than duplicated, so the two never drift). See:
 * app/page.tsx (teasers), app/how-it-works, app/pricing, app/faq.
 */

export const steps = [
  {
    title: "1. Discover your path",
    body: "Answer honest questions about your time, budget, interests, and goals. Get a Best Match, Strong Alternative, and Wild Card, not a random guess.",
    icon: Compass,
  },
  {
    title: "2. Get a personalized roadmap",
    body: "Phased lessons, exercises, and projects generated for your chosen path, not a static PDF everyone gets.",
    icon: Map,
  },
  {
    title: "3. Build real projects",
    body: "Learn by shipping real projects (a password checker, a port scanner, a full-stack app) with AI feedback on every submission.",
    icon: FolderGit2,
  },
  {
    title: "4. Get job-ready",
    body: "Track your Tech Readiness Score, practice real-world simulations, and build a portfolio that gets you interviews.",
    icon: MessageCircle,
  },
];

export const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to discover your path and start learning.",
    features: ["Career discovery assessment", "Basic personalized roadmap", "Selected lessons per path", "Community access"],
    cta: "Start free",
    href: "/onboarding",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "The full accelerator, for people serious about landing a role. Not billable yet, everything below runs on the free plan for now.",
    features: [
      "Full AI Mentor access",
      "Complete roadmap, all phases",
      "Advanced projects + AI project reviewer",
      "Portfolio builder",
      "Mock interviews & readiness analysis",
    ],
    cta: "Start free",
    href: "/onboarding",
    highlighted: true,
  },
  {
    name: "Mentorship",
    price: "Pay-per-session",
    period: "",
    description: "1:1 time with working professionals when you need a human. Founding sessions are free, see a mentor's profile for current pricing.",
    features: ["30-min consultations", "Portfolio & CV reviews", "Mock interviews", "Career guidance"],
    cta: "Browse mentors",
    href: "/mentors",
    highlighted: false,
  },
];

export const faqs = [
  {
    q: "I know nothing about tech. Is this actually for me?",
    a: "Yes, that's specifically who CareerFound is built for. Turn on 'I Know Nothing' mode and every technical term gets a plain-language explanation before we use it.",
  },
  {
    q: "How is this different from a course platform like Udemy or Coursera?",
    a: "Those platforms hand you a catalog and hope you pick the right thing. CareerFound tells you what to do today, adapts your roadmap to your actual progress, and builds a portfolio and readiness score alongside your learning: it's a system, not a library.",
  },
  {
    q: "What if I only have a smartphone and limited data?",
    a: "CareerFound is mobile-first and designed for low-bandwidth use, with lightweight pages and downloadable lesson content for offline review.",
  },
  {
    q: "Do I need to know what career I want before I start?",
    a: "No, that's the whole point of the 'Find Your Tech Path' assessment. Most people start with zero clarity and leave with a specific, personalized recommendation.",
  },
  {
    q: "Is the AI mentor a real person?",
    a: "It's an AI trained to behave like a patient senior engineer, explaining simply, giving hints before answers, and adjusting to your level. Human mentors are available separately in the Mentorship Marketplace.",
  },
  {
    q: "Can I change my career path after starting?",
    a: "Yes. Retake the assessment or browse Career Paths and start a different roadmap whenever you want, your progress on the original path is kept, not deleted.",
  },
  {
    q: "Is CareerFound free?",
    a: "The assessment, a roadmap, and a set of lessons and projects per path are free with no time limit. Pro (full roadmap depth, AI project review, mock interviews) is on the way and not billable yet.",
  },
  {
    q: "How does mentorship work?",
    a: "The Mentorship Marketplace connects you with real professionals for 1:1 sessions. Some profiles are labeled demo profiles for testing; real, bookable mentors are clearly marked. Booking is real today, payment is not live yet, so founding sessions are free.",
  },
];
