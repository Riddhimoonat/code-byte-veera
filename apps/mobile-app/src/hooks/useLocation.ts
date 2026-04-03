import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * WHY: This hook manages FOREGROUND location only.
 * Background location lives in src/tasks/backgroundTasks.ts.
 * Separating foreground (for UI display) from background (for silent risk polling)
 * is critical — they use different APIs and have different permission scopes.
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    isLoading: true,
    error: null,
  });

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) {
            setState((s) => ({
              ...s,
              isLoading: false,
              error: 'Location permission denied.',
            }));
          }
          return;
        }

        // Get an immediate fix for the UI
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!mounted) return;

        const address = await reverseGeocode(
          initial.coords.latitude,
          initial.coords.longitude
        );

        if (mounted) {
          setState({
            latitude: initial.coords.latitude,
            longitude: initial.coords.longitude,
            address,
            isLoading: false,
            error: null,
          });
        }

        // Then subscribe to updates every 2 minutes for UI refresh
        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 120_000,
            distanceInterval: 100,
          },
          async (loc) => {
            if (!mounted) return;
            const addr = await reverseGeocode(
              loc.coords.latitude,
              loc.coords.longitude
            );
            if (mounted) {
              setState((s) => ({
                ...s,
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                address: addr,
              }));
            }
          }
        );
      } catch (e: any) {
        if (mounted) {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: e.message ?? 'Failed to get location.',
          }));
        }
      }
    })();

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  return state;
}

async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    const r = results[0];
    if (!r) return null;
    const parts = [r.name, r.street, r.district, r.city].filter(Boolean);
    return parts.join(', ');
  } catch {
    return null;
  }
}
