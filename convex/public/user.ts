import { api } from '../_generated/api';
import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

export const syncUser = mutation({
  args: { userId: v.string(), email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const isUserAlreadyExists = await ctx.runQuery(api.public.user.getUser, {
      userId: args.userId,
    });

    if (!isUserAlreadyExists) {
      await ctx.db.insert('user', {
        userId: args.userId,
        name: args.name,
        email: args.email,
        isPro: false,
      });
    }
  },
});

export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    const user = await ctx.db
      .query('user')
      .withIndex('by_user_id')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();
    if (!user) {
      return null;
    }
    return user;
  },
});

export const upgradeToPro = mutation({
  args: {
    email: v.string(),
    orderId: v.string(),
    customerId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('user')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();

    if (!user) throw new Error('User not found');

    await ctx.db.patch(user._id, {
      isPro: true,
      proSince: Date.now(),
      lemonSqueezyCustomerId: args.customerId,
      lemonSqueezyOrderId: String(args.orderId),
    });
    return { success: true };
  },
});
