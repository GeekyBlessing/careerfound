import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";

/**
 * Layout for pages that are meant to be browsable by anyone, logged in or
 * not (career details, the mentor marketplace, onboarding, and the new
 * standalone marketing routes). Unlike AppShell, this never redirects to
 * /login — that's the whole point: these are top-of-funnel pages, and
 * bouncing anonymous visitors off them was a real bug, not a design choice.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main className="container-page py-8">{children}</main>
      <Footer />
    </>
  );
}
