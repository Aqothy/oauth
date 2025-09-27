import { getOAuthClient, Provider } from "@/auth/oauth/base";
import { createSession } from "@/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: Provider }> },
) {
  const { provider } = await params;

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 400 });
  }

  if (!code) {
    return new Response(JSON.stringify({ error: "Missing code parameter" }), {
      status: 400,
    });
  }

  const client = getOAuthClient(provider);
  const { access_token, token_type } = await client.getToken(code);

  const userInfo = await client.getUserInfo(access_token, token_type);

  await createSession(userInfo);

  return NextResponse.redirect(new URL("/", request.url));
}
