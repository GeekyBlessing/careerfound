import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentorship Marketplace | CareerFound",
  description:
    "Browse real professionals for portfolio reviews, mock interviews, and career guidance, filtered by the tech career path you're pursuing.",
};

export default function MentorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
