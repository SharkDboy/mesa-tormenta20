import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="pixel-border bg-surface p-8 max-w-sm w-full text-center">
            <p className="text-[8px] text-foreground/50">Carregando...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
