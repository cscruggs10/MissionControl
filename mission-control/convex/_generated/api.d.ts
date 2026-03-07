/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as agents from "../agents.js";
import type * as channels from "../channels.js";
import type * as costTracking from "../costTracking.js";
import type * as documents from "../documents.js";
import type * as loops from "../loops.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as steps from "../steps.js";
import type * as subscriptions from "../subscriptions.js";
import type * as tasks from "../tasks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  agents: typeof agents;
  channels: typeof channels;
  costTracking: typeof costTracking;
  documents: typeof documents;
  loops: typeof loops;
  messages: typeof messages;
  notifications: typeof notifications;
  steps: typeof steps;
  subscriptions: typeof subscriptions;
  tasks: typeof tasks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
