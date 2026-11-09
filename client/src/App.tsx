import { useEffect, useState } from 'react';
import { connect } from './net/socket';
import { useStore } from './state/store';
import { GameScreen } from './ui/GameScreen';
import { Home } from './ui/Home';
import { Lobby } from './ui/Lobby';
import { Notice } from './ui/Notice';
import { WatchScreen } from './ui/WatchScreen';

const SEEN_KEY = 'ms.notice.seen';
function wasSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

interface Layout {
  /** Điện thoại đang cầm dọc: xoay cả giao diện 90° để luôn hiển thị theo chiều ngang. */
  rotated: boolean;
  /** Kích thước hiệu dụng (sau khi xoay), tính bằng px. */
  w: number;
  h: number;
}

function calcLayout(): Layout {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const touch = navigator.maxTouchPoints > 0;
  const rotated = touch && h > w && w <= 820;
  return rotated ? { rotated, w: h, h: w } : { rotated, w, h };
}

/** Theo dõi kích thước và hướng màn hình (kể cả lúc trình duyệt điện thoại báo kích thước muộn). */
function useLayout(): Layout {
  const [layout, setLayout] = useState(calcLayout);
  useEffect(() => {
    const update = () => setLayout(calcLayout());
    const delayed = () => {
      update();
      setTimeout(update, 250);
    };
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', delayed);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', delayed);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
  return layout;
}

export function App() {
  const room = useStore((s) => s.room);
  const view = useStore((s) => s.view);
  const layout = useLayout();
  const [seen, setSeen] = useState(wasSeen);

  useEffect(() => {
    connect();
  }, []);

  // Cầm dọc thì dựng một khung ngang (rộng = chiều cao máy, cao = chiều rộng máy) rồi xoay 90°.
  const style = layout.rotated
    ? { width: layout.w, height: layout.h, left: layout.h, top: 0 }
    : undefined;
  const compact = layout.h <= 560 || layout.w <= 700;
  const mini = layout.h <= 400;

  let screen;
  if (!room && !seen) {
    screen = (
      <Notice
        onContinue={() => {
          try {
            sessionStorage.setItem(SEEN_KEY, '1');
          } catch {
            /* bỏ qua */
          }
          setSeen(true);
        }}
      />
    );
  } else if (!room) screen = <Home />;
  else if (room.myWatch >= 0) screen = <WatchScreen />;
  else if (room.playing && view) screen = <GameScreen view={view} />;
  else screen = <Lobby />;

  return (
    <div
      className={`app${layout.rotated ? ' rotated' : ''}${compact ? ' compact' : ''}${mini ? ' mini' : ''}`}
      style={style}
    >
      {screen}
    </div>
  );
}
