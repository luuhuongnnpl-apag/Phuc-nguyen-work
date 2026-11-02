const views = {
 dashboard:["Tổng quan","Tổng quan công việc","Theo dõi tiến độ và các nhiệm vụ cần triển khai.","Công việc gần đây"],
 tasks:["Công việc","Danh sách công việc","Quản lý nhiệm vụ, thời hạn, mức độ ưu tiên và người phụ trách.","Danh sách công việc"],
 projects:["Dự án & kế hoạch","Dự án và kế hoạch","Nhóm công việc theo mục tiêu và kết quả đầu ra.","Danh sách dự án"],
 calendar:["Lịch công việc","Lịch công việc","Theo dõi công việc theo tháng, tuần và ngày.","Lịch sắp tới"],
 kanban:["Bảng Kanban","Theo dõi tiến độ","Theo dõi trạng thái công việc theo từng giai đoạn.","Bảng tiến độ"],
 reports:["Báo cáo","Báo cáo và thống kê","Tổng hợp kết quả theo thời gian, nhóm nhiệm vụ và người phụ trách.","Báo cáo"]
};
const title=document.querySelector("#pageTitle"),desc=document.querySelector("#pageDescription"),crumb=document.querySelector("#crumb"),section=document.querySelector("#sectionTitle");
function activate(view){
 const data=views[view]||views.dashboard;
 document.querySelectorAll("[data-view]").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
 crumb.textContent=data[0];title.textContent=data[1];desc.textContent=data[2];section.textContent=data[3];
}
document.querySelector("#navigation").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b)activate(b.dataset.view)});
document.querySelectorAll(".text-button,.module-grid button").forEach(b=>b.addEventListener("click",()=>activate(b.dataset.view)));
document.querySelector("#today").textContent=new Intl.DateTimeFormat("vi-VN",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date());
document.querySelector("#newTask").addEventListener("click",()=>document.querySelector("#taskDialog").showModal());
const api=window.PNW_CONFIG?.apiBaseUrl;
if(api){
 fetch(api.replace(/\/$/,"")+"/api/health").then(r=>{if(!r.ok)throw Error("API error");return r.json()}).then(data=>{
  document.querySelector("#connectionText").textContent="API đã phản hồi";
  document.querySelector(".connection i").style.background="#64c69b";
 }).catch(()=>document.querySelector("#connectionText").textContent="Không thể kết nối API");
}
