import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { GameView } from '@ms/shared';
import { useStore } from '../state/store';
import { fmtClock, secondsLeft, useServerNow } from '../ui/hooks';
import { hintText, phaseTitle, winnerText } from '../ui/text';
import { TABLE_Y } from './constants';

const W = 1024;
const H = 512;

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

interface Content {
  title: string;
  timer: string | null;
  main: string;
  mainColor: string;
  hint: string;
}

function outlined(g: CanvasRenderingContext2D, text: string, x: number, y: number, fill: string): void {
  g.lineJoin = 'round';
  g.lineWidth = 14;
  g.strokeStyle = 'rgba(20, 10, 4, 0.92)';
  g.strokeText(text, x, y);
  g.fillStyle = fill;
  g.fillText(text, x, y);
}

/** Chữ viết thẳng lên mặt bàn: không khung, có viền tối để dễ đọc trên nền gỗ. */
function draw(g: CanvasRenderingContext2D, c: Content): void {
  g.clearRect(0, 0, W, H);
  g.textAlign = 'center';
  g.textBaseline = 'middle';

  // dòng trên: tên giai đoạn, đồng hồ
  g.font = '700 70px system-ui, "Segoe UI", sans-serif';
  outlined(g, c.title, c.timer ? W * 0.34 : W / 2, 66, '#f4e6c8');
  if (c.timer) {
    g.font = '800 100px system-ui, sans-serif';
    outlined(g, c.timer, W * 0.8, 66, '#ffd479');
  }

  // nội dung chính
  const hasMain = c.main.length > 0;
  const text = hasMain ? c.main : c.hint;
  const fill = hasMain ? c.mainColor : '#f4e6c8';
  const weight = hasMain ? 800 : 700;
  const hintSpace = hasMain && c.hint ? 100 : 20;
  const avail = H - 170 - hintSpace;

  // Chọn cỡ chữ lớn nhất mà vẫn vừa khung chữ nhật còn trống trên mặt bàn.
  let size = hasMain ? 96 : 80;
  let lines: string[] = [];
  let lineH = 0;
  for (; size >= 40; size -= 4) {
    g.font = `${weight} ${size}px system-ui, "Segoe UI", sans-serif`;
    lines = wrap(g, text, W - 100);
    lineH = size * 1.2;
    if (lines.length * lineH <= avail) break;
  }
  const top = 170 + (avail - lines.length * lineH) / 2 + lineH / 2;
  lines.forEach((l, i) => outlined(g, l, W / 2, top + i * lineH, fill));

  if (hasMain && c.hint) {
    g.font = '700 58px system-ui, sans-serif';
    outlined(g, c.hint, W / 2, H - 56, '#cfe0ff');
  }
}

/**
 * Bảng thông báo đặt trên mặt bàn: tên giai đoạn, đồng hồ, lời quản trò,
 * kết quả đêm / bỏ phiếu, người thắng. Nghiêng về phía camera cố định.
 */
export function TableDisplay({ view }: { view: GameView }) {
  const cue = useStore((s) => s.cue);
  const now = useServerNow(500);

  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [canvas]);

  const left = secondsLeft(view.phaseEndsAt, now);
  const cueText = cue && Date.now() < cue.until && cue.text ? cue.text : '';

  let main = '';
  let mainColor = '#ffffff';
  if (view.phase === 'END') {
    main = winnerText(view.winner);
    mainColor = '#ffd479';
  } else if (view.announce) {
    main = view.announce;
    mainColor = '#ffd479';
  } else if (cueText) {
    main = cueText;
  }

  const content: Content = {
    title: phaseTitle(view),
    timer: left !== null ? fmtClock(left) : null,
    main,
    mainColor,
    hint: hintText(view),
  };
  const key = JSON.stringify(content);

  useEffect(() => {
    const g = canvas.getContext('2d');
    if (!g) return;
    draw(g, content);
    texture.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, canvas, texture]);

  // Nằm phẳng ngay trên mặt bàn, đầu chữ hướng ra xa camera nên người xem đọc xuôi.
  return (
    <mesh position={[0, TABLE_Y + 0.04, 0.05]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
      <planeGeometry args={[4.0, 2.0]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
