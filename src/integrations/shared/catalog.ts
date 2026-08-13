/** Plausible winning-product catalog used to generate demo discovery results. */
export const DEMO_CATEGORIES = [
  "Home & Kitchen",
  "Pet Supplies",
  "Beauty & Personal Care",
  "Fitness & Recovery",
  "Outdoor & Camping",
  "Tech Accessories",
  "Baby & Kids",
  "Automotive Accessories",
] as const;

export const DEMO_PRODUCTS: Record<(typeof DEMO_CATEGORIES)[number], string[]> = {
  "Home & Kitchen": [
    "Self-Stirring Mug",
    "Cordless Mini Rechargeable Vacuum",
    "LED Sunset Projection Lamp",
    "Collapsible Silicone Food Storage Set",
    "Magnetic Knife Strip",
    "Portable Mini Rice Cooker",
  ],
  "Pet Supplies": [
    "Interactive Cat Wand Toy",
    "Automatic Pet Water Fountain",
    "Anti-Anxiety Pet Calming Bed",
    "Dog Nail Grinder",
    "Slow Feeder Dog Bowl",
    "Retractable Pet Leash with LED",
  ],
  "Beauty & Personal Care": [
    "LED Facial Massage Roller",
    "Scalp Massager Shampoo Brush",
    "Ice Roller for Face",
    "Portable Blackhead Remover Vacuum",
    "Hair Straightening Brush",
    "Jade Gua Sha Set",
  ],
  "Fitness & Recovery": [
    "Mini Massage Gun",
    "Resistance Band Set",
    "Posture Corrector Brace",
    "Foldable Ab Roller Wheel",
    "Compression Leg Massager",
    "Grip Strengthener Trainer",
  ],
  "Outdoor & Camping": [
    "Inflatable Camping Pillow",
    "Solar Powered Camping Lantern",
    "Portable Folding Camp Stove",
    "Collapsible Water Container",
    "Multi-Tool Survival Bracelet",
    "Compact Pop-Up Tent",
  ],
  "Tech Accessories": [
    "Magnetic Wireless Car Charger Mount",
    "Portable Mini Projector",
    "Bluetooth Tracker Tile",
    "Foldable Laptop Stand",
    "RGB Gaming Mouse Pad",
    "Wireless Earbuds Charging Case",
  ],
  "Baby & Kids": [
    "Silicone Baby Feeding Set",
    "Portable Baby Night Light",
    "Montessori Sensory Toy Set",
    "Baby Car Seat Mirror",
    "Toddler Anti-Slip Cup",
    "Kids Magnetic Building Blocks",
  ],
  "Automotive Accessories": [
    "LED Interior Car Light Kit",
    "Car Seat Gap Organizer",
    "Portable Tire Inflator",
    "Windshield Sun Shade",
    "Car Vacuum Cleaner Cordless",
    "Steering Wheel Cover",
  ],
};

export const DEMO_COUNTRIES = ["US", "AR", "MX", "ES", "BR", "CO", "CL"] as const;

export function flattenCatalog(): { title: string; category: string }[] {
  return Object.entries(DEMO_PRODUCTS).flatMap(([category, titles]) =>
    titles.map((title) => ({ title, category }))
  );
}
