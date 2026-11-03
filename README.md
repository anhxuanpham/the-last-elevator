# THE LAST ELEVATOR: FLOOR 13

Game kinh dị suy luận chạy trực tiếp trên trình duyệt, viết bằng HTML, CSS và JavaScript thuần.

## Chạy trên macOS

Không cần cài Node.js, npm hoặc framework. Mở Terminal tại thư mục chứa `index.html`:

```bash
cd dist
python3 -m http.server 8080
```

Sau đó truy cập **http://localhost:8080/**.

Có thể mở trực tiếp `dist/index.html`, nhưng nên dùng HTTP server nội bộ để kiểm tra game trong môi trường giống khi deploy.

## Cấu trúc

```text
dist/
  index.html                  UI và nội dung HTML
  styles.css                  Theme, bố cục, responsive, hiệu ứng
  audio.js                    Phát nhạc nền, ambience và hiệu ứng
  game.js                     Toàn bộ logic game và nội dung cốt truyện
  p2game-platform.js           Kết nối SDK và vòng đời P2Game
  p2game.json                  Manifest P2Game
  assets/elevator-lobby.webp   Ảnh nền sảnh thang máy
  assets/elevator-theme.mp3   Nhạc nền gốc của dự án
```

## Những gì đã có

- 3 đêm trực, 12 lượt hành khách, 8 danh tính nhân vật.
- Cốt truyện ba ca cuối trước ngày thay bộ điều khiển: một cuộc gọi không số, khoảng băng bị cắt và những lời của người chơi được phát lại theo lịch sử lựa chọn.
- Hai lượt xác minh trên mỗi hành khách: hồ sơ cư dân, camera CCTV hoặc nhật ký hệ thống.
- Lựa chọn cho phép/từ chối, điểm số, độ tin cậy, vi phạm và bằng chứng.
- 4 kết thúc: The Keeper, The Replacement, The Truth và The Silence.
- Lưu tiến trình và thành tích trong `localStorage` của trình duyệt.
- Giữ lượt xác minh và kết quả vừa đọc khi tải lại trang; SIGNAL phản ánh đường truyền theo đêm, không phải đáp án an toàn.
- Game vẫn chơi được trong phiên hiện tại khi trình duyệt chặn lưu trữ; dữ liệu lưu lỗi được bỏ qua an toàn.
- Hỗ trợ bàn phím và giao diện responsive cho desktop/mobile.
- Nhạc nền gốc có giai điệu, tiếng quạt/động cơ và hiệu ứng theo gameplay; bật/tắt ở thanh trên và trong modal, giữ lựa chọn qua reload. Có trạng thái phát nhạc.
- Hình nhân vật được tạo bằng SVG trực tiếp trong `game.js`; ảnh nền riêng trong `assets/`.

## Tùy chỉnh

- **Nội dung nhân vật, lời thoại, 12 tình huống, các kết thúc:** sửa các hằng `people`, `cases`, `scenes`, `endings` trong `dist/game.js`.
- **Nội dung phụ thuộc quyết định trước đó:** xem `caseQuote()`, `caseNote()`, `clueText()`, `nightBody()`, `nightSummaryText()`, `choiceEcho()` và `endingText()` trong `dist/game.js`.
- **UI và phối màu:** sửa `dist/styles.css`.
- **Nhạc nền và hiệu ứng:** sửa [dist/audio.js](dist/audio.js); các điểm phát âm theo gameplay nằm trong `dist/game.js`. Nhạc MP3 được tải từ asset của game, tiếng nền/hiệu ứng sinh bằng Web Audio; không dùng dịch vụ nhạc ngoài. Script [generate-soundtrack.py](scripts/generate-soundtrack.py) tạo bản nhạc gốc; xem [cách tạo lại asset](docs/gameplay-and-testing.md#tạo-lại-nhạc-nền).
- **Ảnh nền:** thay `dist/assets/elevator-lobby.webp`, hoặc sửa đường dẫn ở `.elevator-stage` trong CSS.
- **Nhân vật:** sửa hàm `portrait(...)` trong `dist/game.js` để thay SVG tạm bằng asset nhân vật riêng.

Xem [hướng dẫn cốt truyện và continuity — có spoiler toàn bộ truyện](docs/story-guide.md) trước khi sửa nội dung.

Âm thanh bắt đầu sau khi bấm bắt đầu/tiếp tục hoặc chủ động bật tiếng. Nếu đã tắt âm, dùng nút **BẬT ÂM THANH** trong modal; sau reload cần một thao tác mới để phát. Trạng thái “đang phát” phản ánh media trong game, không xác nhận tiếng đã đến loa/tai nghe. Xem [quy tắc âm thanh và kiểm tra](docs/gameplay-and-testing.md#âm-thanh).

## Deploy

Game dùng Cloudflare Workers Static Assets, cấu hình trong `wrangler.jsonc`. Cài công cụ và deploy:

```bash
npm ci
npm run deploy:check
npx wrangler login
npm run deploy
```

Xem [hướng dẫn GitHub, deploy và kiểm tra](docs/deployment.md). Node.js chỉ cần cho công cụ deploy/test; bản game vẫn là HTML/CSS/JavaScript tĩnh.

Game đã tích hợp SDK P2Game cho readiness, vòng đời và gửi điểm qua khung nền tảng. Manifest và tài nguyên upload nằm trong `dist/`; xem [hướng dẫn đóng gói P2Game](docs/p2game-integration.md). Game vẫn chạy độc lập, chưa bật cloud save hoặc multiplayer.

## Kiểm tra hồi quy

Xem [quy tắc gameplay, lưu trữ và cách chạy browser test](docs/gameplay-and-testing.md). Test dùng Node.js và Playwright; chạy game vẫn chỉ cần static server.
