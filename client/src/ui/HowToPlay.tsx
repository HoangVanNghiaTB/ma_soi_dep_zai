import { useState } from 'react';
import { RolesList } from './RoleCard';

type TabId = 'intro' | 'start' | 'round' | 'ops' | 'win' | 'village' | 'wolf' | 'third';

const TABS: { id: TabId; label: string }[] = [
  { id: 'intro', label: 'Giới thiệu' },
  { id: 'start', label: 'Bắt đầu' },
  { id: 'round', label: 'Một vòng chơi' },
  { id: 'ops', label: 'Thao tác' },
  { id: 'win', label: 'Ai thắng?' },
  { id: 'village', label: 'Lá Dân làng' },
  { id: 'wolf', label: 'Lá phe Sói' },
  { id: 'third', label: 'Lá phe thứ ba' },
];

function Content({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'intro':
      return (
        <>
          <p>
            Đây là web <b>thay thế quản trò và bộ bài Ma Sói</b>. Web tự chia vai bí mật cho từng người, đọc lời quản trò mỗi đêm,
            đếm giờ và tính ai thắng. Mọi người ngồi quanh một chiếc bàn tròn 3D, mỗi người một ghế cố định.
          </p>
          <p>
            <b>Không có mic và không chat chung.</b> Chỉ có một khung chat riêng cho các Sói, dùng được ban đêm. Chơi cùng phòng
            thì cứ nói chuyện trực tiếp; chơi online thì gọi nhau bằng Google Meet, Discord… Ban đêm và người đã chết tắt mic, chỉ
            bật mic khi tới giờ thảo luận.
          </p>
        </>
      );
    case 'start':
      return (
        <>
          <ul className="abilities">
            <li>Một người tạo phòng và gửi mã phòng hoặc link cho cả nhóm. Cần từ 5 đến 15 người.</li>
            <li>Chủ phòng có thể chọn vai cho ván (có cảnh báo nếu lệch phe), chỉnh thời gian và bật tắt giờ đọc vai.</li>
            <li>
              Chơi cùng phòng: cho một máy vào <b>ghế xem</b> và bật loa để cả bàn nghe quản trò. Ghế xem không chơi.
            </li>
            <li>
              Vào ván, bạn có vài giây đọc thẻ bài của mình. Thẻ nằm ở góc phải, chạm để xem chi tiết, có nút úp thẻ để người bên
              cạnh không thấy.
            </li>
          </ul>
        </>
      );
    case 'round':
      return (
        <>
          <ul className="abilities">
            <li>
              <b>Ban đêm:</b> màn hình tối, quản trò gọi từng vai dậy làm việc. Tới lượt thì màn hình của bạn sáng lên, làm xong
              lại tối. Không tới lượt thì nhắm mắt, im lặng.
            </li>
            <li>
              <b>Trời sáng:</b> thông báo ai chết hiện trên mặt bàn, người chết biến thành bia mộ (vai không bị lộ tới hết ván).
            </li>
            <li>
              <b>Thảo luận:</b> cả bàn nói chuyện để tìm ra Sói. Hết giờ hoặc khi mọi người đồng ý bỏ qua thì sang bỏ phiếu.
            </li>
            <li>
              <b>Bỏ phiếu:</b> mỗi người chọn một người nghi là Sói. Người nhiều phiếu nhất bị treo cổ; hoà phiếu thì chọn ngẫu
              nhiên giữa những người hoà. Rồi sang đêm tiếp theo cho tới khi một phe thắng. Hết ván, vai của mọi người được công
              khai.
            </li>
          </ul>
        </>
      );
    case 'ops':
      return (
        <>
          <ul className="abilities">
            <li>
              <b>Chọn người:</b> chạm vào nhân vật muốn chọn (đường chỉ sáng sẽ nối tới người đó), rồi bấm nút chốt.{' '}
              <b>Đã chốt là xong, không đổi ý.</b>
            </li>
            <li>Vai cần chọn hai người (Thần Tình Yêu, Nhà Ngoại Cảm): chạm lần lượt từng người rồi bấm chốt.</li>
            <li>Muốn bỏ qua lượt thì bấm nút "Bỏ qua". Hết giờ mà chưa chọn thì coi như bỏ qua.</li>
            <li>
              Sói: chat riêng với đồng bọn trong khung chat bên trái khi tới lượt Sói. Sói nhìn nhau chỉ thấy biểu tượng Sói
              chung.
            </li>
            <li>Người chết xem được ai làm gì ban đêm, nhưng phải im lặng tới hết ván.</li>
          </ul>
        </>
      );
    case 'win':
      return (
        <>
          <ul className="abilities">
            <li>
              <b>Dân làng</b> thắng khi mọi Sói đã chết.
            </li>
            <li>
              <b>Phe Sói</b> thắng khi số Sói bằng hoặc nhiều hơn số người còn lại.
            </li>
            <li>Một số vai có điều kiện thắng riêng (Chán Đời, Sói Trắng). Xem ở từng lá bài bên dưới.</li>
          </ul>
        </>
      );
    default:
      return <RolesList only={tab} />;
  }
}

/** Màn hình hướng dẫn: mỗi mục một menu, bấm để chuyển. */
export function HowToPlay({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>('intro');
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card guide" onClick={(e) => e.stopPropagation()}>
        <h2>Hướng dẫn chơi</h2>
        <div className="guide-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`guide-tab${tab === t.id ? ' on' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="guide-scroll" key={tab}>
          <Content tab={tab} />
        </div>
        <button className="btn" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}

/** Nút mở màn hình hướng dẫn, dùng chung ở trang chủ và bàn chờ. */
export function GuideButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="btn ghost small" onClick={onOpen}>
      📖 Hướng dẫn chơi
    </button>
  );
}
