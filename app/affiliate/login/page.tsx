import { AffiliateLoginForm } from "./login-form";

export default function AffiliateLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-light to-brand-secondary/25">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 max-w-xl text-center">
          <p className="text-sm text-brand-dark/75">
            Secure access for Footworx partner podiatrists.
          </p>
        </div>
        <AffiliateLoginForm />
      </div>
    </div>
  );
}
