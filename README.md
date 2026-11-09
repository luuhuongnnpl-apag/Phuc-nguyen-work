# PHÚC NGUYÊN WORK — WORK'S CORNER

Lịch công tác cá nhân theo tuần, phát hành qua GitHub Pages:
https://luuhuongnnpl-apag.github.io/Phuc-nguyen-work/

## Cách hoạt động
- **Dữ liệu lưu trên Firebase Firestore** (dự án `phuc-nguyen-library`): tài liệu `pnw/meta` (phân loại) và `pnw/meta/events/{id}` (mỗi công việc một bản ghi). Ai cũng xem được; chỉ tài khoản admin được ghi (Quy tắc bảo mật Firestore).
- `apps/web/data/events.json` là bản cũ trước khi chuyển (04/11/2026): dùng một lần để tự chuyển lên Firestore khi admin đăng nhập lần đầu, và làm bản dự phòng hiển thị khi không kết nối được Firestore. Không cập nhật file này nữa.
- **Lịch tổng** hiển thị toàn bộ công việc; mỗi lịch con là bộ lọc theo phân loại, nên nhập một lần là tự có ở lịch con và thống kê.
- **Thống kê:** theo tháng, quý, năm; số buổi/việc và số tiết theo từng hạng mục; xuất Excel (hai trang: Tổng hợp, Chi tiết).
- **Lịch R'Mia** là thời khóa biểu cố định của các con (`apps/web/rmia.js`), không tính vào thống kê.

## Quy tắc xếp ô và tính tiết
- Sáng: bắt đầu trước 12h00; chiều: 12h00–18h00; tối: từ 18h00. Việc kéo dài sang buổi sau được gộp ô nếu không trùng việc khác.
- Kiểu thời gian: theo giờ, theo buổi (chưa rõ giờ), cả ngày (sáng + chiều), hạn chót trong ngày (hàng cuối, tô xanh).
- Số tiết: khoảng 1 giờ = 1 tiết, làm tròn đến tiết gần nhất. Nhập ô “Số tiết” để ghi đè (ví dụ buổi cả ngày có nghỉ trưa). Việc thiếu giờ kết thúc được đánh dấu “chưa đủ giờ”.

## Thêm, sửa, xóa công việc (chế độ biên tập)
1. Bấm **BIÊN TẬP** → **Đăng nhập Google** bằng tài khoản quản trị duy nhất luuhuong.nnpl@gmail.com (dùng chung cho cả hệ sinh thái Phúc Nguyên). Máy sẽ nhớ đăng nhập.
2. Thêm việc bằng nút **+ Thêm công việc** hoặc nút **+** ở từng ô. Bấm vào một công việc để sửa, xóa hoặc nhân bản.
3. Lưu xong là trang công khai thấy ngay (không phải chờ GitHub cập nhật).
4. Nút **SAO LƯU** (chỉ hiện khi đăng nhập) tải toàn bộ lịch về máy dạng JSON.
5. Dùng máy chung thì bấm **THOÁT BIÊN TẬP** để đăng xuất.

## Cấu trúc
- `apps/web/index.html`, `app.js`, `styles.css`, `work.css` — giao diện, hiển thị, biên tập, thống kê.
- `apps/web/config.js` — cấu hình Firebase web (công khai), UID admin, quy đổi tiết (không chứa mật khẩu).
- `apps/web/data/events.json` — bản dữ liệu cũ (chuyển đổi/dự phòng).
- `.github/workflows/` — kiểm tra dữ liệu và phát hành Pages.

## Lưu trữ
Phiên bản trước khi thiết kế lại (có máy chủ Cloudflare, trang quản lý, planner) được giữ ở nhánh `backup/20261103-before-redesign`; các nhánh thử nghiệm cũ được lưu bằng tag `archive/<tên nhánh>`.

Bản ngay trước khi chuyển sang Firebase: nhánh `backup-truoc-firebase-20261104`.
