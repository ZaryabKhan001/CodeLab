import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { paginationOptsValidator } from 'convex/server';

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

export const allCodeExecutionsOfUser = query({
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const executions = await ctx.db
      .query('codeExecution')
      .withIndex('by_user_id')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .order('desc')
      .paginate(args.paginationOpts);

    return executions;
  },
});

export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const executions = await ctx.db
      .query('codeExecution')
      .withIndex('by_user_id')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .collect();

    // Get starred snippets
    const starredSnippets = await ctx.db
      .query('stars')
      .withIndex('by_user_Id')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .collect();

    // Get all starred snippet details to analyze languages
    const snippetIds = starredSnippets.map((star) => star.snippetId);
    const snippetDetails = await Promise.all(
      snippetIds.map((id) => ctx.db.get(id))
    );

    // Calculate most starred language
    const starredLanguages = snippetDetails.filter(Boolean).reduce(
      (acc, curr) => {
        if (curr?.language) {
          acc[curr.language] = (acc[curr.language] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const mostStarredLanguage =
      Object.entries(starredLanguages).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      'N/A';

    // Calculate execution stats
    const last24Hours = executions.filter(
      (e) => e._creationTime > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    const languageStats = executions.reduce(
      (acc, curr) => {
        acc[curr.language] = (acc[curr.language] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const languages = Object.keys(languageStats);
    const favoriteLanguage = languages.length
      ? languages.reduce((a, b) =>
          languageStats[a] > languageStats[b] ? a : b
        )
      : 'N/A';

    return {
      totalExecutions: executions.length,
      languagesCount: languages.length,
      languages: languages,
      last24Hours,
      favoriteLanguage,
      languageStats,
      mostStarredLanguage,
    };
  },
});

