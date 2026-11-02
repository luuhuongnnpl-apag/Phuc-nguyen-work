# PHÚC NGUYÊN WORK
Hệ thống quản lý và theo dõi công việc

## Trạng thái triển khai
Repository được khởi tạo theo kiến trúc frontend tĩnh + API Cloudflare Workers + Cloudflare D1.
Không dùng Local Storage làm nguồn dữ liệu chính. Các màn hình chưa kết nối backend sẽ hiển thị trạng thái cấu hình rõ ràng và không lưu giả.

## Cấu trúc
- `apps/web`: giao diện GitHub Pages.
- `apps/api`: Cloudflare Worker API.
- `database/migrations`: schema và migration D1.
- `docs`: kiến trúc, triển khai, kiểm thử.
- `.github/workflows`: CI cơ bản.

## Cập nhật lịch hằng tuần
Mở `apps/web/data.js`, chép một khối `{ from, to, items }` vào phân hệ cần cập nhật và sửa nội dung. Tuần mới nhất tự hiển thị trên cùng, các tuần trước xếp xuống dưới.

## Phát triển
Mở `apps/web/index.html` để xem bản giao diện cục bộ.
Triển khai chính thức cần cấu hình Cloudflare D1, Worker secrets và xác thực OAuth.
Xem `docs/DEPLOYMENT.md`.

## Bảo mật
Không commit OAuth client secret, API token, mật khẩu hoặc dữ liệu cá nhân thật.
