import type { RootState } from '@/app/store';

export const selectCurrentUser = (state: RootState) => state.session.user;
export const selectIsAuthed = (state: RootState) => Boolean(state.session.user);
export const selectSessionInitialized = (state: RootState) => state.session.initialized;
