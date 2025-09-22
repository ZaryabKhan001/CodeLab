import { ConvexError, v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { api } from '../_generated/api';
import { paginationOptsValidator } from 'convex/server';

export const getMessages = query({
  args: { userId: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.public.user.getUser, {
      userId: args.userId,
    });

    if (!user) throw new ConvexError('User not found');

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_user_id')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .order('desc')
      .paginate(args.paginationOpts);

    return {
      ...messages,
      page: messages.page.reverse(),
    };
  },
});

export const createMessage = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.public.user.getUser, {
      userId: args.userId,
    });

    if (!user) throw new ConvexError('User not found');

    await ctx.db.insert('messages', {
      userId: args.userId,
      content: args.content,
      role: args.role,
    });
    return true;
  },
});
