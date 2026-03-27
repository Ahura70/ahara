/**
 * Store Backward Compatibility Module
 *
 * This file is DEPRECATED. The store has been refactored into slices under src/store/
 * Re-exports are provided here for backward compatibility so existing imports continue to work.
 *
 * New code should import from './store/index' instead.
 */

export { AppProvider, useAppStore } from './store/index';
