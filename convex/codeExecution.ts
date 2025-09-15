import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const createCodeExecution = mutation({
  args: {
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, message: 'Not Authenticated' };
    }

    const user = await ctx.db
      .query('user')
      .withIndex('by_user_id')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .first();

    if (!user?.isPro && args.language !== 'javascript') {
      return {
        success: false,
        message: 'Pro Subscription required to use this language',
      };
    }

    await ctx.db.insert('codeExecution', {
      code: args.code,
      userId: user?.userId as string,
      language: args.language,
      output: args?.output,
      error: args?.error,
    });
    return {
      success: true,
      message: 'Code Executed Successfully',
    };
  },
});
