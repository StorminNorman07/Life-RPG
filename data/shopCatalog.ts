export interface ShopCosmetic {
  id: string;
  coinCost: number;
}

// Curated character cosmetics available for early unlock with earned coins.
// Keep item IDs and prices in sync with the shop_cosmetic_catalog migration.
export const shopCosmetics: ShopCosmetic[] = [
  { id: "silver-outfit-2", coinCost: 75 },
  { id: "gold-aura-2", coinCost: 125 },
  { id: "platinum-heldItem-2", coinCost: 225 },
  { id: "diamond-sceneEffect-2", coinCost: 300 },
  { id: "master-accessory-2", coinCost: 400 },
  { id: "legendary-sceneEffect-2", coinCost: 550 },
];

export const coinPacks = [
  { id: "coins_50", coins: 50, price: "$0.99", priceEnv: "STRIPE_PRICE_COINS_50" },
  { id: "coins_800", coins: 800, price: "$9.99", priceEnv: "STRIPE_PRICE_COINS_800" },
  { id: "coins_2000", coins: 2000, price: "$19.99", priceEnv: "STRIPE_PRICE_COINS_2000" },
] as const;
