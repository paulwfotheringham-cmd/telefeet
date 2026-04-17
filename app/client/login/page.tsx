import { LoginHeroShell } from "@/components/login-hero-shell";
import { ClientLoginForm } from "./login-form";

export default function ClientLoginPage() {
  return (
    <LoginHeroShell>
      <ClientLoginForm />
    </LoginHeroShell>
  );
}
