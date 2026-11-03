# Ma Sói 3D

Web thay thẻ bài và quản trò cho Ma Sói. Xem [DE_XUAT_MA_SOI.md](DE_XUAT_MA_SOI.md) (luật, trải nghiệm), [DESIGN.md](DESIGN.md) (thiết kế kỹ thuật), [KICH_BAN_QUAN_TRO.md](KICH_BAN_QUAN_TRO.md) (lời quản trò).

## Chạy thử trên máy

```
npm install
npm run dev          # server cổng 3100 + client Vite cổng 5173
```

Mở http://localhost:5173. Muốn thử nhiều người trên một máy, mở mỗi người một tab (mỗi tab là một phiên riêng) và vào cùng mã phòng. Cần ít nhất 5 tab để bắt đầu.

## Thử trên điện thoại

Điện thoại cùng Wi-Fi với máy tính: chạy `npm run dev`, mở `http://<địa chỉ IP máy tính>:5173` (xem bằng `ipconfig`). Điện thoại cầm dọc hay ngang đều hiển thị game theo chiều ngang (cầm dọc thì giao diện tự xoay 90°). Trang tạo phòng và bàn chờ kéo xuống được khi màn hình thấp.

Khi thử một mình, có thể ép vai bằng biến môi trường `MS_DEBUG_ROLES="villager,villager,villager,villager,werewolf"` (theo thứ tự ghế) khi chạy server, và thêm `?debug` vào link để có công cụ định vị ghế trên màn hình.

## Lệnh khác

- `npm test`: kiểm thử luật và một ván mô phỏng đầy đủ.
- `npm run typecheck`: kiểm tra kiểu.
- `npm run build` rồi `npm start`: chạy bản production (server phục vụ luôn client ở cổng 3100, hoặc `PORT`).
- `node scripts/smoke.mjs`: chạy thử thật qua mạng với 5 người giả (cần server đang chạy).

## Tình trạng

Đã làm xong các bước 1 đến 7 của lộ trình trong DESIGN.md: phòng và bàn chờ (mời ra, chỉnh thời gian), bàn tròn 3D camera cố định, đủ 15 vai và chia vai ngẫu nhiên cân bằng điểm, quản trò tự gọi từng vai ban đêm bằng giọng thu sẵn, chat riêng của Sói, Thợ Săn (súng, đạn), Phù Thủy (ném bình), Thần Tình Yêu, người chết xem được đêm, tạm dừng ván, nối lại khi rớt mạng.

Còn lại là bước 8: chơi thử thật với bạn bè (máy tính và điện thoại, cả iPhone) rồi chỉnh thời gian và luật.
