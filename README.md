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
  audio.js                    Âm nền và hiệu ứng Web Audio sinh trực tiếp
  game.js                     Toàn bộ logic game và nội dung cốt truyện
  assets/elevator-lobby.png   Ảnh nền sảnh thang máy
```

## Những gì đã có

- 3 đêm trực, 12 lượt hành khách, 8 danh tính nhân vật.
- Cốt truyện ba hồi về sự cố năm 2013, những danh tính bị sao chép và ký ức người trực; lời kể theo các lựa chọn trước đó.
- Hai lượt xác minh trên mỗi hành khách: hồ sơ cư dân, camera CCTV hoặc nhật ký hệ thống.
- Lựa chọn cho phép/từ chối, điểm số, độ tin cậy, vi phạm và bằng chứng.
- 4 kết thúc: The Keeper, The Replacement, The Truth và The Silence.
- Lưu tiến trình và thành tích trong `localStorage` của trình duyệt.
- Giữ lượt xác minh và kết quả vừa đọc khi tải lại trang; SIGNAL phản ánh đường truyền theo đêm, không phải đáp án an toàn.
- Game vẫn chơi được trong phiên hiện tại khi trình duyệt chặn lưu trữ; dữ liệu lưu lỗi được bỏ qua an toàn.
- Hỗ trợ bàn phím và giao diện responsive cho desktop/mobile.
- Âm nền quạt/động cơ sảnh và hiệu ứng xác minh, cửa, cảnh báo, chuyển đêm, kết thúc; bật/tắt được ở thanh trên và trong modal, giữ lựa chọn qua reload.
- Hình nhân vật được tạo bằng SVG trực tiếp trong `game.js`; ảnh nền riêng trong `assets/`.

## Tùy chỉnh

- **Nội dung nhân vật, lời thoại, 12 tình huống, các kết thúc:** sửa các hằng `people`, `cases`, `scenes`, `endings` trong `dist/game.js`.
- **Nội dung phụ thuộc quyết định trước đó:** xem `caseQuote()`, `caseNote()`, `clueText()`, `nightBody()`, `nightSummaryText()` và `endingText()` trong `dist/game.js`.
- **UI và phối màu:** sửa `dist/styles.css`.
- **Âm nền và hiệu ứng:** sửa [dist/audio.js](dist/audio.js); các điểm phát âm theo gameplay nằm trong `dist/game.js`. Âm được sinh bằng Web Audio, không cần tải file âm thanh hay dịch vụ ngoài.
- **Ảnh nền:** thay `dist/assets/elevator-lobby.png`, hoặc sửa đường dẫn ở `.elevator-stage` trong CSS.
- **Nhân vật:** sửa hàm `portrait(...)` trong `dist/game.js` để thay SVG tạm bằng asset nhân vật riêng.

Xem [hướng dẫn cốt truyện và continuity — có spoiler toàn bộ truyện](docs/story-guide.md) trước khi sửa nội dung.

Âm thanh bắt đầu sau khi bấm bắt đầu/tiếp tục hoặc chủ động bật tiếng. Nếu đã tắt âm, dùng nút **BẬT ÂM THANH** trong modal; sau reload cần một thao tác mới để phát. Xem [quy tắc âm thanh và kiểm tra](docs/gameplay-and-testing.md#âm-thanh).

## Deploy

Game dùng Cloudflare Workers Static Assets, cấu hình trong `wrangler.jsonc`. Cài công cụ và deploy:

```bash
npm ci
npm run deploy:check
npx wrangler login
npm run deploy
```

Xem [hướng dẫn GitHub, deploy và kiểm tra](docs/deployment.md). Node.js chỉ cần cho công cụ deploy/test; bản game vẫn là HTML/CSS/JavaScript tĩnh.

**Lưu ý:** Đây là mã nguồn của MVP web đã xây, chưa tích hợp asset OpenPencil Phase C/D, backend, hoặc SDK/API của nền tảng thi `p2game.io`.

## Kiểm tra hồi quy

Xem [quy tắc gameplay, lưu trữ và cách chạy browser test](docs/gameplay-and-testing.md). Test dùng Node.js và Playwright; chạy game vẫn chỉ cần static server.
