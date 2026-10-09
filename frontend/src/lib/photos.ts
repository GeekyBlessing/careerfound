/**
 * The people photography the homepage compositions are built around.
 *
 * Every slot is a real photograph the team supplies (no stock "pointing at a
 * laptop" images, no generated faces). A slot is `available: false` until its
 * file exists in `public/photos/`, and while it is unavailable the section
 * renders a clean device-only composition, so nothing ever shows a broken
 * image or an empty hole. To switch a slot on: add the file, set
 * `available: true`. `public/photos/README.md` describes the shot each slot
 * wants.
 */
export interface PhotoSlot {
  src: string;
  alt: string;
  available: boolean;
  /** CSS object-position, so the person (not the empty space) stays in frame. */
  focal?: string;
  /** Width / height of the frame the photo is cropped to on desktop. */
  ratio: string;
}

export const PHOTOS = {
  hero: {
    src: "/photos/hero-learner.jpg",
    alt: "A learner working through a CareerFound roadmap at a desk",
    available: false,
    focal: "60% 40%",
    ratio: "4 / 3",
  },
  discover: {
    src: "/photos/discover-tablet.jpg",
    alt: "A person answering the CareerFound career assessment on a tablet",
    available: false,
    focal: "50% 35%",
    ratio: "4 / 3",
  },
  projectLab: {
    src: "/photos/project-lab-laptop.jpg",
    alt: "A person building a security project on a laptop",
    available: false,
    focal: "55% 40%",
    ratio: "16 / 10",
  },
  portfolio: {
    src: "/photos/portfolio-review.jpg",
    alt: "A person reviewing their published portfolio on a laptop",
    available: false,
    focal: "50% 40%",
    ratio: "4 / 3",
  },
  toriola: {
    src: "/mentors/toriola.jpg",
    alt: "Toriola Opeyemi, CareerFound founder and mentor",
    available: true,
    focal: "50% 24%",
    ratio: "4 / 5",
  },
  dotun: {
    src: "/mentors/mobile-engineering-mentor.jpg",
    alt: "David Oladotun Egundeyi, a real CareerFound full-stack engineering mentor",
    available: true,
    focal: "50% 20%",
    ratio: "4 / 5",
  },
} satisfies Record<string, PhotoSlot>;

export type PhotoKey = keyof typeof PHOTOS;
