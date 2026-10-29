// Names, notes and prices are placeholders until the real ones arrive. Prices are in Taka for 100 ml.
export type Product = {
  id: string;
  name: string;
  family: string;
  price: number;
  sub: string;
  notes: [top: string, heart: string, base: string];
};

export const PRODUCTS: Product[] = [
  { id: "couronne", name: "Couronne", family: "Floral · Rose", price: 12500,
    sub: "A faceted crystal bottle crowned in carved rose gold. Rich Bulgarian rose with a soft amber trail.",
    notes: ["Pink pepper, bergamot", "Damask rose, peony", "Amber, white musk"] },
  { id: "reine", name: "Reine", family: "Floral · Powdery", price: 11800,
    sub: "Fluted glass under a royal crown cap. Powdery iris and violet for quiet evenings.",
    notes: ["Mandarin, pear", "Iris, violet", "Cashmere wood, vanilla"] },
  { id: "jardin", name: "Jardin Secret", family: "Green · Floral", price: 10900,
    sub: "An engraved garden bottle with a branch of rose-gold leaves. Fresh green stems and jasmine.",
    notes: ["Green leaves, lime", "Jasmine, lily of the valley", "Vetiver, moss"] },
  { id: "diamant", name: "Diamant", family: "Chypre · Fruity", price: 13200,
    sub: "Cut like a diamond, with a polished faceted cap. Bright blackcurrant over warm patchouli.",
    notes: ["Blackcurrant, lychee", "Rose, freesia", "Patchouli, oakmoss"] },
  { id: "coeur", name: "Cœur de Feuille", family: "Fruity · Floral", price: 9800,
    sub: "A heart of pink glass with three rose-gold leaves. Juicy peach and magnolia.",
    notes: ["Peach, red apple", "Magnolia, orange blossom", "Sandalwood, musk"] },
  { id: "lumiere", name: "Lumière Nue", family: "Musk · Skin", price: 9400,
    sub: "A clean octagonal bottle with a square cap. A soft, close-to-skin musk for every day.",
    notes: ["Aldehydes, pear", "Cotton flower, rose", "White musk, ambrette"] },
  { id: "tulipe", name: "Tulipe d'Or", family: "Floral · Gourmand", price: 11500,
    sub: "Swirled crystal topped with a golden tulip bud. Tulip and praline with a creamy finish.",
    notes: ["Raspberry, saffron", "Tulip, tuberose", "Praline, tonka bean"] },
  { id: "fleche", name: "Flèche Rose", family: "Oriental · Spicy", price: 12900,
    sub: "A tall pyramid bottle under a spire cap. Rose and saffron warmed by oud.",
    notes: ["Saffron, cardamom", "Turkish rose", "Oud, benzoin"] },
  { id: "charme", name: "Charme", family: "Floral · Woody", price: 10500,
    sub: "Lattice-cut glass with a hanging leaf charm. Gardenia over soft cedar.",
    notes: ["Bergamot, neroli", "Gardenia, jasmine", "Cedar, cashmeran"] },
  { id: "calla", name: "Calla", family: "Aquatic · Floral", price: 10200,
    sub: "A drop-shaped bottle with a calla-lily cap. Airy water lily and sea salt.",
    notes: ["Sea salt, citrus", "Water lily, calla", "Driftwood, musk"] },
];

export const SIZES = [50, 100] as const;
export type Size = (typeof SIZES)[number];

// 50 ml is priced at 62% of the 100 ml bottle, rounded to the nearest 100.
export const priceFor = (p: Product, ml: Size) => (ml === 50 ? Math.round((p.price * 0.62) / 100) * 100 : p.price);

export const taka = (n: number) => "৳" + n.toLocaleString("en-IN");

export const photo = (p: Product) => `/products/${p.id}.webp`;
