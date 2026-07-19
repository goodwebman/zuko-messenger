import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@zuko/contracts';
import { env } from '../config/env';

export type ZukoSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ZukoSocket | null = null;

/** Ленивое создание сокета. Аутентификация — через httpOnly cookie (withCredentials). */
export function getSocket(): ZukoSocket {
  socket ??= io(env.SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
