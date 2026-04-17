import { LoginHeroShell } from "@/components/login-hero-shell";
import { AffiliateLoginForm } from "./login-form";

export default function AffiliateLoginPage() {
  return (
    <LoginHeroShell>
      <div className="mb-8 max-w-xl text-center">
        <p className="text-sm text-brand-dark/75">
          Secure access for Footworx partner podiatrists.
        </p>
      </div>
      <AffiliateLoginForm />
    </LoginHeroShell>
  );
}
