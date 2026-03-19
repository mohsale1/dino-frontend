import { useAuth } from '../contexts/common/Auth';
import { useUserData } from '../contexts/application/UserData';
import { validateVenueAccess, requiresVenueAssignment, debugVenueAssignment } from '../utils/data/venueUtils';

interface VenueCheckResult {
  hasVenueAssigned: boolean;
  venueId: string | null;
  requiresVenueAssignment: boolean;
  canBypassVenueCheck: boolean;
}

export const useVenueCheck = (): VenueCheckResult => {
  const { isOwner, user } = useAuth();
  const { userData } = useUserData();
  
  // Use centralized venue validation
  const validation = validateVenueAccess(userData, user);
  
  // Debug venue assignment
  debugVenueAssignment(userData, user, 'useVenueCheck');
  
  const hasVenueAssigned = validation.hasVenue;
  const venueId = validation.venueId;
  const canBypassVenueCheck = isOwner();
  const requiresAssignment = requiresVenueAssignment(userData, user);
  
  return {
    hasVenueAssigned,
    venueId,
    requiresVenueAssignment: requiresAssignment,
    canBypassVenueCheck,
  };
};

export default useVenueCheck;