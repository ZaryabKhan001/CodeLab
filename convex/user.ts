import { api } from './_generated/api';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const syncUser = mutation({
  args: { userId: v.string(), email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const isUserAlreadyExists = await ctx.runQuery(api.user.getUser, {
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
