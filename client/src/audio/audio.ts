import type { Cue } from '@ms/shared';
import { getState } from '../state/store';

/**
 * Âm thanh bằng Web Audio để chạy ổn trên iPhone: chỉ cần "mở khoá" một lần
 * bằng thao tác chạm của người dùng. Lời quản trò phát nối nhau, không chồng.
 */

type Ctx = AudioContext;

let ctx: Ctx | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
let chain: Promise<void> = Promise.resolve();

function getCtx(): Ctx | null {
  if (ctx) return ctx;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

/** Gọi trong một thao tác chạm của người dùng (bấm nút). */
export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') void c.resume();
}

function load(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  if (!p) {
    p = (async () => {
      const c = getCtx();
      if (!c) return null;
      try {
        const res = await fetch(url);
        if (!res.ok) return null; // thiếu file: bỏ qua tiếng, chữ vẫn hiện
        return await c.decodeAudioData(await res.arrayBuffer());
      } catch {
        return null;
      }
    })();
    buffers.set(url, p);
  }
  return p;
}

function play(buf: AudioBuffer, volume = 1): Promise<void> {
  const c = getCtx();
  if (!c) return Promise.resolve();
  return new Promise((resolve) => {
    const src = c.createBufferSource();
    const gain = c.createGain();
    gain.gain.value = volume;
    src.buffer = buf;
    src.connect(gain).connect(c.destination);
    src.onended = () => resolve();
    src.start();
  });
}

const GM = (name: string) => `/audio/gm/${name}.mp3`;
const SFX = (name: string) => `/audio/sfx/${name}.mp3`;

const GM_KEYS = [
  'night_start', 'dawn', 'vote_start',
  'cupid_wake', 'cupid_sleep', 'traitor_wake', 'traitor_sleep',
  'guard_wake', 'guard_sleep', 'wolf_wake', 'wolf_wake_short', 'wolf_sleep',
  'alpha_wake', 'alpha_sleep', 'whitewolf_wake', 'whitewolf_sleep',
  'seer_wake', 'seer_sleep', 'witch_wake', 'witch_poison', 'witch_sleep',
  'psychic_wake', 'psychic_sleep',
  // Các lời gọi vai mới: chưa có file giọng thì chỉ hiện chữ.
  'sorceress_wake', 'sorceress_sleep', 'medium_wake', 'medium_sleep', 'detective_wake', 'detective_sleep',
];

export const PRELOAD = [
  ...GM_KEYS.map((k) => GM(`gm_${k}`)),
  SFX('wolf_howl'),
  SFX('dawn_birds'),
  SFX('hang'),
  SFX('gunshot'),
];

export function preloadAudio(): void {
  for (const url of PRELOAD) void load(url);
}

export function playCue(cue: Cue): void {
  if (cue.sfx) {
    void load(SFX(cue.sfx)).then((b) => {
      if (b) void play(b, 0.7);
    });
  }
  if (cue.audio && getState().narrationOn) {
    const url = GM(cue.audio);
    chain = chain.then(async () => {
      if (!getState().narrationOn) return;
      const b = await load(url);
      if (b) await play(b);
    });
  }
}
