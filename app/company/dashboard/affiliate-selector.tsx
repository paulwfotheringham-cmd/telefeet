"use client";

import { useRouter } from "next/navigation";

type Option = {
  slug: string;
  name: string;
};

type Props = {
  options: Option[];
};

export function AffiliateSelector({ options }: Props) {
  const router = useRouter();

  return (
    <div className="mt-6 space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wide text-brand-muted">
        Affiliate organisation
      </label>
      <select
        defaultValue=""
        onChange={(e) => {
          const slug = e.target.value;
          if (!slug) return;
          router.push(`/company/dashboard/affiliates/${slug}`);
        }}
        className="w-full rounded-xl border border-brand-line bg-brand-panel px-3 py-2.5 text-sm text-brand-cream outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
      >
        <option value="">Select an affiliate company</option>
        {options.map((opt) => (
          <option key={opt.slug} value={opt.slug}>
            {opt.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-brand-muted">
        Choosing one opens a detailed affiliate profile page.
      </p>
    </div>
  );
}
