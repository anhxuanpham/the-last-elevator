# P2Game

Hợp đồng tham chiếu: [tổng quan](https://dev.p2game.io/docs), [manifest](https://dev.p2game.io/docs/manifest), [SDK](https://dev.p2game.io/docs/sdk). [p2game.json](../dist/p2game.json) sở hữu cấu hình bản dựng; [p2game-platform.js](../dist/p2game-platform.js) sở hữu kết nối; [kiểm tra iframe](../tests/p2game-integration.cjs) thực thi các bảo đảm tại ranh giới SDK.

## Phạm vi

Game vẫn mở trực tiếp trên Cloudflare/local. Trong P2Game, SDK chính thức bắt tay với khung cha, báo `ready` khi intro đã dựng, nhận pause/resume/beforeUnload và gửi điểm ca hoàn tất. Game không đọc token, không tự dựng đăng nhập, không gọi thẳng API tài khoản hoặc bảng điểm. Thông báo gửi điểm chỉ xuất hiện khi host xác nhận nhận điểm; lỗi không chặn ending hoặc xóa thành tích local.

Game solo dùng lưu tiến trình trên máy như trước. Manifest không bắt đăng nhập, không bật cloud save/multiplayer. Người chơi có thể cần đăng nhập ở khung P2Game để gửi điểm. Phiên chơi và kiểm tra thời lượng do host cấp/quản lý; game không tự tạo hay làm mới session bằng API riêng.

Score gửi là điểm của ca vừa kết thúc, không lấy điểm kỷ lục từ một save cũ. Trần và thời lượng tối thiểu nằm trong manifest. Gửi trước `gameOver`; mỗi ca chỉ gửi một lần. Khi chơi lại trong lúc chờ phản hồi, thông báo của ca trước không chen vào ca mới. Kiểm thử dùng SDK và HostBridge thật với phần nhận điểm cục bộ có kiểm soát; chưa thay thế kiểm tra tài khoản/bảng điểm trên P2Game hosted.

Pause từ host giữ save hiện tại, khóa input và dừng nhạc/hiệu ứng. Resume giữ lựa chọn tắt âm; chưa từng bấm bắt đầu thì không tự phát nhạc. SDK thiếu hoặc bắt tay thất bại không làm hỏng gameplay local; điều đó không có nghĩa bản nhúng đã đạt kiểm tra SDK của nền tảng.

## Chuẩn bị bản tải lên

Chạy ở gốc repo:

```bash
npm ci
npm run check
npm test
npm run test:webkit
npm run p2game:check
npm run p2game:package
```

Archive mặc định nằm trong `plans/releases/`, có `index.html` và `p2game.json` ở gốc. [Script đóng gói](../scripts/package-p2game.py) chỉ lấy `dist/`, không chứa source test, node_modules, cấu hình máy hoặc báo cáo local. Có thể truyền đường dẫn đầu ra cho script nếu cần.

`p2game:check` là kiểm tra của dự án dựa trên tài liệu công khai, không phải bộ kiểm tra chính thức. Tại thời điểm tích hợp, package `p2game-validate` trong hướng dẫn trả npm404; trang rules/mẫu manifest cũng báo API chưa sẵn sàng. Khi công cụ chính thức hoạt động, chạy đúng lệnh từ tài liệu nền tảng. Bước upload vẫn phải kiểm tra slug đã đăng ký, version đã xuất bản, schema/CSP thực tế và kiểm duyệt nội dung.

Manifest đang dùng `the-last-elevator` theo repo. Khi tạo game trong Developer Portal, dùng đúng slug đó hoặc cập nhật `id` trước khi đóng gói. Hồ sơ studio cần được duyệt để tạo/xuất bản game. Không tự tạo hồ sơ hoặc nộp game bằng dữ liệu phỏng đoán. Mỗi lần cập nhật game đã xuất bản, tăng version trong manifest theo yêu cầu nền tảng.

Với Git, trỏ tới repo public và chọn `dist/` làm thư mục bản dựng nếu giao diện hỗ trợ. Archive là lựa chọn trực tiếp nếu luồng Git không có trường chọn thư mục. Push GitHub và deploy Workers không tự tạo bản phát hành trên P2Game.

## Tài nguyên và quyền

SDK UMD được giữ nguyên từ `@p2game.io/sdk`, kèm [MIT license](../dist/assets/sdk/LICENSE.txt); version dev dependency dùng cho test là nguồn đối chiếu byte của bundle. SDK được phục vụ cùng origin, game không ghi đè đối tượng SDK. Font được đóng gói cùng các giấy phép OFL trong `dist/assets/fonts/`; không tải Google Fonts lúc chơi. Không cần quyền external-network.

[Store assets](../dist/assets/store/) dùng nhãn13 của game và ảnh chụp game thật, không dùng mockup gameplay. [Script chụp](../scripts/capture-store-assets.cjs) tạo lại icon, cover và hai ảnh màn hình từ bản build hiện tại. Nhạc gốc và ảnh nền của dự án được giữ nguyên. Nội dung có yếu tố kinh dị, mất mát và tội lỗi; age rating trong manifest là khai báo của nhà phát triển, quyết định cuối thuộc kiểm duyệt nền tảng.
