# Hướng dẫn cấu hình và phát hành PHÚC NGUYÊN WORK

## 1. GitHub Pages
1. Mở repository Settings → Pages.
2. Chọn Source: GitHub Actions.
3. Workflow .github/workflows/pages.yml triển khai toàn bộ thư mục apps/web.
4. Địa chỉ dự kiến: https://luuhuongnnpl-apag.github.io/Phuc-nguyen-work/.

## 2. Tạo Cloudflare D1
Trong thư mục apps/api:
```bash
npx wrangler login
npx wrangler d1 create phuc-nguyen-work
```
Sao chép database_id Cloudflare trả về vào database_id trong apps/api/wrangler.toml, thay giá trị placeholder.
Áp dụng toàn bộ migration:
```bash
npx wrangler d1 migrations apply phuc-nguyen-work --remote
```
Migration 0001 tạo users, roles, projects, tasks, documents, sessions và activity log. Migration 0002 tạo schedules và reminders; migration 0003 khởi tạo bảy nhóm công việc mặc định. Không xóa hoặc tạo lại database khi cập nhật ứng dụng.

## 3. Cấu hình GitHub OAuth
Tạo OAuth App tại GitHub Developer Settings:
- Homepage URL: https://luuhuongnnpl-apag.github.io/Phuc-nguyen-work/
- Authorization callback URL: https://<WORKER-DOMAIN>/api/auth/callback

Trong Cloudflare Worker, cấu hình Variables:
- GITHUB_CLIENT_ID: Client ID của OAuth App.
- GITHUB_REDIRECT_URI: callback URL ở trên.
- BOOTSTRAP_ADMIN_GITHUB_ID: 348332521 (GitHub account sở hữu repository, dùng để cấp vai trò admin ban đầu).
- APP_ORIGIN: https://luuhuongnnpl-apag.github.io.
- APP_URL: https://luuhuongnnpl-apag.github.io/Phuc-nguyen-work/.

Đặt secret:
```bash
npx wrangler secret put GITHUB_CLIENT_SECRET
```
Không đưa Client Secret vào frontend hoặc repository. Người đăng nhập khác được cấp vai trò member mặc định; admin/manager có thể phân công công việc. Việc thay đổi vai trò phải thực hiện trực tiếp trong D1 bằng tài khoản quản trị được kiểm soát.

## 4. Triển khai Worker và kết nối frontend
```bash
cd apps/api
npx wrangler deploy
```
Sau khi deploy, sao chép URL Worker (ví dụ dạng https://phuc-nguyen-work-api.<subdomain>.workers.dev) và cập nhật apiBaseUrl trong apps/web/config.js. Đây là URL công khai, không phải secret. Commit thay đổi để GitHub Pages tự triển khai frontend.

Cookie phiên làm việc được phát hành từ Worker với thuộc tính HttpOnly, Secure, SameSite=None để frontend GitHub Pages có thể gửi cookie trong yêu cầu có credentials. CORS chỉ cho phép origin được khai báo tại APP_ORIGIN.

## 5. Nhắc việc qua email (tùy chọn)
Tạo tài khoản Resend và xác minh domain gửi thư. Cấu hình:
- Worker Secret RESEND_API_KEY.
- Worker Variable REMINDER_FROM_EMAIL với địa chỉ gửi đã xác minh.

Cron trong apps/api/wrangler.toml chạy mỗi 15 phút. Nhắc việc kênh in-app hiển thị trong phân hệ Nhắc việc; email chỉ gửi khi đã cấu hình Resend và email GitHub của người dùng được xác minh.

## 6. Vai trò
- admin: toàn quyền, xem toàn bộ dữ liệu.
- manager: quản lý dữ liệu chung, phân công thành viên, xem báo cáo.
- member: tạo công việc/lịch; xem và cập nhật nhiệm vụ do mình tạo hoặc được phân công.
- viewer: chỉ xem dữ liệu, không tạo/sửa/xóa.

## 7. Kiểm thử trước khi đưa vào sử dụng
- GitHub Actions CI phải hoàn thành thành công.
- Đăng nhập GitHub, kiểm tra hồ sơ và đăng xuất.
- Tạo/sửa/xóa công việc và lịch; tải lại trang và đăng nhập lại để xác nhận dữ liệu còn nguyên.
- Kiểm tra phân công thành viên, quyền viewer và giới hạn dữ liệu member.
- Kiểm tra báo cáo theo tuần/tháng, nhắc việc in-app và email.
- Kiểm tra CORS, cookie, backup/restore D1 và nhật ký hoạt động.

Trạng thái hiện tại: mã nguồn và migration đã được đưa lên GitHub; chưa thể xác nhận dịch vụ production cho đến khi có D1 database, OAuth Client Secret, Worker deployment URL và cấu hình Pages thực tế. Không nhập dữ liệu công việc thật trước khi hoàn thành các bước cấu hình và kiểm thử.
