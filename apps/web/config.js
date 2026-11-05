// Cấu hình công khai (không chứa mật khẩu). Khóa Firebase web là định danh công khai;
// quyền đọc/ghi do Quy tắc bảo mật Firestore quyết định: ai cũng xem, chỉ admin được ghi.
window.PNW_CONFIG = Object.freeze({
  appName: "PHÚC NGUYÊN WORK",
  firebase: Object.freeze({
    apiKey: "AIzaSyCIYY-dzhJ4rUYsXvBQivIxcziUC3hR1-U",
    authDomain: "phuc-nguyen-library.firebaseapp.com",
    projectId: "phuc-nguyen-library",
    storageBucket: "phuc-nguyen-library.firebasestorage.app",
    messagingSenderId: "842652271567",
    appId: "1:842652271567:web:40dc5474465aca5f7988ba"
  }),
  // Vị trí dữ liệu trên Firestore: tài liệu pnw/meta (phân loại) + pnw/meta/events/{id} (công việc)
  store: Object.freeze({ metaPath: "pnw/meta", eventsPath: "pnw/meta/events" }),
  // Bản dữ liệu tĩnh cũ (GitHub) — dùng một lần để chuyển sang Firestore và làm dự phòng khi mất mạng tới Firestore
  legacyDataPath: "./data/events.json",
  // Tài khoản admin duy nhất được biên tập (luuhuong.nnpl@gmail.com)
  adminUid: "smoIpuX7qseqTeu9nToc9RYigku1",
  // Đăng nhập Google bằng các email này cũng là quản trị (dùng chung cho cả hệ sinh thái PN)
  adminEmails: ["luuhuong.nnpl@gmail.com", "luuhuong.dhnv@gmail.com"],
  // Quy đổi: khoảng 1 giờ = 1 tiết (làm tròn đến tiết gần nhất).
  minutesPerLesson: 60
});
