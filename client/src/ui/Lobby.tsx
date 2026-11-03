import { useState } from 'react';
import { EDITABLE_TIMINGS } from '@ms/shared';
import { unlockAudio } from '../audio/audio';
import { kickSeat, leaveRoom, moveSeat, startGame, updateSettings } from '../net/socket';
import { useStore } from '../state/store';
import { secondsLeft, useServerNow } from './hooks';

export function Lobby() {
  const room = useStore((s) => s.room);
  const now = useServerNow();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  if (!room) return null;

  const me = room.seats[room.mySeat];
  const isHost = !!me?.isHost;
  const inLobby = room.status === 'LOBBY';
  const count = room.seats.filter(Boolean).length;
  const left = room.status === 'COUNTDOWN' ? secondsLeft(room.countdownEndsAt, now) : null;
  const link = `${location.origin}/?room=${room.code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* bỏ qua */
    }
  }

  async function start() {
    unlockAudio();
    setError(null);
    const err = await startGame();
    if (err) setError(err);
  }

  async function kick(seat: number) {
    setError(null);
    const err = await kickSeat(seat);
    if (err) setError(err);
  }

  async function setTiming(key: string, seconds: number) {
    if (!Number.isFinite(seconds)) return;
    setError(null);
    const err = await updateSettings({ [key]: seconds });
    if (err) setError(err);
  }

  return (
    <div className="home">
      <div className="home-card wide">
        <div className="lobby-head">
          <div>
            <div className="muted small">Mã phòng</div>
            <div className="room-code">{room.code}</div>
          </div>
          <button className="btn small" onClick={copy}>
            {copied ? 'Đã chép link' : 'Chép link mời'}
          </button>
        </div>

        {room.status === 'IN_GAME' && !room.playing && (
          <div className="notice">Ván đang chạy. Bạn sẽ được chơi ở ván sau.</div>
        )}

        <div className="seat-grid">
          {room.seats.map((s, i) => {
            if (!s) {
              return (
                <button key={i} className="seat empty" disabled={!inLobby} onClick={() => moveSeat(i)}>
                  Ghế trống
                </button>
              );
            }
            const mine = i === room.mySeat;
            return (
              <div key={i} className={`seat taken${mine ? ' mine' : ''}${s.connected ? '' : ' off'}`}>
                <span className="seat-name">{s.name}</span>
                <span className="seat-tags">
                  {s.isHost && <b>chủ phòng</b>}
                  {mine && <b>bạn</b>}
                  {!s.connected && <b>mất mạng</b>}
                  {isHost && !mine && inLobby && (
                    <button className="kick" title="Mời ra khỏi phòng" onClick={() => kick(i)}>
                      ✕
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="muted small center">
          {count} người · cần {room.settings.minPlayers}–{room.settings.maxPlayers} người
        </div>

        {left !== null && <div className="countdown">Bắt đầu sau {left}s…</div>}

        <button className="btn ghost small" onClick={() => setShowSettings((v) => !v)}>
          {showSettings ? 'Ẩn thời gian' : 'Xem / chỉnh thời gian'}
        </button>
        {showSettings && (
          <div className="settings">
            {EDITABLE_TIMINGS.map((f) => {
              const value = Math.round((room.settings[f.key] as number) / 1000);
              return (
                <label key={f.key} className="setting-row">
                  <span>{f.label}</span>
                  <span className="setting-input">
                    <input
                      type="number"
                      min={f.min}
                      max={f.max}
                      key={value}
                      defaultValue={value}
                      disabled={!isHost || !inLobby}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== value) void setTiming(f.key, v);
                      }}
                    />
                    <small>giây</small>
                  </span>
                </label>
              );
            })}
            {!isHost && <div className="muted small">Chỉ chủ phòng chỉnh được.</div>}
          </div>
        )}

        {isHost ? (
          <button className="btn primary" disabled={!inLobby} onClick={start}>
            Bắt đầu ván
          </button>
        ) : (
          <div className="muted center">Chờ chủ phòng bắt đầu…</div>
        )}

        {error && <div className="error">{error}</div>}

        <button className="btn ghost" onClick={leaveRoom}>
          Rời phòng
        </button>
      </div>
    </div>
  );
}
