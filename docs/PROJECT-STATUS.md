# Nhật ký triển khai

## 2026-11-02 — Khởi tạo repository
- Xác minh repository đích và quyền admin/push.
- Repository public, nhánh mặc định main.
- Khởi tạo frontend, Worker API skeleton, D1 schema, tài liệu và GitHub Actions.
- Cloudflare, OAuth credentials và D1 database chưa được cấu hình.

## 2026-11-02 — Giao diện WORK'S CORNER
- Dựng giao diện trang lịch theo bộ nhận diện Phúc Nguyên Work.
- Giữ các phân hệ lịch hiện có và dữ liệu tuần tĩnh trong data.js làm phương án dự phòng.
- Bổ sung liên kết sang trang quản lý công việc dùng chung phong cách giao diện.

## 2026-11-03 — Triển khai nghiệp vụ quản lý
- Bổ sung API GitHub OAuth, session cookie bảo mật và kiểm tra quyền ở máy chủ.
- Bổ sung CRUD công việc, CRUD lịch, phân công thành viên, báo cáo tổng hợp, nhắc việc và nhật ký hoạt động.
- Bổ sung migration 0002 cho schedules/reminders và migration 0003 khởi tạo bảy nhóm công việc.
- Bổ sung trang manage.html: danh sách, tìm kiếm/lọc, biểu mẫu công việc/lịch, phân công, báo cáo và nhắc việc.
- Bổ sung cron 15 phút để gửi email nhắc việc khi cấu hình Resend.
- Lịch từ D1 có thể đồng bộ vào bảng lịch tuần sau khi API được cấu hình và người dùng đăng nhập.

## Việc còn phải cấu hình trước production
- Tạo D1 database, cập nhật database_id và chạy migrations 0001–0002.
- Tạo GitHub OAuth App; cấu hình GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI và secret GITHUB_CLIENT_SECRET.
- Cấu hình BOOTSTRAP_ADMIN_GITHUB_ID, APP_ORIGIN, APP_URL.
- Deploy Cloudflare Worker; cập nhật apiBaseUrl trong apps/web/config.js.
- Bật GitHub Pages với Source = GitHub Actions; xác minh CI và Pages deployment.
- Cấu hình Resend nếu cần gửi email nhắc việc.
- Kiểm thử thực tế đăng nhập, CRUD, persistence, phân quyền, báo cáo và reminders trước khi nhập dữ liệu thật.
