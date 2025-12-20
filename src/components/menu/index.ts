// Export all menu components
export { default as MenuCategories } from './MenuCategories';
export { default as MenuItemsGrid } from './MenuItemsGrid';
export { default as MenuFilters } from './MenuFilters';
export { default as FoodAnimationBackground } from './FoodAnimationBackground';
export { default as FloatingCartCard } from './FloatingCartCard';

// Export modular components
export * from './home';
export * from './list';
export * from './orders';
export * from './shared';

// Note: 
// - MenuCategories now includes all search and filter functionality
// - MenuFilters is now simplified to just quick actions (add category)
// - For new implementations, use MenuCategories with integrated filters