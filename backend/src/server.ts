import { createApp } from './app';
import { env } from './config/env';
import { initDatabase } from './db';

async function bootstrap() {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting Notewise Express Backend (TypeScript)');
  console.log('----------------------------------------------------');

  // Initialize DB pool / fallback seed store
  await initDatabase();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`[Server] Listening on http://localhost:${env.PORT}`);
    console.log(`[Server] Client Origin: ${env.CLIENT_URL}`);
    console.log(`[Server] Python Audio Service: ${env.AUDIO_SERVICE_URL}`);
    console.log(`[Server] Uploads Directory: ${env.UPLOADS_DIR}`);
    console.log('----------------------------------------------------');
  });
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

