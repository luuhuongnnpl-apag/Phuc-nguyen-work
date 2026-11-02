# Kiến trúc hệ thống

## Thành phần
1. Frontend: HTML/CSS/ES modules, triển khai tại GitHub Pages.
2. API: Cloudflare Workers, xác thực và kiểm tra quyền ở server.
3. Database: Cloudflare D1 (SQLite), migrations có version.
4. Tài liệu: lưu URL tham chiếu; file nhị phân đặt tại Google Drive/R2 hoặc kho ngoài, không lưu trực tiếp trong D1.
5. Auth: OAuth qua server-side callback; session cookie HttpOnly, Secure, SameSite; secrets chỉ nằm trong Worker Secrets.

## Luồng
Browser -> GitHub Pages -> Worker API -> Auth middleware -> Service layer -> D1.
Mọi truy vấn dữ liệu phải lọc theo tenant/workspace và quyền người dùng. Mọi thao tác thay đổi ghi activity log trong cùng transaction phù hợp.

## Mô hình dữ liệu
- users, sessions, roles, user_roles
- projects, tasks, task_assignees, task_dependencies
- documents, task_documents
- activity_logs, categories, settings

## Nguyên tắc
- UUID/ULID cho khóa công khai; thời gian ISO-8601 UTC.
- Soft delete đối với nghiệp vụ cần lưu vết.
- Migration chỉ tiến về phía trước, không sửa migration đã phát hành.
- Không có demo account hay mật khẩu mặc định.
- CORS chỉ cho phép origin frontend được cấu hình.
