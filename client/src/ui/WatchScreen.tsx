import { useEffect, useState } from 'react';
import { MAX_SEATS } from '@ms/shared';
import { unlockAudio } from '../audio/audio';
import { leaveRoom, moveSeat } from '../net/socket';
import { useStore } from '../state/store';

/** Màn hình ghế xem: chỉ để bật loa nghe quản trò gọi, không chơi. */
export function WatchScreen() {
  const room = useStore((s) => s.room);
  const cue = useStore((s) => s.cue);
  const [on, setOn] = useState(false);
  const [, tick] = useState(0);

  // Làm tươi để lời quản trò tự biến mất sau khi hết giờ hiển thị.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(t);
  }, []);

  if (!room) return null;
  const text = cue && Date.now() < cue.until && cue.text ? cue.text : '';
  const freeSeat = room.seats.findIndex((s) => s === null);
  const statusText =
    room.status === 'IN_GAME' ? 'Ván đang chạy' : room.status === 'COUNTDOWN' ? 'Sắp bắt đầu ván' : 'Đang chờ ở bàn chờ';

  return (
    <div className="home">
      <div className="home-card notice-card">
        <div className="notice-moon">🔊</div>
        <h1>Ghế xem · phòng {room.code}</h1>
        <p>
          Máy này chỉ dùng để <b>phát lời quản trò</b> qua loa cho mọi người cùng nghe. Không chơi, không xem vai của ai.
          Hãy đặt máy gần mọi người, bật to âm lượng và để màn hình sáng.
        </p>
        <button
          className={`btn ${on ? '' : 'primary'}`}
          onClick={() => {
            unlockAudio();
            setOn(true);
          }}
        >
          {on ? '🔊 Loa đã bật' : 'Bật loa'}
        </button>
        <div className="notice-rule">
          <b>{statusText}</b>
          <div className="muted small">{text ? `Quản trò: ${text}` : 'Lời quản trò sẽ hiện và phát ở đây.'}</div>
        </div>
        {freeSeat >= 0 && room.status !== 'IN_GAME' && (
          <button className="btn ghost small" onClick={() => moveSeat(Math.min(freeSeat, MAX_SEATS - 1))}>
            Chuyển sang ghế chơi
          </button>
        )}
        <button className="btn ghost" onClick={leaveRoom}>
          Rời phòng
        </button>
      </div>
    </div>
  );
}
