import * as THREE from 'three';
import type { IconId } from '@ms/shared';
import { EMOJI_FONT, ICON_EMOJI, iconColor } from '../icons';

const icons = new Map<IconId, THREE.Texture>();
const labels = new Map<string, THREE.Texture>();

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Biểu tượng trên đầu nhân vật: huy hiệu tròn màu kem, viền theo phe, hình emoji ở giữa,
 * cùng bộ hình với thẻ bài.
 */
export function iconTexture(id: IconId): THREE.Texture {
  let t = icons.get(id);
  if (!t) {
    t = canvasTexture(160, 160, (g) => {
      g.clearRect(0, 0, 160, 160);
      g.beginPath();
      g.arc(80, 80, 72, 0, Math.PI * 2);
      g.fillStyle = '#f8efd6';
      g.fill();
      g.lineWidth = 12;
      g.strokeStyle = iconColor(id);
      g.stroke();
      g.font = `84px ${EMOJI_FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = '#000';
      g.fillText(ICON_EMOJI[id], 80, 88);
    });
    icons.set(id, t);
  }
  return t;
}

/** Nhãn tên người chơi. */
export function labelTexture(text: string, color = '#ffffff'): THREE.Texture {
  const key = `l|${text}|${color}`;
  let t = labels.get(key);
  if (!t) {
    t = canvasTexture(512, 128, (g) => {
      g.clearRect(0, 0, 512, 128);
      g.font = '600 56px system-ui, "Segoe UI", sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const w = Math.min(480, g.measureText(text).width + 56);
      g.fillStyle = 'rgba(8,10,18,0.72)';
      g.beginPath();
      g.roundRect((512 - w) / 2, 22, w, 84, 42);
      g.fill();
      g.fillStyle = color;
      g.fillText(text, 256, 66, 440);
    });
    labels.set(key, t);
  }
  return t;
}

/** Số phiếu / lượt cắn. */
export function countTexture(n: number, color = '#ffd479'): THREE.Texture {
  const key = `c|${n}|${color}`;
  let t = labels.get(key);
  if (!t) {
    t = canvasTexture(128, 128, (g) => {
      g.clearRect(0, 0, 128, 128);
      g.fillStyle = 'rgba(8,10,18,0.85)';
      g.beginPath();
      g.arc(64, 64, 54, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 8;
      g.strokeStyle = color;
      g.stroke();
      g.font = '700 70px system-ui, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = color;
      g.fillText(String(n), 64, 70);
    });
    labels.set(key, t);
  }
  return t;
}
