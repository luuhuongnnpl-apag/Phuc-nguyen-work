# Phúc Nguyên Work — Work Planner v1

## Trạng thái triển khai
- Đã tạo nhánh sao lưu trước thay đổi: `backup/20261103-before-planner`.
- Đã tạo nhánh phát triển: `feature/work-planner-v1`.
- Snapshot lịch tĩnh hiện có được lưu tại `docs/DEMO-SEED.json`.
- Chưa thay đổi hoặc xóa dữ liệu production.

## Phạm vi chức năng đã thống nhất
1. Lịch tuần kiểu thời khóa biểu, cột Thứ Hai–Chủ nhật.
2. Trục giờ quan sát từ 07:00 đến 20:00, mỗi hàng một giờ; không có vạch 15 phút.
3. Thời gian bắt đầu/kết thúc được nhập và lưu chính xác đến phút. Timeline chỉ là cách quan sát; thẻ công việc luôn ghi rõ ngày, giờ trong nội dung.
4. Công việc không có giờ cụ thể nhưng có hạn được hiển thị trong ô riêng ở cuối cột ngày: “Công việc cần hoàn thành”.
5. Mỗi công việc hỗ trợ mô tả, địa điểm, ưu tiên, trạng thái, deadline, nhiệm vụ cha/con và tài liệu minh chứng.
6. Cuối tuần tự động lưu trữ công việc đã hoàn thành; việc chưa xong được giữ và chuyển tiếp, việc quá hạn vẫn cảnh báo. Không xóa bản ghi.
7. Kho lưu trữ cho phép tìm kiếm, khôi phục, xem tài liệu và thống kê tuần/tháng/quý/năm; hỗ trợ xuất Excel.

## Quy tắc dữ liệu
- Không dùng GitHub repository hoặc tệp frontend công khai để lưu công việc cá nhân/tài liệu minh chứng.
- Dữ liệu nghiệp vụ lưu ở API + Cloudflare D1; tệp đính kèm cần object storage riêng (ví dụ R2) với quyền truy cập kiểm soát.
- Tách trạng thái hoàn thành khỏi trạng thái lưu trữ; lưu thời điểm hoàn thành, thời điểm lưu trữ, lịch sử chuyển tiếp và audit log.
- Tự động chốt tuần phải idempotent, có thể chạy lại an toàn và không nhân đôi bản ghi.
- Không triển khai migration phá hủy hoặc xóa database hiện có.

## Giới hạn môi trường hiện tại cần xử lý trước khi public bản hoạt động
- `apps/web/config.js` đang để `apiBaseUrl: ""`.
- `apps/api/wrangler.toml` còn `database_id = "REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID"`.
- OAuth Client ID/Secret và Worker URL phải được cấu hình trong Cloudflare; không đưa secret vào Git.
- Chưa có bằng chứng kết nối D1 production hoặc bản sao lưu D1; snapshot trong DEMO-SEED chỉ bao gồm lịch tĩnh công khai hiện có.
- Do đó chưa được tuyên bố CRUD, lưu trữ tự động, upload tài liệu hay đăng nhập đã hoạt động production.

## Tiêu chí nghiệm thu
- CI và GitHub Pages Actions đều thành công.
- Kiểm tra trên desktop và iPhone: tạo/sửa lịch giờ lẻ, hiển thị đúng giờ, công việc deadline-only ở ô cuối ngày.
- Kiểm tra upload/download tài liệu qua kho riêng tư; không lộ URL/tệp công khai.
- Kiểm thử tự động chốt tuần, chạy lặp không tạo bản sao; không xóa việc chưa hoàn thành.
- Kiểm thử thống kê, khôi phục, backup/restore và phân quyền.
