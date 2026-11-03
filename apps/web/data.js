/*
  DỮ LIỆU LỊCH — PHÚC NGUYÊN WORK
  ---------------------------------------------------------------
  Các phân hệ lịch công tác là danh sách TUẦN:
    from : ngày đầu tuần (Thứ Hai), dạng YYYY-MM-DD
    to   : ngày cuối tuần (Chủ nhật), dạng YYYY-MM-DD
    items: day = thứ trong tuần; row = ô thời gian
      1 = sáng; 2 = chiều; 3 = tối; 4 = mốc công việc theo ngày
      span = số hàng thời gian gộp (dùng cho lịch cả ngày)
      lines = các dòng chữ hiển thị trong ô
  Hàng 4 dành riêng cho công việc chốt theo ngày, không có giờ bắt đầu/kết thúc.
  Tuần mới nhất tự hiển thị trên cùng; dữ liệu cũ được giữ nguyên trừ nội dung
  được cập nhật rõ ràng theo yêu cầu.
*/
window.PNW_DATA = {
  teaching: [
    {
      from: "2026-11-02",
      to: "2026-11-08",
      items: [
        { day: 1, row: 3, lines: ["LUẬT DÂN SỰ", "2505LHOD", "20h00"] },
        { day: 4, row: 3, lines: ["LUẬT ĐẤT ĐAI", "2405LHOA", "20h00"] },
        { day: 5, row: 3, lines: ["LUẬT DÂN SỰ", "2505LHOA", "20h00"] }
      ]
    }
  ],
  meetings: [
    {
      from: "2026-11-02",
      to: "2026-11-08",
      items: [
        { day: 2, row: 1, lines: ["HỌP KHOA, HỌP ĐẢNG", "8h00"] },
        { day: 4, row: 1, lines: ["KỶ NIỆM 45 NĂM KHOA LUẬT", "8:00 - 12:00"] }
      ]
    }
  ],
  study: [
    {
      from: "2026-11-02",
      to: "2026-11-08",
      items: [
        { day: 1, row: 1, lines: ["KIỂM SOÁT QUYỀN LỰC NHÀ NƯỚC", "GS. Thái", "08h00 - 11h00"] },
        { day: 1, row: 2, lines: ["KIỂM SOÁT QUYỀN LỰC NHÀ NƯỚC", "GS. Thái", "14h00 - 17h00"] },
        { day: 2, row: 1, lines: ["KIỂM SOÁT QUYỀN LỰC NHÀ NƯỚC", "GS. Thái", "08h00 - 11h00"] },
        { day: 2, row: 2, lines: ["KIỂM SOÁT QUYỀN LỰC NHÀ NƯỚC", "GS. Thái", "14h00 - 17h00"] }
        { day: 3, row: 1, lines: ["TỔ CHỨC THỰC HIỆN QUYỀN HÀNH PHÁP", "TS. Lê Thị Hoa", "8h00 - 11h00"] },
        { day: 3, row: 2, lines: ["NÓI CHUYỆN CHUYÊN ĐỀ KHOA LUẬT", "Thầy Thái, Thầy Vinh", "14h00 - 17h00", "Phòng truyền thống"] },
        { day: 4, row: 2, lines: ["TỔ CHỨC THỰC HIỆN QUYỀN HÀNH PHÁP", "TS. Lê Thị Hoa", "14:00 - 17:00"] }
      ]
    }
  ],
  invigilation: [],
  grading: [
    {
      from: "2026-11-02",
      to: "2026-11-08",
      items: [
        { day: 2, row: 4, fixedDate: true, lines: ["RA ĐỀ KN TVPLDS"] }
      ]
    }
  ],
  research: [],
  other: [],
  rmia: []
};
