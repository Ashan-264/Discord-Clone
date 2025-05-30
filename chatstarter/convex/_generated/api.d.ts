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
import type * as functions_channel from "../functions/channel.js";
import type * as functions_dm from "../functions/dm.js";
import type * as functions_friend from "../functions/friend.js";
import type * as functions_helpers from "../functions/helpers.js";
import type * as functions_invite from "../functions/invite.js";
import type * as functions_message from "../functions/message.js";
import type * as functions_moderation from "../functions/moderation.js";
import type * as functions_server from "../functions/server.js";
import type * as functions_storage from "../functions/storage.js";
import type * as functions_typing from "../functions/typing.js";
import type * as functions_user from "../functions/user.js";
import type * as functions__generated_api from "../functions/_generated/api.js";
import type * as functions__generated_server from "../functions/_generated/server.js";
import type * as http from "../http.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/channel": typeof functions_channel;
  "functions/dm": typeof functions_dm;
  "functions/friend": typeof functions_friend;
  "functions/helpers": typeof functions_helpers;
  "functions/invite": typeof functions_invite;
  "functions/message": typeof functions_message;
  "functions/moderation": typeof functions_moderation;
  "functions/server": typeof functions_server;
  "functions/storage": typeof functions_storage;
  "functions/typing": typeof functions_typing;
  "functions/user": typeof functions_user;
  "functions/_generated/api": typeof functions__generated_api;
  "functions/_generated/server": typeof functions__generated_server;
  http: typeof http;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
