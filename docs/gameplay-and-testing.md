# Gameplay, lưu trữ và kiểm tra hồi quy

## Gameplay

- Mỗi hành khách có tối đa hai nguồn xác minh khác nhau. Nguồn đã mở có thể đọc lại bằng nút tương ứng hoặc phím 1–3, không tốn lượt và không cộng lại bằng chứng/điểm. Tải lại trang rồi tiếp tục ca trực giữ các nguồn đã mở và hiển thị lại nguồn đọc gần nhất, kể cả khi vừa đọc lại nguồn cũ.
- Bằng chứng chỉ cộng một lần cho mỗi case: 25 điểm. Mỗi quyết định đúng cộng 100 điểm. Chơi đúng cả 12 case và thu thập đủ 10 bằng chứng đạt 1450 điểm.
- SIGNAL là chất lượng đường truyền: ổn định trong đêm đầu, nhiễu từ đêm thứ hai. Cả người an toàn và không an toàn đều có thể xuất hiện trong mỗi trạng thái tín hiệu. Cần đối chiếu hồ sơ, camera và log.
- Lời thoại Huy, ghi chú chìa khóa của Bảy, manh mối Mai/Huy/Minh, chuyển đêm, tổng kết ca và lời kể The Truth dùng lịch sử lựa chọn thực tế. Các hàm sở hữu nội dung là `caseQuote()`, `caseNote()`, `clueText()`, `nightBody()`, `nightSummaryText()`, `choiceEcho()` và `endingText()` trong [game.js](../dist/game.js). Xem [hướng dẫn cốt truyện — có spoiler](story-guide.md) khi chỉnh các nhánh này.
- Modal giữ focus bên trong và khóa tương tác nền. Sau khi đóng modal, focus trở về hành khách hiện tại; dùng phím 1–3 để xác minh, ←/→ để từ chối/cho phép. Khi focus nằm trong tab hồ sơ, ←/→ chuyển tab (quay vòng), Home/End chọn tab đầu/cuối; các phím này không quyết định hành khách. Chỉ tab đang chọn nằm trong thứ tự Tab.
- Khóa tầng 13 mở The Keeper; cắt điện mở The Silence. Mở cửa cho The Truth khi evidence ≥ 4, trust ≥ 4 và breach ≤ 1; các trường hợp mở cửa khác cho The Replacement.
- Finale luôn hiển thị danh sách cứu hộ và hướng dẫn cần mở cơ học, không cộng bằng chứng chưa đọc. The Truth kể Ông Bảy dùng chìa khóa nếu được cho vào ở case 11; nếu bị từ chối, người trực dùng cần dưới nắp bàn. Lời kể cũng phản ánh việc An và phần ký ức Linh từng được nhận hay bị từ chối, và xử lý lượt mượn tên nếu có một breach. Linh hiện tại còn sống; finale phân biệt ba nạn nhân với người ký và tự hiện bản chép âm gốc. Các bản phát lại dùng đúng quyết định trong history, kể cả sau reload. Các nhánh này giữ nguyên điều kiện ending, điểm số, giới hạn xác minh và save.

## Âm thanh

- Game không tự phát tiếng trước tương tác. Bấm bắt đầu, tiếp tục hoặc chủ động bật âm để khởi động tiếng nền; reload chờ thao tác mới, kể cả trước đó đang bật tiếng.
- Nút âm thanh có ở thanh trên và trong mọi modal. Lựa chọn tắt âm được lưu cùng cơ chế storage của game và giữ qua reload; bật lại trong ca trực khôi phục tiếng nền. Trình đọc màn hình nhận được nhãn bật/tắt và trạng thái hiện tại.
- Âm nền tạm dừng khi trang bị ẩn/rời trang; khi quay lại ca đang chơi, game thử tiếp tục và có thể cần thao tác mới nếu browser chặn phát. Âm nền dừng ở ending, chỉ còn cue kết thúc. Chơi lại dùng lại audio context hiện có.
- [audio.js](../dist/audio.js) phát [nhạc nền gốc MP3](../dist/assets/elevator-theme.mp3) qua media element và sinh ambience/hiệu ứng bằng Web Audio; các lời gọi theo gameplay nằm trong [game.js](../dist/game.js). File nhạc được tải từ asset của game, không qua dịch vụ nhạc bên thứ ba. Lỗi phát MP3 hoặc Web Audio không chặn gameplay.
- Trạng thái nhạc trong footer/modal phản ánh chờ tương tác, tải, phát, tạm dừng, tắt hoặc lỗi. Nếu file tải lỗi, tắt rồi bật âm thanh để thử tải lại. “Đang phát” chỉ xác nhận trạng thái media, không chứng minh người chơi đã nghe tiếng.

### Tạo lại nhạc nền

Nhạc là bản gốc của dự án, gồm pad và motif do [generate-soundtrack.py](../scripts/generate-soundtrack.py) tổng hợp offline bằng Python chuẩn; không lấy bản thu hay sample nhạc bên ngoài. Người bảo trì có thể tạo WAV rồi encode MP3 bằng FFmpeg; người chơi không cần cài các công cụ này. Chạy từ thư mục gốc repo:

```bash
python3 scripts/generate-soundtrack.py /tmp/elevator-theme.wav
ffmpeg -hide_banner -loglevel error -y -i /tmp/elevator-theme.wav -af loudnorm=I=-18:TP=-1.5:LRA=7 -ar 44100 -codec:a libmp3lame -b:a 128k -map_metadata -1 dist/assets/elevator-theme.mp3
```

## Lưu trữ

Các khóa `localStorage` hiện có được giữ nguyên. Save hợp lệ từ bản cũ vẫn đọc được; do bản cũ chưa lưu lượt scan, lần tiếp tục đầu tiên của save cũ bắt đầu với hai lượt xác minh. Save mới lưu các nguồn đã mở trong trường `opened`.

Save phải có các số nguyên hữu hạn không âm, lịch sử và số quyết định khớp nhau, danh sách bằng chứng hợp lệ và tối đa hai nguồn đã mở không trùng. Save hỏng được bỏ qua để người chơi bắt đầu ca mới. Thành tích hỏng trở về điểm 0 và danh sách ending rỗng.

Khi quyền truy cập, đọc hoặc ghi storage thất bại, game dùng dữ liệu trong bộ nhớ cho phiên hiện tại. Dữ liệu trong bộ nhớ sẽ mất khi tải lại/đóng trang; không thể bảo đảm lưu lâu dài nếu trình duyệt không cho ghi. Sau khi chọn ending, save được xóa; nếu chỉ thao tác xóa bị chặn nhưng vẫn ghi được, game ghi `null` để không tiếp tục lại save đã hoàn tất.

## Browser regression suite

Runner: [tests/gameplay-regression.cjs](../tests/gameplay-regression.cjs). Runner tự phục vụ file game tại `127.0.0.1:8080`, chạy trình duyệt headless rồi đóng trình duyệt và server. Nếu cổng đang có tiến trình khác, runner báo lỗi; cần tự dừng server đang chạy trước khi test.

Nếu máy đã có package `playwright` dùng được qua Node:

```bash
node --test tests/gameplay-regression.cjs
```

Hoặc cài công cụ test vào thư mục riêng, không thay đổi môi trường chạy game:

```bash
npm install --prefix /tmp/tle-browser-tests --no-save --package-lock=false playwright@1.61.1
/tmp/tle-browser-tests/node_modules/.bin/playwright install chromium
PLAYWRIGHT_MODULE=/tmp/tle-browser-tests/node_modules/playwright node --test tests/gameplay-regression.cjs
```

Chạy cùng suite trên WebKit khi bản browser tương ứng đã được cài:

```bash
/tmp/tle-browser-tests/node_modules/.bin/playwright install webkit
BROWSER=webkit PLAYWRIGHT_MODULE=/tmp/tle-browser-tests/node_modules/playwright node --test tests/gameplay-regression.cjs
```

`PLAYWRIGHT_MODULE` nhận đường dẫn package đã cài nếu không nằm trong module path mặc định. `GAME_ROOT` nhận thư mục chứa `index.html`, `game.js`, `styles.css` để kiểm tra một snapshot khác. Không chạy nhiều suite cùng lúc vì runner dùng cổng cố định 8080.

Suite kiểm tra bốn ending, điểm/bằng chứng, chống thu thập trùng, scan/đọc lại nguồn qua reload, điều hướng tab không quyết định nhầm, hai nhánh chìa khóa của The Truth sau reload, modal/focus, SIGNAL, các nhánh lịch sử, storage lỗi, save cũ/save hỏng và viewport mobile. Các ca truyện còn kiểm tra nhánh từ chối Minh/Bảy/An/Linh, mốc ba đêm và nguồn điện, finale không tự cộng bằng chứng, Truth với một breach và bốn bằng chứng, cùng khả năng cuộn modal dài trên mobile. Storage lỗi được kiểm tra bằng cách làm các phương thức browser Storage ném `SecurityError`; không thay thế logic game.

Các ca âm thanh đo PCM bằng `AudioContext`/`AnalyserNode` thật tại đầu ra của graph, kiểm tra âm nền liên tục, cue, mute/unmute, reload/tiếp tục, chơi lại không nhân context và fallback. Phép đo này xác nhận tín hiệu do browser tạo ra; không thay thế việc nghe thử qua loa/tai nghe hoặc xác nhận âm lượng phần cứng của người chơi.

Các ca nhạc kiểm tra MP3 thật được decode và `currentTime` tăng sau tương tác; mute/reload/ending dừng đúng, lỗi play hoặc tải file có trạng thái tương ứng, và nút âm thanh nằm trong vòng focus của modal. Không có liên kết mở trình phát nhạc riêng trong giao diện. Trạng thái media và PCM không phải bài nghe thử phần cứng.

## Tích hợp P2Game

[Adapter SDK](../dist/p2game-platform.js) nối readiness, lifecycle và gửi điểm của ca vừa kết thúc; [test iframe](../tests/p2game-integration.cjs) chạy game/SDK/HostBridge thật dưới CSP chỉ cho tài nguyên cùng origin. Các phản hồi nhận hoặc từ chối điểm trong test là phần host cục bộ có kiểm soát, không chứng minh API hosted đã nhận điểm. `npm test` chạy suite gameplay trước rồi suite SDK; không chạy song song vì dùng chung cổng8080. Xem [hướng dẫn P2Game](p2game-integration.md) cho manifest, đóng gói và giới hạn nền tảng.
