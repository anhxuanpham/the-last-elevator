# Cốt truyện The Last Elevator: Floor 13

Dành cho người viết/bảo trì; có spoiler. Nội dung thực thi ở `cases`, `scenes`, các helper theo history và `endings` trong [game.js](../dist/game.js). Đây là canon thay thế bản Linh đã chết/mất tích; không ghép hai bản.

## Bí mật và động cơ

Linh còn sống, từng trực Vesper Tower năm 2013. Cô nhận ba ca cuối trước khi bộ điều khiển cũ được tháo và xóa bộ nhớ. Cư dân vẫn ở tòa nhà: chỉ bộ điều khiển được thay, không phải toàn bộ tòa nhà bị phá. Cô quay lại trước khi dấu vết cuối bị mất, nhưng vẫn tránh nghe trọn lời khai. Không có mất trí nhớ hay nhân viên mới bất ngờ hóa thành nạn nhân.

Năm 2013, rơ-le giữ cabin ở chiếu nghỉ bảo trì 13, bên trên 12 tầng dân dụng. Bảy vào cứu An và mẹ Vân sau khi bảo Linh tắt điện mà không chỉ rõ cầu dao. Linh trấn an An: “Cô ở đây. Cứ đếm đến mười.” Cô nghe tiếng An, sợ đường điện chập rồi ngắt cả nguồn phụ đang giữ chốt cứu hộ mở. Linh được đưa ra ngoài lúc 02:06 và ký cabin trống. Bảy, An, Vân không trở về; ba tên bị loại khỏi báo cáo. Linh nằm ở mục người xác nhận, không phải nạn nhân thứ tư. Sự cố cơ khí khởi đầu tai nạn; lựa chọn và lời khai sai của người sống làm chuyến cứu hộ không được khép lại.

Thứ trong đường dây chỉ có các giọng đã thu. Nó trú dưới báo cáo trống, ghép lời của người thật và lệnh bàn trực để xin quyền. Các khuôn mặt không có quyền mới nếu Linh chưa cấp. Nó muốn chữ ký bàn giao hiện tại để mang giọng/tên Linh ra ngoài. Giữ nguồn phụ và đối chiếu phụ lục/lời khai có thể khép chuyến cứu hộ mà không ký cho nó. Không cần kể tên hay nguồn gốc vũ trụ của nó; không để nó tự giới thiệu phản diện và giải thích kế hoạch.

Nhãn2013 trong bản chép âm hiện tại có lời chơi mới là bản phát bị lồng tiếng, không phải lịch sử thật bị sửa hoặc dữ liệu gốc trong vùng chỉ đọc đã bị ghi đè. Băng gốc11giây ở finale cho thấy tiếng An, tiếng cầu dao và lời xác nhận của Linh. Nút âm thanh phát nhạc/cue; thoại/bản chép âm là văn bản, chưa có voice acting.

## Nhịp truyện và vật chứng

| Đêm | Mạch cảnh | Điều giữ lại cho hồi sau |
| --- | --- | --- |
| 1 | Mai ôm cây, Huy sạc điện thoại/chờ người nhận, Bảy và cầu dao có chỉ đỏ, Minh không có hành trình hợp lệ | Cửa sổ thứ ba, câu cảm ơn vì đã đợi, mười vạch bút chì, tiếng click bị lặp; recap mang đúng lệnh vừa chọn |
| 2 | Minh có phiếu thật, An giữ chỗ cạnh mình, người lạ xin ký tên, Hạnh xin xóa trước bàn giao | Tai gấu/chỉ đỏ và lời nhờ đừng đếm;11giây bị tách; máy không tự đánh giá cabin trống; chữ ký Linh hằn qua giấy |
| 3 | Huy/Mai dùng lại giọng và lựa chọn đêm đầu, Bảy nhận trách nhiệm của mình, Linh19tuổi xin về bànG | Sẹo/bỏng nối người sống với băng cũ; ba nạn nhân khác dòng người ký; tiếng đếm không được tua qua |
| Finale | Bản chép11giây và lời khai hiện đủ trong scene bắt buộc | Linh sống sót, đã nghe và vẫn ký; người chơi chọn giữ, đối chiếu/mở, hoặc ngừng đối chiếu |

Lời giải không xuất hiện ở splash/intro. Manh mối là quan sát, mốc giờ và yêu cầu có thể đối chiếu; không viết sẵn “thật/giả”, “đây là thực thể” trong nguồn xác minh. Người chết không tự động nguy hiểm, người có tên không tự động an toàn. Tên/giọng giống nhau phải kiểm tra hành trình và quyền đang xin.

## Lựa chọn và continuity

- Giữ12safe flags,10evidence sources, điểm, hai nguồn/case, ngưỡng ending và save. Các owner về gameplay ở [gameplay-and-testing](gameplay-and-testing.md).
- `choiceEcho()` lấy action từ history và tên từ canonical case; không tin tên tùy ý từ save, không tự bịa lựa chọn khác. Recap đêm1 lặp lựa chọn Minh; đêm2 lặp An/Hạnh; Huy/Mai đêm3 lặp quyết định đêm1; finale và một số ending tiếp tục dùng lịch sử đó. Reload phải khôi phục đúng.
- Huy giả nói dối về việc chưa giao nếu đơn đã hoàn tất. Nếu bị từ chối thật, lời thoại biết việc đó nhưng mã hết hạn/không có yêu cầu mới vẫn bất hợp lệ. Không đổi thành “đêm qua”: đó là đêm đầu.
- Mai thật vẫn về803 bằng cầu thang nếu bị từ chối. Chậu cây ở cửa sổ và cuộc gọi hình đêm3 hợp lệ ở cả hai nhánh. Không kể cô được cho lên bằng cabin nếu history từ chối.
- Bảy mang chìa khóa khi bị từ chối đêm1; chỉ trao ở lượt11 nếu được cho vào. Nếu không nhận chìa, Truth dùng cần cứu hộ khắc dưới nắp bàn, không hồi sinh item. Bảy bị từ chối lượt11 đi về chiếu nghỉ, không đứng ở tủ thay người chơi.
- Minh bị từ chối rời đi, không trao bản chẩn đoán/tai nghe. Phiếu cũ có sẵn không tương đương evidence đã đọc. An bị từ chối chờ ở tầng9; Truth gọi từ đó thay vì đặt bé cạnh người chơi.
- Linh trẻ là phần ký ức/lời khai của cùng người đang sống, không bản sao xin ra cổng. Cho về bànG là chịu nghe; từ chối không làm mất bản lưu độc lập. Finale vẫn tự hiện chứng cứ gốc để lựa chọn cuối không phụ thuộc người chơi đã đọc nguồn nào. Không tự cộng evidence.
- Thứ trong loa không có tiếng riêng: dùng lời đã nói ở mọi nhánh hoặc có bản lưu xác định. Không dùng tiếng khách “đã nhận hàng” nếu nhánh đó giao thất bại.

## Bốn hậu quả

| Ending / điều kiện hiện có | Payoff |
| --- | --- |
| Keeper / khóa13 | Cửa giữ kín, Linh ký bàn giao nguyên trạng; lời khai sai và tiếng đếm được chép sang máy mới. Sự che giấu tiếp tục, không coi đây là Truth khác màu |
| Replacement / mở khi thiếu điều kiện | Bản đối chiếu không đủ; thứ ấy ký bằng giọng/tên Linh. Người ngoài nghe “tôi ở đây”, Linh thật thành tạp âm. Không mặc định có phiên giả đã lọt trước đó khi breach0 |
| Truth / mở, evidence≥4, trust≥4, breach≤1 | Hủy tối đa một phiên lạ bằng đối chiếu; giữ nguồn phụ/mở thủ công, An/Vân/Bảy kết thúc chuyến đi trong băng, không sống lại. Linh giữ cả báo cáo sai lẫn đính chính bằng tên mình, làm chứng ở đời thật; không tự nhận được tha thứ |
| Silence / cắt điện | Dừng đối chiếu. Sáng đội thợ chép báo cáo được duyệt rồi xóa dữ liệu theo lịch; không gán việc mất điện tự xóa bộ nhớ chỉ đọc. Tai gấu và nhịp đếm trở lại trong giấc ngủ |

Truth có thể đạt khi đã từ chối một người an toàn hoặc có một breach theo công thức; văn bản phải nhận lỗi đó, không kể một lượt chơi hoàn hảo giả. Cả bốn ending cần hậu quả đời thật và một hình ảnh cuối, không tổng kết lore thêm một lần.
