/**
 * ID generation utilities
 */

// Helper: Generate a unique ID
export const newId = (prefix = 'id') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
