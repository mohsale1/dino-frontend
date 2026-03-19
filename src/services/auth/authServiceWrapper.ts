
/**
 * Auth Service Wrapper
 * Direct export of real auth service (mock mode removed)
 */

import { authService as realAuthService } from './auth';

// Direct export - no more wrapper needed
export const authService = realAuthService;
export default authService;