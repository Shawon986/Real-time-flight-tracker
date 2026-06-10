import { useState, useEffect, useRef, useCallback } from 'react';
import { searchFlight, getFlightTrack, getMockFlight } from '../services/opensky';
import { POLL_INTERVAL_MS, CACHE_KEY_LAST_FLIGHT } from '../utils/constants';

/**
 * Core hook: manages flight search, polling, and track state.
 *
 * @param {string} callsign - The flight number to track
 * @returns {{ flight, track, loading, error, lastUpdated, isMock, retry }}
 */
export function useFlightTracking(callsign) {
  const [flight, setFlight] = useState(null);
  const [track, setTrack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const intervalRef = useRef(null);
  const callsignRef = useRef(callsign);
  callsignRef.current = callsign;

  const fetchFlight = useCallback(async (searchCallsign) => {
    if (!searchCallsign || searchCallsign.trim().length < 3) return;

    setLoading(true);
    setError(null);

    try {
      // Try real API first
      let result = await searchFlight(searchCallsign);

      // Fall back to mock data if API fails or returns nothing
      if (!result.found) {
        const mockResult = getMockFlight(searchCallsign);
        if (mockResult.found) {
          setFlight(mockResult.flight);
          setIsMock(true);
          setLastUpdated(new Date());
          setLoading(false);

          // Cache last successful search
          try {
            localStorage.setItem(CACHE_KEY_LAST_FLIGHT, JSON.stringify({
              callsign: searchCallsign,
              flight: mockResult.flight,
              timestamp: Date.now(),
            }));
          } catch (e) { /* ignore */ }
        } else {
          setError(mockResult.error || result.error || 'Flight not found');
          setFlight(null);
          setIsMock(false);
        }
        setLoading(false);
        return;
      }

      setFlight(result.flight);
      setIsMock(false);
      setLastUpdated(new Date());

      // Fetch flight track if we have ICAO24
      if (result.flight?.icao24) {
        try {
          const trackData = await getFlightTrack(result.flight.icao24);
          setTrack(trackData);
        } catch (e) {
          setTrack([]);
        }
      }

      // Cache last successful search
      try {
        localStorage.setItem(CACHE_KEY_LAST_FLIGHT, JSON.stringify({
          callsign: searchCallsign,
          flight: result.flight,
          timestamp: Date.now(),
        }));
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Flight tracking error:', err);
      setError(err.message || 'Failed to fetch flight data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch when callsign changes
  useEffect(() => {
    if (!callsign || callsign.trim().length < 3) {
      setFlight(null);
      setError(null);
      setTrack([]);
      setIsMock(false);
      return;
    }

    fetchFlight(callsign);

    // Set up polling
    intervalRef.current = setInterval(() => {
      fetchFlight(callsignRef.current);
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callsign, fetchFlight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const retry = useCallback(() => {
    if (callsignRef.current) {
      fetchFlight(callsignRef.current);
    }
  }, [fetchFlight]);

  return { flight, track, loading, error, lastUpdated, isMock, retry };
}
