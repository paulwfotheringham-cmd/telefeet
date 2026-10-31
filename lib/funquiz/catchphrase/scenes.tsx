/** Visual “Mr Chips” style picture clues for catchphrase rounds. */
export function CatchphraseScene({ sceneKey }: { sceneKey: string }) {
  switch (sceneKey) {
    case "piece_of_cake":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#1e3a8a" width="400" height="300" />
          <path fill="#fbbf24" d="M80 200 L200 80 L320 200 Z" />
          <rect fill="#fcd34d" x="120" y="120" width="160" height="90" rx="8" />
          <text x="200" y="175" textAnchor="middle" fill="#78350f" fontSize="28" fontWeight="bold">
            CAKE
          </text>
          <rect fill="#ef4444" x="175" y="95" width="50" height="35" rx="4" />
        </svg>
      );
    case "break_a_leg":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#0f172a" width="400" height="300" />
          <path stroke="#f8fafc" strokeWidth="14" fill="none" d="M120 220 Q200 40 280 220" />
          <path stroke="#ef4444" strokeWidth="6" d="M190 120 L210 140 M200 100 L220 115" />
          <text x="200" y="260" textAnchor="middle" fill="#94a3b8" fontSize="22">
            CRACK!
          </text>
        </svg>
      );
    case "spill_the_beans":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#14532d" width="400" height="300" />
          <ellipse fill="#854d0e" cx="200" cy="200" rx="90" ry="35" />
          <ellipse fill="#a16207" cx="200" cy="175" rx="70" ry="50" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse
              key={i}
              fill="#78350f"
              cx={160 + i * 18}
              cy={140 + (i % 2) * 25}
              rx="10"
              ry="14"
            />
          ))}
        </svg>
      );
    case "under_the_weather":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#334155" width="400" height="300" />
          <ellipse fill="#64748b" cx="200" cy="80" rx="120" ry="45" />
          <path fill="#94a3b8" d="M80 80 Q200 160 320 80 L320 120 Q200 200 80 120 Z" />
          <circle fill="#fde68a" cx="200" cy="210" r="35" />
          <path stroke="#0ea5e9" strokeWidth="4" d="M185 200 L195 215 L215 190" fill="none" />
        </svg>
      );
    case "raining_cats_dogs":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#1e40af" width="400" height="300" />
          {[...Array(12)].map((_, i) => (
            <line
              key={`r${i}`}
              x1={30 + i * 32}
              y1={20}
              x2={20 + i * 32}
              y2={120}
              stroke="#93c5fd"
              strokeWidth="3"
            />
          ))}
          <text x="100" y="200" fontSize="48">
            🐱
          </text>
          <text x="240" y="220" fontSize="48">
            🐶
          </text>
        </svg>
      );
    case "once_blue_moon":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#020617" width="400" height="300" />
          <circle fill="#2563eb" cx="200" cy="130" r="70" />
          <circle fill="#020617" cx="230" cy="110" r="60" />
          <text x="200" y="260" textAnchor="middle" fill="#e2e8f0" fontSize="20">
            1 × ?
          </text>
        </svg>
      );
    case "cost_arm_leg":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#4c1d95" width="400" height="300" />
          <text x="200" y="100" textAnchor="middle" fill="#fde047" fontSize="56">
            £££
          </text>
          <path stroke="#fca5a5" strokeWidth="16" strokeLinecap="round" d="M120 200 L160 140" />
          <path stroke="#fca5a5" strokeWidth="16" strokeLinecap="round" d="M280 200 L240 150" />
        </svg>
      );
    case "let_cat_out":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#713f12" width="400" height="300" />
          <rect fill="#a16207" x="100" y="100" width="200" height="140" rx="12" />
          <text x="200" y="190" textAnchor="middle" fontSize="64">
            🐱
          </text>
          <path fill="none" stroke="#fef3c7" strokeWidth="4" d="M200 100 L200 60" />
        </svg>
      );
    case "hit_nail":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#292524" width="400" height="300" />
          <rect fill="#78716c" x="80" y="180" width="240" height="40" />
          <rect fill="#a8a29e" x="185" y="120" width="30" height="70" />
          <path fill="#fbbf24" d="M150 90 L250 90 L230 120 L170 120 Z" />
        </svg>
      );
    case "cold_feet":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#0c4a6e" width="400" height="300" />
          <ellipse fill="#bae6fd" cx="160" cy="200" rx="45" ry="25" />
          <ellipse fill="#bae6fd" cx="240" cy="200" rx="45" ry="25" />
          <text x="200" y="120" textAnchor="middle" fontSize="40">
            🥶
          </text>
        </svg>
      );
    case "burn_midnight_oil":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#172554" width="400" height="300" />
          <circle fill="#fef08a" cx="320" cy="60" r="25" />
          <rect fill="#fcd34d" x="180" y="140" width="40" height="80" />
          <ellipse fill="#f97316" cx="200" cy="130" rx="18" ry="28" />
        </svg>
      );
    case "elephant_room":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#fef3c7" width="400" height="300" />
          <rect fill="#e7e5e4" x="40" y="40" width="320" height="220" rx="8" />
          <text x="200" y="175" textAnchor="middle" fontSize="72">
            🐘
          </text>
        </svg>
      );
    case "when_pigs_fly":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#7dd3fc" width="400" height="300" />
          <text x="200" y="160" textAnchor="middle" fontSize="80">
            🐷
          </text>
          <path stroke="#fff" strokeWidth="3" fill="none" d="M120 200 Q200 80 280 200" strokeDasharray="8 6" />
        </svg>
      );
    case "barking_wrong_tree":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#365314" width="400" height="300" />
          <rect fill="#854d0e" x="260" y="100" width="40" height="160" />
          <circle fill="#166534" cx="280" cy="80" r="55" />
          <text x="120" y="200" fontSize="56">
            🐕
          </text>
          <text x="120" y="240" fill="#fef08a" fontSize="18">
            WOOF!
          </text>
        </svg>
      );
    case "kick_bucket":
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#57534e" width="400" height="300" />
          <path fill="#a8a29e" d="M150 120 L250 120 L270 220 L130 220 Z" />
          <ellipse fill="#78716c" cx="200" cy="120" rx="55" ry="12" />
          <path stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" d="M280 180 L320 140" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden>
          <rect fill="#312e81" width="400" height="300" />
          <text x="200" y="160" textAnchor="middle" fill="#e0e7ff" fontSize="24">
            ?
          </text>
        </svg>
      );
  }
}
