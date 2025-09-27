"use server";

import { redirect } from "next/navigation";
import { getOAuthClient, Provider } from "./oauth/base";

export async function signInWithOAuth(provider: Provider) {
  const client = getOAuthClient(provider);
  redirect(client.getAuthUrl());
}
