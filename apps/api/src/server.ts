import { buildApp } from './app';
import { env } from './env';
import { initSocket } from './realtime/socket';

async function main() {
  const app = await buildApp();

  // Socket.io вешаем на тот же http-сервер, что и Fastify.
  initSocket(app.server, env.WEB_ORIGIN);

  await app.listen({ port: env.API_PORT, host: env.API_HOST });
  app.log.info(`🚀 API + Socket.io на http://localhost:${env.API_PORT}`);
}

main().catch((err) => {
  console.error('Не удалось запустить сервер:', err);
  process.exit(1);
});
