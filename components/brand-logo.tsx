type Props = {
  className?: string;
  /** sm = app bar, md = forms, lg = marketing hero */
  size?: "sm" | "md" | "lg";
};

const sizeClass: Record<NonNullable<Props["size"]>, string> = {
  sm: "max-h-8",
  md: "max-h-12",
  lg: "max-h-16",
};

export function BrandLogo({ className = "", size = "md" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static asset from /public
    <img
      src="/logo-telefeet.png"
      alt="TeleFeet by Footworx"
      width={280}
      height={80}
      className={`h-auto w-auto object-contain object-left ${sizeClass[size]} ${className}`}
    />
  );
}
