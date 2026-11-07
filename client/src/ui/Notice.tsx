/** Màn hình thông báo hiện trước trang chính: web chỉ thay quản trò và bộ bài, không có mic. */
export function Notice({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="home">
      <div className="home-card notice-card">
        <div className="notice-moon">🌙</div>
        <h1>Trước khi vào chơi</h1>
        <p>
          Đây là web <b>thay thế quản trò và bộ bài Ma Sói</b>. Web chia vai, đọc lời quản trò, đếm giờ và tính kết quả giúp bạn.
        </p>
        <ul className="notice-list">
          <li>
            <b>Không có mic, không chat chung.</b> Chỉ có một khung chat riêng cho các Sói, và chỉ dùng được ban đêm.
          </li>
          <li>
            Chơi online thì cả nhóm hãy gọi nhau bằng <b>phần mềm thứ ba</b> như Google Meet, Discord, Zalo…
          </li>
        </ul>
        <div className="notice-rule">
          <b>Luật chung nên thống nhất với nhau:</b>
          <ul>
            <li>
              <b>Ban đêm:</b> tất cả tắt mic và nhắm mắt (hoặc cúi mặt), không nói chuyện.
            </li>
            <li>
              <b>Người đã chết:</b> tắt mic tới hết ván, không gợi ý cho ai.
            </li>
            <li>
              <b>Chỉ được bật mic</b> khi tới giờ thảo luận ban ngày. Hết giờ thảo luận thì tắt mic lại.
            </li>
          </ul>
        </div>
        <button className="btn primary" onClick={onContinue}>
          Mình đã hiểu, vào chơi
        </button>
      </div>
    </div>
  );
}
