/** Original synth cues in a Blockbusters / quiz-show spirit (not show recordings). */

export type BlockbustersSoundId =
  | "pick"
  | "correct"
  | "wrong"
  | "steal"
  | "win";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

function masterGain(ctx: AudioContext, level = 0.24): GainNode {
  const g = ctx.createGain();
  g.gain.value = level;
  g.connect(ctx.destination);
  return g;
}

function tone(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = "square",
  peak = 0.3,
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.04);
}

export function playBlockbustersSound(id: BlockbustersSoundId, muted: boolean): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const out = masterGain(ctx);
  const t = ctx.currentTime;

  switch (id) {
    case "pick":
      tone(ctx, out, 880, t, 0.08, "square", 0.22);
      tone(ctx, out, 1175, t + 0.07, 0.1, "square", 0.2);
      break;
    case "correct":
      tone(ctx, out, 523, t, 0.12, "triangle", 0.35);
      tone(ctx, out, 659, t + 0.1, 0.12, "triangle", 0.32);
      tone(ctx, out, 784, t + 0.2, 0.18, "triangle", 0.38);
      break;
    case "wrong":
      tone(ctx, out, 180, t, 0.25, "sawtooth", 0.28);
      tone(ctx, out, 140, t + 0.12, 0.3, "sawtooth", 0.25);
      break;
    case "steal":
      tone(ctx, out, 440, t, 0.06, "square", 0.2);
      tone(ctx, out, 554, t + 0.05, 0.06, "square", 0.2);
      tone(ctx, out, 659, t + 0.1, 0.14, "square", 0.28);
      break;
    case "win":
      for (let i = 0; i < 5; i++) {
        tone(ctx, out, 392 + i * 98, t + i * 0.11, 0.14, "triangle", 0.32);
      }
      break;
    default:
      break;
  }
}
