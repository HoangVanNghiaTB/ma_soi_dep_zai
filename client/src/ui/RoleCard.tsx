import { useEffect, useState } from 'react';
import { FACTION_NAMES, ROLES, ROLE_IDS, cardLabel } from '@ms/shared';
import type { Faction, RoleDef, RoleId } from '@ms/shared';
import { ICON_EMOJI, THEME_COLOR, themeOf } from '../icons';

/** Hình emoji của một vai (dùng chung với biểu tượng trên đầu nhân vật). */
export function Emoji({ role, className = '' }: { role: RoleId | 'tomb' | 'wolf' | 'heart'; className?: string }) {
  return (
    <span className={`emoji ${className}`} aria-hidden="true">
      {ICON_EMOJI[role]}
    </span>
  );
}

const sign = (n: number): string => (n > 0 ? `+${n}` : String(n));

function RoleBody({ role }: { role: RoleDef }) {
  return (
    <>
      <ul className="abilities">
        {role.abilities.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <div className="goal">
        <b>Mục tiêu:</b> {role.goal}
      </div>
    </>
  );
}

/**
 * Thẻ bài Ma Sói theo mẫu: nền kem, viền màu theo phe, hàng đầu ghi "MA SÓI" và điểm,
 * hình emoji lớn, tên vai, nhãn phe và tác dụng ngắn gọn. Chạm vào thẻ để xem chi tiết.
 */
export function RoleCard({ roleId, intro = false, deck = [] }: { roleId: RoleId; intro?: boolean; deck?: RoleId[] }) {
  const role = ROLES[roleId];
  const theme = themeOf(roleId);
  const color = THEME_COLOR[theme];
  const [detail, setDetail] = useState(false);
  const [down, setDown] = useState(false);

  // Đầu ván: tự mở chi tiết để đọc, hết giờ đọc thì tự đóng.
  useEffect(() => {
    setDetail(intro);
    if (intro) setDown(false);
  }, [intro]);

  return (
    <>
      <div className="tcard-wrap">
        {down ? (
          <button className="tcard back" onClick={() => setDown(false)} aria-label="Thẻ đang úp, chạm để lật">
            <span className="back-moon">🌙</span>
            <span className="back-title">MA SÓI</span>
            <span className="tcard-more">Thẻ đang úp</span>
          </button>
        ) : (
          <button
            className="tcard"
            style={{ ['--theme' as string]: color }}
            onClick={() => setDetail(true)}
            aria-label={`Thẻ vai ${role.name}`}
          >
            <span className="tcard-top">
              <b>MA SÓI</b>
              <b>{sign(role.balance)}</b>
            </span>
            <Emoji role={roleId} className="tcard-emoji" />
            <span className="tcard-name">{role.name}</span>
            <span className={`tcard-pill ${theme}`}>{cardLabel(roleId)}</span>
            <span className={`tcard-effect${role.effect.length > 95 ? ' long' : ''}`}>{role.effect}</span>
            <span className="tcard-more">Chạm để xem chi tiết</span>
          </button>
        )}
        <button className="btn small tcard-flip" onClick={() => setDown((d) => !d)}>
          {down ? 'Lật thẻ' : 'Úp thẻ'}
        </button>
        {deck.length > 0 && (
          <div className="deck">
            <div className="deck-title">Vai trong ván này ({deck.length})</div>
            <div className="deck-list">
              {[...new Set(deck)].map((id) => {
                const n = deck.filter((r) => r === id).length;
                return (
                  <span key={id} className={`deck-chip ${ROLES[id].faction}`} title={ROLES[id].howTo}>
                    <Emoji role={id} />
                    <span className="deck-name">{ROLES[id].name}</span>
                    {n > 1 && <b>×{n}</b>}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {detail && (
        <div className="modal" onClick={() => setDetail(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <Emoji role={roleId} className="modal-emoji" />
            <h2>{role.name}</h2>
            <small className="muted">{FACTION_NAMES[role.faction]}</small>
            <div className="detail">
              <RoleBody role={role} />
            </div>
            {intro && <small className="muted">Tự đóng khi hết thời gian đọc vai</small>}
            <button className="btn" onClick={() => setDetail(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const FACTION_ORDER: Faction[] = ['village', 'wolf', 'third'];

/** Cách chơi của cả 15 vai, chia theo phe. */
export function RolesList({ only }: { only?: Faction } = {}) {
  return (
    <>
      {FACTION_ORDER.filter((f) => !only || f === only).map((f) => (
        <section key={f}>
          <h3 className={f}>{FACTION_NAMES[f]}</h3>
          {ROLE_IDS.filter((id) => ROLES[id].faction === f).map((id) => {
            const r = ROLES[id];
            return (
              <div key={id} className="guide-role">
                <Emoji role={id} className="guide-emoji" />
                <div>
                  <b>{r.name}</b>
                  <RoleBody role={r} />
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </>
  );
}

/** Danh sách cách chơi của cả 15 vai, để người mới tra cứu. */
export function RolesGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card guide" onClick={(e) => e.stopPropagation()}>
        <h2>Cách chơi các vai</h2>
        <div className="guide-scroll">
          <RolesList />
        </div>
        <button className="btn" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}
