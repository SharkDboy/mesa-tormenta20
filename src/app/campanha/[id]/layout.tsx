import { AppHeader } from "@/components/layout/AppHeader";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function CampanhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppHeader />
      <main className="flex flex-1 px-4 py-8">{children}</main>
    </AuthProvider>
  );
}
