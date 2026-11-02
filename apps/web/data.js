/*
  DỮ LIỆU LỊCH — PHÚC NGUYÊN WORK
  ---------------------------------------------------------------
  Mỗi phân hệ (teaching, meetings, ...) là một danh sách các TUẦN.
  Mỗi tuần gồm:
    from  : ngày đầu tuần (Thứ Hai), dạng "YYYY-MM-DD"
    to    : ngày cuối tuần (Chủ nhật), dạng "YYYY-MM-DD"
    items : các ô lịch trong tuần
      day   : 1 = Thứ Hai, 2 = Thứ 3, ... 6 = Thứ 7, 7 = Chủ nhật
      row   : dòng trong bảng (1 = dòng trên cùng)
      lines : các dòng chữ hiển thị trong ô

  Tuần mới nhất tự động hiển thị trên cùng; các tuần đã ban hành
  trước đó tự động xếp xuống dòng dưới. Thêm tuần mới chỉ cần
  chép một khối { from, to, items } và sửa nội dung.
*/
window.PNW_DATA = {
  teaching: [
    {
      from: "2026-10-26",
      to: "2026-11-01",
      items: [
        { day: 1, row: 1, lines: ["LUẬT DÂN SỰ", "2505LHOA", "(T1-3)", "P604 371NHT"] },
        { day: 2, row: 1, lines: ["LUẬT DÂN SỰ", "2505LHOA", "(T1-3)", "P604 371NHT"] },
        { day: 1, row: 2, lines: ["LUẬT DÂN SỰ", "2505LHOD", "(T4-5)", "P604 371NHT"] },
        { day: 2, row: 2, lines: ["LUẬT DÂN SỰ", "2505LHOD", "(T4-5)", "P604 371NHT"] }
      ]
    },
    {
      from: "2026-10-19",
      to: "2026-10-25",
      items: []
    }
  ],
  meetings: [],
  study: [],
  invigilation: [],
  grading: [],
  research: [],
  other: []
};
