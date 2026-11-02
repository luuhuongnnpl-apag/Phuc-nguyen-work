const views={
 teaching:{label:"Lịch giảng",title:"LỊCH GIẢNG",description:"Theo dõi lịch giảng dạy theo tuần.",list:"CÔNG VIỆC TRONG TUẦN",empty:"Chưa có lịch giảng được ghi nhận."},
 meetings:{label:"Lịch họp",title:"LỊCH HỌP",description:"Quản lý lịch họp chuyên môn, hội đồng và các cuộc họp công tác.",list:"CÁC CUỘC HỌP TRONG TUẦN",empty:"Chưa có lịch họp được ghi nhận."},
 study:{label:"Lịch học",title:"LỊCH HỌC",description:"Theo dõi lịch học tập, bồi dưỡng và các chương trình đào tạo.",list:"LỊCH HỌC TRONG TUẦN",empty:"Chưa có lịch học được ghi nhận."},
 invigilation:{label:"Coi thi",title:"LỊCH COI THI",description:"Theo dõi lịch coi thi, phòng thi và nhiệm vụ được phân công.",list:"CA COI THI TRONG TUẦN",empty:"Chưa có lịch coi thi được ghi nhận."},
 grading:{label:"Chấm thi",title:"LỊCH CHẤM THI",description:"Quản lý kế hoạch chấm thi, hạn hoàn thành và tiến độ.",list:"ĐẦU VIỆC CHẤM THI",empty:"Chưa có nhiệm vụ chấm thi được ghi nhận."},
 research:{label:"Nghiên cứu khoa học",title:"NGHIÊN CỨU KHOA HỌC",description:"Theo dõi đề tài, bài báo, hội thảo và các nhiệm vụ nghiên cứu.",list:"NHIỆM VỤ NGHIÊN CỨU TRONG TUẦN",empty:"Chưa có nhiệm vụ nghiên cứu được ghi nhận."},
 other:{label:"Công việc khác",title:"CÔNG VIỆC KHÁC",description:"Theo dõi các nhiệm vụ chuyên môn và công tác phát sinh.",list:"CÔNG VIỆC KHÁC TRONG TUẦN",empty:"Chưa có công việc nào được ghi nhận."}
};
const $=s=>document.querySelector(s);
function activate(key){
 const v=views[key]||views.teaching;
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===key));
 $("#crumb").textContent=v.label;$("#pageTitle").textContent=v.title;$("#pageDescription").textContent=v.description;
 $("#scheduleTitle").textContent=v.title;$("#listTitle").textContent=v.list;$("#emptyHint").textContent=v.empty;
 $("#dialogTitle").textContent="Thêm mục: "+v.label;
}
$("#navigation").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b)activate(b.dataset.view)});
document.querySelectorAll(".quick-links button").forEach(b=>b.addEventListener("click",()=>activate(b.dataset.view)));
$("#today").textContent=new Intl.DateTimeFormat("vi-VN",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date());
$("#newItem").addEventListener("click",()=>$("#itemDialog").showModal());
$("#todayButton").addEventListener("click",()=>{const now=new Date();$("#weekLabel").textContent="TUẦN HIỆN TẠI · "+new Intl.DateTimeFormat("vi-VN",{day:"2-digit",month:"2-digit"}).format(now)});
function shiftWeek(delta){const d=new Date();d.setDate(d.getDate()+delta*7);$("#weekLabel").textContent=new Intl.DateTimeFormat("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d)}
$("#prevWeek").addEventListener("click",()=>shiftWeek(-1));$("#nextWeek").addEventListener("click",()=>shiftWeek(1));
document.querySelectorAll(".view-switch button").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".view-switch button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")}));
const api=window.PNW_CONFIG?.apiBaseUrl;
if(api){fetch(api.replace(/\/$/,"")+"/api/health").then(r=>{if(!r.ok)throw Error("API error");return r.json()}).then(()=>{$("#connectionText").textContent="API đã phản hồi";$(".status-dot").style.background="#39a879"}).catch(()=>$("#connectionText").textContent="Không thể kết nối API")}
