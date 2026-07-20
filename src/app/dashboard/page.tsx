import { redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";
import { dashboardPathForRole } from "@/lib/demo-auth";

export default async function DashboardPage() {
  const session = await getAppSession();
  if (!session) {
    redirect("/auth");
  }
  redirect(dashboardPathForRole(session.role));
}
