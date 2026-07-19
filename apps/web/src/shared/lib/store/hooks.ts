import { useDispatch, useSelector, useStore, type TypedUseSelectorHook } from 'react-redux';
// Единственное допущение в FSD: типы стора живут в app-слое (он собирает
// редьюсеры из entities). Импорт — ТОЛЬКО типовой, без runtime-связи.
import type { AppDispatch, AppStore, RootState } from '@/app/store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;
