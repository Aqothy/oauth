export type Provider = "google" | "discord";
interface OAuthClientConfig {
  clientId: string;
  clientSecret: string;
  scope: string[];
  extraParams?: Record<string, string>;
  responseType: string; // e.g., "code" for Authorization Code Flow
  urls: {
    authurl: string;
    tokenurl: string;
    userinfo: string;
  };
  provider: Provider;
}

export class OAuthClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly scope: string[];
  private readonly responseType: string;
  private readonly provider: Provider;

  // optional
  private readonly extraParams: Record<string, string>;

  private readonly urls: {
    authurl: string;
    tokenurl: string;
    userinfo: string;
  };

  constructor(config: OAuthClientConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.scope = config.scope;
    this.extraParams = config.extraParams || {};
    this.urls = config.urls;
    this.responseType = config.responseType;
    this.provider = config.provider;
  }

  getRedirectUri() {
    return new URL(
      this.provider,
      process.env.OAUTH_REDIRECT_BASE_URL,
    ).toString();
  }

  getAuthUrl() {
    const url = new URL(this.urls.authurl);
    url.searchParams.set("client_id", this.clientId);
    url.searchParams.set("redirect_uri", this.getRedirectUri());
    url.searchParams.set("response_type", this.responseType);
    url.searchParams.set("scope", this.scope.join(" "));

    for (const [key, value] of Object.entries(this.extraParams)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  }

  async getToken(code: string) {
    const params = new URLSearchParams();
    params.set("client_id", this.clientId);
    params.set("client_secret", this.clientSecret);
    params.set("code", code);
    params.set("redirect_uri", this.getRedirectUri());
    params.set("grant_type", "authorization_code");

    const response = await fetch(this.urls.tokenurl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch token: ${response.status} ${response.statusText}`,
      );
    }

    const { access_token, token_type } = await response.json();

    return { access_token, token_type };
  }

  async getUserInfo(access_token: string, token_type: string) {
    const response = await fetch(this.urls.userinfo, {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch user info: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}

export function getOAuthClient(provider: Provider) {
  switch (provider) {
    case "google":
      return new OAuthClient({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        scope: ["openid", "profile", "email"],
        responseType: "code",
        urls: {
          authurl: "https://accounts.google.com/o/oauth2/v2/auth",
          tokenurl: "https://oauth2.googleapis.com/token",
          userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
        },
        provider: "google",
        extraParams: {
          prompt: "consent",
          access_type: "offline",
        },
      });
    case "discord":
      return new OAuthClient({
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        scope: ["identify", "email"],
        responseType: "code",
        urls: {
          authurl: "https://discord.com/oauth2/authorize",
          tokenurl: "https://discord.com/api/oauth2/token",
          userinfo: "https://discord.com/api/users/@me",
        },
        provider: "discord",
      });
    default:
      throw new Error("Unsupported provider");
  }
}
