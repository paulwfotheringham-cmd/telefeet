import { CompanyLoginForm } from "./login-form";

export default function CompanyLoginPage() {
  return (
    <div className="min-h-screen bg-brand-light">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 max-w-md text-center">
          <p className="text-sm text-brand-dark/70">
            Company operations and oversight
          </p>
        </div>
        <CompanyLoginForm />
      </div>
    </div>
  );
}
