import Image from "next/image";

type Props = {
  children: React.ReactNode;
};

/**
 * Shared full-viewport faded hero (same asset as client login) for portal login pages.
 */
export function LoginHeroShell({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col">
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
          className="object-cover opacity-[0.71]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-brand-light/90 via-brand-light/65 to-brand-light/88"
          aria-hidden
        />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}
