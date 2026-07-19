import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@zuko/contracts';

export type ZukoServer = Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

let io: ZukoServer | null = null;

export const setIO = (server: ZukoServer): void => {
  io = server;
};

export const getIO = (): ZukoServer => {
  if (!io) throw new Error('Socket.io ещё не инициализирован');
  return io;
};

export const userRoom = (userId: string): string => `user:${userId}`;

/** Эмит события в личную комнату пользователя (все его вкладки/устройства). */
export function emitToUser<E extends keyof ServerToClientEvents>(
  userId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
): void {
  if (!io) return;
  io.to(userRoom(userId)).emit(event, ...args);
}
