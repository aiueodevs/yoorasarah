"use client";

import { createAuthClient } from "better-auth/react";
import { apiBaseUrl } from "./config";

export const authClient = createAuthClient({
  baseURL: apiBaseUrl
});

export const { signIn, signOut, useSession } = authClient;
