import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTour } from '../../contexts/TourContext';
import TourOverlay from './TourOverlay';
import universalTourSteps from './tourSteps/universalTourSteps';

interface DashboardTourProps {
  className?: string;
}

const DashboardTour: React.FC<DashboardTourProps> = ({ className }) => {  const { user, isAdmin, isOperator, isSuperAdmin } = useAuth();
  const { shouldShowTour, startTour, tourStatus, loading, isActive } = useTour();
  // Use universal tour steps for all roles
  const getTourSteps = () => {
    return universalTourSteps;
  };

  // Auto-start tour for first-time users
  useEffect(() => {
    if (!loading && shouldShowTour && user && tourStatus && !tourStatus.tour_completed && !tourStatus.tour_skipped && !isActive) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        const steps = getTourSteps();        
        // Check if first target element exists (skip for center placement)
        if (steps[0]?.target !== 'center') {
          const firstTarget = document.querySelector(steps[0]?.target);        }
        
        // Check all available data-tour elements
        const allTourElements = document.querySelectorAll('[data-tour]');        startTour(steps);
      }, 1000); // Reduced delay to 1 second

      return () => clearTimeout(timer);
    } else {    }
  }, [loading, shouldShowTour, user, tourStatus, isActive, startTour]);

  // Don't render anything if tour shouldn't be shown
  if (loading || !shouldShowTour || !user) {    return null;
  }  return (
    <div className={className}>
      <TourOverlay />
    </div>
  );
};

export default DashboardTour;