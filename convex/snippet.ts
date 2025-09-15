import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';

export const createSnippet = mutation({
  args: {
    title: v.string(),
    language: v.string(),
    code: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    | { success: boolean; message: string }
    | { success: boolean; snippetId: Id<'snippet'> }
  > => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, message: 'Not Authenticated' };
    }
    const user = await ctx.runQuery(api.user.getUser, {
      userId: identity.subject,
    });

    if (!user) {
      return { success: false, message: 'User Not Found' };
    }

    const snippetId = await ctx.db.insert('snippet', {
      userId: user?.userId,
      userName: user?.name,
      title: args.title,
      language: args.language,
      code: args.code,
    });
    return { success: true, snippetId: snippetId };
  },
});
