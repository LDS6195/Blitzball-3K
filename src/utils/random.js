/**
 * Random utility functions
 */

// Helper: Get a random integer
export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: Get a random item from an array
export const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper: Get a weighted random item from an array
export const weightedRand = (items, weights) => {
  if (items.length === 0 || items.length !== weights.length) {
    return randItem(items); // Fallback to random item if weights are bad or items are empty
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) {
      return items[i];
    }
    random -= weights[i];
  }

  return randItem(items); // Fallback
};
