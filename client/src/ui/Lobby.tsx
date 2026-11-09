import { useState } from 'react';
import { EDITABLE_TIMINGS, MAX_SEATS, ROLES, ROLE_IDS } from '@ms/shared';
import type { RoleId } from '@ms/shared';
import { GuideButton, HowToPlay } from './HowToPlay';
import { Emoji } from './RoleCard';
import { unlockAudio } from '../audio/audio';
import { kickSeat, leaveRoom, moveSeat, startGame, updateOptions, updateSettings, watchSeat } from '../net/socket';
import { useStore } from '../state/store';
import { secondsLeft, useServerNow } from './hooks';

export function Lobby() {
  const room = useStore((s) => s.room);
  const now = useServerNow();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [guide, setGuide] = useState(false);
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

  const chosen = room.options.roles;
  const copies = (r: RoleId) => chosen.filter((x) => x === r).length;
  const total = chosen.reduce((sum, r) => sum + ROLES[r].balance, 0);
  const unbalanced = chosen.length > 0 && (total < -3 || total > 3);
  const totalText = total > 0 ? `+${total}` : String(total);
  const maxOf = (r: RoleId) => (r === 'villager' ? MAX_SEATS : r === 'werewolf' ? 3 : 1);

  async function setRoles(roles: RoleId[]) {
    setError(null);
    const err = await updateOptions({ roles });
    if (err) setError(err);
  }

  async function toggleIntro(on: boolean) {
    setError(null);
    const err = await updateOptions({ intro: on });
    if (err) setError(err);
  }

  function change(r: RoleId, d: number) {
    if (d > 0) {
      if (copies(r) >= maxOf(r) || chosen.length >= MAX_SEATS) return;
      void setRoles([...chosen, r]);
    } else {
      const i = chosen.lastIndexOf(r);
      if (i >= 0) void setRoles(chosen.filter((_, k) => k !== i));
    }
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
                  {s.bot && <b>bot</b>}
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

        <div className="watch-row">
          <span className="muted small">Ghế xem (máy phát loa lời quản trò, không chơi):</span>
          {room.watchSeats.map((w, i) =>
            w ? (
              <span key={i} className={`seat taken${w.connected ? '' : ' off'}`}>
                <span className="seat-name">🔊 {w.name}</span>
                {isHost && inLobby && (
                  <button className="kick" title="Mời ra khỏi phòng" onClick={() => kick(MAX_SEATS + i)}>
                    ✕
                  </button>
                )}
              </span>
            ) : (
              <button
                key={i}
                className="seat empty"
                disabled={isHost || !!me?.inGame}
                title={isHost ? 'Chủ phòng cần ngồi ghế chơi' : undefined}
                onClick={() => watchSeat(i)}
              >
                Ghế xem
              </button>
            ),
          )}
        </div>

        <div className="muted small center">
          {count} người · cần {room.settings.minPlayers}–{room.settings.maxPlayers} người
        </div>

        {left !== null && <div className="countdown">Bắt đầu sau {left}s…</div>}

        <div className="settings">
          <label className="setting-row">
            <span>Thời gian đọc vai đầu ván ({Math.round(room.settings.introMs / 1000)}s)</span>
            <input
              type="checkbox"
              checked={room.options.intro}
              disabled={!isHost || !inLobby}
              onChange={(e) => void toggleIntro(e.target.checked)}
            />
          </label>
        </div>

        <button className="btn ghost small" onClick={() => setShowRoles((v) => !v)}>
          {chosen.length === 0
            ? 'Vai trong ván: chia ngẫu nhiên'
            : `Vai trong ván: đã chọn ${chosen.length}/${count}`}
          {showRoles ? ' ▲' : ' ▼'}
        </button>
        {chosen.length > 0 && (
          <div className={unbalanced ? 'error' : 'muted small center'}>
            {unbalanced
              ? `⚠️ Tổng điểm cân bằng ${totalText}, nằm ngoài khoảng −3 đến +3: ván sẽ lệch về một phe. Vẫn bắt đầu được nếu bạn muốn.`
              : `Tổng điểm cân bằng: ${totalText} (hợp lý, trong khoảng −3 đến +3)`}
          </div>
        )}
        {showRoles && (
          <div className="settings role-pick">
            {isHost && inLobby ? (
              <>
                <div className="muted small">
                  Chọn đúng {count} vai (bằng số người đang ngồi) hoặc xoá hết để máy tự chia cân bằng. Vai được xáo ngẫu nhiên cho từng người.
                </div>
                {ROLE_IDS.map((r) => (
                  <div key={r} className="setting-row">
                    <span>
                      <Emoji role={r} /> {ROLES[r].name}{' '}
                      <small className="muted">({ROLES[r].balance > 0 ? '+' : ''}{ROLES[r].balance})</small>
                    </span>
                    <span className="setting-input">
                      <button className="btn small ghost" disabled={copies(r) === 0} onClick={() => change(r, -1)}>
                        −
                      </button>
                      <b>{copies(r)}</b>
                      <button
                        className="btn small ghost"
                        disabled={copies(r) >= maxOf(r) || chosen.length >= MAX_SEATS}
                        onClick={() => change(r, 1)}
                      >
                        +
                      </button>
                    </span>
                  </div>
                ))}
                <button className="btn small ghost" disabled={chosen.length === 0} onClick={() => void setRoles([])}>
                  Xoá hết (chia ngẫu nhiên)
                </button>
              </>
            ) : (
              <div className="muted small">
                {chosen.length === 0
                  ? 'Chủ phòng chưa chọn vai, máy sẽ tự chia.'
                  : 'Vai trong ván: ' + chosen.map((r) => ROLES[r].name).join(', ')}
              </div>
            )}
          </div>
        )}

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

        <GuideButton onOpen={() => setGuide(true)} />
        {guide && <HowToPlay onClose={() => setGuide(false)} />}

        <button className="btn ghost" onClick={leaveRoom}>
          Rời phòng
        </button>
      </div>
    </div>
  );
}
