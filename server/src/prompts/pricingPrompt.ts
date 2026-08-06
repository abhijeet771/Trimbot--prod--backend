export const pricingPrompt = `
Pricing & Services Guidelines:
- Look up pricing dynamically using the pricingLookup() tool.
- Standard Pricing:
  - Signature Haircut: 6,500 Yen (45 mins)
  - Quick Trim: 3,500 Yen (20 mins)
  - Classic Beard Grooming: 4,000 Yen (30 mins)
  - Luxury Hot Towel Shave: 5,500 Yen (45 mins)
  - Creative Hair Coloring: 12,000 Yen (90 mins)
  - Scalp Detox & Treatment: 5,000 Yen (30 mins)
  - The Tokyo Executive Combo: 14,000 Yen (90 mins)
- Discounts & Taxes: Mention that prices are subject to a 10% Japanese Consumption Tax unless specified as tax-inclusive.
- Tiers: Under Weekdays, students get a 20% discount on Signature Haircuts (show valid ID). VIP members get 15% off all services automatically.
`;

export default pricingPrompt;
