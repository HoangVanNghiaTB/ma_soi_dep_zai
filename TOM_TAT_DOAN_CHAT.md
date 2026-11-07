# Tóm tắt quá trình làm web Ma Sói

Ghi lại những gì đã làm và đã chốt trong đoạn chat, để sau này đọc lại cho nhanh. Luật chi tiết nằm ở [DE_XUAT_MA_SOI.md](DE_XUAT_MA_SOI.md), thiết kế kỹ thuật ở [DESIGN.md](DESIGN.md), lời quản trò ở [KICH_BAN_QUAN_TRO.md](KICH_BAN_QUAN_TRO.md).

## 1. Mục tiêu

Một trang web Ma Sói 3D riêng (không còn nằm trong rạp), **thay bộ bài và quản trò**:

- Server là quản trò tự động: chia bài, gọi từng vai ban đêm bằng giọng thu sẵn, đếm giờ, tính kết quả.
- Mọi người ngồi quanh một bàn tròn 3D, mỗi người một ghế cố định.
- **Không có mic.** Ngồi chung phòng hoặc gọi Discord để nói chuyện. Chỉ có một khung chat: **chat riêng của bầy Sói ban đêm**.
- Không tài khoản, không điểm thưởng, không cơ sở dữ liệu. Phòng sống trong bộ nhớ server.

## 2. Các quyết định chính

**Thao tác**
- Chỉ con trỏ vào người, rồi bấm nút chốt cạnh nút "Bỏ qua". Bấm chốt là xong, không đổi ý. Bấm nhầm thì người chơi tự chịu.
- Bỏ phiếu 30 giây, không đổi phiếu. Số phiếu hiện trên đầu từng người.
- Chọn hai người (Thần Tình Yêu, Nhà Ngoại Cảm): chạm lần lượt từng người rồi bấm chốt.

**Giao diện**
- Camera cố định kiểu Liên Quân, ghế của mình luôn ở phía gần camera. Bàn lệch trái để chừa chỗ cho thẻ bài bên phải.
- Mọi thông báo (giai đoạn, đồng hồ, lời quản trò, người chết, kết quả) in thẳng lên mặt bàn.
- Thẻ bài nền kem theo mẫu của bạn: viền theo phe, hàng đầu ghi "MA SÓI" và điểm, emoji lớn, tên vai, nhãn phe, tác dụng ngắn. Có nút úp thẻ.
- Biểu tượng vai trên đầu nhân vật dùng cùng bộ emoji với thẻ. Người khác không thấy vai của bạn. Sói nhìn nhau chỉ thấy biểu tượng "Sói" chung.
- Điện thoại cầm dọc hay ngang đều hiển thị game theo chiều ngang (cầm dọc thì giao diện tự xoay 90°). Trang tạo phòng và bàn chờ kéo xuống được.

**Ban đêm**
- Màn hình tối, chỉ có vệt sáng mờ ngay trên mặt bàn. Vai được gọi thì sáng lên, xong thì tối lại. Vai gọi cuối giữ sáng thêm 5 giây rồi về đen, tới sáng thì mọi người cùng sáng.
- Quản trò chỉ gọi những vai có trong ván. Vai đã chết vẫn được gọi và chờ ngẫu nhiên để không lộ.
- Người chết xem được ai làm gì ban đêm (không xem được chat Sói).

**Luật vai (các chỗ bạn chốt)**
- Bảo Vệ che được **mọi đòn giết ban đêm** (Sói cắn, Sói Trắng, bình độc), không chọn trùng người đêm trước.
- Thợ Săn chết thì rút súng, bắn trước, rồi bia mộ hiện cùng lúc và công bố một thể.
- Phù Thủy ném bình: xanh lá là cứu, tím là độc.
- Kẻ Phản Bội chỉ dậy ở đêm đầu, ngay sau bầy Sói. Sói Trắng ở trong bầy Sói (vào chat Sói).
- Bầy Sói cắn hoà số lượt thì chọn ngẫu nhiên người bị cắn.
- Tiên Tri và Nhà Ngoại Cảm chỉ xem được kết quả của đêm gần nhất, sang đêm mới là mất.
- Người chết biến thành bia mộ, không lộ vai. Hết ván công khai vai của mọi người.

## 3. Đã làm xong

- **Tài liệu:** đề xuất luật, thiết kế kỹ thuật, kịch bản quản trò.
- **Mã nguồn** (TypeScript): `shared/` (vai, giao thức, cấu hình), `server/` (Node + Socket.IO), `client/` (React + three.js), `tests/`.
- **Đủ 15 vai**, chia vai ngẫu nhiên cân bằng điểm (tổng từ −3 đến +3), theo thuật toán trong thư mục `werewolf/` bạn gửi.
- **Phòng và bàn chờ:** tạo phòng bằng mã hoặc link, 10 ghế, đếm ngược bắt đầu, chủ phòng mời người ra, chỉnh vài mốc thời gian, tạm dừng ván, nối lại khi rớt mạng (giữ ghế 60 giây).
- **Hiệu ứng:** súng và đạn của Thợ Săn, bình thuốc của Phù Thủy, bia mộ, trái tim cặp đôi.
- **Âm thanh:** 23 file giọng quản trò và 7 hiệu ứng, đặt ở `client/public/audio/`.
- **Kiểm thử:** 51 kiểm thử qua, gồm 36 ván bot mô phỏng ngẫu nhiên đủ cỡ bàn 5–10 (ván luôn kết thúc, không lộ vai).
- **Đã chụp thử** màn hình trên trình duyệt thật và giả lập điện thoại (dọc, ngang, ngang nhỏ).
- **Dọn dẹp:** bỏ các thư mục cũ của rạp (`dist`, `public`, `sounds-quanTro`). Phần Ma Sói trong đó trùng hệt file đã có.

## 4. Chạy và triển khai

- **Chạy trên máy:** `npm install` rồi `npm run dev`, mở `http://localhost:5173`. Điện thoại cùng Wi-Fi mở `http://<IP máy tính>:5173`. Xem [README.md](README.md).
- **GitHub:** https://github.com/HoangVanNghiaTB/ma_soi_dep_zai (nhánh `main`).
- **Render:** đã chạy thử quy trình giống Render (cài, build, chạy, kết nối) trên bản clone sạch, đều ổn. Cấu hình ở `render.yaml`:
  - Build `npm install --include=dev && npm run build`, Start `npm start`.
  - Health check `/health`, biến môi trường `NODE_ENV=production` và `NODE_VERSION=22`.
  - Gói Free: RAM 512 MB, tự ngủ sau khoảng 15 phút, phòng mất khi web ngủ hoặc triển khai lại.
  - Bạn đã có tài khoản Render và dịch vụ `cinema-3d`. Muốn Ma Sói nằm ngoài project giống `cinema-3d`: tạo **New → Web Service**, không chọn project.

## 5. Chưa kiểm chứng và còn lại

- Chưa thử trên điện thoại thật, nhất là iPhone (cách xoay giao diện và phát âm thanh).
- Chưa chơi thử thật với nhiều người (bước 8 của lộ trình): cần chỉnh thời gian và luật sau khi chơi.
- Chưa xem bằng mắt: súng, đạn, bình thuốc bay, khung chat Sói, thẻ màu đỏ, tím và xám.
- Câu `wolf_wake_short`: lời chữ do tôi tự viết ("Ma Sói, hãy chọn thêm một người để cắn."), cần nghe file thật rồi sửa cho khớp.
- Thời lượng `psychic_sleep` đang ước 1,5 giây vì chưa đo.
- Hình emoji do máy người chơi tự vẽ nên mỗi hệ điều hành ra khác nhau một chút.
- Hai câu gọi Kẻ Phản Bội trong kịch bản cần nghe lại cho khớp thứ tự gọi mới.

## 6. Bổ sung sau

- **Chọn vai ở bàn chờ:** chỉ chủ phòng chọn, bằng nút − / + cho từng vai. Phải chọn đủ bằng số người đang ngồi, có ít nhất một Sói và một người ngoài phe Sói; vai được xáo ngẫu nhiên cho từng người. Xoá hết thì máy tự chia cân bằng như cũ.
- **Thời gian đọc vai đầu ván:** mặc định 20 giây (chỉnh 5–60 giây), chủ phòng bật hoặc tắt được. Thẻ bài tự mở chi tiết trong lúc đọc, hết giờ mới vào đêm 1.
