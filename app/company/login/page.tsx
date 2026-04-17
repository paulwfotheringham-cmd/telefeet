import { LoginHeroShell } from "@/components/login-hero-shell";
import { CompanyLoginForm } from "./login-form";

export default function CompanyLoginPage() {
  return (
    <LoginHeroShell>
      <div className="mb-8 max-w-md text-center">
        <p className="text-sm text-brand-dark/70">
          Company operations and oversight
        </p>
      </div>
      <CompanyLoginForm />
    </LoginHeroShell>
  );
}
