import { httpRouter } from 'convex/server';
import { handleClerkWebhook } from './webhooks/clerk';
import { handleLemonSqueezyWebhook } from './webhooks/lemonSqueezy';

const http = httpRouter();

http.route({
  path: '/clerk-webhook',
  method: 'POST',
  handler: handleClerkWebhook,
});

http.route({
  path: '/lemon-squeezy-webhook',
  method: 'POST',
  handler: handleLemonSqueezyWebhook,
});

export default http;
