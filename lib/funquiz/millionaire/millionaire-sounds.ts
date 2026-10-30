/** Original synthesized cues inspired by classic quiz-show pacing (not show recordings). */

export type MillionaireSoundId =
  | "select"
  | "lock"
  | "lifeline"
  | "fifty_fifty"
  | "phone_friend"
  | "ask_audience"
  | "reveal_correct"
  | "reveal_wrong"
  | "walkaway"
  | "win"
  | "question";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

function masterGain(ctx: AudioContext, level = 0.22): GainNode {
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
  type: OscillatorType = "sine",
  peak = 0.35,
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function playSelect(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  tone(ctx, out, 880, t, 0.08, "triangle", 0.2);
}

function playLock(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  tone(ctx, out, 440, t, 0.12, "square", 0.15);
  tone(ctx, out, 554, t + 0.1, 0.12, "square", 0.18);
  tone(ctx, out, 659, t + 0.22, 0.35, "square", 0.28);
}

function playLifeline(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    tone(ctx, out, f, t + i * 0.07, 0.18, "sine", 0.22);
  });
}

function playFiftyFifty(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  tone(ctx, out, 600, t, 0.15, "sawtooth", 0.12);
  tone(ctx, out, 400, t + 0.12, 0.2, "sawtooth", 0.14);
  tone(ctx, out, 220, t + 0.28, 0.25, "sine", 0.1);
}

function playPhoneFriend(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  for (let i = 0; i < 4; i++) {
    tone(ctx, out, 440, t + i * 0.35, 0.12, "sine", 0.2);
    tone(ctx, out, 480, t + i * 0.35 + 0.12, 0.12, "sine", 0.18);
  }
}

function playAskAudience(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.6;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 800;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  src.connect(filter);
  filter.connect(g);
  g.connect(out);
  src.start(t);
  src.stop(t + 0.6);
}

function playRevealCorrect(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  [523, 659, 784, 988, 1175].forEach((f, i) => {
    tone(ctx, out, f, t + i * 0.09, 0.22, "triangle", 0.25);
  });
}

function playRevealWrong(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  tone(ctx, out, 220, t, 0.5, "sawtooth", 0.2);
  tone(ctx, out, 185, t + 0.08, 0.55, "square", 0.15);
}

function playWalkaway(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  tone(ctx, out, 440, t, 0.25, "sine", 0.2);
  tone(ctx, out, 370, t + 0.2, 0.3, "sine", 0.18);
  tone(ctx, out, 294, t + 0.45, 0.45, "sine", 0.15);
}

function playWin(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  const scale = [523, 659, 784, 988, 1175, 1319, 1568];
  scale.forEach((f, i) => {
    tone(ctx, out, f, t + i * 0.11, 0.35, "triangle", 0.28);
  });
}

function playQuestion(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;
  tone(ctx, out, 330, t, 0.2, "sine", 0.12);
  tone(ctx, out, 440, t + 0.05, 0.35, "sine", 0.18);
}

const PLAYERS: Record<MillionaireSoundId, (ctx: AudioContext, out: GainNode) => void> = {
  select: playSelect,
  lock: playLock,
  lifeline: playLifeline,
  fifty_fifty: playFiftyFifty,
  phone_friend: playPhoneFriend,
  ask_audience: playAskAudience,
  reveal_correct: playRevealCorrect,
  reveal_wrong: playRevealWrong,
  walkaway: playWalkaway,
  win: playWin,
  question: playQuestion,
};

export function playMillionaireSound(id: MillionaireSoundId, muted: boolean): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const out = masterGain(ctx);
  PLAYERS[id]?.(ctx, out);
}

export function lifelineSoundId(
  lifeline: string,
): MillionaireSoundId {
  if (lifeline === "fifty_fifty") return "fifty_fifty";
  if (lifeline === "phone_a_friend") return "phone_friend";
  if (lifeline === "ask_audience") return "ask_audience";
  return "lifeline";
}
