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
import type * as channel from "../channel.js";
import type * as dm from "../dm.js";
import type * as friend from "../friend.js";
import type * as helpers from "../helpers.js";
import type * as invite from "../invite.js";
import type * as livekit from "../livekit.js";
import type * as message from "../message.js";
import type * as moderation from "../moderation.js";
import type * as server from "../server.js";
import type * as storage from "../storage.js";
import type * as typing from "../typing.js";
import type * as user from "../user.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  channel: typeof channel;
  dm: typeof dm;
  friend: typeof friend;
  helpers: typeof helpers;
  invite: typeof invite;
  livekit: typeof livekit;
  message: typeof message;
  moderation: typeof moderation;
  server: typeof server;
  storage: typeof storage;
  typing: typeof typing;
  user: typeof user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
