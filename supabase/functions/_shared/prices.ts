export const PRICE_IDS = {
  starter: "price_1SWJgDH1V6OhfCAPSCR5VbT2",   // $24
  advanced: "price_1SWNNuH1V6OhfCAPDChwyuAX", // $59
  complete: "price_1SWO9QH1V6OhfCAPjqYLT7Ko", // $129
  extraRender: "price_1SWNl3H1V6OhfCAPas1HJF05" // $5 metered
};

export const PRICE_TO_TIER: Record<string, string> = {
  "price_1SWJgDH1V6OhfCAPSCR5VbT2": "starter",
  "price_1SWNNuH1V6OhfCAPDChwyuAX": "advanced",
  "price_1SWO9QH1V6OhfCAPjqYLT7Ko": "complete"
};

export const RENDER_LIMITS: Record<string, number> = {
  starter: 10,
  advanced: 50,
  complete: 200
};
