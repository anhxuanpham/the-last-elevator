# GitHub và Cloudflare Workers

Game được deploy bằng Workers Static Assets. Wrangler chỉ tải nội dung thư mục `dist/`; docs, tests, package và báo cáo local không trở thành file trên website. Không cần Worker script hoặc build frontend.

## Cài công cụ

Node.js 22 trở lên:

```bash
npm ci
```

Node chỉ dùng cho công cụ deploy/test. Để chơi local vẫn có thể dùng static server theo README.

## Kiểm tra và deploy

```bash
npm run check
npm run deploy:check
npx wrangler login
npm run deploy
```

Tên Worker và thư mục assets nằm trong [wrangler.jsonc](../wrangler.jsonc). `workers_dev` bật địa chỉ HTTPS `workers.dev`; đường dẫn không có asset trả 404. Không có fallback SPA hoặc API backend.

Nếu có nhiều Cloudflare account, chọn account bằng biến môi trường `CLOUDFLARE_ACCOUNT_ID` khi deploy. Không đưa OAuth token, API token hoặc file cấu hình chứa bí mật lên GitHub.

## Kiểm tra game

```bash
npx playwright install chromium webkit
npm test
npm run test:webkit
```

Suite tự chạy server tại `127.0.0.1:8080`, đóng server/browser sau khi hoàn tất. Không chạy hai suite cùng lúc. Xem thêm [gameplay/testing](gameplay-and-testing.md).

## Cập nhật

```bash
git add dist docs README.md package.json package-lock.json wrangler.jsonc .gitignore
git commit -m "fix: update game content"
git push
npm run deploy
```

Push GitHub và deploy là hai thao tác riêng; project chưa cấu hình tự động deploy khi push. Các plan, báo cáo, ảnh kiểm thử và đường dẫn riêng của máy nằm trong `plans/`, được giữ local qua `.gitignore`.
