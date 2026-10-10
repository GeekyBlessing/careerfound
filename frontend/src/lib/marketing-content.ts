import { CAREER_CATEGORIES, CAREER_PATH_COUNT } from "@/lib/career-categories";

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
    body: "A staged roadmap for the one career you choose, with its tools, entry roles and three graded projects. Cybersecurity and Software Engineering also include lessons, exercises and quizzes.",
    icon: Map,
  },
  {
    title: "3. Build real projects",
    body: "Learn by building projects at three levels of difficulty and ask the AI Mentor for feedback on what you wrote. In the Cybersecurity Project Lab, each project ends in a public GitHub repository and a README.",
    icon: FolderGit2,
  },
  {
    title: "4. Get job-ready",
    body: "Track a Career Readiness Score built from your own activity, practise with simulations, and build a portfolio of finished projects to show employers. The score tracks your progress and does not predict hiring.",
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
    features: ["Career discovery assessment", "A staged roadmap and three projects for every career", "Full lessons and quizzes for Cybersecurity and Software Engineering", "Community access"],
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
    a: `${CAREER_PATH_COUNT} tech career paths today, grouped into ${CAREER_CATEGORIES.length} categories for browsing: software engineering; cloud, infrastructure and DevOps; cybersecurity; data and artificial intelligence; design and product; and IT, automation and technical communication. Each career has its own page with entry roles, tools, a staged roadmap, three projects and interview preparation, and related careers link across categories. Some careers overlap on purpose, such as Cloud Engineering and DevOps, so each page says where it differs. Cybersecurity and Software Engineering have full lessons, exercises and quizzes today. The others have the roadmap and projects, and more depth is being added. Browse the full directory on the Career Paths page.`,
  },
  {
    q: "How do the projects work?",
    a: "Every career has three projects at Beginner, Intermediate and Expert difficulty, each with clear steps, hints, common mistakes to avoid, and what you'll actually produce. Cybersecurity also has the Project Lab: twelve projects across four levels that end in a public GitHub repository, a README and a portfolio entry. CareerFound checks that your evidence exists. It does not run or grade your code, and outside the Project Lab a project is marked complete on your word.",
  },
  {
    q: "Is CareerFound suitable for complete beginners?",
    a: "Yes, that's specifically who it's built for. Every path starts with a beginner-friendly explanation before any jargon, and the roadmap outline for each career tells you exactly what to focus on first.",
  },
  {
    q: "What does the AI Mentor do?",
    a: "It answers your questions in plain language, gives hints before answers instead of solving things for you, gives feedback on a project write-up when you ask for it, and helps you figure out what to learn next when you're stuck. It is software, so check anything important against a second source.",
  },
  {
    q: "Is the AI Mentor a real person?",
    a: "No. It's an AI powered learning assistant, not a human professional, and CareerFound doesn't present it as one. If you want a real person, that's what 1:1 mentorship and the Career Consultation are for.",
  },
  {
    q: "How does human mentorship work?",
    a: "There are two ways to get a real person. The Mentorship Marketplace lists named mentors you can read about before you send a request, each with their own areas and program. And you can request 1:1 Career Mentorship or a Career Consultation directly with Toriola, CareerFound's founder. Either way you send a request first. Nothing is charged on the site yet: the team replies by email to confirm and arrange payment.",
  },
  {
    q: "How much does the 1:1 mentorship cost?",
    a: "₦250,000 or $200 for a 2-month program. It's a paid service: personalized direction, one-on-one mentorship, a career roadmap, project guidance, portfolio review, CV and LinkedIn guidance, interview preparation, and accountability tracking throughout. You request a place first and are not charged until you and the team have arranged payment by email.",
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
    a: "You'll get a welcome email when you sign up, plus account emails like verification and password resets when needed, and a confirmation when you send a mentorship or consultation request. Anything beyond that, like tips or nudges, is opt-in only in your settings, never on by default.",
  },
  {
    q: "Is CareerFound free?",
    a: "The assessment, a roadmap and three projects for every career, and the full lessons for Cybersecurity and Software Engineering are free with no time limit. 1:1 mentorship and the career consultation are paid services with the pricing above; a broader paid Pro tier (planned at $10/month) is still being built and isn't billable yet.",
  },
  {
    q: "How can I contact CareerFound?",
    a: "Email hello@mycareerfound.com, or use the Contact page. For mentorship or a consultation specifically, requesting it from the Pricing page reaches the team directly.",
  },
];
