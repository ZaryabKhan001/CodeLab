import { api, internal } from '../_generated/api';
import { httpAction } from '../_generated/server';

const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

export const handleLemonSqueezyWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get('X-Signature');

  if (!signature) {
    return new Response('Webhook Signature is missing', { status: 400 });
  }

  if (!webhookSecret) {
    return new Response('Webhhook secret is missing', { status: 400 });
  }

  const rawBody = await request.text();

  try {
    const payload = await ctx.runAction(
      internal.internals.lemonSqueezy.verifySignature,
      {
        rawBody: rawBody,
        signature: signature,
      }
    );
    if (!payload) {
      console.log('Invalid Signature');
      return new Response('Invalid Signature', { status: 400 });
    }

    console.log('Signature Verified');
  } catch (error) {
    console.log('Error verifying signature', error);
  }

  const payload = JSON.parse(rawBody);

  if (payload.meta.event_name === 'order_created') {
    const { data } = payload;

    const { success } = await ctx.runMutation(api.public.user.upgradeToPro, {
      email: data.attributes.user_email,
      customerId: data.attributes.customer_id.toString(),
      orderId: data.id,
      amount: data.attributes.total,
    });

    if (success) {
      console.log('User Status Upgrade Successfully');
    }
  }

  return new Response('Webhook processed successfully', {
    status: 200,
  });
});
