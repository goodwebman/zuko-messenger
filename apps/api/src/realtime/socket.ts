import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@zuko/contracts';
import { verifyAccessToken } from '../lib/jwt';
import { ACCESS_COOKIE } from '../lib/cookies';
import { markConversationRead } from '../modules/messages/messages.service';
import { conversationRoom, deliverMessage } from './deliver';
import { setIO, userRoom, type ZukoServer } from './registry';

/** Достаёт нужную cookie из raw-заголовка handshake. */
function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function initSocket(httpServer: HttpServer, corsOrigin: string): ZukoServer {
  const io: ZukoServer = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    object,
    SocketData
  >(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
  });
  setIO(io);

  // Аутентификация: cookie zuko_at или handshake.auth.token.
  io.use((socket, next) => {
    const fromCookie = readCookie(socket.handshake.headers.cookie, ACCESS_COOKIE);
    const fromAuth = (socket.handshake.auth as { token?: string })?.token;
    const token = fromCookie ?? fromAuth;
    if (!token) return next(new Error('unauthorized'));
    try {
      socket.data.userId = verifyAccessToken(token).sub;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    await socket.join(userRoom(userId));

    // Presence: если это первый сокет юзера — он «онлайн».
    const sockets = await io.in(userRoom(userId)).fetchSockets();
    if (sockets.length === 1) socket.broadcast.emit('presence:update', { userId, online: true });

    socket.on('conversation:join', (conversationId) => {
      void socket.join(conversationRoom(conversationId));
    });
    socket.on('conversation:leave', (conversationId) => {
      void socket.leave(conversationRoom(conversationId));
    });

    socket.on('message:send', async ({ conversationId, body }, ack) => {
      try {
        const message = await deliverMessage(conversationId, userId, body.trim());
        ack?.({ ok: true, message });
      } catch (err) {
        ack?.({ ok: false, error: err instanceof Error ? err.message : 'Ошибка отправки' });
      }
    });

    socket.on('typing:start', (conversationId) => {
      socket.to(conversationRoom(conversationId)).emit('typing', { conversationId, userId, typing: true });
    });
    socket.on('typing:stop', (conversationId) => {
      socket.to(conversationRoom(conversationId)).emit('typing', { conversationId, userId, typing: false });
    });

    socket.on('message:read', async (conversationId) => {
      const readAt = await markConversationRead(conversationId, userId);
      socket
        .to(conversationRoom(conversationId))
        .emit('message:read', { conversationId, userId, readAt: readAt.toISOString() });
    });

    socket.on('disconnect', async () => {
      const remaining = await io.in(userRoom(userId)).fetchSockets();
      if (remaining.length === 0) socket.broadcast.emit('presence:update', { userId, online: false });
    });
  });

  return io;
}
