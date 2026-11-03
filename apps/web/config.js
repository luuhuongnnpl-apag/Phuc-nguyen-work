// Cấu hình công khai. Tuyệt đối không đặt mã truy cập (token) hay mật khẩu ở đây:
// mã truy cập GitHub chỉ được nhập trên trình duyệt của người biên tập và lưu tại máy đó.
window.PNW_CONFIG = Object.freeze({
  appName: "PHÚC NGUYÊN WORK",
  github: Object.freeze({
    owner: "luuhuongnnpl-apag",
    repo: "Phuc-nguyen-work",
    branch: "main",
    dataPath: "apps/web/data/events.json"
  }),
  // Quy đổi: khoảng 1 giờ = 1 tiết (làm tròn đến tiết gần nhất).
  minutesPerLesson: 60
});
