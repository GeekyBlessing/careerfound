import { cn } from "@/lib/utils";
import { ScaledScreen } from "./scaled-screen";

/**
 * Device shells for CareerFound's product storytelling. Each one only owns the
 * hardware (bezel, base, notch); the screen is real UI rendered at a design
 * size and scaled (see ScaledScreen). Plain generic devices, no brand
 * silhouettes. `label` describes what the screen shows for assistive tech.
 */

interface ScreenProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

export function Laptop({ label, className, children }: ScreenProps) {
  return (
    <figure role="img" aria-label={label} className={cn("relative mx-auto w-full", className)}>
      <div className="rounded-t-[1.1rem] border border-b-0 border-[#2a2d27] bg-[#14160f] p-[2.2%] pb-0 shadow-raised">
        <div className="relative overflow-hidden rounded-t-[0.5rem] bg-base-950">
          <span aria-hidden="true" className="absolute left-1/2 top-[1.5%] z-10 h-[1.6%] w-[1.6%] -translate-x-1/2 rounded-full bg-[#14160f]" />
          <ScaledScreen designWidth={1040} designHeight={600}>{children}</ScaledScreen>
        </div>
      </div>
      <div className="relative mx-[-4%] h-[2.2%] min-h-[10px] rounded-b-[1.2rem] border border-t-0 border-[#2a2d27] bg-gradient-to-b from-[#34372f] to-[#1d1f19] shadow-raised">
        <span aria-hidden="true" className="absolute left-1/2 top-0 h-[55%] w-[16%] -translate-x-1/2 rounded-b-md bg-[#0f110c]" />
      </div>
    </figure>
  );
}

export function Monitor({ label, className, children }: ScreenProps) {
  return (
    <figure role="img" aria-label={label} className={cn("relative mx-auto w-full", className)}>
      <div className="rounded-[0.9rem] border border-[#2a2d27] bg-[#14160f] p-[1.6%] shadow-raised">
        <div className="overflow-hidden rounded-[0.4rem] bg-base-950">
          <ScaledScreen designWidth={1280} designHeight={720}>{children}</ScaledScreen>
        </div>
      </div>
      <div aria-hidden="true" className="mx-auto h-[7%] min-h-[18px] w-[11%] bg-gradient-to-b from-[#2b2e26] to-[#1a1c16]" style={{ clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)" }} />
      <div aria-hidden="true" className="mx-auto h-[1.4%] min-h-[6px] w-[26%] rounded-full bg-[#1a1c16] shadow-card" />
    </figure>
  );
}

export function Tablet({ label, className, landscape = true, children }: ScreenProps & { landscape?: boolean }) {
  return (
    <figure role="img" aria-label={label} className={cn("relative mx-auto w-full", className)}>
      <div className={cn("border border-[#2a2d27] bg-[#14160f] shadow-raised", landscape ? "rounded-[1.4rem] p-[2.6%]" : "rounded-[1.6rem] p-[4%]")}>
        <div className="overflow-hidden rounded-[0.7rem] bg-base-950">
          {landscape ? <ScaledScreen designWidth={860} designHeight={600}>{children}</ScaledScreen> : <ScaledScreen designWidth={600} designHeight={860}>{children}</ScaledScreen>}
        </div>
      </div>
    </figure>
  );
}

export function Phone({ label, className, children }: ScreenProps) {
  return (
    <figure role="img" aria-label={label} className={cn("relative mx-auto w-full", className)}>
      <div className="rounded-[2.1rem] border border-[#2a2d27] bg-[#14160f] p-[3.2%] shadow-raised">
        <div className="relative overflow-hidden rounded-[1.7rem] bg-base-950">
          <span aria-hidden="true" className="absolute left-1/2 top-[1.6%] z-10 h-[2.6%] w-[28%] -translate-x-1/2 rounded-full bg-[#14160f]" />
          <ScaledScreen designWidth={390} designHeight={800}>{children}</ScaledScreen>
        </div>
      </div>
    </figure>
  );
}
