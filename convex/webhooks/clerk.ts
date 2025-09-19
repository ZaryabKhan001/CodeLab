import { httpAction } from '../_generated/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { api } from '../_generated/api';

export const handleClerkWebhook = httpAction(async (ctx, req) => {
  console.log("get")
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret)
    return new Response('clerk webhook secret is missing', {
      status: 400,
    });
  const wh = new Webhook(webhookSecret);

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const headers = {
    'svix-id': req.headers.get('svix-id') || '',
    'svix-signature': req.headers.get('svix-signature') || '',
    'svix-timestamp': req.headers.get('svix-timestamp') || '',
  };

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, headers) as WebhookEvent;
  } catch (error) {
    console.log('Unable to verify clerk webhook request headers', error);
    return new Response('Invalid signature', { status: 400 });
  }

  if (evt.type === 'user.created') {
    const { first_name, last_name, email_addresses, id } = evt.data;

    const email = email_addresses[0].email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim();

    try {
      await ctx.runMutation(api.public.user.syncUser, {
        userId: id,
        email,
        name,
      });
      return new Response('User created successfully', { status: 200 });
    } catch (error) {
      console.log('Error in adding clerk client to database', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', {
    status: 200,
  });
});
