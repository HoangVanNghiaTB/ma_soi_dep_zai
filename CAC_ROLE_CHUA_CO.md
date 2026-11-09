# Các vai chưa có trong web

Tài liệu này dịch và hệ thống lại bộ vai bạn gửi (bản "Ultimate Werewolf"), kèm gợi ý cách làm trên web. Các vai đánh dấu **✅ Đã thêm** đã được lập trình (xem mục 0). Các vai còn lại chưa làm, muốn thêm vai nào thì chọn từ đây rồi báo tôi.

Web hiện có 22 vai: 15 vai gốc (Dân làng, Tiên Tri, Bảo Vệ, Thợ Săn, Phù Thủy, Thị Trưởng, Hoàng Tử, Nhà Ngoại Cảm, Thần Tình Yêu, Ma Sói, Sói Con, Sói Đầu Đàn, Kẻ Phản Bội, Chán Đời, Sói Trắng) và 7 vai thêm sau (Kẻ Ngốc, Người Yêu Hoà Bình, Người Mang Dáng Sói, Thầy Đồng, Thám Tử Ngoại Cảm, Phù Thủy Sói, Tiên Tri Nữ). Danh sách đầy đủ ở [DE_XUAT_MA_SOI.md](DE_XUAT_MA_SOI.md).

Số trong ngoặc là **điểm cân bằng** của bản gốc (dương có lợi cho Dân làng, âm có lợi cho Sói). Điểm này lấy từ tài liệu gốc, nếu thêm vào web thì cần cân lại cùng bảng điểm hiện tại.

## 0. Đã thêm vào web

Bảy vai "Dễ" đã được lập trình, có thẻ bài, biểu tượng, kiểm thử và chia ngẫu nhiên:

| Vai | Điểm | Cách web làm |
|---|---|---|
| ✅ Kẻ Ngốc | +2 | Không bỏ qua được phiếu. Bấm "Chọn ngẫu nhiên" hoặc hết giờ chưa chọn thì phiếu rơi vào một người ngẫu nhiên (người khác, còn sống). |
| ✅ Người Yêu Hoà Bình | −2 | Khi bỏ phiếu không có ai để chọn, chỉ bấm được "Bỏ qua". |
| ✅ Người Mang Dáng Sói | −1 | Tiên Tri và Tiên Tri Nữ soi ra "Là Sói". Các vai khác coi là Dân làng. |
| ✅ Thầy Đồng | +3 | Mỗi đêm chọn một người; kết quả "có / không có vai đặc biệt". Không đặc biệt chỉ là Dân làng thường và Ma Sói thường (kể cả Ma Sói do Sói Đầu Đàn biến ra). |
| ✅ Thám Tử Ngoại Cảm | +3 | Mỗi đêm chọn một người (kể cả mình); kết quả "có / không có Sói" trong ba chỗ ngồi liền nhau, theo thứ tự ghế ở bàn, chỉ tính người còn sống. Chỉ tính Sói thật, không tính Kẻ Phản Bội và Phù Thủy Sói. |
| ✅ Phù Thủy Sói | −3 | Được gọi riêng mỗi đêm, chọn một người để biết có phải Tiên Tri không. Sói không biết Phù Thủy Sói và ngược lại; không vào chat Sói. Tính vào phe Sói khi so số người, Dân phải loại cả Phù Thủy Sói mới thắng. |
| ✅ Tiên Tri Nữ | +7 | Y hệt Tiên Tri, được gọi chung lượt, mỗi người soi riêng. Chỉ xuất hiện ở bàn từ 10 người. |

**Điều cần biết**
- **Lời gọi của Thầy Đồng, Thám Tử Ngoại Cảm, Phù Thủy Sói chưa có tiếng**, chỉ hiện chữ trên bàn. Danh sách câu cần thu ở [KICH_BAN_QUAN_TRO.md](KICH_BAN_QUAN_TRO.md). Tiên Tri Nữ dùng chung câu gọi Tiên Tri.
- **Pháp Sư (Sorcerer) chưa thêm**: tôi coi là trùng với Phù Thủy nên bỏ qua. Nếu bạn vẫn muốn, nói tôi biết.
- **Kẻ Ngốc và Người Yêu Hoà Bình được giấu**, theo bản gốc: trong danh sách vai công khai dưới thẻ bài, hai vai này hiện như Dân làng nên không ai biết ván có chúng. Hết ván mới lộ.
- Kết quả của Thầy Đồng, Thám Tử, Phù Thủy Sói giống Tiên Tri: chỉ giữ trong đêm đó, sang đêm mới là mất.

## 1. Vai trong bản gốc đã có tương đương ở web

| Vai bản gốc | Vai ở web | Khác biệt đáng chú ý |
|---|---|---|
| Cupid | Thần Tình Yêu | Bản gốc: cặp đôi cùng phe thì thắng chung với phe đó; **khác phe thì lập phe riêng**, chỉ thắng khi là hai người sống sót cuối cùng. Cần đối chiếu với luật cặp đôi hiện tại của web. |
| Witch | Phù Thủy | Giống. |
| Mayor | Thị Trưởng | Bản gốc có biến thể "bầu Thị Trưởng ngày đầu", nếu chết thì bầu lại. |
| Hunter | Thợ Săn | Giống. |
| Prince | Hoàng Tử | Giống. |
| Seer | Tiên Tri | Bản gốc có thêm **Tiên Tri Nữ** (Seeress), chỉ là bản nữ, dùng cùng lúc ở bàn lớn. |
| Villager | Dân làng | Giống. |
| Bodyguard | Bảo Vệ | Bản gốc có hai biến thể: mỗi người chỉ được bảo vệ một lần cả ván; hoặc người được bảo vệ cũng không bị treo cổ ngày hôm sau. |
| Wolf Cub, Werewolf | Sói Con, Ma Sói | Giống. |
| Tanner | Chán Đời | Giống: thắng nếu bị treo cổ. |
| Psychic Detective | **Khác hẳn** Nhà Ngoại Cảm | Vai bản gốc xem một người cùng hai hàng xóm có Sói không (xem mục 3.9). Vai của web chọn hai người để so sánh phe. Hai vai khác nhau nên vai bản gốc vẫn tính là chưa có. |
| Lone Wolf | **Khác** Sói Trắng | Sói Đơn Độc không giết đồng bọn (xem mục 5.6). Sói Trắng của web thì cứ hai đêm giết một Sói. |
| Minion | **Gần giống** Kẻ Phản Bội | Xem mục 4.2. |

## 2. Bảng tổng hợp vai còn thiếu

Cột "Hợp web" cho biết cần làm gì thêm so với cơ chế hiện có:
- **Dễ**: chỉ thêm một lượt đêm hoặc một quy tắc nhỏ.
- **Vừa**: cần thêm trạng thái mới cho người chơi.
- **Khó**: đổi cách chơi, hoặc phụ thuộc người chơi tự giữ luật vì web không có mic.

| Vai (gợi ý tên Việt) | Bản gốc | Điểm | Đêm nào dậy | Phe | Hợp web |
|---|---|---|---|---|---|
| Pháp Sư | Sorcerer | +4 | Mọi đêm | Dân | Dễ (giống Phù Thủy, nên chỉ nên thêm biến thể hai phép) |
| Kẻ Ngốc ✅ | Fool | +2 | Không | Dân | Đã thêm |
| Kẻ Cứng Cáp | Stalwart | +3 | Không | Dân | Vừa |
| Người Mang Dáng Sói ✅ | Lycan | −1 | Không | Dân | Đã thêm |
| Hội Viên Bí Mật | Mason | +2 | Đêm 1 | Dân | Khó (phụ thuộc luật cấm nhắc tới) |
| Thầy Đồng ✅ | Medium | +3 | Mọi đêm | Dân | Đã thêm |
| Người Chịu Tội Thay | Martyr | +3 | Không | Dân | Vừa |
| Người Yêu Hoà Bình ✅ | Pacifist | −2 | Không | Dân | Đã thêm |
| Bóng Ma | Ghost | +2 | Mọi đêm | Dân | Khó (cần giấy, thay bằng gợi ý chữ cái) |
| Linh Mục | Priest | +3 | Mọi đêm | Dân | Vừa |
| Kẻ Gây Rối | Trouble Maker | +2 | Mọi đêm | Dân | Vừa |
| Mụ Già | Old Hag | +1 | Mọi đêm | Dân | Khó (người bị đày phải rời hẳn ban ngày) |
| Trưởng Lão | Elder | 0 | Không | Dân | Vừa |
| Tiên Tri Tập Sự | Apprentice Seer | +4 | Khi được kích hoạt | Dân | Vừa |
| Người Bịt Miệng | Enchantress | +1 | Mọi đêm | Dân | Khó (web không ép được im lặng) |
| Người Mang Bệnh | Diseased | +3 | Không | Dân | Vừa |
| Thám Tử Ngoại Cảm ✅ | Psychic Detective | +3 | Mọi đêm | Dân | Đã thêm |
| Phù Thủy Sói ✅ | Sorceress | −3 | Mọi đêm | Sói | Đã thêm |
| Tay Sai | Minion | −6 | Không | Sói | Vừa |
| Kẻ Sao Chép | Doppelganger | −2 | Đêm 1, rồi khi kích hoạt | Đổi phe | Vừa |
| Kẻ Bị Nguyền | Cursed | −3 | Khi kích hoạt | Đổi phe | Vừa |
| Kẻ Say | Drunk | −3 | Đêm 3 | Đổi phe | Vừa |
| Tên Cướp | Bandit | 0 | Đêm 1 | Riêng | Vừa |
| Ma Cà Rồng | Vampire | −8 | Mọi đêm | Phe thứ ba | Khó (cần thêm cả phe mới) |
| Sói Đơn Độc | Lone Wolf | −5 | Mọi đêm | Riêng | Vừa |
| Giáo Chủ | Cult Leader | +1 | Mọi đêm | Riêng | Khó (cần danh sách tín đồ và điều kiện thắng mới) |

## 3. Phe Dân làng

### 3.1 Pháp Sư (Sorcerer, +4, dậy mọi đêm)
Y hệt Phù Thủy: cứu người bị Sói cắn đêm đó và giết một người (mỗi phép một lần), dùng cùng đêm được.
- **Biến thể:** Pháp Sư có **hai phép** cả ván, dùng tuỳ ý: cứu hai lần, giết hai lần, hoặc một cứu một giết; dùng cả hai cùng đêm được.
- **Nhận xét:** trùng với Phù Thủy, chỉ đáng thêm nếu muốn một vai "Phù Thủy phiên bản khác" để đổi gió.

### 3.2 Kẻ Ngốc ✅ Đã thêm (Fool, +2, không dậy)
Lá phiếu của Kẻ Ngốc **luôn tính là đồng ý treo cổ**.
- Nên rút ngẫu nhiên Kẻ Ngốc và Người Yêu Hoà Bình vào bộ bài, để người chơi không biết trước ván này có vai nào trong hai vai đó.
- **Biến thể:** không phát thẻ, mà chọn bí mật một người làm Kẻ Ngốc. Người đó không biết mình là Kẻ Ngốc, nhưng phiếu của họ vẫn tính là treo cổ.
- **Trên web:** khi bỏ phiếu, nếu người đó có vai này thì web tự điền phiếu "treo cổ" cho họ, không cho chọn khác.

### 3.3 Kẻ Cứng Cáp (Stalwart, +3, không dậy)
Bị Sói cắn thì **không chết ngay**, mà chết vào **đêm kế tiếp**. Sáng hôm đó thông báo không ai chết. Đêm sau có thể chết nhiều người: Kẻ Cứng Cáp cộng người bị cắn đêm đó.
- **Trên web:** thêm cờ "chết muộn" cho người chơi; sáng đầu không đưa tên vào danh sách chết.

### 3.4 Người Mang Dáng Sói ✅ Đã thêm (Lycan, −1, không dậy)
Tiên Tri (và Tiên Tri Nữ) soi ra **Sói**, dù thực ra chỉ là Dân làng.
- **Biến thể:** nếu chơi có công khai vai khi chết, vai của Lycan lúc chết cũng lộ là Sói.
- **Trên web:** chỉ cần sửa kết quả soi của Tiên Tri.

### 3.5 Hội Viên Bí Mật (Mason, +2, dậy đêm 1)
Đêm đầu, quản trò gọi các Mason dậy để **nhận ra nhau**. Cả làng **không được nhắc tới Mason** dù trực tiếp hay gián tiếp. Ai lỡ nhắc thì đêm sau bị Mason giết, và người bị Mason giết **thua dù phe mình thắng**.
- **Lưu ý cho web:** luật cấm nhắc tới cần có người quản trò nghe được. Web không có mic nên **không tự phát hiện được**. Nếu thêm, chỉ nên cho Mason nhận ra nhau đêm 1 và bỏ luật giết, hoặc để chủ phòng bấm giết thủ công.

### 3.6 Thầy Đồng ✅ Đã thêm (Medium, +3, dậy mọi đêm)
Mỗi đêm chọn một người để biết **có phải vai đặc biệt không** (không phải Dân làng thường cũng không phải Sói thường). Càng nhiều vai đặc biệt thì Thầy Đồng càng mạnh. Nên có ít nhất một vai đặc biệt thuộc phe xấu, kẻo vai này chỉ là "máy tìm Dân làng".
- **Biến thể:** biết người đó **có thuộc phe Dân làng không**. Chỉ nên dùng khi ván có nhiều vai không thuộc Dân làng (ít nhất ba vai ngoài Sói).
- Kẻ Bị Nguyền, Kẻ Sao Chép, Kẻ Say được kiểm tra theo phe tại thời điểm kiểm.

### 3.7 Người Chịu Tội Thay (Martyr, +3, không dậy)
Ngay sau khi bỏ phiếu xong, **trước khi treo cổ**, Người Chịu Tội Thay có thể tự nhận chết thay cho người bị kết án. Việc này xảy ra **trước khi lộ vai**.
- **Trên web:** thêm một bước ngắn sau kết quả bỏ phiếu, chỉ hiện nút "Chết thay" cho người có vai này. Hết giờ mà không bấm thì thôi.
- **Biến thể:** mỗi đêm sau khi Sói chọn nạn nhân, Người Chịu Tội Thay có thể thế chỗ nạn nhân bị cắn; nạn nhân sống, Người Chịu Tội Thay chết.

### 3.8 Người Yêu Hoà Bình ✅ Đã thêm (Pacifist, −2, không dậy)
Lá phiếu **luôn chống treo cổ**, nên vô tình giúp Sói vì là một phiếu cứu chắc chắn.
- Nên rút ngẫu nhiên cùng Kẻ Ngốc (xem mục 3.2).
- **Biến thể:** không được tố cáo hay ủng hộ lời tố cáo ai, và phải bỏ phiếu chống treo cổ.
- **Trên web:** tự điền phiếu "bỏ qua" cho người có vai này.

### 3.9 Thám Tử Ngoại Cảm ✅ Đã thêm (Psychic Detective, +3, dậy mọi đêm)
Mỗi đêm có thể chọn một người. Quản trò cho biết **trong ba người đó (người được chọn và hai người ngồi hai bên) có Sói nào không**, chứ không nói ai là Sói.
- **Trên web:** ghế đã cố định quanh bàn nên đủ dữ liệu "hai bên", chỉ cần thêm lượt đêm mới và cách tính hàng xóm theo thứ tự ghế (bỏ qua ghế trống, tính người còn sống hay cả người chết cần chốt).
- Vai này khác hẳn Nhà Ngoại Cảm đang có; nên đặt tên khác để khỏi nhầm.

### 3.10 Bóng Ma (Ghost, +2, dậy mọi đêm)
Chết ngay đêm đầu. Từ đó mỗi đêm được viết **một chữ cái** (không viết tên hay chữ đầu tên) làm gợi ý cho cả làng. Chỉ được đứng ngoài quan sát, không nói, không nháy mắt, không ra hiệu.
- **Biến thể:** người chết đầu tiên trở thành Bóng Ma, nhưng chỉ giúp phe của mình. Nếu Sói bị treo cổ ngày đầu thì đêm đó họ thành Bóng Ma, thấy hết vai và viết gợi ý cho phe Sói. Nếu không công khai vai người chết, mọi người phải đoán Bóng Ma thuộc phe nào.
- **Trên web:** không có giấy, nên thay bằng ô nhập **một chữ cái**, đêm nào cũng hiện trên mặt bàn cho cả làng đọc. Người này cũng đã bị loại nên cần cho phép xem và gõ chữ khi đang ở chế độ người chết.

### 3.11 Linh Mục (Priest, +3, dậy mọi đêm)
Một đêm trong ván, Linh Mục có thể ban phước cho một người (không phải bản thân). Nếu người đó bị giết ở đêm sau, họ **sống sót nhưng mất phước**. Nếu Linh Mục chết sau khi đã ban phước thì phước vẫn còn, và lần đầu người đó bị giết thì phước mất.
- **Biến thể:** một lần trong ván, Linh Mục xem vai của một người **đã chết**. Chỉ dùng khi ván không công khai vai.
- **Trên web:** web hiện **không công khai vai người chết**, nên biến thể này dùng được và có ích.

### 3.12 Kẻ Gây Rối (Trouble Maker, +2, dậy mọi đêm)
Một đêm trong ván, Kẻ Gây Rối báo sẽ có **hai lượt treo cổ** vào ngày hôm sau. Mỗi đêm quản trò hỏi "Kẻ Gây Rối có muốn gây rối không?", nếu có thì sáng hôm sau, ngay sau khi treo người đầu tiên thì bỏ phiếu để treo thêm người thứ hai.
- **Trên web:** thêm một lượt bỏ phiếu thứ hai ngay sau lượt đầu, cần chốt luật khi hai lượt cùng có người chết.

### 3.13 Mụ Già (Old Hag, +1, dậy mọi đêm)
Mỗi đêm chọn một người (không phải mình). Người đó **rời làng cả ngày hôm sau**: không thảo luận, không bỏ phiếu, không bị tác động gì kể cả phát bắn của Thợ Săn.
- **Biến thể:** khi người bị đày trở về, đêm sau họ chọn người bị đày tiếp theo, cứ thế nối tiếp. Nếu người trở về chết ban đêm thì Mụ Già chọn người mới.
- **Trên web:** cần trạng thái "vắng mặt" ban ngày: không hiện nút bỏ phiếu, không vào danh sách người bị chọn. Khi thảo luận ngoài đời vẫn không ép được họ im lặng.

### 3.14 Trưởng Lão (Elder, 0, không dậy)
Sẽ **chết vào đêm thứ X** (X = số Sói trong ván + 1), ngoài các nạn nhân khác. Mỗi khi một Sói chết thì thời hạn sống của Trưởng Lão rút ngắn.
- **Trên web:** cần tính số đêm còn lại theo số Sói còn sống, nên web phải xử lý khi Sói Đầu Đàn biến thêm Sói hay Sói chết giữa ván.

### 3.15 Tiên Tri Tập Sự (Apprentice Seer, +4, dậy khi được kích hoạt)
Thay chỗ Tiên Tri (hoặc Tiên Tri Nữ) khi họ chết. Từ đó, mỗi lần quản trò gọi Tiên Tri thì Tập Sự thức dậy thay.
- **Biến thể:** ngay cả khi Tiên Tri còn sống, Tập Sự vẫn dậy kiểm tra, nhưng phải soi **hai lần** một người mới biết có phải Sói không.
- **Trên web:** Tập Sự vẫn phải được gọi để người ngoài không đoán ra Tiên Tri đã chết (giống cách web gọi cả vai đã chết rồi chờ ngẫu nhiên).

### 3.16 Người Bịt Miệng (Enchantress, +1, dậy mọi đêm)
Mỗi đêm có thể chọn một người (kể cả mình) **bị câm cả ngày hôm sau**: không được nói nhưng vẫn bỏ phiếu và ra hiệu bằng cử chỉ. Không bịt một người hai lần trong ván.
- **Biến thể:** mỗi đêm **bắt buộc** chọn một người. Đầu ván vui, cuối ván khó chọn.
- **Lưu ý cho web:** web không có mic nên không thể tắt tiếng người bị bịt. Chỉ hiện biểu tượng "bị câm" trên đầu để mọi người tự giác.

### 3.17 Người Mang Bệnh (Diseased, +3, không dậy)
Nếu Sói cắn trúng người này, **đêm sau Sói không đi săn được** vì bệnh.
- Nếu ván có công khai vai thì đêm đó Sói không dậy. Nếu không công khai, Sói vẫn dậy chọn nhưng nạn nhân không chết.
- **Trên web:** vì web không công khai vai người chết, dùng cách thứ hai: Sói vẫn được gọi và chọn, nhưng kết quả bị bỏ qua.

### 3.18 Tiên Tri Nữ ✅ Đã thêm (Seeress)
Chỉ là bản nữ của Tiên Tri, cùng khả năng. Bàn lớn dùng cả hai, quản trò gọi từng người riêng. Với web, thêm vai này chỉ là thêm một lá "Tiên Tri" thứ hai, không cần luật mới.

## 4. Phe Sói

### 4.1 Phù Thủy Sói ✅ Đã thêm (Sorceress, −3, dậy mọi đêm)
Mỗi đêm **tìm Tiên Tri**: chỉ vào một người, nếu là Tiên Tri hoặc Tiên Tri Nữ thì quản trò giơ hai ngón cái. Sói và Phù Thủy Sói **không biết nhau**. Tiên Tri soi ra Phù Thủy Sói là Dân làng.
- **Biến thể:** đêm đầu, quản trò cho Phù Thủy Sói biết ai là Sói (lợi thế lớn cho phe Sói).

### 4.2 Tay Sai (Minion, −6, không dậy)
Thường không cần thẻ. Đêm đầu, **Sói chọn một người** để thành Tay Sai, gia nhập phe Sói. Tay Sai **biết Sói là ai** nhưng **không dậy cùng Sói** ban đêm. Tiên Tri soi ra là Dân làng. Nếu người đó đang có vai đặc biệt thì giữ nguyên khả năng (có thể là cả Tiên Tri, lúc đó rất tệ cho Dân làng).
- **Biến thể:** dùng thẻ riêng; Tay Sai và Sói biết nhau, nhưng Tay Sai không có vai thứ hai.
- **So với Kẻ Phản Bội của web:** gần giống (cả hai biết Sói, không dậy chung, Tiên Tri soi ra là người). Khác ở chỗ Tay Sai **do Sói chọn**, còn Kẻ Phản Bội được chia bài. Nếu thêm Tay Sai nên dùng cách Sói chọn bằng nút, và có thể gộp luật với Kẻ Phản Bội.

## 5. Vai đổi phe và phe riêng

### 5.1 Kẻ Sao Chép (Doppelganger, −2, dậy đêm 1 và khi kích hoạt)
Đêm đầu chọn một người. Khi người đó **chết**, vai của họ chuyển cho Kẻ Sao Chép. Trong lúc chờ, Kẻ Sao Chép chơi cho Dân làng, Tiên Tri soi ra là Dân làng. Đêm sau khi người kia chết, quản trò vỗ vai báo vai mới.
- **Biến thể:** đêm đầu Kẻ Sao Chép **chép ngay** vai người đó (người gốc vẫn giữ vai) và phải được gọi mỗi đêm để dùng khả năng (nếu có), hoặc gọi cho có để khỏi lộ.
- **Trên web:** web đã quen kiểu "gọi người không có việc để khỏi lộ", nên dễ áp dụng. Cần hiện vai mới riêng cho người đó khi chuyển.

### 5.2 Kẻ Bị Nguyền (Cursed, −3, dậy khi kích hoạt)
Ban đầu chơi cho Dân làng (Tiên Tri soi ra là Dân làng). Nếu bị Sói cắn thì **không chết mà biến thành Sói**, từ đó Tiên Tri soi ra Sói. Mỗi đêm quản trò gọi riêng người này, giơ ngón cái nếu đã là Sói, lắc đầu nếu chưa.
- **Trên web:** rất gần vai Sói Đầu Đàn (biến thành Sói thay vì chết). Lưu ý: người này thành Sói khi **bị cắn**, không cần Đầu Đàn ra lệnh.
- Nếu sau này có Ma Cà Rồng: bị Ma Cà Rồng cắn thì thành Ma Cà Rồng.

### 5.3 Kẻ Say (Drunk, −3, dậy đêm 3)
Tin mình là Dân làng thường tới **đêm 3**, lúc đó được cho biết vai thật. Tiên Tri soi theo vai thật. Khi chia bài, trộn một Sói, một Dân làng và các vai chưa dùng, rút bừa một lá làm vai thật của Kẻ Say.
- **Biến thể:** biết vai ngay đêm 1 nhưng chưa dùng được khả năng cho tới đêm 3. Ví dụ là Sói thì biết mình là Sói nhưng hai đêm đầu không dậy.
- **Trên web:** thẻ bài hiển thị "Dân làng" tới đêm 3 rồi đổi vai. Phải tính tới việc kẻ này vẫn bị Sói gọi hay không, vì đêm 1, 2 chưa dậy.

### 5.4 Tên Cướp (Bandit, 0, dậy đêm 1)
Đêm đầu chọn **hai người**. Chỉ thắng nếu **còn sống đến cuối ván và hai người đó đã chết**. Các phe khác giữ điều kiện thắng riêng, nên để Tên Cướp tự thắng thì thường Dân làng phải thắng.
- **Biến thể:** chọn **bốn người**; nếu cả bốn chết mà Tên Cướp sống thì ván kết thúc ngay, Tên Cướp thắng, mọi phe khác thua (trừ Giáo Chủ nếu toàn bộ người sống là tín đồ).

### 5.5 Ma Cà Rồng (Vampire, −8, dậy mọi đêm)
Là phe lớn thứ ba (cùng Sói và Dân làng). Mỗi đêm chọn nạn nhân như Sói, nhưng **người chơi chỉ biết nạn nhân sau khi bỏ phiếu treo cổ xong**: nạn nhân chết giữa ban ngày. Sói không giết được Ma Cà Rồng, nên Ma Cà Rồng mạnh hơn Sói một chút. Khi cả ba phe cùng có mặt, Ma Cà Rồng hoặc Sói phải diệt cả hai phe còn lại mới thắng.
- Chỉ nên thêm cho người chơi có kinh nghiệm, thay bớt Sói (tổng Ma Cà Rồng và Sói bằng số Sói của ván thường).
- Các vai tìm Sói (Tiên Tri, Thám Tử Ngoại Cảm…) cũng phát hiện Ma Cà Rồng nhưng không phân biệt được với Sói.
- **Lưu ý:** đây là vai tốn công nhất, vì cần phe mới, điều kiện thắng ba bên và thêm Thợ Săn Ma Cà Rồng (Thợ Săn bị Ma Cà Rồng giết thì bắn chết Ma Cà Rồng gần nhất).

### 5.6 Sói Đơn Độc (Lone Wolf, −5, dậy mọi đêm)
Tính là Sói, dậy cùng bầy Sói mỗi đêm chọn nạn nhân, nhưng **chỉ thắng khi là người cuối cùng còn sống**, hoặc người sống còn lại duy nhất không phải Sói. Nên nói trước với người chơi "có thể có Sói Đơn Độc", rồi ngẫu nhiên thêm hoặc không.
- Gần với Sói Trắng của web về điều kiện thắng, nhưng khác ở chỗ Sói Trắng được giết thêm một Sói mỗi hai đêm.

### 5.7 Giáo Chủ (Cult Leader, +1, dậy mọi đêm)
Mỗi đêm chọn một người vào giáo (người đó không biết). Giáo Chủ chỉ thắng nếu **mọi người còn sống đến cuối ván đều là tín đồ** (bản thân Giáo Chủ có thể đã chết). Quản trò giữ danh sách tín đồ.
- **Biến thể:** Giáo Chủ chết thì tín đồ đầu tiên thành Giáo Chủ mới (quản trò vỗ vai), vẫn dùng được khả năng của vai khác nếu có, và thắng khi mọi người còn sống đều là tín đồ.

## 6. Gợi ý nên thêm trước

Xếp theo mức "ít công, nhiều thú vị, hợp web không mic":

1. **Dễ nhất (đã làm xong, trừ Pháp Sư):** Kẻ Ngốc, Người Yêu Hoà Bình (chỉ điền sẵn phiếu), Người Mang Dáng Sói (sửa kết quả soi), Thầy Đồng, Thám Tử Ngoại Cảm, Phù Thủy Sói, Tiên Tri Nữ.
2. **Vừa, đáng làm:** Kẻ Bị Nguyền, Người Chịu Tội Thay, Linh Mục (biến thể xem vai người chết rất hợp vì web không công khai vai), Tiên Tri Tập Sự, Kẻ Sao Chép, Kẻ Cứng Cáp, Người Mang Bệnh.
3. **Cần cân nhắc:** Hội Viên Bí Mật, Bóng Ma, Mụ Già, Người Bịt Miệng, Giáo Chủ (hợp hơn khi có người quản trò nghe được).
4. **Để sau cùng:** Ma Cà Rồng (cần cả phe thứ ba mới).

Các vai thêm vào cũng cần cân lại **bảng điểm cân bằng** và **thứ tự gọi ban đêm** ([KICH_BAN_QUAN_TRO.md](KICH_BAN_QUAN_TRO.md)), và cần thu thêm giọng đọc quản trò cho từng lượt gọi mới.
