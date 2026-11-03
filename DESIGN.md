# Thiết kế kỹ thuật: web Ma Sói 3D

Tài liệu thiết kế để bắt tay vào lập trình. **Luật chơi, vai trò và trải nghiệm** nằm ở [DE_XUAT_MA_SOI.md](DE_XUAT_MA_SOI.md), lời quản trò ở [KICH_BAN_QUAN_TRO.md](KICH_BAN_QUAN_TRO.md). Tài liệu này chỉ nói **làm thế nào**: kiến trúc, dữ liệu, máy trạng thái, giao thức mạng, cảnh 3D, âm thanh. Gặp mâu thuẫn thì DE_XUAT_MA_SOI.md là nguồn đúng về luật.

Các lựa chọn công nghệ ở mục 2 là **đề xuất**, đổi được nếu bạn quen công cụ khác.

## 1. Mục tiêu và phạm vi

- Web riêng thay thẻ bài và quản trò cho nhóm ngồi chung phòng hoặc gọi Discord. Không mic, không voice.
- 5 đến 10 người một phòng, mỗi người một ghế cố định quanh bàn tròn 3D, chỉ xoay nhìn.
- Server là quản trò tự động và là **nguồn sự thật duy nhất**. Trình duyệt chỉ hiển thị và gửi lựa chọn.
- Không tài khoản, không cơ sở dữ liệu, không điểm. Phòng sống trong bộ nhớ server, mất khi server khởi động lại.
- Chạy được trên điện thoại (chạm để chọn).

**Ngoài phạm vi** (để sau): bot lấp chỗ trống, chọn bộ vai thủ công, bảng xếp hạng, voice, chat ban ngày.

## 2. Công nghệ đề xuất

| Phần | Chọn | Lý do |
|---|---|---|
| Ngôn ngữ | TypeScript cả client và server | Dùng chung kiểu dữ liệu giao thức và hằng số luật. |
| Server | Node.js + Socket.IO | Có sẵn phòng (room), tự nối lại, dự phòng khi mạng chập chờn. |
| Client | Vite + React (giao diện HTML) | Bảng chọn, nút, chat, thẻ giải thích vai làm bằng HTML dễ hơn vẽ trong 3D. |
| 3D | three.js (qua @react-three/fiber) | Phổ biến, chạy tốt trên điện thoại nếu giữ cảnh đơn giản. |
| Âm thanh | Web Audio / thẻ audio | Hàng đợi lời quản trò, hiệu ứng, mở khoá phát tiếng trên iPhone. |
| Kiểm thử | Vitest | Chạy được logic luật không cần trình duyệt. |

Triển khai: **một tiến trình Node** phục vụ cả file tĩnh của client và WebSocket, đặt sau HTTPS. Một tiến trình thì phòng nằm trong bộ nhớ là đủ, không cần Redis. Chạy trên **Render** (xem mục 19).

## 3. Kiến trúc tổng thể

```
 Trình duyệt (nhiều người)                       Server (Node)
┌───────────────────────────┐   WebSocket   ┌──────────────────────────────┐
│ React UI  ── HTML overlay │ ───────────►  │ net/        nhận sự kiện     │
│ three.js  ── cảnh 3D      │  hành động    │ rooms/      quản lý phòng    │
│ audio/    ── giọng + sfx  │ ◄───────────  │ game/       máy trạng thái,  │
│ state/    ── view của mình│  view riêng   │             luật, chia vai   │
└───────────────────────────┘  từng người   │ views/      lọc thông tin    │
                                            └──────────────────────────────┘
```

Nguyên tắc:

1. **Server quyết mọi thứ**: giờ, giai đoạn, kết quả, ai thấy gì. Client không tự suy ra thông tin ẩn.
2. **Mỗi người nhận một "view" riêng** do server lọc (mục 8). Không bao giờ gửi vai người khác xuống máy ai khác trừ khi luật cho phép.
3. Logic luật là **hàm thuần** (nhận trạng thái và hành động, trả trạng thái mới), tách khỏi mạng để kiểm thử được.

## 4. Cấu trúc thư mục

```
ma_soi_off/
├─ shared/                  Kiểu dữ liệu, hằng số, định nghĩa vai, giao thức
│  ├─ roles.ts              15 vai: phe, điểm cân bằng, có lượt đêm không
│  ├─ protocol.ts           Tên sự kiện + kiểu payload
│  └─ config.ts             Các mốc thời gian mặc định
├─ server/src/
│  ├─ index.ts              Khởi động HTTP + Socket.IO
│  ├─ net/                  Đăng ký sự kiện, kiểm tra hợp lệ
│  ├─ rooms/                Phòng, ghế, chủ phòng, nối lại
│  ├─ game/
│  │  ├─ machine.ts         Máy trạng thái ván
│  │  ├─ deal.ts            Rút và chia vai
│  │  ├─ nightSteps.ts      Dựng danh sách lượt gọi trong đêm
│  │  ├─ resolve.ts         Tính kết quả đêm, bỏ phiếu, Thợ Săn
│  │  └─ win.ts             Kiểm tra thắng thua
│  └─ views/                Hàm viewFor(người) lọc thông tin
├─ client/
│  ├─ public/audio/         gm/ (giọng quản trò) và sfx/
│  └─ src/
│     ├─ scene/             Bàn, ghế, nhân vật, bia mộ, hiệu ứng
│     ├─ ui/                Bảng chọn, nút chốt, chat Sói, thẻ vai
│     ├─ audio/             Hàng đợi quản trò, mở khoá âm thanh
│     ├─ net/               Kết nối, nối lại, đồng hồ lệch giờ
│     └─ state/             Kho view hiện tại của mình
└─ tests/                   Kiểm thử luật và mô phỏng bot
```

Giọng quản trò đã được chuyển vào `client/public/audio/gm/` và **đổi tên theo bảng `gm_<tên>.mp3`** trong KICH_BAN_QUAN_TRO.md; hiệu ứng ở `client/public/audio/sfx/`. Thư mục `sounds-quanTro` ở gốc chỉ còn một file thừa (bản sao `(1)` của câu gọi Nhà Ngoại Cảm).

## 5. Mô hình dữ liệu (server)

```ts
type Phase =
  | 'LOBBY' | 'COUNTDOWN' | 'NIGHT' | 'DAWN'
  | 'DAY_DISCUSS' | 'DAY_VOTE' | 'EXECUTION' | 'END';

interface Room {
  code: string;                 // mã phòng, 5 ký tự
  hostId: string;               // chủ phòng
  seats: (SeatPlayer | null)[]; // 10 ghế cố định
  settings: Timings;            // các mốc thời gian chủ phòng chỉnh
  game: Game | null;            // null khi đang ở bàn chờ
  paused: boolean;
}

interface SeatPlayer {
  sessionId: string;            // nhận diện khi nối lại
  name: string;
  connected: boolean;
  lastSeenAt: number;
}

interface Game {
  phase: Phase;
  phaseEndsAt: number | null;   // mốc giờ server
  night: number;                // đêm thứ mấy, từ 1
  players: PlayerState[];       // đúng thứ tự quanh bàn
  nightPlan: NightStep[];       // danh sách lượt gọi của đêm này
  stepIndex: number;
  pending: NightActions;        // lựa chọn đã chốt trong đêm
  votes: Record<SeatIdx, SeatIdx | 'skip'>;
  flags: GameFlags;             // xem bên dưới
  log: ServerEvent[];           // nhật ký nội bộ của server, không gửi cho client
}

interface PlayerState {
  seat: SeatIdx;
  sessionId: string;
  role: RoleId;                 // vai THẬT
  alive: boolean;
  isWolfNow: boolean;           // đã bị Sói Đầu Đàn biến thì true
  lover: SeatIdx | null;
  princeUsed: boolean;
  isMayor: boolean;
  bot: boolean;                 // do server chơi thay (mất kết nối)
}

interface GameFlags {
  guardLastTarget: SeatIdx | null;
  alphaUsed: boolean;
  witchHeal: boolean;           // còn bình cứu
  witchPoison: boolean;         // còn bình độc
  extraBiteNext: boolean;       // Sói Con đã chết, đêm sau cắn thêm một người
  whiteWolfNextNight: number;   // đêm kế Sói Trắng được giết
}
```

Định nghĩa vai nằm trong `shared/roles.ts` dưới dạng bảng: `id`, `faction` (`village | wolf | third`), `balance` (điểm cân bằng), `nightCall` (có lượt gọi riêng không), `seenAsWolfBySeer`.

## 6. Máy trạng thái ván

```
LOBBY ──(chủ phòng bấm Bắt đầu, ≥5 người)──► COUNTDOWN (15s)
  ▲                                              │ hết giờ, còn ≥5 người
  │                                              ▼
  │                                         chia vai ──► NIGHT
  │                                                        │ hết các lượt gọi
  │                                                        ▼
  │                                                      DAWN
  │                                   (Thợ Săn bắn nếu chết đêm → bia mộ → công bố)
  │                                                        │ chưa có phe thắng
  │                                                        ▼
  │                                                   DAY_DISCUSS (120s)
  │                                                        │ hết giờ / tất cả bấm bỏ qua
  │                                                        ▼
  │                                                   DAY_VOTE (30s)
  │                                                        │ hết giờ / mọi người đã bấm
  │                                                        ▼
  │                                                   EXECUTION
  │                                (treo cổ → Hoàng Tử / Chán Đời / Thợ Săn)
  │                                                        │ chưa có phe thắng → đêm kế
  │                                                        ▼
  └────────── về bàn chờ sau 25s ◄──────────────────── END (lật hết vai)
```

Mỗi bước chuyển giai đoạn do **server hẹn giờ** (`setTimeout` hoặc vòng lặp tick 250 ms). Mọi chuyển giai đoạn đi qua **một hàm duy nhất** `advance(game)` để dễ kiểm thử và chống chạy trùng. Mọi hẹn giờ phải được **huỷ** khi phòng trống hoặc ván kết thúc.

### 6.1 Bắt đầu và huỷ

- Bắt đầu: chủ phòng, đủ 5 người. Đủ 10 người thì bỏ qua đếm ngược.
- Đang đếm ngược mà tụt dưới 5 người thì huỷ đếm ngược.
- Trong ván, còn dưới **3 người thật** (không tính người do server chơi thay) hoặc quá **40 phút** thì huỷ ván.

### 6.2 Tạm dừng

Chủ phòng bấm tạm dừng: `paused = true`, server **dừng mọi bộ đếm** và nhớ phần giây còn lại. Tiếp tục thì đếm ngược 5 giây rồi chạy tiếp phần còn lại. Không ai thao tác được khi đang tạm dừng.

## 7. Đêm: danh sách lượt gọi

### 7.1 Dựng `nightPlan`

Đầu mỗi đêm, server dựng danh sách lượt từ **các vai có trong ván** (không gọi vai không có), theo thứ tự cố định:

| Thứ tự | Lượt | Điều kiện gọi | Ai thao tác |
|---|---|---|---|
| 1 | Thần Tình Yêu | Chỉ đêm 1 | Thần Tình Yêu: chọn 2 người |
| 2 | Bảo Vệ | Có vai trong ván | Bảo Vệ: chọn 1 người (không cùng người 2 đêm liền) |
| 3 | Bầy Sói | Có Sói trong ván | Mọi Sói còn sống: cùng chọn người cắn |
| 3b | Kẻ Phản Bội | Chỉ đêm 1, ngay sau bầy Sói | Không ai thao tác, chỉ xem |
| 4 | Sói Đầu Đàn | Từ đêm 2, chưa dùng, thoả điều kiện biến | Sói Đầu Đàn: biến hoặc bỏ qua |
| 5 | Sói Trắng | Cách một đêm | Sói Trắng: chọn một Sói khác để giết, hoặc bỏ qua |
| 6 | Tiên Tri | Có vai trong ván | Tiên Tri: chọn 1 người để soi |
| 7 | Phù Thủy | Có vai trong ván | Phù Thủy: cứu / độc / bỏ qua |
| 8 | Nhà Ngoại Cảm | Có vai trong ván | Nhà Ngoại Cảm: chọn 2 người |

Một lượt (`NightStep`):

```ts
interface NightStep {
  id: string;                 // 'cupid' | 'guard' | 'wolves' | 'traitor' | ...
  wakeCue: CueId;             // câu gọi dậy (gm_wolf_wake...)
  sleepCue: CueId;            // câu gọi ngủ
  actors: SeatIdx[];          // người thao tác (có thể rỗng)
  observers: SeatIdx[];       // người dậy nhưng chỉ xem (Kẻ Phản Bội)
  action: ActionKind | null;
  timeoutMs: number;
  deadWaitMs?: number;        // chờ ngẫu nhiên nếu người giữ vai đã chết
}
```

### 7.2 Chạy một lượt

1. Phát `wakeCue`. Màn hình của `actors` và `observers` sáng lại.
2. Nhận hành động. Lượt kết thúc **ngay khi mọi `actors` đã chốt** hoặc hết `timeoutMs`.
3. Phát `sleepCue`. Màn hình tối lại.
4. Sang lượt kế.

Quy tắc đặc biệt:

- **Vai đã chia mà người giữ đã chết** vẫn được gọi đủ wake và sleep, rồi chờ một khoảng ngẫu nhiên (`deadWaitMs`, đề xuất 5 đến 10 giây) để người ngoài không biết vai đó đã chết.
- **Vai không còn gì để làm** (Phù Thủy hết cả hai bình, Bảo Vệ... ) xử lý như vai đã chết: gọi và chờ ngẫu nhiên.
- **Kẻ Phản Bội** dậy ngay sau lệnh dậy của bầy Sói, ngủ ngay sau lệnh ngủ của bầy Sói. Thời gian dậy của Kẻ Phản Bội trùng với bầy Sói, nên lượt này không tốn thêm giờ.
- **Lượt cuối cùng của đêm:** người của lượt đó giữ sáng thêm 5 giây rồi về đen. Hết đêm thì mọi màn hình **cùng sáng một lúc** khi trời sáng.
- Bầy Sói có thể phải **cắn hai lần** nếu `extraBiteNext` (Sói Con đã chết): lượt Sói lặp hai lần liên tiếp, người thứ hai phải khác người thứ nhất.

### 7.3 Chọn mục tiêu: hai bước

Mọi thao tác chọn người đi theo cùng một khuôn:

1. Người chơi **chỉ con trỏ** vào một người. Client gửi `pointer` (`targetSeat` hoặc `null`). Chưa tính gì cả.
2. Hiện **nút chốt** (ví dụ "Cắn", "Soi", "Vote", "Bắn") cạnh nút "Bỏ qua". Bấm nút chốt gửi `act`. **Server chốt, không đổi ý được.**

Server **bỏ qua** mọi `act` đến sau lượt đã chốt, đến từ người không phải `actors` của lượt hiện tại, hoặc nhắm vào đích không hợp lệ (người đã chết, chính mình khi không cho phép, người Bảo Vệ chọn trùng đêm trước...).

### 7.4 Bầy Sói chọn người cắn

- Mỗi Sói còn sống chỉ con trỏ rồi bấm "Cắn". Server đếm **số lượt cắn** cho từng người, gửi cho các Sói để hiện số trên đầu.
- Chốt khi mọi Sói còn sống đã bấm hoặc hết giờ.
- Người nhiều lượt nhất bị cắn. **Hoà thì chọn ngẫu nhiên một người trong số những người hoà.** Không ai bấm thì không ai bị cắn.
- Sói Trắng tham gia như một Sói thường trong lượt này (để không bị lộ).

## 8. Luật chi tiết khi cài đặt

Các điểm DE_XUAT_MA_SOI.md chưa nói hẳn. Đây là **mặc định đề xuất**, chỉnh được trong `resolve.ts` khi chơi thử.

### 8.1 Tính kết quả đêm (`resolveNight`)

Thứ tự áp dụng, sau khi mọi lượt xong:

1. **Ghép đôi** (đêm 1): `lover` hai chiều.
2. **Bảo Vệ che được mọi đòn giết ban đêm** (cắn, Sói Trắng giết, bình độc), vì Bảo Vệ không biết ai sắp chết nên chọn là hên xui. Người được che **không chết** vì bất cứ đòn nào đêm đó. Chỉ **chết dây chuyền cặp đôi** là không bị che.
   **Cắn**: lấy mục tiêu từ lượt Sói.
   - Nếu Bảo Vệ che người đó thì **không chết**.
   - Nếu Sói Đầu Đàn đã chọn biến (và thoả điều kiện: Bảo Vệ không che; sau khi biến số Sói vẫn ít hơn số người còn lại) thì **người đó biến thành Sói, không chết** (`isWolfNow = true`, biểu tượng đổi thành Sói).
3. **Phù Thủy**: được thấy người **sẽ chết vì bầy Sói** (sau khi trừ Bảo Vệ che và việc bị biến; nếu không ai thì hiện "đêm nay không ai chết"). Cứu thì người đó không chết. Độc thì thêm một người chết (trừ khi Bảo Vệ che người đó). Cứu và độc dùng được trong cùng một đêm.
4. **Sói Trắng** giết một Sói khác (Bảo Vệ che người đó thì người đó không chết).
5. **Chết dây chuyền cặp đôi**: một người trong cặp chết thì người kia chết theo.
6. **Sói Con**: nếu Sói Con nằm trong số người chết (bất kể nguyên nhân) thì đặt `extraBiteNext = true` cho đêm sau.
7. Danh sách người chết đêm là tập hợp tất cả các trường hợp trên. Chưa ghi `alive = false` vội, vì Thợ Săn còn bắn.

### 8.2 Bình minh (`DAWN`)

1. Nếu **Thợ Săn nằm trong số người chết đêm** thì bắn trước: 15 giây chỉ người, bấm "Bắn" hoặc "Bỏ qua".
2. Người bị bắn cộng vào danh sách chết. Nếu là một nửa cặp đôi thì người kia chết theo. Nếu người chết thêm này là Thợ Săn nào khác thì không xảy ra, mỗi ván chỉ có một Thợ Săn.
3. Ghi `alive = false` cho tất cả, **hiện bia mộ cùng lúc**, hiện chữ công bố 5 đến 8 giây.
4. Kiểm tra thắng. Nếu chưa thì sang `DAY_DISCUSS`.

### 8.3 Bỏ phiếu và treo cổ (`EXECUTION`)

- Phiếu của **Thị Trưởng tính hai**. Phiếu "Bỏ qua" và hết giờ chưa bấm là phiếu trắng, không tính cho ai.
- Người nhiều phiếu nhất bị treo. **Hoà phiếu hoặc không ai có phiếu thì không ai bị treo.**
- **Hoàng Tử** bị treo lần đầu: không chết, lộ vai cho cả bàn (`princeUsed = true`). Lần sau chết bình thường.
- **Chán Đời** bị treo: thắng ngay, ván kết thúc.
- **Thợ Săn** bị treo: bắn như mục 8.2, rồi chết dây chuyền cặp đôi.
- Kiểm tra thắng. Nếu chưa thì sang đêm kế (`night += 1`).

### 8.4 Điều kiện thắng (`win.ts`)

Kiểm tra sau `DAWN` (đã bắn xong) và sau `EXECUTION`:

1. **Chán Đời thắng** ngay khi bị treo cổ (kiểm tra trước các điều kiện khác).
2. **Sói Trắng thắng** khi chỉ còn mình nó sống.
3. **Dân thắng** khi hết Sói (Ma Sói, Sói Con, Sói Đầu Đàn, Sói Trắng, người bị biến thành Sói) và Kẻ Phản Bội.
4. **Phe Sói thắng** khi số người phe Sói còn sống **không ít hơn** số người còn lại. Phe Sói gồm cả Kẻ Phản Bội và người bị biến, **không gồm Sói Trắng**.

## 9. Giao thức mạng

Mọi sự kiện dùng tên có tiền tố. Client gửi **ý định**, server phản hồi bằng **view mới**.

### 9.1 Client gửi lên server

| Sự kiện | Dữ liệu | Khi nào |
|---|---|---|
| `room:create` | `{name}` | Tạo phòng |
| `room:join` | `{code, name, sessionId?}` | Vào phòng hoặc nối lại |
| `room:leave` | — | Rời phòng |
| `seat:move` | `{seat}` | Đổi ghế (ván chưa bắt đầu) |
| `room:kick` | `{seat}` | Chủ phòng mời ra |
| `room:settings` | `Timings` | Chủ phòng chỉnh thời gian (bàn chờ) |
| `game:start` | — | Chủ phòng bắt đầu |
| `game:pause` / `game:resume` | — | Chủ phòng |
| `game:pointer` | `{target: SeatIdx\|null}` | Chỉ con trỏ (chưa chốt) |
| `game:act` | `{kind, targets: SeatIdx[]}` | Bấm nút chốt |
| `game:skip` | `{kind}` | Bấm "Bỏ qua" |
| `game:skipDiscuss` | — | Bấm "Bỏ qua thảo luận" |
| `chat:wolf` | `{text}` | Chat Sói (chỉ trong lượt bầy Sói) |
| `game:leave` | — | Người chết rời ván sớm |

### 9.2 Server gửi xuống

| Sự kiện | Dữ liệu |
|---|---|
| `room:state` | Bàn chờ: danh sách ghế, chủ phòng, cài đặt |
| `game:view` | **View riêng của người nhận** (mục 10), kèm số phiên bản tăng dần |
| `game:cue` | `{cue, text}`: phát lời quản trò hoặc hiệu ứng; luôn kèm `text` để hiện chữ |
| `game:pointers` | Con trỏ mà người nhận được phép thấy |
| `chat:wolf` | Tin nhắn Sói (chỉ gửi cho Sói) |
| `game:fx` | Hiệu ứng: đạn, bình thuốc, bia mộ hiện (xem mục 12.4) |
| `error` | `{code, msg}` |

### 9.3 Đồng bộ

- `game:view` là **ảnh chụp đầy đủ** của view, đánh số `version`. Client bỏ view có `version` cũ hơn view đang có. Ảnh chụp đầy đủ đơn giản và chịu được mất gói; kích thước nhỏ (tối đa 10 người).
- Giờ: server gửi `phaseEndsAt` bằng giờ server cùng `serverNow`. Client tính độ lệch đồng hồ lúc kết nối và hiển thị đếm ngược theo độ lệch đó.
- **Server kiểm tra mọi thứ**: người gửi có đúng là `actor` của lượt hiện tại không, đích có hợp lệ không, lượt đã chốt chưa. Bỏ qua im lặng hoặc trả `error` nhẹ nếu không hợp lệ.

## 10. View riêng cho từng người (`viewFor`)

Đây là phần quan trọng nhất để chống lộ bài. `viewFor(game, seat)` dựng dữ liệu cho một người, theo bảng dưới.

| Thông tin | Ai thấy |
|---|---|
| Vai thật của mình, kèm cách chơi vai | Chính mình |
| Biểu tượng vai của người khác | Không ai (trừ các dòng bên dưới) |
| Mọi Sói hiện là biểu tượng "Sói" thường, kể cả Sói Trắng, Sói Con, người bị biến | Các Sói; Kẻ Phản Bội (đêm 1 trở đi) |
| Biểu tượng Thị Trưởng | Mọi người |
| Biểu tượng trái tim của cặp đôi | Chỉ hai người trong cặp |
| Hoàng Tử lộ vai khi bị treo lần đầu | Mọi người, từ lúc đó |
| Người bị treo cổ hoặc chết | Chỉ biết là chết (bia mộ), không lộ vai |
| Vai của tất cả | Mọi người, ở `END` |
| Kết quả soi của Tiên Tri, kết quả Nhà Ngoại Cảm | Chính người đó, **chỉ kết quả của đêm gần nhất** (sang đêm mới là mất, phải tự nhớ) |
| Người sẽ chết vì bầy Sói (Phù Thủy) | Chính Phù Thủy, trong lượt Phù Thủy |
| Con trỏ ban ngày | Mọi người |
| Con trỏ ban đêm của một lượt | Người của lượt đó; riêng bầy Sói thấy của nhau; người chết thấy tất cả |
| Số phiếu vote (ban ngày) | Mọi người |
| Số lượt cắn của bầy Sói | Các Sói; người chết |
| Chat Sói | Chỉ Sói còn sống. **Không** gồm Kẻ Phản Bội và người chết |
| Hành động ban đêm của mọi người (ai được gọi, chỉ vào ai, hiệu ứng cắn / soi / bảo vệ / ném bình / ghép đôi) | **Người chết** (xem trực tiếp, kèm vai của người hành động) |
| Hiệu ứng bắn của Thợ Săn | Mọi người |
| Hiệu ứng ném bình ban đêm | Phù Thủy và người chết |

Quy tắc kỹ thuật:

- View của người còn sống **không bao giờ** chứa vai thật của người khác, kể cả ẩn trong dữ liệu mà giao diện không hiển thị. Client không được "giấu bằng CSS".
- Biểu tượng Sói dùng một mã duy nhất (`wolfGeneric`), server **thay** mã vai thật bằng mã này khi gửi cho Sói.
- Hành động ban đêm gửi cho người chết đi qua kênh riêng `game:fx` hoặc trường `nightFeed` của view, chỉ có trong view của người chết.
- `game:view` của người ngoài cuộc (đang ở bàn chờ trong lúc ván chạy) không chứa thông tin ván.

## 11. Nối lại và mất kết nối

- Mỗi người có `sessionId` (lưu ở trình duyệt). Rớt mạng hoặc đóng tab: giữ nguyên ghế trong **60 giây**. Quay lại với cùng `sessionId` thì nhận lại view hiện tại và đúng ghế cũ.
- Trong lúc vắng, server **chơi thay**: không làm gì ban đêm (không chốt, dẫn tới hết giờ), bỏ phiếu trắng.
- Quá 60 giây: coi như rời ván. Vai vẫn do server chơi thay tới hết ván. Không chặn người khác.
- **Chủ phòng rời hoặc mất kết nối quá 60 giây**: quyền chuyển cho người có ghế kế tiếp đang online.
- **Phòng trống** (không ai còn kết nối): sau 10 phút thì xoá phòng, huỷ mọi bộ đếm.

## 12. Cảnh 3D (client)

### 12.1 Bố cục

- Căn phòng tối, **bàn tròn** ở giữa. N ghế đặt đều trên đường tròn quanh bàn (góc `2π·i / N`), N là số người của ván. Ghế đặt **xa nhau** để hạn chế chỉ nhầm.
- Ở bàn chờ có 10 vị trí cố định. Khi bắt đầu ván, các ghế được **dàn đều lại theo số người thật**, giữ nguyên thứ tự.
- **Camera cố định kiểu Liên Quân**: nhìn chéo từ trên xuống (độ cao 50°), không xoay, không di chuyển, **giống nhau cho mọi người**. Khác nhau chỉ ở chỗ **ghế của mình luôn nằm ở phía gần camera**: vị trí ghế tính theo `(i − ghế_của_mình) mod N`. Khoảng cách camera tự tính theo tỉ lệ màn hình và số người để thấy đủ cả bàn, kể cả điện thoại dọc.
- Nhân vật: mô hình đơn giản (ít đa giác), có tên bằng nhãn 2D bám theo đầu.

### 12.2 Chọn người bằng con trỏ

- Mỗi ghế có một **hitbox** (hình trụ vô hình) bán kính vừa phải, **không chồng lên nhau**. Dùng raycast từ vị trí chuột hoặc ngón tay.
- Rê chuột hoặc chạm vào ghế: người đó **nổi bật** và client gửi `game:pointer`. Hiện nút chốt cạnh nút "Bỏ qua" trong khung HTML.
- Trên điện thoại không có rê chuột: chạm = chỉ, bấm nút chốt mới tính. Nút chốt đủ lớn.
- Client chỉ gửi **ghế đang chỉ**, không gửi toạ độ chuột (mục 9).

### 12.3 Các thứ nổi trên đầu

| Thành phần | Hiện cho |
|---|---|
| Biểu tượng vai của mình | Chính mình |
| Biểu tượng "Sói" của đồng loại | Các Sói và Kẻ Phản Bội |
| Biểu tượng Thị Trưởng | Mọi người |
| Trái tim | Hai người trong cặp |
| Số phiếu vote / số lượt cắn | Theo bảng mục 10 |
| Bia mộ (thay nhân vật) | Mọi người, có tên người chết, không hiện vai |

Biểu tượng là **sprite luôn quay về camera**. Server chỉ gửi mã biểu tượng người đó được phép thấy; client chỉ việc vẽ.

### 12.4 Hiệu ứng

Giữ **đơn giản nhất có thể**, đúng yêu cầu:

- **Thợ Săn**: nhân vật rút một khẩu súng (hình khối đơn giản); khi bấm "Bắn", một viên đạn (hình cầu nhỏ) bay thẳng từ súng tới người bị chỉ trong khoảng nửa giây, kèm tiếng súng. Rồi hai bia mộ hiện (cùng lúc với bia mộ khác nếu là ban đêm).
- **Phù Thủy**: một chai thuốc bay theo cung từ Phù Thủy tới đích trong khoảng một giây; **xanh lá = cứu, tím = độc**. Chỉ Phù Thủy và người chết thấy.
- **Bia mộ**: nhân vật thu nhỏ biến mất, bia mộ hiện lên với tên. Hiện cùng lúc với chữ công bố trên mặt bàn.
- **Cắn / soi / bảo vệ / ghép đôi**: hiệu ứng ngắn dạng tia sáng nối hai ghế, chỉ hiện cho người được phép (người chết thấy tất cả).

### 12.5 Sáng tối và nhịp ban đêm

- **Ban ngày:** ánh sáng ấm, mọi ghế rõ.
- **Ban đêm:** đèn tắt gần hết, chỉ có **một vệt sáng mờ ở giữa bàn**, không nhìn rõ ai. Đây là hiệu ứng ở client, nhưng điều kiện **ai được sáng** do server quyết (qua cờ `awake` trong view).
- Vai được gọi (`awake = true`): cảnh sáng lại, hiện bảng làm việc. Xong lượt thì tối lại.
- Vai gọi cuối cùng: giữ sáng thêm 5 giây rồi về đen; khi trời sáng mọi người **cùng sáng**.
- Người chết: ban đêm thấy cảnh mờ kèm các hiệu ứng hành động (xem được cả đêm).

### 12.6 Phần HTML phủ lên trên

Dùng HTML (những thứ cần bấm) cho phần ngoài bàn; thông báo nằm trong cảnh, trên mặt bàn:

- **Nút chốt và nút "Bỏ qua"**, hiện theo ngữ cảnh.
- **Chat Sói** (góc màn hình, chỉ hiện trong lượt bầy Sói).
- **Thẻ vai ghim ở góc phải trên** (thu gọn / mở ra được): tên vai, phe, tóm tắt, các ý tác dụng và cách chơi, mục tiêu thắng. Dữ liệu lấy từ `ROLES` trong `shared/roles.ts` (`howTo`, `abilities`, `goal`). Nút "cách chơi các vai" mở danh sách cả 15 vai.
- **Bảng thông báo trên mặt bàn** (`scene/TableDisplay.tsx`): vẽ bằng canvas, đặt nghiêng trên bàn hướng về camera. Hiện tên giai đoạn, đồng hồ, lời quản trò, kết quả đêm / bỏ phiếu, người thắng, gợi ý. Thay cho các dòng chữ HTML nổi trên màn hình.
- **Bảng kết quả riêng** của Tiên Tri / Ngoại Cảm: xem lại trong ván.
- **Bàn chờ**: danh sách người, nút bắt đầu, mã phòng, cài đặt (cho chủ phòng).

### 12.7 Hiệu năng

- Mục tiêu 30 fps trên điện thoại tầm trung. Ít đa giác, không bóng đổ thật ở chế độ thấp, vài đèn.
- Có chế độ **giảm đồ hoạ** (tắt sương, tắt hiệu ứng hạt, hạ độ phân giải).
- Nên chia nhỏ gói tải (3D tách file) và nạp âm thanh khi vào phòng.

## 13. Âm thanh

### 13.1 Lời quản trò

- Server gửi `game:cue` **đúng lúc** (kèm `text`). Client có **hàng đợi phát**: các cue phát nối nhau, không chồng.
- Mọi cue luôn hiện chữ giữa bàn, dù giọng tắt.
- Giọng thu sẵn ở `client/public/audio/gm/`, tên theo bảng trong [KICH_BAN_QUAN_TRO.md](KICH_BAN_QUAN_TRO.md). **Thiếu file** thì bỏ qua tiếng, chữ vẫn hiện. Hiện đã đủ 23 file.
- Quản trò chỉ đọc lời gọi của vai **có trong ván**.

### 13.2 Ai phát giọng

- Mỗi máy có nút **bật / tắt giọng** (mặc định bật).
- Khi cả bàn ngồi chung phòng, bật ở **một máy** và tắt ở các máy còn lại để khỏi lệch tiếng. Có thể thêm "máy phát giọng" do chủ phòng chỉ định ở bản sau.
- Nút bắt đầu / vào phòng có thao tác chạm của người dùng, dùng nó để **mở khoá phát âm thanh** (bắt buộc trên iPhone).

### 13.3 Hiệu ứng âm thanh

| Khi | File |
|---|---|
| Trời tối | `wolf_howl`, `amb_night` |
| Trời sáng | `dawn_birds` |
| Treo cổ | `hang` |
| Thợ Săn bắn | `gunshot` |
| Phù Thủy dậy hoặc dùng bình | `witch_laugh` |
| Chọn, bỏ phiếu, đếm ngược, thắng thua | Chưa có tiếng, bổ sung sau. **Không dùng `bonk`.** |

## 14. Cấu hình

`shared/config.ts`, chủ phòng chỉnh ở bàn chờ (áp dụng từ ván sau, không lưu sau khi server khởi động lại):

| Mục | Mặc định |
|---|---|
| Số người tối thiểu / tối đa | 5 / 10 |
| Đếm ngược bắt đầu | 15 giây |
| Thảo luận | 120 giây |
| Hiện nút "Bỏ qua thảo luận" sau | 60 giây |
| Bỏ phiếu | 30 giây |
| Thợ Săn bắn | 15 giây |
| Chữ công bố người chết | 5 đến 8 giây |
| Một lượt đêm (tối đa) | Theo từng vai, lấy từ `werewolf/narration.js`: Thần Tình Yêu 10 giây, Bảo Vệ 8, bầy Sói 20, Sói Đầu Đàn 8, Sói Trắng 8, Tiên Tri 8, Phù Thủy 10 (bình cứu) + 8 (bình độc), Nhà Ngoại Cảm 10 |
| Chờ ngẫu nhiên vai đã chết / không còn việc | 5 đến 10 giây |
| Vai gọi cuối giữ sáng | 5 giây |
| Xem kết quả rồi về bàn chờ | 25 giây |
| Giữ ghế khi mất kết nối | 60 giây |
| Ván kẹt tối đa | 40 phút |
| Phòng trống bị xoá sau | 10 phút |

Danh sách vai, điểm cân bằng và điều kiện thắng **không** chỉnh được.

## 15. Chống lộ bài và gian lận

| Nguy cơ | Cách xử lý |
|---|---|
| Soi vai qua gói mạng | Server chỉ gửi view đã lọc (mục 10), không chứa vai người khác. |
| Gửi hành động giả (chốt thay người khác, chốt ngoài lượt) | Server kiểm tra người gửi, lượt hiện tại, đích hợp lệ. |
| Đoán vai qua thời gian thao tác | Vai đã chết / không còn việc vẫn được gọi và chờ ngẫu nhiên; mọi người cùng sáng khi trời sáng. Chỉ giảm, không triệt để. |
| Liếc màn hình người bên cạnh | Màn hình tối ban đêm; biểu tượng vai chỉ mình thấy; mặt trong lá bài màu đen. Không chặn được hoàn toàn. |
| Người chết nói lại cho người sống | Không chặn được, dựa vào tự giác (đã chấp nhận). |
| Chat Sói bị đọc | Server chỉ gửi tin cho Sói còn sống trong lượt bầy Sói; ban ngày chặn nhận tin. |
| Nhiều tab cùng một người | Một `sessionId` chỉ một kết nối; tab mới thay tab cũ. |
| Spam sự kiện | Giới hạn tốc độ mỗi kết nối, bỏ gói quá cỡ. |
| Mã phòng đoán được | Mã đủ dài, ngẫu nhiên, hạn chế số lần thử vào phòng sai mã. |

## 16. Kiểm thử

- **Chia vai** (`deal.ts`): với mỗi N từ 5 đến 10, chạy hàng nghìn lần, kiểm tra luôn đúng số Sói, đúng giới hạn lá, tổng điểm cân bằng trong −3 đến +3, phe thứ ba chỉ từ N ≥ 8, Thần Tình Yêu chỉ từ N ≥ 6, luôn có Sói thật.
- **Tính kết quả đêm** (`resolve.ts`): bảng ca thử cho Bảo Vệ che, Phù Thủy cứu và độc cùng đêm, Sói sắp biến (đủ điều kiện và không đủ), Sói Trắng giết, cặp đôi chết dây chuyền, Thợ Săn bị cắn, Sói Con chết.
- **Thắng thua** (`win.ts`): các tình huống Sói Trắng, Chán Đời, Kẻ Phản Bội, người bị biến.
- **View** (`viewFor`): kiểm tra **không bao giờ lọt vai thật** của người khác vào view của người sống, với mọi giai đoạn.
- **Mô phỏng bằng bot**: chạy hàng loạt ván giả lập (nhiều N, nhiều đội hình), kiểm tra ván luôn kết thúc, không kẹt, không lỗi, không bộ đếm mồ côi.
- **Chơi thử thật** với bạn bè trên máy tính và điện thoại thật (bước cuối trong lộ trình).

## 17. Lộ trình triển khai

Lấy theo lộ trình trong DE_XUAT_MA_SOI.md, thêm các đầu việc kỹ thuật:

1. **Khung:** dự án shared/server/client, tạo phòng + mã, vào phòng, 10 ghế, bàn tròn 3D, ghế quanh bàn, bắt đầu + đếm ngược, chia vai (Dân + Sói), đêm / ngày, chỉ con trỏ + nút chốt, bỏ phiếu, treo cổ, bia mộ, thắng thua. Chạy thử cả vòng bằng bot.
2. **View riêng + vai Dân:** `viewFor`, biểu tượng vai trên đầu, 8 vai Dân còn lại, nhật ký server.
3. **Sói và phe thứ ba:** Sói Con, Sói Đầu Đàn, Kẻ Phản Bội, Chán Đời, Sói Trắng; bầy Sói chọn cắn; chat Sói.
4. **Random vai:** rút ngẫu nhiên theo DE_XUAT mục 5.2, kiểm thử hàng loạt.
5. **Quản trò và âm thanh:** `nightPlan`, gọi từng vai, hàng đợi lời, chữ giữa bàn, sfx, sáng tối ban đêm.
6. **Thợ Săn và hiệu ứng:** súng, đạn, bình thuốc, bia mộ, hiệu ứng ban đêm cho người chết.
7. **Mất kết nối và chủ phòng:** nối lại, chơi thay, chuyển chủ phòng, tạm dừng, mời ra, chỉnh thời gian.
8. **Hoàn thiện:** thẻ giải thích vai, giao diện điện thoại, giảm đồ hoạ, mở khoá âm thanh iPhone.
9. **Chơi thử thật:** chơi với bạn bè, chỉnh thời gian và luật ở mục 8 của tài liệu này.

Sau bước 1 và 2 là chơi được bản thô, nên thử sớm.

## 18. Điều chưa chắc

- **Luật mặc định ở mục 8** (Phù Thủy thấy ai thế nào khi người bị cắn được biến; Sói Con chết vì bất cứ nguyên nhân nào cũng cho cắn thêm) đã được bạn đồng ý, nhưng vẫn cần chơi thử. Riêng Bảo Vệ che được mọi đòn giết ban đêm là luật bạn đã chốt.
- **Bảo Vệ có tự bảo vệ chính mình được không:** DE_XUAT chưa nói. Đang để **được**, chỉ cấm trùng người đêm trước. Bạn đã đồng ý các luật mặc định.
- **Thời gian mỗi lượt đêm** lấy theo `werewolf/narration.js` (bản chạy trong rạp), cần chơi thử xem có đủ cho người mới không. Thời lượng từng lời quản trò cũng lấy từ file đó (riêng `psychic_sleep` mới thu nên đang ước 1,5 giây).
- **Hiệu năng 3D trên điện thoại cũ** chưa đo. Cần thử sớm ở bước 1.
- **Giọng thu sẵn:** đã đủ 23 file, đặt tên theo `gm_<tên>.mp3`. Hai câu gọi Kẻ Phản Bội cần nghe lại để khớp thứ tự gọi mới.
- **Chọn Socket.IO hay WebSocket thuần, React hay thư viện khác:** đề xuất ở mục 2, chưa chốt.

## 19. Triển khai trên Render

- **Loại dịch vụ:** một **Web Service** (Node). Server nghe cổng lấy từ biến môi trường `PORT` (Render cấp), phục vụ cả client đã build và WebSocket. Render hỗ trợ WebSocket.
- **Build:** cài gói, build client (Vite) ra `client/dist`, build server. **Start:** chạy server, server phục vụ `client/dist`.
- **Một bản duy nhất (một instance):** phòng nằm trong bộ nhớ nên **không được chạy nhiều bản** song song. Không bật tự động nhân bản.
- **Gói miễn phí tự ngủ** khi lâu không có truy cập, đánh thức lại mất vài chục giây, và **mọi phòng mất khi khởi động lại**. Chấp nhận được khi chơi thử. Muốn ổn định thì dùng gói trả phí.
- **Đang chơi mà server khởi động lại** (deploy mới, Render đổi máy) thì ván đó mất. Tránh deploy trong lúc có người chơi.
- **HTTPS** do Render lo sẵn. Cần HTTPS để phát âm thanh và dùng WebSocket an toàn (`wss`).
- **Kiểm tra sức khoẻ:** có đường `/health` trả về 200 để Render biết server còn sống.
- **Biến môi trường:** `PORT` (do Render cấp), `NODE_ENV=production`. Không cần khoá bí mật nào vì không có tài khoản hay cơ sở dữ liệu.
