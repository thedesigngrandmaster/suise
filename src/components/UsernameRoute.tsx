import { useParams } from "react-router-dom";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

/** Usernames: letters, numbers, underscore only (same as profile editor). */
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

export function UsernameRoute() {
  const { username } = useParams<{ username: string }>();
  const clean = username?.replace(/^@/, "") ?? "";

  if (!clean || !USERNAME_RE.test(clean)) {
    return <NotFound />;
  }

  return <Profile />;
}
