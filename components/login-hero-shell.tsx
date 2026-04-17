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
          className="absolute inset-0 bg-gradient-to-b from-brand-light/82 via-brand-light/52 to-brand-light/80"
          aria-hidden
        />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-6 py-10 md:px-10 lg:pl-16 lg:pr-8">
        {children}
      </div>
    </div>
  );
}
