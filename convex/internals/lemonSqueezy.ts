'use node';
import { v } from 'convex/values';
import { internalAction } from '../_generated/server';
import crypto from 'crypto';

const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;

export const verifySignature = internalAction({
  args: { rawBody: v.string(), signature: v.string() },
  handler: async (ctx, args) => {
    const secret = webhookSecret;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(args.rawBody).digest('hex'), 'utf8');
    const signature = Buffer.from(args.signature || '', 'utf8');

    if (!crypto.timingSafeEqual(digest, signature)) {
      return false;
    }
    return true;
  },
});
