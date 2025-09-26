import { getSession } from "@/auth/session";
import SignIn from "@/components/SignIn";

export default async function Home() {
  const session = await getSession();
  const userInfo = JSON.stringify(session || "{}");

  return <div>{session ? <div>{userInfo}</div> : <SignIn />}</div>;
}
