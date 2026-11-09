# Đề xuất: web Ma Sói 3D thay bộ bài và quản trò

Tài liệu này viết lại cho hướng mới: **một trang web riêng về Ma Sói**, không còn nằm trong rạp. Luật vai, cách chia vai và điều kiện thắng giữ lại từ bản trước. Phần điểm, mic và cửa sổ overlay của rạp đã bỏ. **Chat riêng của Sói được giữ lại.**

## 1. Ý tưởng

Ngoài đời không ai muốn làm quản trò, và bộ bài giấy thì phiền. Web này thay cả hai:

- **Thay bộ bài:** web chia vai, mỗi người chỉ thấy vai của mình trên máy của mình.
- **Thay quản trò:** web tự đọc lời dẫn, gọi từng vai dậy ban đêm, đếm giờ, tính người chết, kiểm tra thắng thua.
- **Web chỉ thay thẻ bài và quản trò.** Không có mic, không có voice. Mọi người ngồi chung phòng, hoặc gọi qua Discord để nói chuyện. Web không làm thay việc đó.
- **Chỉ có một khung chat: chat riêng của bầy Sói ban đêm**, để Sói thống nhất người cần cắn mà không phải thì thầm (ngồi chung phòng thì thì thầm sẽ bị nghe, qua Discord thì không có kênh riêng).
- **Cảnh 3D:** mọi người ngồi quanh một **bàn tròn**. Mỗi người **một ghế cố định**, chỉ ngồi, không đi lại.
- **Con trỏ để chỉ:** khi bỏ phiếu hay chọn mục tiêu (cắn, soi, bảo vệ...), người chơi dùng con trỏ chỉ vào người đó trên bàn, rồi bấm nút chốt cạnh nút "Bỏ qua".

## 2. Những điều đã chốt

| # | Nội dung | Quyết định |
|---|---|---|
| 1 | Hình thức | Web riêng, độc lập, không gắn với rạp. |
| 2 | Quản trò | Web tự làm hoàn toàn. |
| 3 | Mic / voice | Không có. Ngồi chung phòng hoặc dùng Discord. Web chỉ thay thẻ bài và quản trò. |
| 3b | Chat | Chỉ giữ chat riêng của bầy Sói ban đêm (mục 4.2). **Ban ngày Sói không chat được**, không ai có chat. |
| 4 | Không gian | 3D, bàn tròn, mỗi người một ghế. |
| 5 | Di chuyển | Không. Ngồi yên tại ghế, chỉ xoay nhìn. |
| 6 | Thao tác chọn người | Chỉ con trỏ vào người đó (chuột hoặc chạm), hiện nút chốt cạnh nút "Bỏ qua"; bấm nút chốt là xong, không đổi ý. |
| 7 | Vai | 22 vai, chia ngẫu nhiên, tổng điểm cân bằng từ −3 đến +3 (mục 5). |

## 3. Vào phòng và bàn chờ

1. Một người **tạo phòng**, nhận **mã phòng** hoặc đường link. Người khác vào bằng mã hoặc link, nhập tên. Chưa cần đăng ký tài khoản.
2. Mỗi phòng có **một bàn tròn, tối đa 15 ghế**. Vào phòng là được xếp **một ghế**. Có thể đổi sang ghế trống khi ván chưa bắt đầu.
3. **Chủ phòng** (người tạo) bấm "Bắt đầu" khi có **từ 5 người** trở lên. Hết 15 giây đếm ngược cho người khác kịp vào. Đủ 15 người thì bắt đầu ngay. Chủ phòng thoát thì quyền chuyển cho người kế.
4. Đang đếm ngược mà tụt xuống dưới 5 người thì **huỷ đếm ngược**.
5. **Không vào giữa ván.** Người đến sau chờ ván kế tiếp.
6. Hết ván, mọi người **ở lại bàn chờ** của phòng, chủ phòng bấm bắt đầu ván mới. Vai được chia lại.

## 4. Một ván diễn ra thế nào

### 4.1 Chia bài
Server xáo trộn và chia vai (mục 5.2). Mỗi người thấy **vai của mình** bằng biểu tượng trên đầu nhân vật của mình, kèm thẻ giải thích cách chơi vai. Người khác không thấy gì. Các Sói nhìn nhau chỉ thấy biểu tượng "Sói" thường, chỉ mình mới thấy vai chính xác của mình (mục 8.1). Thị Trưởng lộ cho cả bàn từ đầu ván.

### 4.2 Ban đêm
- Quản trò đọc lời dẫn bằng **giọng thu sẵn** kèm **dòng chữ** giữa bàn: "Trời tối, mọi người nhắm mắt."
- **Màn hình mọi người tối đi, giữa màn hình chỉ có một vệt sáng mờ**, không nhìn thấy ai quanh bàn (mục 8.1). Vai nào được gọi thì màn hình **sáng lại** để làm việc, xong thì tối lại.
- Quản trò **gọi lần lượt từng vai** theo [KICH_BAN_QUAN_TRO.md](KICH_BAN_QUAN_TRO.md), **chỉ gọi những vai có trong ván này**, không gọi vai không có trong ván. Thứ tự: Thần Tình Yêu (đêm đầu), Bảo Vệ, bầy Sói, Kẻ Phản Bội (chỉ đêm đầu, gọi ngay sau bầy Sói), Sói Đầu Đàn, Sói Trắng (hai đêm một lần), Tiên Tri, Phù Thủy, Nhà Ngoại Cảm. Bảo Vệ gọi trước bầy Sói để Sói Đầu Đàn biết người bị cắn có được che không.
- **Cách chọn:** người được gọi **chỉ con trỏ vào người cần chọn**, lúc đó hiện **nút chốt cạnh nút "Bỏ qua"** (ví dụ "Cắn", "Soi", "Bảo vệ"). **Bấm nút chốt là xong, không đổi ý.** Trước khi bấm thì chỉ sang người khác thoải mái. Chọn xong thì sang vai kế tiếp, không chờ hết giờ.
- Vai đã chia mà người giữ **đã chết** vẫn được gọi và chờ vài giây ngẫu nhiên, để người ngoài không đoán được vai còn sống hay không.
- **Bầy Sói** thức dậy cùng lúc gồm Ma Sói, Sói Con, Sói Đầu Đàn và **Sói Trắng** (Sói Trắng ở trong bầy để không bị lộ). **Kẻ Phản Bội có lời gọi riêng, chỉ ở đêm đầu**: vừa gọi bầy Sói dậy xong thì gọi luôn Kẻ Phản Bội dậy để nhận ra các Sói, nhưng **không thao tác được** và không vào chat. Lúc gọi bầy Sói ngủ thì ngay sau đó gọi Kẻ Phản Bội ngủ. Từ đêm 2 không gọi Kẻ Phản Bội nữa. Cách chọn người cắn:
  - Các Sói **thấy con trỏ của nhau**. Mỗi Sói chỉ vào một người rồi bấm "Cắn". **Số Sói đã bấm cắn hiện trên đầu từng người.**
  - Chốt khi mọi Sói còn sống đã bấm hoặc hết giờ. Người nhiều lượt cắn nhất bị cắn; hoà lượt cắn thì **chọn ngẫu nhiên một người trong số những người hoà để chết**.
- **Chat riêng của Sói:** khi bầy Sói được gọi, hiện một khung chat nhỏ, **server chỉ gửi cho các Sói** (Ma Sói, Sói Con, Sói Đầu Đàn, **Sói Trắng**). **Kẻ Phản Bội không vào chat.** Khung chat **đóng ngay khi bầy Sói chọn xong** hoặc hết giờ, và **Sói không chat được vào ban ngày** (không có khung chat nào ban ngày, server cũng chặn tin nhắn gửi ngoài giờ bầy Sói được gọi). Sói đã chết không chat, và **người chết cũng không xem được chat Sói**. Lịch sử chat không lưu sang ván sau.
- **Sói Đầu Đàn** có lượt gọi riêng (từ đêm 2, một lần) để biến người bị cắn. **Người bị biến chỉ đổi biểu tượng trên đầu thành Sói**, rồi nhìn được các Sói khác và vào chat Sói như một Sói bình thường.
- **Sói Trắng** có lượt gọi riêng cách một đêm để giết một Sói khác.
- **Thần Tình Yêu** chọn hai người thành đôi ở đêm đầu. **Hai người trong cặp thấy biểu tượng trái tim trên đầu nhau**, để biết mình cặp với ai. Người ngoài cặp không thấy.
- **Hết đêm:** vai được gọi cuối cùng **giữ sáng thêm 5 giây rồi về màn hình đen**, sau đó khi trời sáng **mọi người cùng sáng lên một lúc**, để không ai đoán được vai gọi cuối qua màn hình.

### 4.3 Ban ngày
- Trời sáng. Nếu **Thợ Săn chết đêm qua thì Thợ Săn bắn trước** (mục 4.4). Sau đó **tất cả người chết đêm qua** (kể cả Thợ Săn và người bị bắn) **biến thành bia mộ cùng lúc** ngay tại ghế, và quản trò **công bố một thể bằng chữ trên mặt bàn trong khoảng 5 đến 8 giây** (ví dụ "Đêm qua, A và B đã chết", hoặc "Đêm qua không ai chết"). Chỉ nói tên, không nói vì sao chết và không lộ vai.
- **Thảo luận** khoảng 120 giây, bằng cách người chơi tự nói chuyện với nhau. Web chỉ đếm giờ. Quá 60 giây thì hiện nút "Bỏ qua thảo luận"; tất cả người còn sống bấm thì sang bỏ phiếu sớm. Không có xin thêm giờ.
- **Bỏ phiếu treo cổ** 30 giây. Mỗi người **chỉ con trỏ vào một người**, hiện **nút "Vote" cạnh nút "Bỏ qua"** (bỏ qua là phiếu trắng). **Bấm "Vote" là chốt, không đổi phiếu.** Trước khi bấm thì chỉ sang người khác được. **Số phiếu đã vote hiện trên đầu từng người**, công khai cho cả bàn. Hết giờ hoặc mọi người đã bấm xong thì chốt. Phiếu nhiều nhất bị treo, hoà phiếu thì không ai bị treo.
- Người bị treo cổ **không lộ vai**.

### 4.4 Người chết
Người chết **biến thành bia mộ** ngay tại ghế của mình (người bị treo cổ hay bị Thợ Săn bắn cũng vậy). Họ **vẫn xem tiếp ván** nhưng không bỏ phiếu và không làm gì ban đêm. Bia mộ **không hiện vai**. Ban đêm người chết **xem được ai làm gì**: thấy vai nào được gọi, người đó chỉ vào ai, và các hiệu ứng cắn, soi, bảo vệ, ném bình... (**không gồm chat Sói**). Nhờ vậy họ biết vai của những người có hành động đêm đó, còn vai không hành động thì vẫn giấu tới hết ván. Vì web không quản lý lời nói, luật **chết thì im lặng** dựa vào sự tự giác của người chơi.

**Thợ Săn bắn khi chết** (bị Sói cắn, bị treo cổ hay chết vì lý do khác):
1. Thợ Săn **chưa thành bia mộ ngay**. Nhân vật của họ **rút súng ra** (một khẩu súng đơn giản). Nếu chết ban đêm thì **bắn ngay lúc trời sáng, trước lúc công bố** (mục 4.3).
2. Trong khoảng **15 giây**, Thợ Săn **chỉ con trỏ vào một người**, hiện **nút "Bắn" cạnh nút "Bỏ qua"**. Bấm "Bắn" là chốt, giống mọi thao tác khác.
3. **Một viên đạn đơn giản bay từ súng tới người bị chỉ.** Trúng thì **cả hai biến thành bia mộ**: Thợ Săn và người bị bắn (cùng lúc với những người chết khác nếu là ban đêm).
4. Hết 15 giây mà không chọn, hoặc bấm "Bỏ qua", thì không ai bị bắn, Thợ Săn thành bia mộ một mình.
5. Cả bàn **đều thấy** cảnh rút súng và viên đạn, nên ai cũng biết người đó là Thợ Săn (đã ghi ở mục 5.4). Lúc này lộ vai Thợ Săn là đúng luật.
6. Người bị bắn thành bia mộ giống mọi người chết khác, **không lộ vai**. Nếu họ là một nửa của cặp đôi Thần Tình Yêu thì người kia chết theo như thường.

### 4.5 Kết thúc
**Công khai vai của tất cả mọi người**, hiện phe thắng to giữa bàn, rồi quay về bàn chờ (khoảng 25 giây sau).

## 5. Vai trò và cân bằng

Dùng bảng điểm masoi.online làm thước đo (gọi là **điểm cân bằng**, không liên quan tới điểm thưởng nào cả). Đây không phải chuẩn chính thức nên cần chơi thử rồi chỉnh. Chọn 15 vai **không phụ thuộc chỗ ngồi** (bỏ Hiệp Sĩ Kiếm Rỉ, Kẻ Khủng Bố...), vì dù bàn tròn nhưng người chơi không cần nhớ ai ngồi cạnh ai.

### 5.1 Danh sách 22 vai

**Phe Dân làng (15 vai)**

| Vai | Điểm cân bằng | Việc làm |
|---|---|---|
| Dân làng | +1 | Không có chức năng. Chỉ thảo luận và bầu. |
| Tiên Tri | +7 | Mỗi đêm soi một người có phải Sói không. Kẻ Phản Bội soi ra là người. Sói Trắng soi ra là Sói. |
| Bảo Vệ | +4 | Mỗi đêm bảo vệ một người khỏi **mọi đòn giết ban đêm** (cắn, Sói Trắng giết, bình độc). Bảo Vệ không biết ai sắp chết nên chọn là hên xui. Không chọn cùng người hai đêm liền. |
| Thợ Săn | +3 | Khi chết (kể cả bị treo cổ) được rút súng, chỉ một người, người đó chết theo. |
| Phù Thủy | +5 | Một bình cứu, một bình độc, mỗi bình dùng một lần. Thấy ai bị Sói cắn trong đêm đó. |
| Thị Trưởng | +2 | Phiếu bầu treo cổ tính hai phiếu. Mọi người đều biết ai là Thị Trưởng. |
| Hoàng Tử | +2 | Bị treo cổ lần đầu thì không chết, và lộ vai cho cả bàn. |
| Nhà Ngoại Cảm | +4 | Mỗi đêm chỉ hai người, biết họ có cùng phe không (Dân hay Sói, phe thứ ba tính riêng). |
| Kẻ Ngốc | +2 | Không có việc ban đêm. Khi bỏ phiếu **không được bỏ qua**: bấm "Chọn ngẫu nhiên" hoặc hết giờ mà chưa chọn thì phiếu rơi vào một người ngẫu nhiên. |
| Người Yêu Hoà Bình | −2 | Không có việc ban đêm. Phiếu **luôn là bỏ qua** (chỉ bấm "Bỏ qua" được), nên vô tình cứu người bị nghi. |
| Người Mang Dáng Sói | −1 | Dân làng, nhưng Tiên Tri và Tiên Tri Nữ soi ra là **Sói**. Các vai khác vẫn coi là Dân làng. |
| Thầy Đồng | +3 | Mỗi đêm chọn một người, biết họ **có vai đặc biệt không**. "Không đặc biệt" chỉ là Dân làng thường và Ma Sói thường; mọi vai còn lại là đặc biệt. |
| Thám Tử Ngoại Cảm | +3 | Mỗi đêm chọn một người (kể cả mình), biết **trong ba người liền nhau** (người đó và hai người ngồi hai bên, chỉ tính người còn sống) **có Sói không**, không biết ai. Kẻ Phản Bội và Phù Thủy Sói không tính là Sói. |
| Tiên Tri Nữ | +7 | Y hệt Tiên Tri, được gọi cùng lượt. Chỉ xuất hiện ở bàn từ 10 người. |
| Thần Tình Yêu | +3 | Đêm đầu chỉ hai người thành đôi. Một người chết thì người kia cũng chết. Cặp đôi có thể thuộc bất cứ phe nào. Hai người trong cặp thấy biểu tượng trái tim trên đầu nhau. |

**Phe Ma Sói (5 vai)**

| Vai | Điểm cân bằng | Việc làm |
|---|---|---|
| Ma Sói | −6 | Cùng bầy Sói chọn một người để cắn mỗi đêm. |
| Sói Con | −8 | Khi bị loại, bầy Sói được cắn thêm một người vào đêm kế tiếp. |
| Sói Đầu Đàn | −9 | Từ đêm 2, một lần trong ván, biến người bị cắn thành Sói thay vì giết. Chỉ biến được khi Bảo Vệ không che người đó và sau khi biến số Sói vẫn ít hơn số người còn lại. Người bị biến đổi biểu tượng thành Sói, thấy bầy Sói và vào chat Sói. Nếu người bị biến là Thị Trưởng thì vẫn giữ mũ Thị Trưởng trên đầu và phiếu tính hai (người ngoài không thấy gì thay đổi). |
| Phù Thủy Sói | −3 | Mỗi đêm được gọi riêng, chọn một người để biết họ **có phải Tiên Tri (hoặc Tiên Tri Nữ) không**. Sói và Phù Thủy Sói **không biết nhau**, Phù Thủy Sói không vào chat Sói. Tiên Tri soi ra là người. Tính vào phe Sói khi so số người; Dân phải loại cả Phù Thủy Sói mới thắng. |
| Kẻ Phản Bội | −6 | Chỉ đêm đầu, được gọi dậy ngay sau bầy Sói để nhận ra các Sói, không thao tác được. Giúp Sói thắng, nhưng Sói không biết nó. Tiên Tri soi ra là người. |

**Phe thứ ba (2 vai)**

| Vai | Điểm cân bằng | Việc làm và cách thắng |
|---|---|---|
| Chán Đời | −2 | Chỉ thắng nếu **bị dân làng treo cổ ban ngày**. Thắng thì ván kết thúc ngay, hai phe kia thua. |
| Sói Trắng | −2 | Thức dậy cùng bầy Sói, cứ hai đêm được giết thêm một Sói khác. Chỉ thắng nếu **là người cuối cùng còn sống**. Tiên Tri soi ra là Sói. |

### 5.2 Cách random vai (tổng điểm cân bằng từ −3 đến +3)

0. **Bàn 5 người là ngoại lệ:** rút 5 lá bất kỳ từ bộ bài, **không theo các luật chia phe dưới đây**, chỉ cần tổng điểm cân bằng trong −3 đến +3. Chỉ giữ hai điều tối thiểu: mỗi lá không quá số bản của bộ bài thật (Ma Sói tối đa 3, vai đặc biệt 1, Dân làng tuỳ ý) và có ít nhất một Sói (Ma Sói, Sói Con, Sói Đầu Đàn hoặc Sói Trắng), nếu không ván kết thúc ngay.
1. Với N từ 6 đến 10, server **rút ngẫu nhiên N lá** từ bộ 15 vai theo các luật:
   - Số người phe Sói (Ma Sói, Sói Con, Sói Đầu Đàn, Kẻ Phản Bội): **2** khi N = 6 hoặc 7, **3** khi N từ 8 đến 10. Luôn có ít nhất một **Sói thật** (không chỉ Kẻ Phản Bội).
   - Ma Sói tối đa 3 lá. Dân làng không giới hạn. Các vai còn lại mỗi vai tối đa **một** lá.
   - **Phe thứ ba** chỉ xuất hiện khi N ≥ 8, mỗi ván tối đa **một** vai phe thứ ba.
   - Phù Thủy Sói được rút như một chỗ của phe Sói (cùng Kẻ Phản Bội). Tiên Tri Nữ chỉ có khi N ≥ 10. Các vai mới (Kẻ Ngốc, Người Yêu Hoà Bình, Người Mang Dáng Sói, Thầy Đồng, Thám Tử Ngoại Cảm) rút như các vai đặc biệt khác.
2. **Cộng điểm cân bằng** các lá vừa rút. Tổng nằm trong **−3 đến +3** thì dùng, không thì rút lại (thử tối đa vài trăm lần).
3. Không ra đội hình hợp lệ (hiếm) thì dùng **đội hình mẫu** dưới đây rồi xáo ngẫu nhiên cho từng người.

| Số người | Vai trong ván | Tổng điểm cân bằng |
|---|---|---|
| **5** | Sói Đầu Đàn, Tiên Tri, Hoàng Tử, Dân làng ×2 | **+2** |
| **6** | Ma Sói, Sói Con, Tiên Tri, Bảo Vệ, Thợ Săn, Dân làng | **+1** |
| **7** | Ma Sói, Sói Đầu Đàn, Tiên Tri, Bảo Vệ, Thợ Săn, Dân làng ×2 | **+1** |
| **8** | Ma Sói, Sói Con, Kẻ Phản Bội, Tiên Tri, Bảo Vệ, Phù Thủy, Thợ Săn, Nhà Ngoại Cảm | **+3** |
| **9** | Ma Sói, Sói Con, Kẻ Phản Bội, Tiên Tri, Bảo Vệ, Phù Thủy, Thợ Săn, Thần Tình Yêu, Chán Đời | **0** |
| **10** | Ma Sói ×2, Sói Con, Sói Trắng, Tiên Tri, Bảo Vệ, Phù Thủy, Thợ Săn, Thị Trưởng, Hoàng Tử | **+1** |

### 5.3 Điều kiện thắng
- **Dân thắng** khi hết Sói (Ma Sói, Sói Con, Sói Đầu Đàn, Sói Trắng) và Kẻ Phản Bội.
- **Phe Sói thắng** khi số người phe Sói còn sống **không ít hơn** số người còn lại. Sói Trắng không tính vào phe Sói để thắng.
- **Chán Đời thắng** ngay khi bị treo cổ ban ngày.
- **Sói Trắng thắng** khi là người duy nhất còn sống.
- **Cặp đôi của Thần Tình Yêu** chỉ cùng chết, chưa có điều kiện thắng riêng.

### 5.4 Chỗ tự chọn luật, cần xem lại
- **Sói Trắng "thắng khi là Sói cuối cùng":** hiểu là *còn sống một mình* mới thắng.
- **Thị Trưởng lộ vai từ đầu:** theo thông lệ nhiều bộ, không bắt buộc.
- **Kẻ Phản Bội** tính vào phe Sói khi so sánh số người, nhưng Sói không biết nó.
- **Hoàng Tử** lộ vai khi bị treo lần đầu.
- **Thợ Săn và Hoàng Tử** là hai vai tự lộ qua hành động, dù không lật bài.

## 6. Giao diện 3D

- **Cảnh:** một căn phòng tối, **bàn tròn ở giữa**, mỗi người một ghế quanh bàn. Mỗi ghế có hình đại diện và tên người ngồi.
- **Góc nhìn:** **cố định kiểu Liên Quân**: camera nhìn chéo từ trên xuống, không xoay, không di chuyển. Ghế của mình luôn nằm ở phía gần camera (dưới màn hình), các ghế khác xếp vòng quanh bàn, nên mọi người thấy cùng một bố cục chỉ khác vị trí của mình.
- **Con trỏ:** rê chuột hoặc chạm vào người nào thì chỉ vào người đó và người đó được làm nổi bật; lúc đó hiện nút chốt ("Vote", "Cắn"...) cạnh nút "Bỏ qua". Bấm nút chốt mới tính, nên trên điện thoại chạm thử vẫn chưa mất lượt. Con trỏ ban ngày hiện cho mọi người thấy, ban đêm chỉ hiện đúng đối tượng (mục 4.2).
- **Khung chat Sói:** góc màn hình, chỉ hiện cho Sói và chỉ trong lúc bầy Sói được gọi; ban ngày ẩn hẳn, không gửi được.
- **Mọi thông báo hiện trên mặt bàn** (một bảng đặt trên bàn): tên giai đoạn, đồng hồ đếm ngược, dòng chữ lời quản trò (cùng lúc phát giọng), người chết đêm qua, kết quả bỏ phiếu, phe thắng khi hết ván, gợi ý ngắn cho người chơi. Ngoài bàn chỉ còn những thứ cần bấm (nút chốt, nút bỏ qua) và thẻ vai.
- **Thẻ vai ở góc phải trên:** luôn ghim sẵn, hiện tên vai, phe, tóm tắt, **từng ý tác dụng và cách chơi**, và mục tiêu thắng; thu gọn / mở ra được. Có nút "cách chơi các vai" mở danh sách đủ 15 vai để tra cứu.
- **Trên đầu mỗi người:** số phiếu lúc bỏ phiếu (và số Sói đã bấm cắn, chỉ Sói thấy); biểu tượng Thị Trưởng; biểu tượng trái tim của cặp đôi (chỉ hai người trong cặp thấy). Người chết thì thay bằng bia mộ.
- **Vai của mình:** biểu tượng vai nổi trên đầu nhân vật của mình (người khác không thấy; Sói nhìn nhau chỉ thấy biểu tượng "Sói" thường, chỉ mình thấy vai chính xác của mình). Có nút mở thẻ giải thích cách chơi vai. Lá bài, nếu hiện trong cảnh, quay mặt trong màu đen về phía người khác.
- **Ban đêm:** màn hình tối, chỉ có một vệt sáng mờ ở giữa; vai đang được gọi thì màn hình sáng lại, xong thì tối lại (vai gọi cuối giữ sáng thêm 5 giây rồi về đen, tới sáng thì mọi người cùng sáng); chỉ vai đang được gọi mới thấy bảng làm việc ("Chọn người để cắn", "Chọn người để soi"...). Có ghi chú nhắc rằng **bấm nút chốt là chốt, bấm nhầm là mất lượt**. Các ghế xếp xa nhau để dễ chỉ đúng người.
- **Người chết:** ghế chuyển thành bia mộ (có tên người chết, không hiện vai), hiện dòng "Bạn đã chết, hãy im lặng tới hết ván".
- **Âm thanh:** giọng quản trò, sói hú lúc trời tối, chim hót lúc sáng, tiếng treo cổ, tiếng súng Thợ Săn, tiếng chọn / bỏ phiếu / đếm ngược / thắng thua. Có nút bật / tắt tiếng.
- **Điện thoại:** chạm để chọn người, bố cục thu gọn, không cần bàn phím.
- **Lưu ý khi cả bàn ngồi chung phòng:** nên chỉ **một thiết bị phát giọng quản trò** (hoặc mỗi người đeo tai nghe), vì nhiều máy phát cùng lúc sẽ bị lệch tiếng. Cần một tuỳ chọn cho việc này (mục 11).

## 7. Phần kỹ thuật cần lưu ý

### 7.1 Trạng thái riêng cho từng người
Server không gửi chung một trạng thái cho cả bàn. Mỗi người chỉ nhận **phần của mình**: vai của mình, Sói thấy nhau và tin nhắn chat của Sói (người chết và Kẻ Phản Bội không nhận chat Sói), trái tim của cặp đôi, kết quả soi của Tiên Tri... Người chết xem được diễn biến công khai và **mọi hành động ban đêm** (kèm vai của người hành động, mục 4.4), nhưng không thấy vai của những người không hành động. Đây là phần quan trọng nhất để chống lộ bài.

### 7.2 Server là quản trò
Mọi thứ do server đếm giờ và quyết định (đếm ngược, đêm, ngày, bỏ phiếu); trình duyệt chỉ hiển thị và gửi lựa chọn. Không ai chỉnh giờ hay sửa kết quả được. Dọn đồng hồ khi phòng trống.

### 7.3 Thời gian thực
Cần kết nối hai chiều (ví dụ WebSocket) để đồng bộ phòng, ghế, con trỏ, phiếu bầu, chat Sói. Con trỏ chỉ gửi **vị trí đang chỉ vào ai** (không gửi toạ độ chuột), giảm tải và dễ ẩn / hiện theo giai đoạn.

### 7.4 Mất kết nối
Ai rớt mạng hoặc đóng tab có **60 giây** để quay lại đúng ghế cũ (nhớ bằng mã phiên). Trong lúc vắng, server **chơi thay** (không làm gì ban đêm, không bầu) để ván không bị kẹt. Quá 60 giây thì coi như rời ván, vai vẫn do server chơi thay.

### 7.5 Ván kẹt hoặc thiếu người
Còn dưới **3 người thật** thì ván huỷ. Ván kéo quá lâu (đề xuất 40 phút) cũng huỷ. Không có tính điểm nên không cần hoàn trả gì.

### 7.6 Giọng đọc quản trò
Dùng lời **thu sẵn** theo từng vai và từng giai đoạn. Kịch bản lời quản trò đã có ở [KICH_BAN_QUAN_TRO.md](KICH_BAN_QUAN_TRO.md), giọng thu sẵn ở thư mục `sounds-quanTro` và âm thanh ở `sfx`. Quản trò chỉ gọi những vai có trong ván. Hai câu gọi Kẻ Phản Bội (`gm_traitor_wake`, `gm_traitor_sleep`) giữ nguyên; thứ tự gọi trong kịch bản đã đổi: Kẻ Phản Bội gọi ngay sau Ma Sói (cả lúc dậy và lúc ngủ), không còn đứng trước Bảo Vệ. Giọng thu sẵn đã đủ 23 file.

## 8. Thao tác và chống lộ bài

### 8.1 Đã chốt

- **Hai bước, bấm nút chốt là xong.** Bước 1: chỉ con trỏ vào người cần chọn (chỉ sang người khác thoải mái). Bước 2: bấm nút chốt ("Vote", "Cắn", "Soi"...) hiện cạnh nút "Bỏ qua". **Bấm nút chốt rồi thì không đổi ý.** Bấm nhầm nút chốt thì người chơi tự chịu, như Goose Goose Duck. Khi làm giao diện sẽ **xếp các ghế đủ xa nhau, hitbox vừa phải** để hạn chế chỉ nhầm người.
- **Bỏ phiếu 30 giây, không đổi phiếu.** Số phiếu hiện trên đầu từng người. Phiếu đã bấm "Vote" là phiếu cuối cùng, nên phải cân nhắc kỹ trước khi bấm.
- **Không có xin thêm giờ thảo luận.**
- **Không có ghi chú cá nhân và không có nhật ký ván.** Ngoài đời không ai ghi chép, nên trên web cũng vậy. Hết ván thì **công khai vai của tất cả mọi người** (mục 4.5), vậy là đủ.
- **Thẻ bài chỉ mình thấy:**
  - Vai của mình hiện bằng **biểu tượng vai trên đầu nhân vật của mình**, theo góc nhìn thứ ba.
  - **Người khác không thấy gì**: với họ, bạn chỉ là một người ngồi bình thường, không có biểu tượng.
  - **Sói nhìn nhau chỉ thấy một biểu tượng "Sói" thường**, không phân biệt vai (Ma Sói, Sói Con, Sói Đầu Đàn, Sói Trắng đều hiện giống nhau). **Chỉ chính mình mới thấy biểu tượng vai chính xác của mình.**
  - Lá bài (nếu có hiện ra) quay **mặt trong màu đen** về phía người khác, nên nhìn vào cũng không đọc được.
  - Không có thao tác "cầm lên xem" riêng, vì biểu tượng đã luôn hiện cho đúng người.
- **Ban đêm: màn hình tối, giữa màn hình chỉ có một vệt sáng mờ.** Không nhìn thấy ai quanh bàn.
  - **Vai được gọi thì màn hình sáng trở lại** (hiện bảng làm việc và con trỏ), **làm xong thì tối lại**.
  - **Vai được gọi cuối cùng giữ sáng thêm 5 giây rồi về màn hình đen**, tới khi trời sáng thì **mọi người cùng sáng lên một lúc**.
  - Chỉ người đang được gọi thấy bảng làm việc và con trỏ của mình.

### 8.2 Đã chốt thêm

**Chọn mục tiêu**
1. **Chọn hai người** (Thần Tình Yêu, Nhà Ngoại Cảm): chỉ lần lượt người thứ nhất rồi người thứ hai (đánh số 1, 2), sau đó hiện nút chốt cạnh nút "Bỏ qua"; bấm nút chốt là xong.
2. **Có nút "Bỏ qua / không làm gì"** cho vai tuỳ chọn. Nút này cũng là cách vai không có việc "làm xong" mà không lộ.
3. **Phù Thủy ném bình thuốc:**
   - Khi được gọi, Phù Thủy thấy người bị Sói cắn đêm đó và ba lựa chọn "Cứu / Dùng độc / Bỏ qua". Bình đã dùng thì mờ đi.
   - **Cứu:** một **bình xanh lá** bay ra từ Phù Thủy tới người bị cắn.
   - **Độc:** Phù Thủy chỉ con trỏ vào một người rồi bấm chốt, một **bình tím** bay ra từ Phù Thủy tới người đó.
   - Hình ném bình ban đêm **chỉ Phù Thủy và người chết thấy** (mục 4.4), người còn sống không thấy.

**Bỏ phiếu**
4. **Nút "Bỏ qua" lúc bỏ phiếu là phiếu trắng.** Hết giờ mà chưa bấm "Vote" cũng tính là phiếu trắng.
5. **Chốt sớm khi tất cả đã chọn xong.**

**Chống lộ bài ban đêm**
6. **Cùng một giao diện cho mọi người ban đêm** (kể cả vai không có việc), chỉ khác nội dung bên trong, để người ngoài nhìn màn hình không đoán được vai.
7. **Kết quả riêng của mình** (Tiên Tri soi ai ra gì, Nhà Ngoại Cảm so sánh ra sao) **chỉ xem được kết quả của đêm gần nhất**. Soi đêm 1 thì xem được suốt ngày 1; sang đêm 2 kết quả đêm 1 biến mất, người chơi phải tự nhớ (thử thách trí nhớ). Đêm nào không soi thì ban ngày không có gì để xem.

**Phòng và chủ phòng**
8. **Chủ phòng tạm dừng được ván** (đi vệ sinh, mất mạng...), hết tạm dừng thì đếm ngược 5 giây rồi chạy tiếp.
9. **Mời ra khỏi phòng**, đổi tên, đổi ghế ở bàn chờ.
10. **Chủ phòng chỉnh thời gian** trước ván (thảo luận, bỏ phiếu, đếm ngược). Danh sách vai và điều kiện thắng thì cố định.
11. **Chọn bộ vai thủ công** (tuỳ chọn, để sau): chủ phòng chọn vai thay vì random, cho nhóm đã quen.

**Người chết**
12. **Người chết xem được cả đêm:** thấy ai được gọi, làm gì, chỉ vào ai (cắn, soi, bảo vệ, ném bình, ghép đôi...). Xem trực tiếp trong lúc diễn ra. **Không xem được chat Sói.**
13. **Nút "Rời ván"** cho người chết muốn về bàn chờ trước, không ảnh hưởng ván đang chạy.

**Cảm giác**
14. **Hiệu ứng riêng** khi Hoàng Tử bị treo mà không chết, cặp đôi cùng chết, Sói Đầu Đàn biến người. Chỉ công khai những điều được phép lộ.
15. **Nút tắt giọng quản trò** cho nhóm đã thuộc luật; vẫn hiện chữ giữa bàn.
16. **Phím tắt trên máy tính:** Esc để đóng bảng, Enter để mở chat Sói.

## 9. Rủi ro và giới hạn

- **Cần kênh nói chuyện bên ngoài** (ngồi chung hoặc Discord). Web không kiểm soát được. Nên ghi rõ ngay ở trang chủ.
- **Người chết nói chuyện, nói riêng, tiết lộ vai:** không chặn được. Chỉ dựa vào tự giác, hoặc thoả thuận trong nhóm.
- **Chat Sói chỉ ép được ở server:** người ngoài bầy không nhận được tin của Sói. Nhưng nếu các Sói ngồi cạnh người khác thì vẫn có thể bị liếc màn hình.
- **Lộ vai qua màn hình hoặc thời gian thao tác:** ngồi chung phòng thì người bên cạnh có thể liếc màn hình. Vai không có việc vẫn "xong" sau một lúc ngẫu nhiên để giảm đoán, nhưng không triệt để.
- **15 vai là nhiều với người mới:** cần màn hình giải thích vai ngắn gọn khi chia bài.
- **3D nặng hơn 2D:** cần kiểm tra trên điện thoại cũ. Nên giữ cảnh đơn giản (một bàn, vài ghế, ánh sáng ít) và có chế độ giảm đồ hoạ.
- **Cần đủ 5 người cùng lúc.** Ít bạn thì không chơi được. Có thể về sau thêm bot lấp chỗ trống (để sau).

## 10. Lộ trình đề xuất

1. **Bước 1 (khung):** tạo phòng bằng mã, vào phòng, ghế quanh bàn tròn 3D, đếm ngược bắt đầu, chia bài, chuyển đêm / ngày, bỏ phiếu bằng con trỏ, kiểm tra thắng thua, chỉ có Dân và Sói. Chạy thử được cả vòng.
2. **Bước 2 (trạng thái riêng):** gửi riêng từng người (mục 7.1), thêm 8 vai Dân còn lại.
3. **Bước 3 (Sói và phe thứ ba):** Sói Con, Sói Đầu Đàn, Kẻ Phản Bội, Chán Đời, Sói Trắng, cùng các điều kiện thắng riêng.
4. **Bước 4 (random vai):** rút ngẫu nhiên theo mục 5.2, kiểm tra tổng điểm từ −3 đến +3.
5. **Bước 5 (quản trò và chat Sói):** gọi từng vai ban đêm bằng giọng thu sẵn, dòng chữ giữa bàn, âm thanh, khung chat riêng cho bầy Sói.
6. **Bước 6 (mất kết nối):** quay lại ghế cũ, server chơi thay, huỷ ván khi thiếu người.
7. **Bước 7 (hoàn thiện):** thẻ giải thích vai, các thao tác ở mục 8.2 (bỏ qua, phiếu trắng, ném bình Phù Thủy, tạm dừng...), giao diện điện thoại, chế độ giảm đồ hoạ, tuỳ chọn chỉ một máy phát giọng.
8. **Bước 8 (chơi thử):** chơi vài ván thật với bạn bè, chỉnh thời gian và các luật ở mục 5.4.

Sau bước 1 và 2 là chơi được bản thô, nên thử sớm.

## 11. Điều chưa chắc và cần bạn quyết

- **Điểm / bảng xếp hạng:** đã bỏ phí và lãi của rạp. Có muốn ghi số ván thắng cho từng người không?
- **Đội hình random chưa thử bằng ván thật.** Khoảng −3 đến +3 có thể vẫn lệch phe, nhất là bàn 5 người (vai bất kỳ, chỉ ràng buộc bằng điểm).
- **Luật vai phức tạp** (Sói Trắng, Thần Tình Yêu, Kẻ Phản Bội, mục 5.4) cần thử thật.
- **Thời gian mỗi giai đoạn** (thảo luận 120 giây, bỏ phiếu 30 giây, đếm ngược 15 giây...) là ước đoán.
- **Giọng quản trò phát ở đâu:** một máy chung hay mỗi máy tự phát.
