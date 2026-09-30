import { cookies } from "next/headers";
import crypto from "crypto";

export async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;

  const secret = process.env.VOTE_SECRET;

  if (!session || !secret) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update("admin-session")
    .digest("hex");

  return session === expected;
}
