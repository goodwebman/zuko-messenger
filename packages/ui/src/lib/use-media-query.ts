import { useCallback, useSyncExternalStore } from 'react';

/**
 * Хук для отслеживания CSS media query. Возвращает `true`, когда query совпадает.
 *
 * Через `useSyncExternalStore`: на сервере и в первом (гидратационном) рендере
 * отдаёт `false` (серверный снапшот), после гидратации — реальное совпадение.
 * Иначе `useState`-инициализатор с `window.matchMedia` вернул бы на первом
 * клиентском рендере значение, которого не было на сервере → hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => { mql.removeEventListener('change', onStoreChange); };
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
