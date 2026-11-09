import { useState } from 'react';
import { unlockAudio } from '../audio/audio';
import { GuideButton, HowToPlay } from './HowToPlay';
import { createRoom, joinRoom } from '../net/socket';
import { useStore } from '../state/store';

function loadName(): string {
  try {
    return localStorage.getItem('ms.name') ?? '';
  } catch {
    return '';
  }
}

export function Home() {
  const connected = useStore((s) => s.connected);
  const kickedMsg = useStore((s) => s.error);
  const [name, setName] = useState(loadName);
  const [code, setCode] = useState(() => new URLSearchParams(location.search).get('room') ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guide, setGuide] = useState(false);
  const [busy, setBusy] = useState(false);

  const cleanName = name.trim();

  async function run(fn: () => Promise<string | null>) {
    unlockAudio();
    if (!cleanName) {
      setError('Hãy nhập tên của bạn.');
      return;
    }
    try {
      localStorage.setItem('ms.name', cleanName);
    } catch {
      /* bỏ qua */
    }
    setBusy(true);
    setError(null);
    const err = await fn();
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <div className="home">
      <div className="home-card">
        <div className="logo">🐺</div>
        <h1>Ma Sói</h1>
        <p className="muted">Web làm quản trò và chia bài. Bạn bè ngồi quanh một bàn tròn.</p>

        <label className="field">
          <span>Tên của bạn</span>
          <input
            value={name}
            maxLength={16}
            placeholder="Ví dụ: Nghĩa"
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <button className="btn primary" disabled={!connected || busy} onClick={() => run(() => createRoom(cleanName))}>
          Tạo phòng mới
        </button>

        <div className="or">hoặc vào phòng có sẵn</div>

        <div className="row">
          <input
            className="code"
            value={code}
            maxLength={5}
            placeholder="MÃ PHÒNG"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button
            className="btn"
            disabled={!connected || busy || code.trim().length < 5}
            onClick={() => run(() => joinRoom(code.trim(), cleanName))}
          >
            Vào phòng
          </button>
        </div>

        {(error ?? kickedMsg) && <div className="error">{error ?? kickedMsg}</div>}
        {!connected && <div className="muted small">Đang kết nối tới server…</div>}
        <GuideButton onOpen={() => setGuide(true)} />
        {guide && <HowToPlay onClose={() => setGuide(false)} />}
      </div>
    </div>
  );
}
