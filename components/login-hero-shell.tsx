import Image from "next/image";

type Props = {
  children: React.ReactNode;
};

/**
 * Login hero: photo under a rich black + warm gold veil.
 */
export function LoginHeroShell({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-ink via-brand-surface to-brand-ink"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/client-login-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.35]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-brand-ink/92 via-brand-ink/78 to-brand-ink/94"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.12)_0%,_transparent_55%)]"
          aria-hidden
        />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-6 py-10 md:px-10 lg:pl-16 lg:pr-8">
        {children}
      </div>
    </div>
  );
}
