import AdminHeader from "@/components/AdminHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <AdminHeader />
      <main className="flex w-full flex-1 flex-col">{children}</main>
    </div>
  );
}
