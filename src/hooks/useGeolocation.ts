import { useState, useCallback } from 'react';

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  locationName: string;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback((): Promise<GeolocationResult> => {
    return new Promise((resolve) => {
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        setTimeout(() => {
          resolve({
            latitude: 22.5032,
            longitude: 113.9357,
            locationName: '深圳湾口岸货运通关区',
          });
          setLoading(false);
        }, 1500);
        return;
      }

      const timeoutId = setTimeout(() => {
        resolve({
          latitude: 22.5032,
          longitude: 113.9357,
          locationName: '深圳湾口岸货运通关区',
        });
        setLoading(false);
      }, 3000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            locationName: '深圳湾口岸货运通关区',
          });
          setLoading(false);
        },
        () => {
          clearTimeout(timeoutId);
          resolve({
            latitude: 22.5032,
            longitude: 113.9357,
            locationName: '深圳湾口岸货运通关区',
          });
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }, []);

  return { getLocation, loading, error };
}
