# Kế hoạch kiểm thử và nghiệm thu

## Backend
- [ ] Health endpoint
- [ ] OAuth state/PKCE/callback và chống replay
- [ ] Session cookie HttpOnly/Secure/SameSite, hết hạn và logout
- [ ] RBAC: guest, member, manager, admin
- [ ] CRUD task/project và kiểm tra input
- [ ] Phân quyền truy cập object (IDOR)
- [ ] Dependencies và vòng lặp phụ thuộc
- [ ] Activity log
- [ ] Migration, backup và restore

## Frontend
- [ ] Responsive desktop/tablet/mobile
- [ ] Điều hướng và biểu mẫu
- [ ] Trạng thái loading/empty/error
- [ ] Không lưu dữ liệu nghiệp vụ vào Local Storage
- [ ] API unavailable phải báo rõ, không hiển thị dữ liệu giả

## Nghiệm thu
Chỉ xác nhận hoàn thành sau khi chạy kiểm thử tích hợp trên URL công khai, xác minh dữ liệu D1 tồn tại sau đăng xuất/đăng nhập lại và kiểm tra tài khoản không có quyền bị từ chối.
