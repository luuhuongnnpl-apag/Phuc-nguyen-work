# Nhật ký triển khai

## 2026-11-02 — Khởi tạo repository
- Xác minh repository đích và quyền admin/push.
- Repository ban đầu rỗng, public, default branch main.
- Khởi tạo cấu trúc frontend, Worker API skeleton, D1 schema, tài liệu và GitHub Actions.
- Chưa cấu hình Cloudflare, OAuth credentials hoặc D1 database.
- Chưa có nghiệp vụ CRUD hoặc xác thực production; chưa đủ điều kiện nghiệm thu.

## 2026-11-02 — Dựng lại giao diện theo mẫu WORK'S CORNER
- Bố cục theo mẫu: đầu trang gradient đen–xanh tím có logo, thanh phân hệ dạng viên thuốc, bảng tuần 7 cột, danh sách tuần bên dưới.
- Lịch đánh theo tuần: tuần mới nhất ở trên, tuần ban hành trước tự xếp xuống dòng dưới; bấm vào tuần để xem.
- Dữ liệu lịch nằm trong `apps/web/data.js` (sửa file này để thêm tuần mới).
- Lỗi triển khai trước đó: GitHub Pages chưa được bật (deploy-pages báo 404). Cần bật Settings → Pages → Source: GitHub Actions.
