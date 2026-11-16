import { realApi } from './api.js';
import { mockApi } from './mockApi.js';

/**
 * Switches cleanly between the standalone mock service and the real Node.js/Express backend
 * using VITE_USE_MOCK. Defaults to mock mode ("true") so the frontend works standalone.
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const api = USE_MOCK ? mockApi : realApi;
