"use client";

import { createAuthClient } from "better-auth/react";
import { getApiBaseUrl } from "./api";

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl()
});

export const { changeEmail, changePassword, sendVerificationEmail, signIn, signOut, signUp, useSession } = authClient;
