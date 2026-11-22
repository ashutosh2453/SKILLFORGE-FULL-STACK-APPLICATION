import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Whether the backend allows password-less demo logins (`/api/health` → `demo_mode`).
 * Unknown (still loading or unreachable) counts as "off", so demo buttons never show
 * on a deployment that would reject them.
 */
export function useDemoMode(): boolean {
  const { data } = useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
  return Boolean(data?.demo_mode);
}
