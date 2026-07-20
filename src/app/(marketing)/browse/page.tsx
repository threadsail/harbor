import { redirect } from "next/navigation";

/** Public browse marketplace removed — inventory is link-private only. */
export default function BrowsePage() {
  redirect("/");
}
