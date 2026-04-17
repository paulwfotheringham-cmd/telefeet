/**
 * Login card logo: static asset, fixed height box so any aspect ratio scales cleanly
 * (avoids Next/Image layout quirks that can make wide logos look like tiny previews).
 */
export function TelefeetLoginLogo() {
  return (
    <div className="relative mx-auto mb-3 h-[52px] w-full max-w-[260px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- small static branding asset */}
      <img
        src="/logo-telefeet-on-light.png"
        alt="TeleFeet by Footworx"
        className="h-full w-full object-contain object-top"
        width={280}
        height={80}
        decoding="async"
      />
    </div>
  );
}
