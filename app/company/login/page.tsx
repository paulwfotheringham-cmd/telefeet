import { LoginHeroShell } from "@/components/login-hero-shell";
import { CompanyLoginForm } from "./login-form";

export default function CompanyLoginPage() {
  return (
    <LoginHeroShell>
      <div className="flex w-full max-w-[320px] flex-col gap-4">
        <p className="text-left text-sm leading-relaxed text-brand-dark/70">
          Company operations and oversight
        </p>
        <CompanyLoginForm />
      </div>
    </LoginHeroShell>
  );
}
