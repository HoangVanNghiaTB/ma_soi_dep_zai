import { useEffect, useRef, useState } from 'react';
import { ROLES } from '@ms/shared';
import type { GameView } from '@ms/shared';
import { unlockAudio } from '../audio/audio';
import {
  leaveRoom,
  pauseGame,
  resumeGame,
  sendAct,
  sendSkip,
  sendSkipDiscuss,
  sendWolfChat,
} from '../net/socket';
import { GameScene } from '../scene/GameScene';
import { setState, useStore } from '../state/store';
import { useServerNow } from './hooks';
import { Emoji, RoleCard, RolesGuide } from './RoleCard';
import { winnerText } from './text';

/** Khung chat riêng của bầy Sói: chỉ hiện đúng lượt bầy Sói. */
function WolfChat() {
  const msgs = useStore((s) => s.wolfChat);
  const [text, setText] = useState('');
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [msgs.length]);

  function send() {
    const t = text.trim();
    if (!t) return;
    sendWolfChat(t);
    setText('');
  }

  return (
    <div className="panel chat">
      <div className="panel-title">Chat bầy Sói</div>
      <div className="chat-list" ref={box}>
        {msgs.length === 0 && <div className="muted small">Bàn bạc người cần cắn…</div>}
        {msgs.map((m, i) => (
          <div key={i} className="chat-line">
            <b>{m.name}:</b> {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={text}
          maxLength={120}
          placeholder="Nhắn cho bầy Sói"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
        />
        <button className="btn small" onClick={send}>
          Gửi
        </button>
      </div>
    </div>
  );
}

/** Ghi chú kết quả riêng (Tiên Tri, Ngoại Cảm) và, với người chết, ai làm gì đêm nay. */
function InfoPanel({ view }: { view: GameView }) {
  const lines = view.feed ?? [];
  if (view.notes.length === 0 && lines.length === 0) return null;
  return (
    <div className="panel info">
      {view.notes.length > 0 && (
        <>
          <div className="panel-title">Kết quả của bạn</div>
          {view.notes.map((n) => (
            <div key={n} className="info-line">
              {n}
            </div>
          ))}
        </>
      )}
      {lines.length > 0 && (
        <>
          <div className="panel-title">Ban đêm (bạn xem được)</div>
          {lines.map((l, i) => (
            <div key={i} className="info-line">
              {l}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Lớp giao diện phủ lên cảnh 3D. Mọi thông báo (giai đoạn, đồng hồ, lời quản trò,
 * kết quả) nằm trên mặt bàn trong cảnh; ở đây chỉ còn những thứ cần bấm được.
 */
function Hud({ view }: { view: GameView }) {
  const now = useServerNow();
  const pointing = useStore((s) => s.pointing);
  const narrationOn = useStore((s) => s.narrationOn);
  const isHost = useStore((s) => !!s.room?.seats[s.room.mySeat]?.isHost);
  const [showGuide, setShowGuide] = useState(false);

  const prompt = view.prompt;
  const spectator = !view.me.alive;
  const picked = pointing.map((s) => view.players[s]).filter(Boolean);
  const ready = !!prompt && (prompt.pick === 0 || picked.length === prompt.pick);
  const canSkipDiscuss =
    view.phase === 'DAY_DISCUSS' &&
    view.me.alive &&
    view.skipDiscussAt !== null &&
    now >= view.skipDiscussAt;

  let confirmText = prompt?.label ?? '';
  if (prompt && picked.length > 0) confirmText = `${prompt.label}: ${picked.map((p) => p.name).join(' & ')}`;

  return (
    <>
      <div
        className={`night-dim${view.phase === 'NIGHT' && !view.awake ? ' on' : ''}${spectator ? ' spectator' : ''}`}
      />

      <div className="hud-tools">
        <button
          className="icon-btn"
          title="Bật / tắt giọng quản trò"
          onClick={() => setState({ narrationOn: !narrationOn })}
        >
          {narrationOn ? '🔊' : '🔇'}
        </button>
        <button className="icon-btn" title="Cách chơi các vai" onClick={() => setShowGuide(true)}>
          📖
        </button>
        {isHost && view.phase !== 'END' && (
          <button
            className="icon-btn"
            title={view.paused ? 'Tiếp tục ván' : 'Tạm dừng ván'}
            onClick={view.paused ? resumeGame : pauseGame}
          >
            {view.paused ? '▶️' : '⏸️'}
          </button>
        )}
        <button className="icon-btn" title="Rời ván" onClick={leaveRoom}>
          🚪
        </button>
      </div>

      <RoleCard roleId={view.me.role} intro={view.phase === 'INTRO'} />

      <div className="left-stack">
        {view.canChat && <WolfChat />}
        <InfoPanel view={view} />
      </div>

      <div className="action-bar">
        {prompt && (
          <>
            {prompt.info && <div className="info-pill">{prompt.info}</div>}
            <div className="actions">
              <button
                className="btn primary"
                disabled={!ready}
                onClick={() => {
                  unlockAudio();
                  if (ready) sendAct(prompt.kind, pointing);
                }}
              >
                {confirmText}
              </button>
              <button className="btn" onClick={sendSkip}>
                {prompt.skipLabel}
              </button>
            </div>
            <div className="warn">
              {prompt.pick === 0
                ? `Bấm ${prompt.label} hoặc ${prompt.skipLabel}. Bấm là chốt, không đổi ý được.`
                : prompt.pick === 2
                  ? `Chạm vào hai người (đã chọn ${picked.length}/2), rồi bấm ${prompt.label}. Bấm là chốt, không đổi ý được.`
                  : `Chạm vào người cần chọn, rồi bấm ${prompt.label}. Bấm là chốt, không đổi ý được.`}
            </div>
          </>
        )}

        {canSkipDiscuss && (
          <button className="btn" disabled={view.hasSkippedDiscuss} onClick={sendSkipDiscuss}>
            {view.hasSkippedDiscuss ? 'Đã bấm bỏ qua thảo luận' : 'Bỏ qua thảo luận'}
          </button>
        )}
      </div>

      {view.paused && (
        <div className="paused">
          <b>Ván đang tạm dừng</b>
          <span>{isHost ? 'Bấm ▶️ để tiếp tục.' : 'Chờ chủ phòng tiếp tục.'}</span>
        </div>
      )}

      {showGuide && <RolesGuide onClose={() => setShowGuide(false)} />}
      {view.phase === 'END' && <EndScreen view={view} />}
    </>
  );
}

function EndScreen({ view }: { view: GameView }) {
  const now = useServerNow();
  const left = view.phaseEndsAt !== null ? Math.max(0, Math.ceil((view.phaseEndsAt - now) / 1000)) : null;
  return (
    <div className="end-panel">
      <h2 className="win">{winnerText(view.winner)}</h2>
      <div className="role-list">
        {view.players.map((p) => {
          const r = view.roles?.[p.seat];
          return (
            <div key={p.seat} className={`role-row${p.alive ? '' : ' dead'}`}>
              {r && <Emoji role={r} className="role-emoji" />}
              <span className="rn">{p.name}</span>
              <span className="rr">{r ? ROLES[r].name : ''}</span>
            </div>
          );
        })}
      </div>
      <div className="muted small center">{left !== null ? `Về bàn chờ sau ${left}s…` : ''}</div>
      <button className="btn small" onClick={leaveRoom}>
        Rời phòng
      </button>
    </div>
  );
}

export function GameScreen({ view }: { view: GameView }) {
  return (
    <div className="game">
      <GameScene view={view} />
      <Hud view={view} />
    </div>
  );
}
