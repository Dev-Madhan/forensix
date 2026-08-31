import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Header } from "@/components/header";

/**
 * Server component wrapper that reads the session and fetches
 * the current user, then passes it down to the client Header.
 */
export async function HeaderServer() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session || !session.user) {
    return <Header user={null} />;
  }

  return (
    <Header
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? undefined,
        role: session.user.role as string,
      }}
    />
  );
}
