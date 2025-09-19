/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as http from "../http.js";
import type * as internals_lemonSqueezy from "../internals/lemonSqueezy.js";
import type * as public_codeExecution from "../public/codeExecution.js";
import type * as public_snippet from "../public/snippet.js";
import type * as public_user from "../public/user.js";
import type * as webhooks_clerk from "../webhooks/clerk.js";
import type * as webhooks_lemonSqueezy from "../webhooks/lemonSqueezy.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  http: typeof http;
  "internals/lemonSqueezy": typeof internals_lemonSqueezy;
  "public/codeExecution": typeof public_codeExecution;
  "public/snippet": typeof public_snippet;
  "public/user": typeof public_user;
  "webhooks/clerk": typeof webhooks_clerk;
  "webhooks/lemonSqueezy": typeof webhooks_lemonSqueezy;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
