import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  user: defineTable({
    userId: v.string(), // clerk userId
    email: v.string(),
    name: v.string(),
    isPro: v.boolean(),
    proSince: v.optional(v.number()),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueexyOrderId: v.optional(v.string()),
  }).index('by_user_id', ['userId']),
  codeExecution: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  snippet: defineTable({
    userId: v.string(),
    userName: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
  }).index('by_user_Id', ['userId']),
  snippetComment: defineTable({
    snippetId: v.id('snippet'),
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
  }).index('by_snipped_Id', ['snippetId']),
  stars: defineTable({
    userId: v.string(),
    snippetId: v.id('snippet'),
  })
    .index('by_user_Id', ['userId']) // all snippets liked by specific user
    .index('by_snipped_Id', ['snippetId']) // all users liked specific snippet
    .index('by_user_and_snipped_Id', ['userId', 'snippetId']), // specific user like specific snippet or not
});
