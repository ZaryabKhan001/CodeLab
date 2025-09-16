import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
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

export const getSnippets = query({
  handler: async (ctx) => {
    const snippets = await ctx.db.query('snippet').order('desc').collect();
    return snippets;
  },
});

export const isSnippetStarred = query({
  args: { snippetId: v.id('snippet') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Not Authenticated');
    }
    const star = await ctx.db
      .query('stars')
      .withIndex('by_user_and_snipped_Id')
      .filter(
        (q) =>
          q.eq(q.field('userId'), identity.subject) &&
          q.eq(q.field('snippetId'), args.snippetId)
      )
      .first();
    return star ? true : false;
  },
});

export const getSnippetStarCount = query({
  args: { snippetId: v.id('snippet') },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query('stars')
      .withIndex('by_snipped_Id')
      .filter((q) => q.eq(q.field('snippetId'), args.snippetId))
      .collect();
    return users.length;
  },
});

export const getSnippet = query({
  args: { snippetId: v.id('snippet') },
  handler: async (ctx, args) => {
    const snippet = await ctx.db
      .query('snippet')
      .filter((q) => q.eq(q.field('_id'), args.snippetId))
      .first();
    return snippet;
  },
});

export const deleteSnippet = mutation({
  args: { snippetId: v.id('snippet') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Not Authenticated');
    const snippet = await ctx.runQuery(api.snippet.getSnippet, {
      snippetId: args.snippetId,
    });

    if (!snippet) throw new ConvexError('Snippet not found');

    if (snippet.userId !== identity.subject) throw new Error('Not Authorized');

    await ctx.db.delete(args.snippetId);
    return true;
  },
});
