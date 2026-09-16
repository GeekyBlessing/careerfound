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
    priceAlt: "",
    period: "forever",
    description: "Everything you need to discover your path and start learning.",
    features: ["Career discovery assessment", "Basic personalized roadmap", "Selected lessons per path", "Community access"],
    cta: "Start free",
    href: "/onboarding",
    highlighted: false,
    paid: false,
  },
  {
    name: "1:1 Career Mentorship",
    price: "$200",
    priceAlt: "₦250,000",
    period: "2 months",
    description: "Direct, one-on-one mentorship with Toriola to help you move with a plan instead of guessing. This is a paid service.",
    features: [
      "Personalized career direction",
      "One-on-one mentorship",
      "Career roadmap",
      "Project guidance",
      "Portfolio review",
      "CV and LinkedIn guidance",
      "Interview preparation",
      "Accountability and progress tracking",
    ],
    cta: "Request mentorship",
    href: "/mentorship",
    highlighted: true,
    paid: true,
  },
  {
    name: "Career Consultation",
    price: "$7",
    priceAlt: "₦10,000",
    period: "30 minutes",
    description: "A single focused conversation to get unstuck on a specific question. This is a paid service.",
    features: [
      "Personal career consultation",
      "Career path guidance",
      "CV or portfolio advice",
      "Technology career questions",
      "Personalized recommendations",
    ],
    cta: "Book consultation",
    href: "/consultation",
    highlighted: false,
    paid: true,
  },
];

export const faqs = [
  {
    q: "What is CareerFound?",
    a: "CareerFound is a career development platform for people trying to get into tech. It helps you figure out which technology career actually fits you, gives you a roadmap and real projects to build the right skills, and connects you with an AI mentor and, if you want it, real human mentorship.",
  },
  {
    q: "Who is CareerFound for?",
    a: "Anyone trying to break into or move within tech: complete beginners with zero background, people switching careers, and self-taught learners who have some skills but no clear direction or portfolio.",
  },
  {
    q: "Do I need previous technology experience?",
    a: "No. The assessment and beginner-level content assume no prior experience. If you already have some background, the assessment adjusts and can point you toward more advanced paths and projects.",
  },
  {
    q: "How does the career assessment work?",
    a: "You answer honest questions about your time, budget, interests, and how you like to work. Based on that, CareerFound recommends a best match, a strong alternative, and a wild card, not a single random guess.",
  },
  {
    q: "What career paths are available?",
    a: "21 tech career paths today, spanning software engineering, cybersecurity, cloud engineering, cloud security, DevOps, data analysis, data engineering, AI/ML engineering, frontend, backend, full-stack development, UI/UX and product design, product management, technical writing, QA engineering, no-code and automation, IT support, and solutions architecture. Browse the full directory on the Career Paths page.",
  },
  {
    q: "How do the projects work?",
    a: "Each career path has real, hands-on projects at Beginner, Intermediate, and Expert difficulty, each with clear steps, hints, common mistakes to avoid, and what you'll actually produce. They're built to end up in your portfolio, not just checked off a list.",
  },
  {
    q: "Is CareerFound suitable for complete beginners?",
    a: "Yes, that's specifically who it's built for. Every path starts with a beginner-friendly explanation before any jargon, and the roadmap outline for each career tells you exactly what to focus on first.",
  },
  {
    q: "What does the AI Mentor do?",
    a: "It answers your questions in plain language, gives hints before answers instead of solving things for you, reviews your project submissions, and helps you figure out what to learn next when you're stuck.",
  },
  {
    q: "Is the AI Mentor a real person?",
    a: "No. It's an AI powered learning assistant, not a human professional, and CareerFound doesn't present it as one. If you want a real person, that's what 1:1 mentorship and the Career Consultation are for.",
  },
  {
    q: "How does human mentorship work?",
    a: "There are two ways to get a real person: the Mentorship Marketplace, where you can browse and book independent mentors (some profiles are clearly labeled as demo profiles for testing, real bookable mentors are marked separately), and 1:1 Career Mentorship or a Career Consultation directly with Toriola, CareerFound's founder.",
  },
  {
    q: "How much does the 1:1 mentorship cost?",
    a: "₦250,000 or $200 for a 2-month program. It's a paid service: personalized direction, one-on-one mentorship, a career roadmap, project guidance, portfolio review, CV and LinkedIn guidance, interview preparation, and accountability tracking throughout.",
  },
  {
    q: "What is included in the 30-minute consultation?",
    a: "A focused 30-minute conversation for ₦10,000 or $7, covering personal career consultation, career path guidance, CV or portfolio advice, technology career questions, and personalized recommendations. It's meant for one specific question or decision, not an ongoing program.",
  },
  {
    q: "Can I use CareerFound on my phone?",
    a: "Yes. It's built mobile-first and designed to work well on a smaller screen and slower connection, not just as an afterthought to a desktop layout.",
  },
  {
    q: "Do I receive emails after joining?",
    a: "You'll get a welcome email right after you sign up, plus account emails like verification and password resets when needed. Anything beyond that, like tips or nudges, is opt-in only in your settings, never on by default.",
  },
  {
    q: "Is CareerFound free?",
    a: "The assessment, a personalized roadmap, and a real set of lessons and projects per path are free with no time limit. 1:1 mentorship and the career consultation are paid services with the pricing above; a broader paid Pro tier (planned at $10/month) is still being built and isn't billable yet.",
  },
  {
    q: "How can I contact CareerFound?",
    a: "Email hello@mycareerfound.com, or use the Contact page. For mentorship or a consultation specifically, requesting it from the Pricing page reaches the team directly.",
  },
];
