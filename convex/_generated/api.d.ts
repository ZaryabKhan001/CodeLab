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
import type * as codeExecution from "../codeExecution.js";
import type * as http from "../http.js";
import type * as snippet from "../snippet.js";
import type * as user from "../user.js";
import type * as webhooks_clerk from "../webhooks/clerk.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  codeExecution: typeof codeExecution;
  http: typeof http;
  snippet: typeof snippet;
  user: typeof user;
  "webhooks/clerk": typeof webhooks_clerk;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
