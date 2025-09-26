import { cookies } from "next/headers";

export interface User {
  email: string;
  name: string;
}

export async function createSession(user: any) {
  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify(user), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    expires: Date.now() + 60 * 60 * 24 * 7 * 1000,
  });
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return null;
    }

    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function requireAuth() {
  const user = await getSession();
  return user;
}
