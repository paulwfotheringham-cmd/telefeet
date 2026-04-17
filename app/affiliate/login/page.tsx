import { LoginHeroShell } from "@/components/login-hero-shell";
import { AffiliateLoginForm } from "./login-form";

export default function AffiliateLoginPage() {
  return (
    <LoginHeroShell>
      <div className="flex w-full max-w-[320px] flex-col gap-4">
        <p className="text-left text-sm leading-relaxed text-brand-cream/80">
          Secure access for Footworx partner podiatrists.
        </p>
        <AffiliateLoginForm />
      </div>
    </LoginHeroShell>
  );
}
