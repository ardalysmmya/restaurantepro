const TIERS = {
  bronze: { min: 0, name: 'Bronce', color: 'text-amber-400' },
  silver: { min: 500, name: 'Plata', color: 'text-slate-300' },
  gold: { min: 2000, name: 'Oro', color: 'text-yellow-400' },
  platinum: { min: 5000, name: 'Platino', color: 'text-purple-400' },
  diamond: { min: 15000, name: 'Diamante', color: 'text-cyan-400' },
};

export function calculateTier(points) {
  const tiers = Object.entries(TIERS).reverse();
  for (const [key, { min }] of tiers) {
    if (points >= min) return { key, ...TIERS[key] };
  }
  return { key: 'bronze', ...TIERS.bronze };
}

export function calculatePointsFromOrder(total) {
  return Math.floor(total);
}

export function getDiscountForTier(tier) {
  const discounts = { bronze: 0, silver: 5, gold: 10, platinum: 15, diamond: 20 };
  return discounts[tier] || 0;
}

export function pointsToNextTier(points) {
  const tiers = Object.entries(TIERS);
  for (const [key, { min }] of tiers) {
    if (points < min) return { nextTier: key, needed: min - points, ...TIERS[key] };
  }
  return null;
}
