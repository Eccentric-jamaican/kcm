/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminMux from "../adminMux.js";
import type * as courses from "../courses.js";
import type * as http from "../http.js";
import type * as httpHelpers from "../httpHelpers.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_courseSeedData from "../lib/courseSeedData.js";
import type * as progress from "../progress.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as videoPlayback from "../videoPlayback.js";
import type * as webinars from "../webinars.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminMux: typeof adminMux;
  courses: typeof courses;
  http: typeof http;
  httpHelpers: typeof httpHelpers;
  "lib/auth": typeof lib_auth;
  "lib/courseSeedData": typeof lib_courseSeedData;
  progress: typeof progress;
  seed: typeof seed;
  users: typeof users;
  videoPlayback: typeof videoPlayback;
  webinars: typeof webinars;
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
