export type Faction = 'village' | 'wolf' | 'third';

export type RoleId =
  | 'villager'
  | 'seer'
  | 'guard'
  | 'hunter'
  | 'witch'
  | 'mayor'
  | 'prince'
  | 'psychic'
  | 'cupid'
  | 'werewolf'
  | 'cub'
  | 'alpha'
  | 'traitor'
  | 'jester'
  | 'whitewolf'
  | 'fool'
  | 'pacifist'
  | 'lycan'
  | 'medium'
  | 'detective'
  | 'sorceress'
  | 'seeress';

export interface RoleDef {
  id: RoleId;
  name: string;
  faction: Faction;
  /** Điểm cân bằng dùng khi rút ngẫu nhiên đội hình. */
  balance: number;
  /** Có lượt gọi riêng ban đêm không. */
  nightCall: boolean;
  /** Tóm tắt một câu. */
  howTo: string;
  /** Tác dụng chính in trên thẻ bài (lời lấy theo werewolf/roles.js). */
  effect: string;
  /** Điều kiện thắng, rất ngắn, in trên thẻ bài. */
  win: string;
  /** Tác dụng và cách chơi, từng ý một, hiện trên thẻ vai. */
  abilities: string[];
  /** Điều kiện thắng của vai này. */
  goal: string;
}

export const FACTION_NAMES: Record<Faction, string> = {
  village: 'Phe Dân làng',
  wolf: 'Phe Ma Sói',
  third: 'Phe thứ ba',
};

/** Nhãn phe in trên thẻ bài, theo FACTION_NAMES trong werewolf/roles.js (Chán Đời và Sói Trắng có nhãn riêng). */
export function cardLabel(id: RoleId): string {
  const f = ROLES[id].faction;
  if (f === 'village') return 'Dân làng';
  if (f === 'wolf') return 'Ma Sói';
  return id === 'jester' ? 'Chán Đời' : 'Sói Trắng';
}

const VILLAGE_GOAL = 'Thắng khi mọi Sói và đồng bọn của Sói (Kẻ Phản Bội, Phù Thủy Sói) bị loại.';
const WOLF_GOAL = 'Thắng khi số người phe Sói còn sống không ít hơn số người còn lại.';

type NewRoleId = 'fool' | 'pacifist' | 'lycan' | 'medium' | 'detective' | 'sorceress' | 'seeress';

const BASE_ROLES: Record<Exclude<RoleId, NewRoleId>, RoleDef> = {
  villager: {
    id: 'villager', name: 'Dân làng', faction: 'village', balance: 1, nightCall: false,
    effect: 'Không có chức năng. Thảo luận và bỏ phiếu để tìm Sói.',
    win: 'Diệt hết Sói',
    howTo: 'Không có chức năng đặc biệt. Thảo luận, tìm ra Sói và bỏ phiếu treo cổ chúng.',
    abilities: [
      'Không có việc ban đêm, cứ nhắm mắt chờ trời sáng.',
      'Ban ngày: lắng nghe, tranh luận và bỏ phiếu treo cổ người bạn nghi là Sói.',
    ],
    goal: VILLAGE_GOAL,
  },
  seer: {
    id: 'seer', name: 'Tiên Tri', faction: 'village', balance: 7, nightCall: true,
    effect: 'Mỗi đêm soi một người xem có phải Sói không. Kẻ Phản Bội soi ra là người, Sói Trắng soi ra là Sói.',
    win: 'Diệt hết Sói',
    howTo: 'Mỗi đêm soi một người xem có phải Sói không.',
    abilities: [
      'Mỗi đêm khi được gọi, chỉ vào một người rồi bấm "Soi".',
      'Kết quả là "Sói" hoặc "Không phải Sói", chỉ mình bạn biết.',
      'Kẻ Phản Bội soi ra "Không phải Sói". Sói Trắng soi ra "Sói".',
    ],
    goal: VILLAGE_GOAL,
  },
  guard: {
    id: 'guard', name: 'Bảo Vệ', faction: 'village', balance: 4, nightCall: true,
    effect: 'Mỗi đêm bảo vệ một người khỏi mọi đòn giết ban đêm. Không chọn cùng một người hai đêm liền.',
    win: 'Diệt hết Sói',
    howTo: 'Mỗi đêm che chở một người khỏi mọi đòn giết ban đêm.',
    abilities: [
      'Mỗi đêm chọn một người để che chở khỏi mọi đòn giết ban đêm (Sói cắn, Sói Trắng giết, bình độc).',
      'Không được chọn cùng một người hai đêm liền.',
      'Bạn không biết ai sắp bị giết, nên chọn là hên xui.',
    ],
    goal: VILLAGE_GOAL,
  },
  hunter: {
    id: 'hunter', name: 'Thợ Săn', faction: 'village', balance: 3, nightCall: false,
    effect: 'Khi chết (kể cả bị treo cổ) được chọn một người chết theo.',
    win: 'Diệt hết Sói',
    howTo: 'Khi chết, bạn rút súng và bắn một người chết theo.',
    abilities: [
      'Không có việc ban đêm.',
      'Khi bạn chết (bị cắn, bị treo cổ...), nhân vật rút súng ra. Bạn chỉ vào một người và bấm "Bắn", người đó chết theo.',
      'Bạn có 15 giây để chọn. Hết giờ hoặc bấm "Bỏ qua" thì không bắn ai.',
      'Cả bàn đều thấy cảnh rút súng nên ai cũng biết bạn là Thợ Săn.',
    ],
    goal: VILLAGE_GOAL,
  },
  witch: {
    id: 'witch', name: 'Phù Thủy', faction: 'village', balance: 5, nightCall: true,
    effect: 'Một bình cứu và một bình độc, mỗi bình dùng một lần. Được biết ai sắp bị Sói cắn chết.',
    win: 'Diệt hết Sói',
    howTo: 'Có một bình cứu (xanh lá) và một bình độc (tím), mỗi bình dùng một lần.',
    abilities: [
      'Mỗi bình chỉ dùng một lần trong cả ván: bình cứu (xanh lá) và bình độc (tím).',
      'Khi được gọi, bạn thấy ai sắp chết vì Sói. Có thể ném bình cứu để cứu người đó.',
      'Hoặc ném bình độc vào một người để giết họ.',
      'Có thể dùng cả hai trong cùng một đêm, hoặc bấm "Bỏ qua".',
    ],
    goal: VILLAGE_GOAL,
  },
  mayor: {
    id: 'mayor', name: 'Thị Trưởng', faction: 'village', balance: 2, nightCall: false,
    effect: 'Phiếu treo cổ của bạn tính hai phiếu. Cả làng biết ai là Thị Trưởng.',
    win: 'Diệt hết Sói',
    howTo: 'Phiếu bầu treo cổ của bạn tính hai phiếu.',
    abilities: [
      'Không có việc ban đêm.',
      'Phiếu treo cổ của bạn tính hai phiếu.',
      'Mọi người đều biết bạn là Thị Trưởng ngay từ đầu ván.',
    ],
    goal: VILLAGE_GOAL,
  },
  prince: {
    id: 'prince', name: 'Hoàng Tử', faction: 'village', balance: 2, nightCall: false,
    effect: 'Bị treo cổ lần đầu thì không chết, nhưng lộ vai cho cả làng.',
    win: 'Diệt hết Sói',
    howTo: 'Lần đầu bị treo cổ, bạn không chết nhưng lộ vai.',
    abilities: [
      'Không có việc ban đêm.',
      'Lần đầu bị treo cổ, bạn không chết mà lộ vai Hoàng Tử cho cả bàn.',
      'Lần bị treo thứ hai thì chết bình thường.',
    ],
    goal: VILLAGE_GOAL,
  },
  psychic: {
    id: 'psychic', name: 'Nhà Ngoại Cảm', faction: 'village', balance: 4, nightCall: true,
    effect: 'Mỗi đêm chọn hai người, biết họ có cùng phe không.',
    win: 'Diệt hết Sói',
    howTo: 'Mỗi đêm chọn hai người và biết họ có cùng phe không.',
    abilities: [
      'Mỗi đêm khi được gọi, chỉ lần lượt vào hai người rồi bấm chốt.',
      'Bạn biết hai người đó cùng phe hay khác phe (Dân hay Sói).',
      'Bạn không biết cụ thể ai là Sói, chỉ biết họ có giống nhau hay không.',
    ],
    goal: VILLAGE_GOAL,
  },
  cupid: {
    id: 'cupid', name: 'Thần Tình Yêu', faction: 'village', balance: 3, nightCall: true,
    effect: 'Đêm đầu chọn hai người thành một đôi. Một người chết thì người kia chết theo.',
    win: 'Diệt hết Sói',
    howTo: 'Đêm đầu chọn hai người thành đôi, một người chết thì người kia chết theo.',
    abilities: [
      'Chỉ hành động ở đêm đầu: chọn hai người thành một cặp đôi (có thể chọn cả chính bạn).',
      'Hai người trong cặp thấy trái tim trên đầu nhau và biết mình cặp với ai.',
      'Một người chết thì người kia chết theo. Cặp đôi có thể thuộc bất cứ phe nào.',
    ],
    goal: VILLAGE_GOAL,
  },
  werewolf: {
    id: 'werewolf', name: 'Ma Sói', faction: 'wolf', balance: -6, nightCall: true,
    effect: 'Cùng bầy Sói chọn một người để cắn mỗi đêm.',
    win: 'Sói áp đảo số người',
    howTo: 'Cùng bầy Sói chọn một người để cắn mỗi đêm.',
    abilities: [
      'Mỗi đêm cả bầy Sói cùng chỉ và bấm "Cắn" một người. Người bị chọn nhiều nhất bị cắn (hoà thì ngẫu nhiên).',
      'Các Sói thấy nhau (biểu tượng Sói), thấy con trỏ của nhau và có khung chat riêng ban đêm.',
      'Ban ngày hãy giả làm Dân làng, đừng để lộ.',
    ],
    goal: WOLF_GOAL,
  },
  cub: {
    id: 'cub', name: 'Sói Con', faction: 'wolf', balance: -8, nightCall: false,
    effect: 'Nếu bạn chết, đêm sau bầy Sói được cắn thêm một người.',
    win: 'Sói áp đảo số người',
    howTo: 'Khi bạn bị loại, bầy Sói được cắn thêm một người.',
    abilities: [
      'Làm việc như Ma Sói: cùng bầy chọn người cắn, thấy đồng loại, vào chat Sói.',
      'Khi bạn bị loại (bị cắn, bị treo cổ...), đêm kế tiếp bầy Sói được cắn thêm một người.',
    ],
    goal: WOLF_GOAL,
  },
  alpha: {
    id: 'alpha', name: 'Sói Đầu Đàn', faction: 'wolf', balance: -9, nightCall: true,
    effect: 'Từ đêm 2, một lần, biến người bị cắn thành Sói (không giết). Chỉ khi Sói sau đó vẫn ít hơn số người còn lại và Bảo Vệ không che người đó.',
    win: 'Sói áp đảo số người',
    howTo: 'Một lần trong ván, biến người bị cắn thành Sói thay vì giết.',
    abilities: [
      'Như Ma Sói: cùng bầy cắn, thấy đồng loại, vào chat Sói.',
      'Từ đêm 2, một lần trong ván, bạn được biến người bị cắn thành Sói thay vì giết.',
      'Chỉ biến được khi Bảo Vệ không che người đó và sau khi biến số Sói vẫn ít hơn số người còn lại.',
      'Người bị biến đổi biểu tượng thành Sói và gia nhập bầy.',
    ],
    goal: WOLF_GOAL,
  },
  traitor: {
    id: 'traitor', name: 'Kẻ Phản Bội', faction: 'wolf', balance: -6, nightCall: true,
    effect: 'Biết Sói là ai và giúp Sói thắng, nhưng Sói không biết bạn. Tiên Tri soi ra là người.',
    win: 'Sói áp đảo số người',
    howTo: 'Biết Sói là ai nhưng Sói không biết bạn.',
    abilities: [
      'Ở đêm đầu bạn thức dậy ngay sau bầy Sói để nhận ra họ, nhưng không thao tác được.',
      'Sói không biết bạn là ai, và bạn không vào chat Sói.',
      'Tiên Tri soi bạn ra "Không phải Sói".',
      'Bạn tính vào phe Sói khi so số người; Dân phải loại cả bạn mới thắng.',
    ],
    goal: WOLF_GOAL,
  },
  jester: {
    id: 'jester', name: 'Chán Đời', faction: 'third', balance: -2, nightCall: false,
    effect: 'Chỉ thắng nếu bị dân làng treo cổ ban ngày. Thắng thì ván kết thúc ngay.',
    win: 'Bị treo cổ ban ngày',
    howTo: 'Bạn chỉ thắng nếu bị dân làng treo cổ.',
    abilities: [
      'Không có việc ban đêm.',
      'Hãy khiến dân làng nghi ngờ và treo cổ bạn.',
      'Bị treo thì ván kết thúc ngay, cả hai phe kia thua.',
    ],
    goal: 'Thắng ngay khi bị treo cổ ban ngày.',
  },
  whitewolf: {
    id: 'whitewolf', name: 'Sói Trắng', faction: 'third', balance: -2, nightCall: true,
    effect: 'Ở cùng bầy Sói, cứ hai đêm được giết thêm một Sói khác. Chỉ thắng nếu là người cuối cùng còn sống.',
    win: 'Sống sót một mình',
    howTo: 'Dậy cùng bầy Sói, cứ hai đêm giết thêm một Sói khác.',
    abilities: [
      'Bạn thức dậy cùng bầy Sói (thấy họ, vào chat Sói) và họ không biết bạn là Sói Trắng.',
      'Cứ hai đêm, bạn được giết thêm một Sói khác.',
      'Tiên Tri soi bạn ra "Sói". Bạn không tính vào phe Sói khi xét điều kiện thắng.',
    ],
    goal: 'Thắng khi là người duy nhất còn sống.',
  },
};

const NEW_ROLES: Record<NewRoleId, RoleDef> = {
fool: {
  id: 'fool', name: 'Kẻ Ngốc', faction: 'village', balance: 2, nightCall: false,
  effect: 'Khi bỏ phiếu bạn không được bỏ qua: luôn phải chọn một người để treo cổ.',
  win: 'Diệt hết Sói',
  howTo: 'Phiếu của bạn luôn phải treo cổ một người, không được bỏ qua.',
  abilities: [
    'Không có việc ban đêm.',
    'Ban ngày bạn không được bỏ qua phiếu. Bấm "Chọn ngẫu nhiên" hoặc hết giờ mà chưa chọn thì phiếu của bạn rơi vào một người ngẫu nhiên.',
    'Bạn vẫn thắng cùng Dân làng.',
  ],
  goal: VILLAGE_GOAL,
},

pacifist: {
  id: 'pacifist', name: 'Người Yêu Hoà Bình', faction: 'village', balance: -2, nightCall: false,
  effect: 'Phiếu của bạn luôn là "bỏ qua", bạn không bao giờ chọn treo cổ ai.',
  win: 'Diệt hết Sói',
  howTo: 'Phiếu của bạn luôn là bỏ qua, không treo cổ ai.',
  abilities: [
    'Không có việc ban đêm.',
    'Khi bỏ phiếu bạn chỉ bấm được "Bỏ qua". Dù vậy bạn vẫn được thảo luận và thuyết phục người khác.',
    'Vì thế bạn vô tình giúp Sói: một phiếu cứu chắc chắn cho người bị nghi.',
    'Bạn vẫn thắng cùng Dân làng.',
  ],
  goal: VILLAGE_GOAL,
},

lycan: {
  id: 'lycan', name: 'Người Mang Dáng Sói', faction: 'village', balance: -1, nightCall: false,
  effect: 'Bạn là Dân làng, nhưng Tiên Tri soi bạn ra là Sói.',
  win: 'Diệt hết Sói',
  howTo: 'Dân làng bị Tiên Tri soi nhầm là Sói.',
  abilities: [
    'Không có việc ban đêm.',
    'Tiên Tri và Tiên Tri Nữ soi bạn ra "Là Sói", dù bạn không phải.',
    'Các vai khác (Nhà Ngoại Cảm, Thầy Đồng, Thám Tử Ngoại Cảm) vẫn coi bạn là Dân làng.',
    'Hãy thuyết phục mọi người đừng treo cổ oan bạn.',
  ],
  goal: VILLAGE_GOAL,
},

medium: {
  id: 'medium', name: 'Thầy Đồng', faction: 'village', balance: 3, nightCall: true,
  effect: 'Mỗi đêm chọn một người, biết họ có vai đặc biệt không (khác Dân làng thường và Ma Sói thường).',
  win: 'Diệt hết Sói',
  howTo: 'Mỗi đêm biết một người có vai đặc biệt hay không.',
  abilities: [
    'Mỗi đêm khi được gọi, chỉ vào một người rồi bấm "Cảm nhận".',
    'Bạn biết người đó có phải vai đặc biệt không. Dân làng thường và Ma Sói thường là "không đặc biệt"; mọi vai còn lại là "đặc biệt".',
    'Kết quả chỉ giữ trong đêm đó, sang đêm mới là mất.',
  ],
  goal: VILLAGE_GOAL,
},

detective: {
  id: 'detective', name: 'Thám Tử Ngoại Cảm', faction: 'village', balance: 3, nightCall: true,
  effect: 'Mỗi đêm chọn một người, biết trong người đó và hai người ngồi hai bên có Sói không.',
  win: 'Diệt hết Sói',
  howTo: 'Mỗi đêm biết quanh một người (ba chỗ ngồi liền nhau) có Sói không.',
  abilities: [
    'Mỗi đêm khi được gọi, chỉ vào một người (kể cả mình) rồi bấm "Dò".',
    'Bạn biết trong ba người liền nhau (người đó và hai người ngồi hai bên, chỉ tính người còn sống) có Sói không, nhưng không biết ai là Sói.',
    'Kẻ Phản Bội và Phù Thủy Sói không tính là Sói. Kết quả chỉ giữ trong đêm đó.',
  ],
  goal: VILLAGE_GOAL,
},

sorceress: {
  id: 'sorceress', name: 'Phù Thủy Sói', faction: 'wolf', balance: -3, nightCall: true,
  effect: 'Mỗi đêm tìm Tiên Tri. Sói không biết bạn, Tiên Tri soi bạn ra là người.',
  win: 'Sói áp đảo số người',
  howTo: 'Mỗi đêm đoán một người có phải Tiên Tri không. Sói không biết bạn.',
  abilities: [
    'Mỗi đêm khi được gọi, chỉ vào một người rồi bấm "Tìm". Bạn biết người đó có phải Tiên Tri (hoặc Tiên Tri Nữ) không.',
    'Bạn thức dậy riêng, không biết Sói là ai và không vào chat Sói. Sói cũng không biết bạn.',
    'Tiên Tri soi bạn ra "Không phải Sói". Bạn tính vào phe Sói khi so số người; Dân phải loại cả bạn mới thắng.',
  ],
  goal: WOLF_GOAL,
},

seeress: {
  id: 'seeress', name: 'Tiên Tri Nữ', faction: 'village', balance: 7, nightCall: true,
  effect: 'Y hệt Tiên Tri: mỗi đêm soi một người xem có phải Sói không. Bàn lớn có thể có cả hai.',
  win: 'Diệt hết Sói',
  howTo: 'Mỗi đêm soi một người xem có phải Sói không.',
  abilities: [
    'Mỗi đêm khi được gọi, chỉ vào một người rồi bấm "Soi".',
    'Kết quả: "Là Sói" hoặc "Không phải Sói". Kẻ Phản Bội và Phù Thủy Sói soi ra là người, Sói Trắng và Người Mang Dáng Sói soi ra là Sói.',
    'Được gọi cùng lượt với Tiên Tri. Kết quả chỉ giữ trong đêm đó.',
  ],
  goal: VILLAGE_GOAL,
},
};

export const ROLES: Record<RoleId, RoleDef> = { ...BASE_ROLES, ...NEW_ROLES };

export const ROLE_IDS = Object.keys(ROLES) as RoleId[];

/** Phe Sói khi so sánh số người để thắng. Không gồm Sói Trắng. */
export function isWolfTeam(role: RoleId): boolean {
  return role === 'werewolf' || role === 'cub' || role === 'alpha' || role === 'traitor' || role === 'sorceress';
}

/** Sói thật (bị tính là Sói khi Dân cần diệt hết). */
export function isWolfKind(role: RoleId): boolean {
  return role === 'werewolf' || role === 'cub' || role === 'alpha' || role === 'whitewolf';
}
