import Image from "next/image";
import { ClientLoginForm } from "./login-form";

export default function ClientLoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-3.75rem)] flex-col">
      {/* Soft base so the page still looks fine if hero file is missing */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-light via-[#eef5f3] to-brand-light"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/client-login-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.42]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-brand-light/90 via-brand-light/65 to-brand-light/88"
          aria-hidden
        />
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <ClientLoginForm />
      </div>
    </div>
  );
}
