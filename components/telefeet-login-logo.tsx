type Props = {
  /**
   * `form` — centered block for login cards (default).
   * `inline` — left-aligned strip for dashboards / nav.
   */
  variant?: "form" | "inline";
};

/**
 * Official TeleFeet wordmark (teal + BY FOOTWORX on black).
 * Asset: /telefeet-wordmark-login.png — not the page hero image.
 */
export function TelefeetLoginLogo({ variant = "form" }: Props) {
  const isForm = variant === "form";
  return (
    <div
      className={
        isForm
          ? "mx-auto mb-4 w-full max-w-[280px] overflow-hidden rounded-xl shadow-sm ring-1 ring-brand-gold/25"
          : "w-full max-w-[280px] overflow-hidden rounded-xl shadow-sm ring-1 ring-brand-gold/25 sm:max-w-[240px]"
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static branding from /public */}
      <img
        src="/telefeet-wordmark-login.png"
        alt="TeleFeet by Footworx"
        className={
          isForm
            ? "mx-auto block h-auto max-h-[52px] w-full object-contain object-center"
            : "block h-auto max-h-[40px] w-full object-contain object-left sm:max-h-[36px]"
        }
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
