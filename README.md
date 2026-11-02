# PHÚC NGUYÊN WORK

Hệ thống quản lý và theo dõi lịch công tác, nhiệm vụ chuyên môn và tiến độ công việc.

## Phân hệ
- Lịch công tác: lịch giảng, lịch họp, lịch học, coi thi, chấm thi, nghiên cứu khoa học và công việc khác.
- Quản lý công việc: tạo, cập nhật, xóa mềm, phân công thành viên, trạng thái, mức ưu tiên, tiến độ và hạn hoàn thành.
- Quản lý lịch: CRUD lịch, liên kết lịch với nhiệm vụ.
- Báo cáo: tổng hợp theo khoảng thời gian, trạng thái, số lượng quá hạn và lịch theo phân hệ.
- Nhắc việc: thông báo trong hệ thống và email theo lịch (tùy cấu hình Resend).
- Đăng nhập GitHub OAuth, phân quyền admin/manager/member/viewer.

## Kiến trúc
- Frontend: HTML/CSS/JavaScript tĩnh trên GitHub Pages.
- API: Cloudflare Workers.
- Cơ sở dữ liệu: Cloudflare D1. Không dùng Local Storage làm nguồn dữ liệu chính.
- Xác thực: GitHub OAuth; session token được băm trước khi lưu vào D1; cookie HttpOnly, Secure, SameSite=None.
- Migration: database/migrations.

## Phát triển
- Trang lịch: apps/web/index.html.
- Quản trị công việc: apps/web/manage.html.
- Cấu hình API công khai: apps/web/config.js (chỉ đặt URL Worker, không đặt secrets).
- API: apps/api/src/index.js.
- Hướng dẫn cấu hình và phát hành: docs/DEPLOYMENT.md.

## Cập nhật lịch tĩnh dự phòng
Mở apps/web/data.js, thêm một khối tuần vào phân hệ tương ứng. Khi API được cấu hình và có phiên đăng nhập, lịch đã lưu trên D1 sẽ được đồng bộ vào trang lịch; dữ liệu tĩnh vẫn dùng làm phương án dự phòng khi API chưa khả dụng.

## Bảo mật
Không commit OAuth client secret, API token, mật khẩu hoặc dữ liệu cá nhân thật. Không dùng tài khoản demo hay mật khẩu mặc định.
