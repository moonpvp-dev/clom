import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const PRODUCTS = [
  {
    slug: "leave-in-conditioner",
    name: "Leave-In Conditioner",
    short: "Lightweight daily moisture for curls, waves, coils, and perms.",
    bestFor: "Daily hydration without buildup",
    status: "In Development",
    accent: "#8B5CF6",
    benefits: [
      "Helps soften hair",
      "Supports manageability",
      "Designed for low buildup",
      "Helps improve slip and spreadability",
      "Lightweight enough for active routines",
    ],
    who: "Curls, waves, coils, and permed hair that need daily moisture without weight.",
    feel: "Watery-cream texture. Absorbs without stickiness.",
    howTo: "Apply to damp hair, mid-lengths to ends. Scrunch or rake through. Style as usual.",
    ingredients: ["Humectants (moisture)", "Lightweight emollients (slip)", "Conditioning polymers", "Preservatives (safety)", "Chelators (stability)"],
  },
  {
    slug: "curl-cream",
    name: "Curl Cream",
    short: "Definition and softness with flexible styling support.",
    bestFor: "Soft definition with movement",
    status: "Planned",
    accent: "#A78BFA",
    benefits: [
      "Supports curl definition",
      "Helps soften strands",
      "Designed for flexible, touchable finish",
      "Low-buildup formulation approach",
    ],
    who: "Anyone seeking definition without crunch or heaviness.",
    feel: "Smooth cream that melts in.",
    howTo: "Apply to wet or damp hair. Rake, scrunch, or finger-coil.",
    ingredients: ["Humectants", "Conditioning emollients", "Film-forming polymers", "Preservatives", "Chelators"],
  },
  {
    slug: "gel",
    name: "Gel",
    short: "Hold and performance — designed to form a cast that breaks cleanly.",
    bestFor: "Long-lasting definition and hold",
    status: "In Testing",
    accent: "#7C3AED",
    benefits: [
      "Designed for clean cast that breaks softly",
      "Supports definition through the day",
      "Low-buildup design",
      "Lightweight feel",
    ],
    who: "Anyone who wants serious hold without flake or stickiness.",
    feel: "Clear, slick gel. No tackiness once set.",
    howTo: "Apply over leave-in or cream. Smooth in sections. Scrunch out crunch when dry.",
    ingredients: ["Hold polymers", "Humectants", "Plasticizers (clean break)", "Preservatives", "Chelators"],
  },
  {
    slug: "mousse",
    name: "Mousse",
    short: "Volume and lightweight styling — air-feel finish.",
    bestFor: "Volume and bounce",
    status: "Planned",
    accent: "#C4B5FD",
    benefits: [
      "Supports volume at root and lengths",
      "Lightweight, airy feel",
      "Low-residue design",
    ],
    who: "Fine to medium textures wanting body without heaviness.",
    feel: "Whipped foam that disappears.",
    howTo: "Dispense a palmful onto damp hair. Scrunch upward from ends.",
    ingredients: ["Volumizing polymers", "Humectants", "Preservatives"],
  },
  {
    slug: "shampoo",
    name: "Shampoo",
    short: "Gentle cleansing — designed to be low-stripping.",
    bestFor: "Routine cleansing without dryness",
    status: "Planned",
    accent: "#8B5CF6",
    benefits: [
      "Designed for gentle, low-strip cleansing",
      "Helps support scalp comfort",
      "Pairs with the rest of the routine",
    ],
    who: "Textured, curly, permed, and active hair types.",
    feel: "Soft lather, clean rinse.",
    howTo: "Apply to wet scalp. Massage gently. Rinse thoroughly.",
    ingredients: ["Mild surfactants", "Conditioning agents", "Chelators", "Preservatives"],
  },
  {
    slug: "conditioner",
    name: "Conditioner",
    short: "Softness and detangling for everyday use.",
    bestFor: "Slip and softness in-shower",
    status: "Planned",
    accent: "#A78BFA",
    benefits: [
      "Helps detangle",
      "Supports softness",
      "Low-buildup approach",
    ],
    who: "All textured hair, including permed strands.",
    feel: "Silky, rinses clean.",
    howTo: "Apply to wet hair after shampoo. Distribute. Rinse.",
    ingredients: ["Conditioning emollients", "Cationic polymers", "Humectants", "Preservatives"],
  },
];

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);
