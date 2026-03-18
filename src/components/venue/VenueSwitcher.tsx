import React, { useState } from 'react';
import { useVenue } from '../../contexts/venueContext';

interface VenueSwitcherProps {
  className?: string;
}

export const VenueSwitcher: React.FC<VenueSwitcherProps> = ({ className = '' }) => {
  const { currentVenue, availableVenues, loading, switchVenue } = useVenue();
  const [switching, setSwitching] = useState(false);

  const handleVenueSwitch = async (venueId: string) => {
    if (venueId === currentVenue?.id || switching) return;

    try {
      setSwitching(true);
      await switchVenue(venueId);
    } catch (error) {
      console.error('Failed to switch venue:', error);
      alert('Failed to switch venue. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  // Don't show switcher if user has only one venue
  if (availableVenues.length <= 1) {
    return null;
  }

  return (
    <div className={`venue-switcher ${className}`}>
      <label htmlFor="venue-select" className="venue-switcher-label">
        Current Venue:
      </label>
      <select
        id="venue-select"
        value={currentVenue?.id || ''}
        onChange={(e) => handleVenueSwitch(e.target.value)}
        disabled={loading || switching}
        className="venue-switcher-select"
      >
        {availableVenues.map((venue) => (
          <option key={venue.id} value={venue.id}>
            {venue.name}
          </option>
        ))}
      </select>
      {switching && <span className="venue-switcher-loading">Switching...</span>}
    </div>
  );
};

export default VenueSwitcher;