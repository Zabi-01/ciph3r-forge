import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export function usePageVisitLogger() {
  const location = useLocation();

  useEffect(() => {
    const logPageVisit = async () => {
      try {
        // Only log if user is authenticated
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (!isAuthenticated) return;

        await base44.functions.invoke('logUserActivity', {
          page_path: location.pathname,
          module: 'Navigation',
          operation: 'page_visit',
          details: `User visited ${location.pathname}`
        });
      } catch (error) {
        console.error('Failed to log page visit:', error);
      }
    };

    logPageVisit();
  }, [location.pathname]);

  return null;
}