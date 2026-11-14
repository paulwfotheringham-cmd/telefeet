import type { ReactNode } from "react";

/** High-contrast picture clues. Blue cover tiles sit on top of these, so the art stays light. */
function Frame({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
      <rect width="400" height="300" fill={bg} />
      {children}
    </svg>
  );
}

export function CatchphraseScene({ sceneKey }: { sceneKey: string }) {
  switch (sceneKey) {
    case "piece_of_cake":
      return (
        <Frame bg="#fff7ed">
          <path fill="#f59e0b" d="M70 210 L200 70 L330 210 Z" />
          <rect fill="#fde68a" x="110" y="130" width="180" height="90" rx="10" />
          <rect fill="#ef4444" x="175" y="95" width="50" height="40" rx="6" />
          <circle fill="#f472b6" cx="150" cy="175" r="10" />
          <circle fill="#60a5fa" cx="200" cy="185" r="10" />
          <circle fill="#34d399" cx="250" cy="175" r="10" />
        </Frame>
      );
    case "break_a_leg":
      return (
        <Frame bg="#f8fafc">
          <path stroke="#0f172a" strokeWidth="22" strokeLinecap="round" fill="none" d="M90 230 L150 120 L210 230" />
          <path stroke="#ef4444" strokeWidth="8" strokeLinecap="round" d="M140 150 L175 125" />
          <path stroke="#ef4444" strokeWidth="8" strokeLinecap="round" d="M155 168 L190 145" />
          <circle fill="#fecaca" cx="280" cy="160" r="36" />
          <path stroke="#0f172a" strokeWidth="6" fill="none" d="M262 160 H298 M280 142 V178" />
        </Frame>
      );
    case "spill_the_beans":
      return (
        <Frame bg="#ecfdf5">
          <path fill="#b45309" d="M150 70 H250 L270 150 H130 Z" />
          <ellipse fill="#92400e" cx="200" cy="70" rx="50" ry="14" />
          <path fill="#fbbf24" d="M230 120 L310 210 L250 230 Z" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <ellipse key={i} fill="#78350f" cx={250 + (i % 4) * 28} cy={200 + Math.floor(i / 4) * 28} rx="12" ry="16" />
          ))}
        </Frame>
      );
    case "under_the_weather":
      return (
        <Frame bg="#e0f2fe">
          <ellipse fill="#64748b" cx="200" cy="70" rx="130" ry="42" />
          <ellipse fill="#94a3b8" cx="150" cy="78" rx="70" ry="32" />
          <ellipse fill="#cbd5e1" cx="250" cy="78" rx="70" ry="32" />
          <circle fill="#fde68a" cx="200" cy="200" r="42" />
          <path stroke="#0284c7" strokeWidth="6" strokeLinecap="round" d="M170 130 L185 175 M200 120 L200 180 M230 130 L215 175" />
        </Frame>
      );
    case "raining_cats_dogs":
      return (
        <Frame bg="#dbeafe">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={i} x1={40 + i * 46} y1={20} x2={28 + i * 46} y2={110} stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
          ))}
          <ellipse fill="#f59e0b" cx="120" cy="200" rx="46" ry="28" />
          <polygon fill="#f59e0b" points="80,185 95,155 115,185" />
          <polygon fill="#f59e0b" points="125,185 145,155 165,185" />
          <circle fill="#0f172a" cx="105" cy="198" r="4" />
          <circle fill="#0f172a" cx="140" cy="198" r="4" />
          <ellipse fill="#78716c" cx="280" cy="205" rx="50" ry="30" />
          <circle fill="#78716c" cx="325" cy="185" r="22" />
          <ellipse fill="#44403c" cx="318" cy="170" rx="10" ry="16" />
          <circle fill="#0f172a" cx="332" cy="182" r="3" />
        </Frame>
      );
    case "once_blue_moon":
      return (
        <Frame bg="#e0f2fe">
          <circle fill="#2563eb" cx="145" cy="145" r="80" />
          <circle fill="#e0f2fe" cx="185" cy="120" r="64" />
          <text x="290" y="190" fill="#1e3a8a" fontSize="84" fontWeight="700" fontFamily="sans-serif">
            1
          </text>
        </Frame>
      );
    case "cost_arm_leg":
      return (
        <Frame bg="#f5f3ff">
          <rect fill="#fde047" x="40" y="40" width="150" height="90" rx="12" />
          <text x="115" y="100" textAnchor="middle" fill="#713f12" fontSize="48" fontWeight="700" fontFamily="sans-serif">
            ££
          </text>
          <path stroke="#fb7185" strokeWidth="22" strokeLinecap="round" fill="none" d="M230 80 L300 40" />
          <circle fill="#fecdd3" cx="308" cy="34" r="16" />
          <path stroke="#fb7185" strokeWidth="22" strokeLinecap="round" fill="none" d="M240 160 L320 230" />
          <ellipse fill="#fecdd3" cx="330" cy="242" rx="22" ry="14" />
        </Frame>
      );
    case "let_cat_out":
      return (
        <Frame bg="#fffbeb">
          <path fill="#d97706" d="M90 110 H250 L280 250 H70 Z" />
          <path fill="#fbbf24" d="M90 110 L170 60 L250 110 Z" />
          <ellipse fill="#f59e0b" cx="210" cy="175" rx="48" ry="32" />
          <polygon fill="#f59e0b" points="170,160 185,130 205,160" />
          <polygon fill="#f59e0b" points="210,160 230,130 250,160" />
          <circle fill="#0f172a" cx="200" cy="172" r="4" />
          <circle fill="#0f172a" cx="224" cy="172" r="4" />
        </Frame>
      );
    case "hit_nail":
      return (
        <Frame bg="#fafaf9">
          <rect fill="#a8a29e" x="40" y="200" width="280" height="36" rx="4" />
          <rect fill="#78716c" x="190" y="120" width="22" height="90" />
          <path fill="#fbbf24" d="M120 70 L250 50 L240 110 L130 120 Z" />
          <rect fill="#92400e" x="210" y="70" width="70" height="18" rx="4" />
        </Frame>
      );
    case "cold_feet":
      return (
        <Frame bg="#e0f2fe">
          <path fill="#bae6fd" d="M40 40 H200 V180 H40 Z" />
          <path fill="#7dd3fc" d="M70 50 L90 140 L50 140 Z" />
          <path fill="#7dd3fc" d="M130 40 L155 150 L110 150 Z" />
          <ellipse fill="#0ea5e9" cx="140" cy="230" rx="55" ry="24" />
          <ellipse fill="#0284c7" cx="270" cy="230" rx="55" ry="24" />
        </Frame>
      );
    case "burn_midnight_oil":
      return (
        <Frame bg="#fff7ed">
          <rect fill="#1e1b4b" x="240" y="24" width="130" height="100" rx="8" />
          <circle fill="#fef08a" cx="305" cy="70" r="24" />
          <rect fill="#fcd34d" x="120" y="150" width="40" height="100" rx="6" />
          <ellipse fill="#fb923c" cx="140" cy="132" rx="24" ry="34" />
          <ellipse fill="#fef9c3" cx="140" cy="124" rx="10" ry="16" />
        </Frame>
      );
    case "elephant_room":
      return (
        <Frame bg="#fef3c7">
          <rect fill="#e7e5e4" x="30" y="30" width="340" height="240" rx="8" />
          <rect fill="#d6d3d1" x="50" y="50" width="80" height="60" />
          <ellipse fill="#a8a29e" cx="230" cy="170" rx="90" ry="60" />
          <circle fill="#a8a29e" cx="300" cy="130" r="36" />
          <path fill="#a8a29e" d="M310 150 Q360 180 320 220" stroke="#78716c" strokeWidth="10" fillOpacity="1" />
          <rect fill="#78716c" x="200" y="210" width="16" height="40" />
          <rect fill="#78716c" x="250" y="210" width="16" height="40" />
        </Frame>
      );
    case "when_pigs_fly":
      return (
        <Frame bg="#e0f2fe">
          <ellipse fill="#fbcfe8" cx="200" cy="170" rx="80" ry="50" />
          <circle fill="#f9a8d4" cx="270" cy="145" r="32" />
          <ellipse fill="#fce7f3" cx="285" cy="155" rx="16" ry="12" />
          <circle fill="#0f172a" cx="280" cy="138" r="4" />
          <path fill="#ffffff" d="M140 150 Q80 80 160 120 Q120 90 190 145 Z" />
          <path fill="#ffffff" d="M180 130 Q150 40 240 110 Z" />
        </Frame>
      );
    case "barking_wrong_tree":
      return (
        <Frame bg="#ecfccb">
          <rect fill="#854d0e" x="250" y="90" width="46" height="180" />
          <circle fill="#166534" cx="273" cy="70" r="62" />
          <ellipse fill="#a16207" cx="120" cy="210" rx="55" ry="32" />
          <circle fill="#a16207" cx="165" cy="185" r="24" />
          <ellipse fill="#78350f" cx="155" cy="168" rx="12" ry="18" />
          <circle fill="#0f172a" cx="174" cy="182" r="4" />
          <path stroke="#0f172a" strokeWidth="4" fill="none" d="M185 190 Q230 170 245 150" />
        </Frame>
      );
    case "kick_bucket":
      return (
        <Frame bg="#f5f5f4">
          <path fill="#a8a29e" d="M150 90 L270 90 L295 230 L125 230 Z" />
          <ellipse fill="#78716c" cx="210" cy="90" rx="62" ry="16" />
          <path stroke="#0f172a" strokeWidth="16" strokeLinecap="round" fill="none" d="M70 200 L140 150" />
          <ellipse fill="#fecdd3" cx="150" cy="142" rx="22" ry="14" />
        </Frame>
      );
    default:
      return (
        <Frame bg="#fff7ed">
          <text x="200" y="165" textAnchor="middle" fill="#9a3412" fontSize="64" fontFamily="sans-serif">
            ?
          </text>
        </Frame>
      );
  }
}
