type Props = {
  className?: string;
};

/**
 * TeleFeet symbol mark from /public/logo-telefeet.png (use with wordmark or alone).
 */
export function TelefeetMark({ className = "h-12 w-auto" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static asset from /public
    <img
      src="/logo-telefeet.png"
      alt="TeleFeet"
      className={`object-contain object-left ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
