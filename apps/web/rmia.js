/*
  LỊCH R'MIA — THỜI KHÓA BIỂU CỐ ĐỊNH
  cells: mỗi ô theo thứ tự cột ngày.
    ""            : ô trống
    "Toán"        : ô thường
    { t, rs, tone }: t = chữ (dùng \n để xuống dòng), rs = số tiết gộp,
                    tone = "center" (trung tâm), "extra" (ngoại khóa, BDHSG), "mark" (đánh dấu)
    null          : ô đã được ô phía trên gộp xuống (bỏ qua)
*/
window.PNW_RMIA = [
  {
    id: "9t8",
    name: "LỚP 9T8",
    note: "Thực hiện từ 14/9/2026",
    days: ["THỨ 2", "THỨ 3", "THỨ 4", "THỨ 5", "THỨ 6", "THỨ 7"],
    sessions: [
      {
        name: "SÁNG",
        rows: [
          ["1", "7h30 - 8h15", ["TNHN1", "LS&ĐL (Địa)", "LS&ĐL (Địa)", "Nghệ thuật (MT)", "Anh", "Công nghệ"]],
          ["2", "8h20 - 9h05", ["Toán", "LS&ĐL (Sử)", "Tin", "Anh", "KHTN (VS)", "Toán"]],
          ["3", "9h20 - 10h05", ["Anh", "Nghệ thuật (AN)", "KHTN (VS)", "GDCD", "Văn", "Toán"]],
          ["4", "10h10 - 10h55", ["KHTN (Chất)", "GDTC", "KHTN (NL)", "LS&ĐL (Sử)", "GD ĐP", "GDTC"]],
          ["5", "11h00 - 11h45", ["Văn", "Văn", "Văn", "Toán", "TNHN2", "TNHN3"]]
        ]
      },
      {
        name: "CHIỀU",
        rows: [
          ["1", "13h45 - 14h30", ["DTHT_Văn", "", "DTHT_Toán",
            { t: "Trung tâm môn Văn\n(học từ 14h00 - 15h30)", rs: 2, tone: "center" },
            { t: "Trung tâm môn Anh\n(học từ 14h00 - 15h30)", rs: 2, tone: "center" },
            { t: "Trung tâm môn Toán\n(học từ 14h00 - 17h15)", rs: 4, tone: "center" }]],
          ["2", "14h35 - 15h20", ["DTHT_Văn", "", "DTHT_Toán", null, null, null]],
          ["3", "15h30 - 16h15", ["",
            { t: "Trung tâm môn Văn\n(học từ 16h00 - 17h30)", rs: 2, tone: "center" },
            "DTHT_Anh",
            { t: "Ươm mầm (BDHSG)", rs: 2, tone: "extra" },
            { t: "Trung tâm môn KHTN\n(học từ 15h45 - 17h15)", rs: 2, tone: "center" },
            null]],
          ["4", "16h20 - 17h05", ["", null, "", null, null, null]]
        ]
      }
    ],
    footer: [
      ["TRANG PHỤC", ["Áo trắng - Quần âu", "TDTT đỏ", "Áo trắng - Quần âu", "Áo polo kem - Quần TDTT", "Áo trắng - Quần âu", "TDTT đỏ"]]
    ],
    notes: ["Sáng 7h15 có mặt tại trường", "Chiều 13h30 có mặt tại trường"]
  },
  {
    id: "7t1",
    name: "LỚP 7T1",
    note: "Trường THCS Cầu Giấy B",
    days: ["THỨ 2", "THỨ 3", "THỨ 4", "THỨ 5", "THỨ 6", "THỨ 7"],
    sessions: [
      {
        name: "SÁNG",
        rows: [
          ["1", "7h30 - 8h15", ["TNHN1", "Sử", "Toán", "Toán", "Toán",
            { t: "Toán\n7h30 - 10h30", rs: 4, tone: "extra" }]],
          ["2", "8h20 - 9h05", ["KHTN", "Tin", "Văn", "KHTN", "Toán", null]],
          ["3", "9h20 - 10h05", ["Văn", "GD ĐP", { t: "Văn", tone: "mark" }, { t: "Sử", tone: "mark" }, "Văn", null]],
          ["4", "10h10 - 10h55", ["Âm nhạc", "GDTC", "Địa", "GDTC", "TNHN3", null]],
          ["5", "11h00 - 11h45", ["", "", "", "", "", ""]]
        ]
      },
      {
        name: "CHIỀU",
        rows: [
          ["1", "13h45 - 14h30", ["TNHN2", "Anh", "Anh", "Địa", "KHTN", ""]],
          ["2", "14h35 - 15h20", ["GDCD", "Công nghệ", "Anh", "Mĩ thuật", "KHTN", ""]],
          ["3", "15h30 - 16h15", [
            { t: "Văn\n15h45 - 17h15", rs: 2, tone: "extra" },
            { t: "KHTN\n15h45 - 17h15", rs: 2, tone: "extra" },
            { t: "", rs: 2 },
            { t: "Anh\n15h45 - 17h15", rs: 2, tone: "extra" },
            { t: "Văn\n15h45 - 17h15", rs: 2, tone: "extra" },
            ""]],
          ["4", "16h20 - 17h05", [null, null, null, null, null, ""]],
          ["5", "17h10 - 17h55", ["", "", "", "", "", ""]]
        ]
      }
    ],
    footer: [
      ["TRANG PHỤC", ["Quần âu - Áo sơ mi", "Bộ polo đỏ", "Bộ polo kem", "Bộ polo đỏ", "Quần âu - Áo sơ mi", ""]]
    ],
    notes: ["Ô màu cam: học ngoại khóa", "Địa điểm ngoại khóa: Phòng học số 8 - 55 Trương Công Giai"]
  }
];
