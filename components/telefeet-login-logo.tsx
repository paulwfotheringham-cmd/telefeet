/**
 * Official TeleFeet wordmark (teal + BY FOOTWORX on black) above portal titles.
 * Asset: /telefeet-wordmark-login.png — not the page hero image.
 */
export function TelefeetLoginLogo() {
  return (
    <div className="mx-auto mb-4 w-full max-w-[280px] overflow-hidden rounded-xl shadow-sm ring-1 ring-black/15">
      {/* eslint-disable-next-line @next/next/no-img-element -- static branding from /public */}
      <img
        src="/telefeet-wordmark-login.png"
        alt="TeleFeet by Footworx"
        className="mx-auto block h-auto max-h-[52px] w-full object-contain object-center"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
