# Hướng dẫn triển khai

## A. GitHub Pages
1. Repository Settings -> Pages.
2. Source: GitHub Actions.
3. Workflow `.github/workflows/pages.yml` sẽ build và deploy thư mục `apps/web`.
4. Cấu hình `VITE_API_BASE_URL` (nếu dùng bundler về sau) hoặc cập nhật cấu hình API trong `apps/web/config.js`.

## B. Cloudflare D1
1. Tạo D1 database.
2. Gắn binding tên `DB` vào Worker.
3. Chạy migration bằng Wrangler: `wrangler d1 migrations apply phuc-nguyen-work --remote`.
4. Không xóa hoặc tái tạo database khi cập nhật ứng dụng.

## C. Cloudflare Worker
1. Tạo Worker và cấu hình `wrangler.toml`.
2. Thêm D1 binding `DB`.
3. Đặt variables: `APP_ORIGIN`, `OAUTH_CLIENT_ID`, `OAUTH_REDIRECT_URI`.
4. Đặt secrets bằng `wrangler secret put OAUTH_CLIENT_SECRET` và `SESSION_SECRET`.
5. Cấu hình OAuth app callback trùng `OAUTH_REDIRECT_URI`.
6. Deploy Worker, cập nhật API base URL trong frontend.

## D. Trước khi mở truy cập
- Xác minh OAuth callback, session rotation, logout và CSRF protections.
- Kiểm tra CORS, cookie, quyền vai trò và truy vấn theo phạm vi người dùng.
- Chạy toàn bộ migration và kiểm tra backup/restore D1.
- Không coi ứng dụng là production-ready khi chưa có OAuth credentials và database thật.
