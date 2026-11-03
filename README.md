# PHÚC NGUYÊN WORK — WORK'S CORNER

Lịch công tác cá nhân theo tuần, phát hành qua GitHub Pages:
https://luuhuongnnpl-apag.github.io/Phuc-nguyen-work/

## Cách hoạt động
- **Một nguồn dữ liệu duy nhất:** `apps/web/data/events.json`, gồm danh sách phân loại (`categories`) và công việc (`events`).
- **Lịch tổng** hiển thị toàn bộ công việc; mỗi lịch con (Lịch giảng, Lịch họp, Lịch học, Coi thi, Chấm thi, NCKH, Khác và các loại tự thêm) là bộ lọc theo phân loại, nên nhập một lần là tự có ở lịch con và thống kê.
- **Thống kê:** theo tháng, quý, năm; số buổi/việc và số tiết theo từng hạng mục; xuất Excel (hai trang: Tổng hợp, Chi tiết).
- **Lịch R'Mia** là thời khóa biểu cố định của các con (`apps/web/rmia.js`), không tính vào thống kê.

## Quy tắc xếp ô và tính tiết
- Sáng: bắt đầu trước 12h00; chiều: 12h00–18h00; tối: từ 18h00. Việc kéo dài sang buổi sau được gộp ô nếu không trùng việc khác.
- Kiểu thời gian: theo giờ, theo buổi (chưa rõ giờ), cả ngày (sáng + chiều), hạn chót trong ngày (hàng cuối, tô xanh).
- Số tiết: khoảng 1 giờ = 1 tiết, làm tròn đến tiết gần nhất. Nhập ô “Số tiết” để ghi đè (ví dụ buổi cả ngày có nghỉ trưa). Việc thiếu giờ kết thúc được đánh dấu “chưa đủ giờ”.

## Thêm, sửa, xóa công việc (chế độ biên tập)
1. Tạo mã truy cập một lần tại https://github.com/settings/personal-access-tokens/new
   - Repository access: **Only select repositories** → `Phuc-nguyen-work`.
   - Permissions → Repository permissions → **Contents: Read and write** (không cần quyền nào khác).
   - Chọn thời hạn (ví dụ 1 năm), bấm Generate token, sao chép mã `github_pat_…`.
2. Trên trang lịch, bấm **BIÊN TẬP** (thanh ĐIỀU HƯỚNG), dán mã, bấm “Bật biên tập”. Mỗi trình duyệt/thiết bị chỉ cần làm một lần.
3. Thêm việc bằng nút **+ Thêm công việc** hoặc nút **+** ở từng ô (tự điền ngày, buổi). Bấm vào một công việc để sửa, xóa hoặc nhân bản sang ngày khác.
4. Mỗi lần lưu là một commit vào `data/events.json`; trang công khai cập nhật sau khoảng 1–2 phút. Người xem không thấy các nút biên tập.
5. Dùng máy chung thì bấm **THOÁT BIÊN TẬP** để xóa mã khỏi trình duyệt. Nếu lộ mã, thu hồi ngay tại trang Personal access tokens của GitHub.

## Cấu trúc
- `apps/web/index.html`, `app.js`, `styles.css`, `work.css` — giao diện, hiển thị, biên tập, thống kê.
- `apps/web/config.js` — thông tin kho GitHub và quy đổi tiết (không chứa bí mật).
- `apps/web/data/events.json` — dữ liệu lịch.
- `.github/workflows/` — kiểm tra dữ liệu và phát hành Pages.

## Lưu trữ
Phiên bản trước khi thiết kế lại (có máy chủ Cloudflare, trang quản lý, planner) được giữ ở nhánh `backup/20261103-before-redesign`; các nhánh thử nghiệm cũ được lưu bằng tag `archive/<tên nhánh>`.
