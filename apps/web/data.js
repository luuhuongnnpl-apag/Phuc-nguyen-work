/*
  DỮ LIỆU LỊCH — PHÚC NGUYÊN WORK
  ---------------------------------------------------------------
  Các phân hệ lịch công tác (teaching, meetings, ...) là danh sách TUẦN:
    from  : ngày đầu tuần (Thứ Hai), dạng "YYYY-MM-DD"
    to    : ngày cuối tuần (Chủ nhật), dạng "YYYY-MM-DD"
    items : các ô lịch trong tuần
      day   : 1 = Thứ Hai, 2 = Thứ 3, ... 6 = Thứ 7, 7 = Chủ nhật
      row   : buổi — 1 = SÁNG (hàng trên), 2 = CHIỀU (hàng giữa), 3 = TỐI (hàng cuối)
      lines : các dòng chữ hiển thị trong ô
  Tuần mới nhất tự hiển thị trên cùng; tuần ban hành trước tự xếp
  xuống dòng dưới. Thêm tuần mới: chép một khối { from, to, items }.

  Phân hệ rmia là THỜI KHÓA BIỂU cố định (xem cuối file).
*/
window.PNW_DATA = {
  teaching: [
    {
      from: "2026-11-02",
      to: "2026-11-08",
      items: [
        { day: 1, row: 3, lines: ["LUẬT DÂN SỰ", "2505LHOD", "20h00"] },
        { day: 2, row: 3, lines: ["LUẬT ĐẤT ĐAI", "2405LHOA", "20h00"] },
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
        { day: 1, row: 1, lines: ["KIỂM SOÁT QUYỀN LỰC NHÀ NƯỚC", "Thầy Thái", "8h30 - 11h00"] },
        { day: 1, row: 2, lines: ["KIỂM SOÁT QUYỀN LỰC NHÀ NƯỚC", "Thầy Thái", "14h00 - 17h00"] },
        { day: 2, row: 1, lines: ["KIỂM SOÁT QUYỀN LỰC NHÀ NƯỚC", "Thầy Thái", "8h30 - 11h00"] },
        { day: 2, row: 2, lines: ["KIỂM SOÁT QUYỀN LỰC NHÀ NƯỚC", "Thầy Thái", "14h00 - 17h00"] },
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
        { day: 1, row: 1, lines: ["RA ĐỀ THI", "KNTVPLDS K23"] }
      ]
    }
  ],
  research: [],
  other: [],
  rmia: []
};
