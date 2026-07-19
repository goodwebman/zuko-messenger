import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  /** Контейнер для рендера; по умолчанию — document.body */
  container?: HTMLElement | null;
}

const emptySubscribe = () => () => {};

/**
 * `false` на сервере и в первом (гидратационном) рендере клиента, `true` —
 * сразу после гидратации. Через `useSyncExternalStore` с отдельным
 * `getServerSnapshot`: React использует серверный снапшот для гидратации, а
 * потом переключается на клиентский — без hydration mismatch.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Рендерит children в портал вне основного DOM-дерева (по умолчанию в body).
 *
 * SSR-безопасно: порталы на сервере не рендерятся, поэтому первый клиентский
 * (гидратационный) рендер тоже обязан быть пустым — иначе hydration mismatch.
 * `useHydrated` даёт `null` ровно на этот первый рендер и `createPortal` со
 * следующего.
 *
 * При этом любой Portal, смонтированный уже ПОСЛЕ гидратации (открытие
 * Popover/Tooltip/Select по клику), на первом же своём рендере получает
 * `hydrated === true` и контейнер синхронно — измерение размера сразу после
 * открытия (`contentRef.current`) не съезжает на кадр.
 *
 * @component
 */
export function Portal({ children, container }: PortalProps): ReactNode {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return createPortal(children, container ?? document.body);
}
