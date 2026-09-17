/**
 * The CareerFound mark: two diamonds ascending a shared diagonal, joined by
 * a short connecting stroke.
 *
 * Why this shape and not a stock icon: CareerFound's whole product is a
 * sequence of waypoints (discover -> choose -> roadmap -> build -> job
 * ready), and the diamond is already the "you are here" node used by
 * <PathTrack>/<JourneySteps> throughout the app (see path-node in
 * globals.css). The logo is two of those same waypoint diamonds - a larger
 * one anchoring the foundation, a smaller one a step further up and to the
 * right - so the brand mark IS the product's own visual language distilled
 * to its smallest form, not a separate illustration bolted onto the top of
 * it. Reading up-and-right also happens to be the universal "progress"
 * direction, which is the whole point without needing an arrow, a compass,
 * or a graduation cap to say so literally.
 *
 * Geometry lives here (not duplicated inside each consumer) so the nav
 * logo, the favicon route, the apple touch icon, and the marketing lockup
 * are provably the same shape at every size.
 */

// 32x32 viewBox. Diamond points are [top, right, bottom, left] for a
// rhombus centered at (cx, cy) with vertex distance r.
function diamondPoints(cx: number, cy: number, r: number): string {
  return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
}

export const BRAND_MARK_VIEWBOX = "0 0 32 32";

// The foundation waypoint: larger, anchored lower-left.
export const MARK_DIAMOND_FOUNDATION = diamondPoints(13, 20, 8.5);

// The progress waypoint: smaller, a step further along the path.
export const MARK_DIAMOND_PROGRESS = diamondPoints(21, 10.5, 5.5);

// The short link between the two waypoints, implying the rest of the path
// continues beyond the frame in both directions.
export const MARK_CONNECTOR = { x1: 21.4, y1: 19.3, x2: 20.7, y2: 16.6 };
