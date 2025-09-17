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

    //* also delete all comments of snippet

    const comments = await ctx.db
      .query('snippetComment')
      .withIndex('by_snipped_Id')
      .filter((q) => q.eq(q.field('snippetId'), args.snippetId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    //* also delete all likes of snippet
    const likes = await ctx.db
      .query('stars')
      .withIndex('by_snipped_Id')
      .filter((q) => q.eq(q.field('snippetId'), args.snippetId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    await ctx.db.delete(args.snippetId);
    return true;
  },
});

export const starSnippet = mutation({
  args: { snippetId: v.id('snippet') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Not Authenticated');

    const snippet = await ctx.runQuery(api.snippet.getSnippet, {
      snippetId: args.snippetId,
    });

    if (!snippet) throw new ConvexError('Snippet not found');

    const isAlreadyStarred = await ctx.db
      .query('stars')
      .withIndex('by_user_and_snipped_Id')
      .filter(
        (q) =>
          q.eq(q.field('userId'), identity.subject) &&
          q.eq(q.field('snippetId'), args.snippetId)
      )
      .first();

    if (isAlreadyStarred) {
      await ctx.db.delete(isAlreadyStarred._id);
      return true;
    }

    await ctx.db.insert('stars', {
      userId: identity.subject,
      snippetId: args.snippetId,
    });
    return true;
  },
});

export const getSnippetComments = query({
  args: { snippetId: v.id('snippet') },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query('snippetComment')
      .withIndex('by_snipped_Id')
      .filter((q) => q.eq(q.field('snippetId'), args.snippetId))
      .order('desc')
      .collect();
    return comments;
  },
});

export const addComment = mutation({
  args: { snippetId: v.id('snippet'), content: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Not Authenticated');

    const user = await ctx.db
      .query('user')
      .withIndex('by_user_id')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .first();

    if (!user) throw new ConvexError('User not found');

    const snippet = await ctx.runQuery(api.snippet.getSnippet, {
      snippetId: args.snippetId,
    });

    if (!snippet) throw new ConvexError('Snippet not found');

    await ctx.db.insert('snippetComment', {
      userId: identity.subject,
      userName: user.name,
      content: args.content,
      snippetId: args.snippetId,
    });
    return true;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id('snippetComment') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Not Authenticated');

    const comment = await ctx.db.get(args.commentId);

    if (!comment) throw new ConvexError('Comment not found');

    const isAuthorized = comment.userId === identity.subject;

    if (!isAuthorized)
      throw new ConvexError('Not Authorized to delete this comment');

    await ctx.db.delete(args.commentId);
  },
});
