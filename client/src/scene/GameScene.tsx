import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { GameView, PlayerView } from '@ms/shared';
import { chooseSeat } from '../net/socket';
import { useStore } from '../state/store';
import type { ActiveFx } from '../state/store';
import { CAM_ELEV, CAM_FOV, TABLE_R, TABLE_Y } from './constants';
import { TableDisplay } from './TableDisplay';
import { countTexture, iconTexture, labelTexture } from './textures';

/** Ghế của mình luôn ở phía gần camera (góc 0), các ghế khác xếp theo vòng. */
function seatAngle(i: number, n: number, my: number): number {
  return (2 * Math.PI * ((i - my + n) % n)) / n;
}

function seatRadius(n: number): number {
  return n <= 6 ? 3.7 : n <= 10 ? 4.0 : 4.9;
}

function seatPos(i: number, n: number, r: number, my: number): THREE.Vector3 {
  const a = seatAngle(i, n, my);
  return new THREE.Vector3(Math.sin(a) * r, 0, Math.cos(a) * r);
}

const BODY_COLORS = [
  '#e07a5f', '#81b29a', '#f2cc8f', '#6d8ee0', '#c77dff',
  '#4cc9f0', '#f4a261', '#90be6d', '#ef476f', '#b8c0ff',
  '#2ec4b6', '#ffbf69', '#9d4edd', '#06d6a0', '#e5989b',
];

// ---------------------------------------------------------------- camera

/** Camera cố định kiểu MOBA: nhìn chéo từ trên xuống, không xoay, không đổi theo ghế. */
const LOOK_AT = new THREE.Vector3(0, 0.5, 0.9);

function CameraRig({ n }: { n: number }) {
  const { camera, size, gl } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    // Màn hình rộng: dịch bàn sang trái, chừa khoảng trống bên phải cho thẻ bài.
    const shift = aspect > 1.25 ? 0.15 : 0;
    const usable = 1 - 2 * shift;
    const halfW = seatRadius(n) + 1.5; // nửa bề ngang cần nhìn thấy
    const halfH = (seatRadius(n) + 0.7) * Math.sin(CAM_ELEV) + 1.9; // nửa bề dọc (đã chiếu, gồm cả biểu tượng trên đầu)
    const tanV = Math.tan((CAM_FOV * Math.PI) / 360);
    const dist = Math.max(halfH / tanV, halfW / (tanV * aspect * usable), 9);
    cam.fov = CAM_FOV;
    cam.position.set(
      LOOK_AT.x,
      LOOK_AT.y + Math.sin(CAM_ELEV) * dist,
      LOOK_AT.z + Math.cos(CAM_ELEV) * dist,
    );
    cam.lookAt(LOOK_AT);
    // Dịch cả cảnh xuống một chút để biểu tượng của người ngồi đối diện không bị cắt ở mép trên.
    const down = 0.06 * size.height;
    cam.setViewOffset(size.width, size.height, shift * size.width, -down, size.width, size.height);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);

    // Báo cho giao diện biết bàn đang nằm đâu trên màn hình để lớp tối ban đêm soi đúng giữa bàn.
    const host = gl.domElement.closest('.game') as HTMLElement | null;
    if (host) {
      const c = new THREE.Vector3(0, TABLE_Y, 0.05).project(cam);
      const e = new THREE.Vector3(TABLE_R, TABLE_Y, 0.05).project(cam);
      const cx = (c.x * 0.5 + 0.5) * size.width;
      const cy = (-c.y * 0.5 + 0.5) * size.height;
      const rx = Math.abs((e.x - c.x) * 0.5 * size.width);
      host.style.setProperty('--tx', `${cx}px`);
      host.style.setProperty('--ty', `${cy}px`);
      host.style.setProperty('--tr', `${rx}px`);
    }
  }, [camera, gl, size.width, size.height, n]);
  return null;
}

// ------------------------------------------------------------- nhân vật

function Sprite({
  map,
  position,
  scale,
  depthTest = false,
}: {
  map: THREE.Texture;
  position: [number, number, number];
  scale: [number, number, number];
  depthTest?: boolean;
}) {
  return (
    <sprite position={position} scale={scale} renderOrder={10}>
      <spriteMaterial map={map} transparent depthTest={depthTest} />
    </sprite>
  );
}

interface CharacterProps {
  p: PlayerView;
  n: number;
  my: number;
  radius: number;
  isMe: boolean;
  chooseable: boolean;
  pointed: boolean;
  hovered: boolean;
  onHover: (seat: number | null) => void;
  onChoose: (seat: number) => void;
  night: boolean;
}

function Character({ p, n, my, radius, isMe, chooseable, pointed, hovered, onHover, onChoose, night }: CharacterProps) {
  const a = seatAngle(p.seat, n, my);
  const pos = seatPos(p.seat, n, radius, my);
  const color = BODY_COLORS[p.seat % BODY_COLORS.length];
  const chord = 2 * radius * Math.sin(Math.PI / n);
  const hitR = Math.min(1.0, chord * 0.46);
  const glow = pointed ? '#ffd479' : hovered && chooseable ? '#ffffff' : null;

  const nameTex = useMemo(
    () => labelTexture(p.name + (p.connected ? '' : ' (mất mạng)'), isMe ? '#ffd479' : '#ffffff'),
    [p.name, p.connected, isMe],
  );

  return (
    <group position={pos} rotation={[0, a + Math.PI, 0]}>
      {/* ghế */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.55, 0.5, 0.14, 20]} />
        <meshStandardMaterial color="#3b2a20" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, -0.5]}>
        <boxGeometry args={[0.95, 0.9, 0.12]} />
        <meshStandardMaterial color="#3b2a20" roughness={0.9} />
      </mesh>

      {p.alive ? (
        <group>
          <mesh position={[0, 0.98, 0]} castShadow>
            <capsuleGeometry args={[0.36, 0.55, 6, 14]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.68, 0]} castShadow>
            <sphereGeometry args={[0.31, 20, 16]} />
            <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.08} />
          </mesh>
          <mesh position={[-0.11, 1.72, 0.27]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#111" />
          </mesh>
          <mesh position={[0.11, 1.72, 0.27]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#111" />
          </mesh>
          {/* súng của Thợ Săn khi đến lượt bắn: một khẩu súng thật đơn giản */}
          {p.armed && (
            <group position={[0.42, 1.25, 0.55]}>
              <mesh>
                <boxGeometry args={[0.1, 0.14, 0.62]} />
                <meshStandardMaterial color="#2b2f3a" metalness={0.6} roughness={0.35} />
              </mesh>
              <mesh position={[0, -0.16, -0.2]} rotation={[0.35, 0, 0]}>
                <boxGeometry args={[0.1, 0.28, 0.12]} />
                <meshStandardMaterial color="#5a3b28" roughness={0.8} />
              </mesh>
            </group>
          )}
          {/* tay đặt lên bàn */}
          <mesh position={[-0.34, 1.0, 0.3]} rotation={[0.9, 0, 0.2]}>
            <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0.34, 1.0, 0.3]} rotation={[0.9, 0, -0.2]}>
            <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      ) : (
        <group position={[0, 0, 0.1]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.95, 1.1, 0.4]} />
            <meshStandardMaterial color="#aab2c0" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.475, 0.475, 0.4, 24]} />
            <meshStandardMaterial color="#aab2c0" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.2, 0.35]} scale={[1.2, 0.5, 1]}>
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshStandardMaterial color="#5b4636" roughness={1} />
          </mesh>
        </group>
      )}

      {/* vòng sáng dưới chân */}
      {glow && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.0, 40]} />
          <meshBasicMaterial color={glow} transparent opacity={pointed ? 0.95 : 0.6} />
        </mesh>
      )}

      {/* nhãn trên đầu: các sprite luôn quay về camera nên đặt theo toạ độ nhóm */}
      <Sprite map={nameTex} position={[0, p.alive ? 2.25 : 1.75, 0]} scale={[2.1, 0.52, 1]} />
      {p.mark && (
        <Sprite
          map={iconTexture(p.mark)}
          position={[0.7, p.alive ? 3.3 : 2.75, 0]}
          scale={[0.55, 0.55, 1]}
        />
      )}
      {p.icon && (
        <Sprite
          map={iconTexture(p.icon)}
          position={[0, p.alive ? 3.3 : 2.75, 0]}
          scale={isMe ? [0.95, 0.95, 1] : [0.8, 0.8, 1]}
        />
      )}
      {p.count !== null && p.count > 0 && (
        <Sprite
          map={countTexture(p.count, night ? '#ff8f8f' : '#ffd479')}
          position={[0, p.alive ? 4.15 : 3.6, 0]}
          scale={[0.7, 0.7, 1]}
        />
      )}

      {/* vùng bấm: trong suốt nhưng vẫn nhận chuột / chạm */}
      <mesh
        position={[0, 1.1, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(p.seat);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          if (chooseable) onChoose(p.seat);
        }}
      >
        <cylinderGeometry args={[hitR, hitR, 2.6, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ------------------------------------------------- tia nối con trỏ giữa hai ghế

function Beam({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const { mid, len, quat } = useMemo(() => {
    const a = from.clone().setY(1.5);
    const b = to.clone().setY(1.5);
    const dir = b.clone().sub(a);
    const length = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { mid: a.clone().add(b).multiplyScalar(0.5), len: length, quat: q };
  }, [from, to]);
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.04, 0.04, len, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

// ------------------------------------------------------------------- bàn

function Table() {
  return (
    <group>
      <mesh position={[0, TABLE_Y - 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[TABLE_R, TABLE_R, 0.2, 48]} />
        <meshStandardMaterial color="#5a3b28" roughness={0.75} />
      </mesh>
      <mesh position={[0, TABLE_Y + 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[TABLE_R - 0.12, 48]} />
        <meshStandardMaterial color="#7a5239" roughness={0.6} />
      </mesh>
      <mesh position={[0, TABLE_Y + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.45, 1.5, 64]} />
        <meshBasicMaterial color="#d9b382" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, TABLE_Y / 2 - 0.2, 0]}>
        <cylinderGeometry args={[0.35, 0.6, TABLE_Y, 16]} />
        <meshStandardMaterial color="#3b2a20" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Floor({ night }: { night: boolean }) {
  return (
    <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[60, 64]} />
      <meshStandardMaterial color={night ? '#1c2030' : '#4a5578'} roughness={1} />
    </mesh>
  );
}

// ------------------------------------------------------------------ cảnh

function Lights({ view }: { view: GameView }) {
  const night = view.phase === 'NIGHT';
  const bright = !night || view.awake;
  const spectator = !view.me.alive;
  const ambient = night ? (view.awake ? 0.55 : spectator ? 0.3 : 0.08) : 0.85;
  const sun = night ? (view.awake ? 0.5 : 0.02) : 1.1;
  return (
    <>
      <ambientLight intensity={ambient} color={night ? '#8ea2ff' : '#fff4e0'} />
      <directionalLight
        position={[4, 9, 5]}
        intensity={sun}
        color={night ? '#9db0ff' : '#ffe9c4'}
        castShadow
      />
      {/* vệt sáng mờ giữa bàn */}
      {/* Ban đêm tối: chỉ có một vệt sáng mờ ngay trên mặt bàn, không soi tới các ghế */}
      <pointLight position={[0, 1.7, 0]} intensity={night && !bright ? 3.2 : 1.2} distance={night && !bright ? 3.6 : 5} decay={2} color="#ffd9a0" />
    </>
  );
}

function World({ view }: { view: GameView }) {
  const n = view.players.length;
  const radius = seatRadius(n);
  const my = view.me.seat;
  const prompt = view.prompt;
  const pointing = useStore((s) => s.pointing);
  const fx = useStore((s) => s.fx);
  const [hover, setHover] = useState<number | null>(null);
  const night = view.phase === 'NIGHT';
  const targets = useMemo(() => new Set(prompt?.targets ?? []), [prompt]);

  // Công cụ thử nghiệm (chỉ khi mở trang với ?debug): cho biết ghế đang nằm ở đâu trên màn hình.
  const { camera, size } = useThree();
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('debug')) return;
    (window as unknown as Record<string, unknown>).__ms = {
      pos: (seat: number) => {
        camera.updateMatrixWorld(true);
        const v = seatPos(seat, n, radius, my).setY(1.3).project(camera);
        return { x: (v.x * 0.5 + 0.5) * size.width, y: (-v.y * 0.5 + 0.5) * size.height };
      },
    };
  });

  // Người chết xem được cả đêm; người sống mà màn hình tối thì không thấy gì về hành động của ai.
  const blind = night && !view.awake && view.me.alive;
  const bg = night && !view.awake ? '#04050a' : night ? '#0a0e1c' : '#1b2640';
  const players = useMemo(
    () => (blind ? view.players.map((p) => ({ ...p, count: null })) : view.players),
    [blind, view.players],
  );

  const beams = Object.entries(blind ? {} : view.pointers).flatMap(([from, to]) => {
    if (to === null || to === undefined) return [];
    const f = Number(from);
    if (f === my) return []; // mình đã có đường chỉ riêng
    return [{ f, t: to }];
  });

  return (
    <>
      <color attach="background" args={[bg]} />
      <Lights view={view} />
      <CameraRig n={n} />
      <TableDisplay view={view} />
      <Floor night={night} />
      <Table />
      {players.map((p) => (
        <Character
          key={p.seat}
          p={p}
          n={n}
          my={my}
          radius={radius}
          isMe={p.seat === my}
          chooseable={targets.has(p.seat)}
          pointed={!blind && (pointing.includes(p.seat) || Object.values(view.pointers).includes(p.seat))}
          hovered={hover === p.seat}
          onHover={setHover}
          onChoose={chooseSeat}
          night={night}
        />
      ))}
      {beams.map((b) => (
        <Beam
          key={`${b.f}-${b.t}`}
          from={seatPos(b.f, n, radius, my)}
          to={seatPos(b.t, n, radius, my)}
          color={BODY_COLORS[b.f % BODY_COLORS.length]}
        />
      ))}
      {!blind &&
        pointing.map((t) => (
          <Beam
            key={`me-${t}`}
            from={seatPos(my, n, radius, my)}
            to={seatPos(t, n, radius, my)}
            color={BODY_COLORS[my % BODY_COLORS.length]}
          />
        ))}
      {fx.map((f) => (
        <FxItem key={f.seq} fx={f} n={n} radius={radius} my={my} />
      ))}
    </>
  );
}

/** Đạn của Thợ Săn bay thẳng; bình thuốc của Phù Thủy bay theo cung (xanh lá = cứu, tím = độc). */
function FxItem({ fx, n, radius, my }: { fx: ActiveFx; n: number; radius: number; my: number }) {
  const ref = useRef<THREE.Group>(null);
  const from = useMemo(() => seatPos(fx.from, n, radius, my).setY(1.5), [fx.from, n, radius, my]);
  const to = useMemo(() => seatPos(fx.to, n, radius, my).setY(1.5), [fx.to, n, radius, my]);
  const dur = fx.kind === 'shoot' ? 500 : 1000;

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = Math.min(1, (Date.now() - fx.at) / dur);
    g.position.lerpVectors(from, to, t);
    if (fx.kind === 'potion') g.position.y += Math.sin(Math.PI * t) * 1.8;
    g.rotation.z = t * 9;
    g.visible = t < 1;
  });

  return (
    <group ref={ref} renderOrder={12}>
      {fx.kind === 'shoot' ? (
        <mesh>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshBasicMaterial color={fx.color} />
        </mesh>
      ) : (
        <>
          <mesh>
            <sphereGeometry args={[0.24, 14, 14]} />
            <meshStandardMaterial color={fx.color} emissive={fx.color} emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 0.22, 10]} />
            <meshStandardMaterial color="#d9d2c0" />
          </mesh>
        </>
      )}
    </group>
  );
}

export function GameScene({ view }: { view: GameView }) {
  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.75]}
      camera={{ fov: CAM_FOV, near: 0.1, far: 120, position: [0, 10, 10] }}
      gl={{ antialias: true }}
      // Đo kích thước bằng offsetWidth/offsetHeight (không bị CSS xoay làm đảo chiều) để chạy đúng khi điện thoại cầm dọc.
      resize={{ offsetSize: true, scroll: false }}
      style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
    >
      <World view={view} />
    </Canvas>
  );
}
