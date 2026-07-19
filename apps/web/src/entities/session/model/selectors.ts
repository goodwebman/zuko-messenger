import type { SessionState } from './slice';

// Типизация по срезу, а не по RootState — entity не должен импортить app-слой (FSD: только вниз).
type SessionSlice = { session: SessionState };

export const selectCurrentUser = (state: SessionSlice) => state.session.user;
export const selectIsAuthed = (state: SessionSlice) => Boolean(state.session.user);
export const selectSessionInitialized = (state: SessionSlice) => state.session.initialized;
