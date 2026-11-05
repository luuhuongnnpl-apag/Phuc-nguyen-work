/*
  PHÚC NGUYÊN WORK — LỊCH CÔNG TÁC
  ---------------------------------------------------------------
  Nguồn dữ liệu: Firestore (bản cũ data/events.json chỉ để chuyển đổi/dự phòng).
  - Lịch tổng hiển thị mọi công việc; mỗi lịch con là bộ lọc theo phân loại.
  - Thống kê đọc cùng nguồn đó, quy đổi số tiết theo thời lượng.
  - Chế độ biên tập: lưu trực tiếp vào kho GitHub qua Contents API bằng
    mã truy cập của người biên tập (lưu trong trình duyệt của máy đó).
  Mỗi công việc (event):
    id, title, category, date (YYYY-MM-DD),
    mode: "time" (start, end) | "session" (session 1 sáng, 2 chiều, 3 tối)
          | "allday" (sáng + chiều) | "deadline" (hàng chốt hạn),
    location, info (nhiều dòng), lessons (tùy chọn, ghi đè số tiết tự tính).
*/
(function () {
  "use strict";

  var CFG = window.PNW_CONFIG || {};
  var GH = CFG.github || {};
  var MIN_PER_LESSON = Number(CFG.minutesPerLesson) || 60;
  var RMIA = window.PNW_RMIA || [];
  var DAY_NAMES = ["THỨ HAI", "THỨ 3", "THỨ 4", "THỨ 5", "THỨ 6", "THỨ 7", "CHỦ NHẬT"];
  var DAY_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  var SESSION_NAMES = { 1: "Sáng", 2: "Chiều", 3: "Tối" };
  var SESSION_START = { 1: "08:00", 2: "14:00", 3: "18:00" };

  var store = { version: 1, categories: [], events: [] };
  var token = null;
  var state = { view: "overview", weekFrom: null, classIndex: 0 };
  var editingId = null;

  var $ = function (s) { return document.querySelector(s); };

  /* ---------- Tiện ích ngày giờ ---------- */
  function pad(n) { return String(n).padStart(2, "0"); }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function mondayOf(s) { var d = parse(s); var wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return iso(d); }
  function todayISO() { return iso(new Date()); }
  function fmt(s) { var d = parse(s); return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear(); }
  function weekdayIndex(s) { return (parse(s).getDay() + 6) % 7; }
  function minutes(t) { if (!t) return null; var p = t.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function hText(t) { if (!t) return ""; var p = t.split(":"); return pad(+p[0]) + "h" + p[1]; }
  function rowOf(m) { return m < 720 ? 1 : (m < 1080 ? 2 : 3); }
  function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || ""); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- Phân loại ---------- */
  function categories() { return store.categories || []; }
  function catById(id) { return categories().filter(function (c) { return c.id === id; })[0]; }
  function catName(id) { var c = catById(id); return c ? c.name : "Khác"; }
  function catColor(id) { var c = catById(id); return c && /^#[0-9a-fA-F]{3,8}$/.test(c.color || "") ? c.color : ""; }
  function catTab(id) { var c = catById(id); return c ? (c.tab || c.name.toUpperCase()) : "KHÁC"; }
  function slug(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "loai";
  }

  /* ---------- Suy ra vị trí, nội dung, số tiết của một công việc ---------- */
  function rowsOf(ev) {
    if (ev.mode === "deadline") return [4, 4];
    if (ev.mode === "allday") return [1, 2];
    if (ev.mode === "session") { var s = Number(ev.session) || 1; return [s, s]; }
    var a = rowOf(minutes(ev.start) || 0);
    var b = ev.end ? rowOf(Math.max(minutes(ev.end) - 1, 0)) : a;
    return [a, Math.max(a, b)];
  }

  function timeText(ev) {
    if (ev.mode === "deadline") return "Hạn trong ngày";
    if (ev.mode === "allday") return "Cả ngày";
    if (ev.mode === "session") return "";
    return hText(ev.start) + (ev.end ? " – " + hText(ev.end) : "");
  }

  function linesOf(ev) {
    var out = [ev.title];
    String(ev.info || "").split("\n").forEach(function (l) { if (l.trim()) out.push(l.trim()); });
    var t = timeText(ev); if (t) out.push(t);
    if (ev.location) out.push(ev.location);
    return out;
  }

  function hasLessonOverride(ev) {
    return ev.lessons !== undefined && ev.lessons !== null && ev.lessons !== "" && !isNaN(Number(ev.lessons));
  }
  function durationMin(ev) {
    if (ev.mode !== "time" || !ev.start || !ev.end) return null;
    var d = minutes(ev.end) - minutes(ev.start);
    return d > 0 ? d : null;
  }
  function autoLessons(ev) {
    var d = durationMin(ev);
    return d == null ? null : Math.max(1, Math.round(d / MIN_PER_LESSON));
  }
  // Trả về { value, missing }: missing = cần bổ sung giờ để tính tiết
  function lessonsOf(ev) {
    if (hasLessonOverride(ev)) return { value: Number(ev.lessons), missing: false };
    if (ev.mode === "deadline") return { value: 0, missing: false };
    var a = autoLessons(ev);
    return a == null ? { value: 0, missing: true } : { value: a, missing: false };
  }

  function sortEvents(list) {
    return list.slice().sort(function (x, y) {
      if (x.date !== y.date) return x.date < y.date ? -1 : 1;
      var rx = rowsOf(x)[0], ry = rowsOf(y)[0];
      if (rx !== ry) return rx - ry;
      return (x.start || SESSION_START[x.session] || "99").localeCompare(y.start || SESSION_START[y.session] || "99");
    });
  }

  function eventsOfView(view) {
    var list = store.events || [];
    if (view !== "overview") list = list.filter(function (e) { return e.category === view; });
    return list.filter(function (e) { return validDate(e.date); });
  }

  /* ---------- Điều hướng phân hệ ---------- */
  function views() {
    var v = [{ id: "overview", tab: "LỊCH TỔNG" }];
    categories().forEach(function (c) { v.push({ id: c.id, tab: c.tab || c.name.toUpperCase() }); });
    v.push({ id: "rmia", tab: "LỊCH R'MIA" });
    v.push({ id: "stats", tab: "THỐNG KÊ" });
    return v;
  }
  function viewTitle(id) {
    var f = views().filter(function (v) { return v.id === id; })[0];
    return f ? f.tab : "LỊCH TỔNG";
  }
  function viewExists(id) { return views().some(function (v) { return v.id === id; }); }

  function renderNav() {
    var nav = $("#navigation");
    nav.innerHTML = "";
    views().forEach(function (v) {
      var b = el("button", "nav-item" + (v.id === state.view ? " active" : ""), v.tab);
      b.type = "button";
      b.dataset.view = v.id;
      b.setAttribute("aria-current", v.id === state.view ? "page" : "false");
      nav.appendChild(b);
    });
  }

  /* ---------- Lịch tuần ---------- */
  function weeksOf(view) {
    var map = {};
    eventsOfView(view).forEach(function (e) { map[mondayOf(e.date)] = true; });
    map[mondayOf(todayISO())] = true;
    if (state.weekFrom) map[state.weekFrom] = true;
    return Object.keys(map).sort().reverse();
  }

  function renderHeads(from) {
    var today = todayISO();
    document.querySelectorAll(".week-table th.dh").forEach(function (th, i) {
      th.innerHTML = "";
      th.classList.remove("past-date-head", "today-head");
      th.appendChild(el("div", "dname", DAY_NAMES[i]));
      var day = addDays(from, i);
      th.appendChild(el("div", "ddate", "(" + fmt(day) + ")"));
      if (day < today) th.classList.add("past-date-head");
      if (day === today) th.classList.add("today-head");
    });
  }

  // Sắp xếp công việc của một ngày vào các ô; chỉ gộp hàng khi không chồng lấn
  function layoutDay(dayEvents) {
    var cells = { 1: [], 2: [], 3: [], 4: [] };
    dayEvents.forEach(function (ev) { var r = rowsOf(ev); cells[r[0]].push({ ev: ev, end: r[1] }); });
    var spans = { 1: 1, 2: 1, 3: 1, 4: 1 };
    for (var r = 1; r <= 3; r++) {
      if (!cells[r].length) continue;
      var maxEnd = Math.max.apply(null, cells[r].map(function (c) { return c.end; }));
      var free = true;
      for (var k = r + 1; k <= maxEnd; k++) if (cells[k].length) free = false;
      if (free && maxEnd > r) { spans[r] = maxEnd - r + 1; r = maxEnd; }
    }
    return { cells: cells, spans: spans };
  }

  function renderWeek() {
    var overview = state.view === "overview";
    var from = state.weekFrom;
    renderHeads(from);
    var body = $("#weekBody");
    body.innerHTML = "";
    var list = eventsOfView(state.view);
    var today = todayISO();
    var layouts = [];
    for (var i = 0; i < 7; i++) {
      var day = addDays(from, i);
      layouts.push(layoutDay(sortEvents(list.filter(function (e) { return e.date === day; }))));
    }
    var covered = {};
    for (var r = 1; r <= 4; r++) {
      var tr = el("tr", (overview ? "overview-row " : "") + "time-slot-row time-slot-row-" + r + (r === 4 ? " deadline-row" : ""));
      for (var d = 0; d < 7; d++) {
        if (covered[d + "-" + r]) continue;
        var dayISO = addDays(from, d);
        var lay = layouts[d];
        var items = lay.cells[r];
        var td = el("td", overview ? "overview-day" : "");
        td.dataset.label = DAY_SHORT[d] + " · " + (r === 4 ? "Hạn" : SESSION_NAMES[r]);
        if (dayISO === today) td.classList.add("today-col");
        if (dayISO < today) td.classList.add("past-date-cell");
        if (lay.spans[r] > 1) {
          td.rowSpan = lay.spans[r];
          for (var k = r + 1; k < r + lay.spans[r]; k++) covered[d + "-" + k] = true;
        }
        if (items.length) td.classList.add("filled");
        if (r === 4 && items.length) {
          td.classList.add("fixed-date-cell");
          // Ô hạn chót chỉ gồm việc thuộc một phân loại có màu riêng thì tô theo màu đó
          var cols = items.map(function (it) { return catColor(it.ev.category); });
          if (cols[0] && cols.every(function (c) { return c === cols[0]; })) { td.classList.add("cat-colored"); td.style.setProperty("--cat", cols[0]); }
        }
        items.forEach(function (it) { td.appendChild(cardOf(it.ev, overview, r === 4)); });
        if (!items.length && overview) td.appendChild(el("div", "overview-empty", "—"));
        if (token) td.appendChild(addSlotButton(dayISO, r));
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }
    renderWeekList();
  }

  function cardOf(ev, overview, deadline) {
    var card;
    if (overview) {
      card = el("div", "overview-event" + (deadline ? " fixed-date-event" : ""));
      card.appendChild(el("div", "overview-category", catName(ev.category)));
      linesOf(ev).forEach(function (l, i) { card.appendChild(el("div", i === 0 ? "first" : "overview-detail", l)); });
    } else {
      card = el("div", "schedule-entry" + (deadline ? " fixed-date-entry" : ""));
      linesOf(ev).forEach(function (l, i) { card.appendChild(el("div", i === 0 ? "first" : "", l)); });
    }
    var color = catColor(ev.category);
    if (color) { card.classList.add("cat-colored"); card.style.setProperty("--cat", color); }
    if (token) {
      card.classList.add("editable");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Sửa: " + ev.title);
      card.addEventListener("click", function () { openForm(ev); });
      card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openForm(ev); } });
    }
    return card;
  }

  function addSlotButton(dayISO, row) {
    var b = el("button", "add-slot", "+");
    b.type = "button";
    b.title = "Thêm công việc " + (row === 4 ? "chốt hạn" : "buổi " + SESSION_NAMES[row].toLowerCase()) + " ngày " + fmt(dayISO);
    b.setAttribute("aria-label", b.title);
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var preset = { date: dayISO, category: state.view !== "overview" ? state.view : "" };
      if (row === 4) preset.mode = "deadline";
      else { preset.mode = "time"; preset.start = SESSION_START[row]; preset.session = row; }
      openForm(null, preset);
    });
    return b;
  }

  function renderWeekList() {
    var list = $("#weekList");
    list.innerHTML = "";
    weeksOf(state.view).forEach(function (w) {
      var li = el("li");
      var on = w === state.weekFrom;
      var b = el("button", "week-btn" + (on ? " active" : ""));
      b.type = "button";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      var label = el("span", "label");
      label.appendChild(document.createTextNode("- Tuần từ " + fmt(w) + " - "));
      label.appendChild(el("span", "to", fmt(addDays(w, 6))));
      b.appendChild(label);
      b.addEventListener("click", function () { if (on) return; goWeek(w); });
      li.appendChild(b);
      list.appendChild(li);
    });
  }

  function goWeek(from) {
    state.weekFrom = from;
    pushHistory();
    render();
  }

  /* ---------- Lịch R'Mia (thời khóa biểu cố định) ---------- */
  function cellNode(tag, c) {
    var n = el(tag);
    if (c && typeof c === "object") {
      if (c.rs > 1) n.rowSpan = c.rs;
      if (c.tone) n.className = "tone-" + c.tone;
      String(c.t || "").split("\n").forEach(function (line, i) { n.appendChild(el("div", i === 0 ? "first" : "sub", line)); });
    } else {
      n.textContent = c || "";
    }
    return n;
  }

  function renderTimetable() {
    var sw = $("#classSwitch"), table = $("#ttTable"), notes = $("#ttNotes");
    sw.innerHTML = ""; table.innerHTML = ""; notes.innerHTML = "";
    if (!RMIA.length) { $("#ttNote").textContent = "Chưa có thời khóa biểu."; return; }
    if (state.classIndex >= RMIA.length) state.classIndex = 0;
    RMIA.forEach(function (k, i) {
      var b = el("button", "class-btn" + (i === state.classIndex ? " active" : ""), k.name);
      b.type = "button"; b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === state.classIndex ? "true" : "false");
      b.addEventListener("click", function () { if (state.classIndex === i) return; state.classIndex = i; pushHistory(); renderTimetable(); });
      sw.appendChild(b);
    });
    var k = RMIA[state.classIndex];
    $("#ttNote").textContent = k.note || "";
    var thead = el("thead"), hr = el("tr");
    ["BUỔI", "TIẾT", "THỜI GIAN"].concat(k.days).forEach(function (h, i) { hr.appendChild(el("th", i < 3 ? "meta" : "", h)); });
    thead.appendChild(hr); table.appendChild(thead);
    var tbody = el("tbody");
    k.sessions.forEach(function (s, si) {
      s.rows.forEach(function (r, ri) {
        var tr = el("tr", ri === 0 && si > 0 ? "session-start" : "");
        if (ri === 0) {
          var sc = el("th", "session session-" + si, s.name);
          sc.rowSpan = s.rows.length; sc.scope = "rowgroup";
          tr.appendChild(sc);
        }
        tr.appendChild(el("td", "period", r[0]));
        tr.appendChild(el("td", "time", r[1]));
        r[2].forEach(function (c) { if (c !== null) tr.appendChild(cellNode("td", c)); });
        tbody.appendChild(tr);
      });
    });
    (k.footer || []).forEach(function (f) {
      var tr = el("tr", "footer-row");
      var lab = el("th", "footer-label", f[0]); lab.colSpan = 3; lab.scope = "row";
      tr.appendChild(lab);
      f[1].forEach(function (c) { tr.appendChild(cellNode("td", c)); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    (k.notes || []).forEach(function (t) { notes.appendChild(el("li", "", t)); });
  }

  /* ---------- Thống kê ---------- */
  var QUARTER_NAMES = { 1: "I", 2: "II", 3: "III", 4: "IV" };

  function statsRange() {
    var mode = $("#statsMode").value;
    var y = Number($("#statsYear").value) || new Date().getFullYear();
    if (mode === "month") {
      var m = $("#statsMonth").value || todayISO().slice(0, 7);
      var p = m.split("-");
      var last = new Date(+p[0], +p[1], 0).getDate();
      return { from: m + "-01", to: m + "-" + pad(last), label: "Tháng " + (+p[1]) + "/" + p[0], file: "thang-" + p[1] + "-" + p[0] };
    }
    if (mode === "quarter") {
      var q = Number($("#statsQuarter").value) || 1;
      var sm = (q - 1) * 3 + 1, em = sm + 2;
      return { from: y + "-" + pad(sm) + "-01", to: y + "-" + pad(em) + "-" + pad(new Date(y, em, 0).getDate()), label: "Quý " + QUARTER_NAMES[q] + "/" + y, file: "quy-" + q + "-" + y };
    }
    return { from: y + "-01-01", to: y + "-12-31", label: "Năm " + y, file: "nam-" + y };
  }

  function computeStats() {
    var range = statsRange();
    var inRange = sortEvents((store.events || []).filter(function (e) { return validDate(e.date) && e.date >= range.from && e.date <= range.to; }));
    var groups = categories().map(function (c) { return { cat: c, items: [], lessons: 0, missing: 0 }; });
    var other = { cat: { id: "_", name: "Chưa phân loại" }, items: [], lessons: 0, missing: 0 };
    inRange.forEach(function (e) {
      var g = groups.filter(function (x) { return x.cat.id === e.category; })[0] || other;
      var l = lessonsOf(e);
      g.items.push({ ev: e, lessons: l });
      g.lessons += l.value;
      if (l.missing) g.missing++;
    });
    if (other.items.length) groups.push(other);
    return { range: range, groups: groups, total: inRange.length };
  }

  function numText(n) { return (Math.round(n * 10) / 10).toLocaleString("vi-VN"); }

  function renderStats() {
    var s = computeStats();
    $("#statsRange").textContent = s.range.label + " (" + fmt(s.range.from) + " – " + fmt(s.range.to) + ") · " + s.total + " công việc";
    var t = $("#statsSummary");
    t.innerHTML = "";
    var thead = el("thead"), hr = el("tr");
    ["Hạng mục", "Số buổi / việc", "Số tiết", "Chưa đủ giờ"].forEach(function (h) { hr.appendChild(el("th", "", h)); });
    thead.appendChild(hr); t.appendChild(thead);
    var tb = el("tbody"), sumN = 0, sumL = 0, sumM = 0;
    s.groups.forEach(function (g) {
      var tr = el("tr", g.items.length ? "" : "zero");
      tr.appendChild(el("th", "", g.cat.name));
      tr.appendChild(el("td", "num", String(g.items.length)));
      tr.appendChild(el("td", "num", numText(g.lessons)));
      tr.appendChild(el("td", "num" + (g.missing ? " warn" : ""), g.missing ? String(g.missing) : "—"));
      tb.appendChild(tr);
      sumN += g.items.length; sumL += g.lessons; sumM += g.missing;
    });
    var ft = el("tr", "total");
    ft.appendChild(el("th", "", "TỔNG CỘNG"));
    ft.appendChild(el("td", "num", String(sumN)));
    ft.appendChild(el("td", "num", numText(sumL)));
    ft.appendChild(el("td", "num" + (sumM ? " warn" : ""), sumM ? String(sumM) : "—"));
    tb.appendChild(ft);
    t.appendChild(tb);

    var box = $("#statsDetail");
    box.innerHTML = "";
    s.groups.forEach(function (g) {
      if (!g.items.length) return;
      var sec = el("section", "stats-group");
      sec.appendChild(el("h3", "stats-group-title", g.cat.name.toUpperCase() + " · " + g.items.length + " việc · " + numText(g.lessons) + " tiết"));
      var wrap = el("div", "table-wrap");
      var tbl = el("table", "stats-table detail");
      var th = el("thead"), r0 = el("tr");
      ["Ngày", "Thời gian", "Công việc", "Thông tin khác", "Địa điểm", "Số tiết"].forEach(function (h) { r0.appendChild(el("th", "", h)); });
      th.appendChild(r0); tbl.appendChild(th);
      var b = el("tbody");
      g.items.forEach(function (it) {
        var e = it.ev, tr = el("tr");
        tr.appendChild(el("td", "nowrap", DAY_SHORT[weekdayIndex(e.date)] + ", " + fmt(e.date)));
        tr.appendChild(el("td", "nowrap", timeText(e) || (e.mode === "session" ? SESSION_NAMES[e.session] : "")));
        tr.appendChild(el("td", "strong", e.title));
        tr.appendChild(el("td", "", String(e.info || "").split("\n").filter(Boolean).join("; ")));
        tr.appendChild(el("td", "", e.location || ""));
        var lc = el("td", "num" + (it.lessons.missing ? " warn" : ""), it.lessons.missing ? "chưa đủ giờ" : numText(it.lessons.value));
        tr.appendChild(lc);
        if (token) {
          tr.classList.add("editable");
          tr.title = "Bấm để sửa";
          tr.addEventListener("click", function () { openForm(e); });
        }
        b.appendChild(tr);
      });
      tbl.appendChild(b);
      wrap.appendChild(tbl);
      sec.appendChild(wrap);
      box.appendChild(sec);
    });
    if (!s.total) box.appendChild(el("p", "empty-note", "Không có công việc nào trong kỳ này."));
  }

  function exportRows() {
    var s = computeStats();
    var summary = [["THỐNG KÊ CÔNG VIỆC — " + s.range.label.toUpperCase()], ["Từ " + fmt(s.range.from) + " đến " + fmt(s.range.to)], [],
      ["Hạng mục", "Số buổi / việc", "Số tiết", "Chưa đủ giờ"]];
    var sumN = 0, sumL = 0, sumM = 0;
    s.groups.forEach(function (g) {
      summary.push([g.cat.name, g.items.length, Math.round(g.lessons * 10) / 10, g.missing]);
      sumN += g.items.length; sumL += g.lessons; sumM += g.missing;
    });
    summary.push(["TỔNG CỘNG", sumN, Math.round(sumL * 10) / 10, sumM]);
    var detail = [["Hạng mục", "Ngày", "Thứ", "Thời gian", "Công việc", "Thông tin khác", "Địa điểm", "Số tiết", "Ghi chú"]];
    s.groups.forEach(function (g) {
      g.items.forEach(function (it) {
        var e = it.ev;
        detail.push([g.cat.name, fmt(e.date), DAY_NAMES[weekdayIndex(e.date)], timeText(e) || (e.mode === "session" ? SESSION_NAMES[e.session] : ""),
          e.title, String(e.info || "").split("\n").filter(Boolean).join("; "), e.location || "",
          it.lessons.missing ? "" : it.lessons.value, it.lessons.missing ? "Chưa đủ giờ để tính tiết" : ""]);
      });
    });
    return { s: s, summary: summary, detail: detail };
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var sc = document.createElement("script");
      sc.src = src; sc.onload = resolve; sc.onerror = reject;
      document.head.appendChild(sc);
    });
  }

  function exportExcel() {
    var data = exportRows();
    var name = "thong-ke-cong-viec-" + data.s.range.file;
    var go = function () {
      var wb = XLSX.utils.book_new();
      var ws1 = XLSX.utils.aoa_to_sheet(data.summary);
      ws1["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 14 }];
      var ws2 = XLSX.utils.aoa_to_sheet(data.detail);
      ws2["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 36 }, { wch: 28 }, { wch: 22 }, { wch: 8 }, { wch: 24 }];
      XLSX.utils.book_append_sheet(wb, ws1, "Tổng hợp");
      XLSX.utils.book_append_sheet(wb, ws2, "Chi tiết");
      XLSX.writeFile(wb, name + ".xlsx");
    };
    if (window.XLSX) { go(); return; }
    toast("Đang chuẩn bị tệp Excel…");
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js").then(go).catch(function () {
      // Dự phòng: xuất CSV (Excel mở được) khi không tải được thư viện
      var rows = data.summary.concat([[]], data.detail);
      var csv = "﻿" + rows.map(function (r) {
        return r.map(function (c) { var v = String(c == null ? "" : c); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(",");
      }).join("\r\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      a.download = name + ".csv";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });
  }

  function initStatsControls() {
    var now = new Date();
    $("#statsMonth").value = now.getFullYear() + "-" + pad(now.getMonth() + 1);
    $("#statsYear").value = now.getFullYear();
    $("#statsQuarter").value = String(Math.floor(now.getMonth() / 3) + 1);
    var sync = function () {
      var mode = $("#statsMode").value;
      $("#statsMonthWrap").hidden = mode !== "month";
      $("#statsQuarterWrap").hidden = mode !== "quarter";
      $("#statsYearWrap").hidden = mode === "month";
      renderStats();
    };
    $("#statsMode").addEventListener("change", sync);
    ["statsMonth", "statsQuarter", "statsYear"].forEach(function (id) {
      $("#" + id).addEventListener("change", renderStats);
      $("#" + id).addEventListener("input", renderStats);
    });
    $("#exportExcel").addEventListener("click", exportExcel);
  }

  /* ---------- Hiển thị chung ---------- */
  function render() {
    renderNav();
    var v = state.view;
    $("#weekPanel").hidden = v === "rmia" || v === "stats";
    $("#ttPanel").hidden = v !== "rmia";
    $("#statsPanel").hidden = v !== "stats";
    $("#sectionTitle").textContent = viewTitle(v);
    document.body.classList.toggle("is-editor", !!token);
    if (v === "rmia") { renderTimetable(); return; }
    if (v === "stats") { renderStats(); return; }
    if (!state.weekFrom) state.weekFrom = mondayOf(todayISO());
    $("#weekCaption").textContent = viewTitle(v) + " — tuần " + fmt(state.weekFrom) + " đến " + fmt(addDays(state.weekFrom, 6));
    renderWeek();
  }

  function historyState() { return { pnWorkState: { view: state.view, weekFrom: state.weekFrom, classIndex: state.classIndex } }; }
  function pushHistory() { history.pushState(historyState(), "", "#" + state.view); }

  function activate(view, mode) {
    if (!viewExists(view)) view = "overview";
    var changed = view !== state.view;
    state.view = view;
    if (changed || !state.weekFrom) state.weekFrom = mondayOf(todayISO());
    if (mode === "replace") history.replaceState(historyState(), "", "#" + view);
    else if (mode !== "none") pushHistory();
    render();
  }

  $("#navigation").addEventListener("click", function (e) {
    var b = e.target.closest("[data-view]");
    if (b && b.dataset.view !== state.view) activate(b.dataset.view);
  });
  $("#prevWeek").addEventListener("click", function () { goWeek(addDays(state.weekFrom, -7)); });
  $("#nextWeek").addEventListener("click", function () { goWeek(addDays(state.weekFrom, 7)); });
  $("#thisWeek").addEventListener("click", function () { var m = mondayOf(todayISO()); if (m !== state.weekFrom) goWeek(m); });
  $("#addEvent").addEventListener("click", function () {
    var today = todayISO();
    var d = (today >= state.weekFrom && today <= addDays(state.weekFrom, 6)) ? today : state.weekFrom;
    openForm(null, { date: d, category: state.view !== "overview" ? state.view : "", mode: "time" });
  });

  window.addEventListener("popstate", function (event) {
    var saved = event.state && event.state.pnWorkState;
    if (saved && viewExists(saved.view)) {
      state.view = saved.view;
      state.weekFrom = validDate(saved.weekFrom) ? saved.weekFrom : mondayOf(todayISO());
      state.classIndex = Number.isInteger(saved.classIndex) ? saved.classIndex : 0;
      render();
      return;
    }
    activate(location.hash.slice(1) || "overview", "none");
  });

  // Cập nhật làm mờ ngày đã qua theo đồng hồ thiết bị
  window.setInterval(function () {
    if (document.hidden || anyDialogOpen()) return;
    if (state.view !== "rmia" && state.view !== "stats") render();
  }, 60000);

  /* ---------- Thông báo ---------- */
  var toastTimer = null;
  function toast(msg, kind) {
    var t = $("#toast");
    t.textContent = msg;
    t.className = "toast" + (kind ? " " + kind : "");
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, kind === "error" ? 8000 : 4500);
  }
  function setSyncNote() {
    var n = $("#syncNote");
    n.textContent = token ? "Đang ở chế độ biên tập · bấm vào công việc để sửa, bấm “+” ở ô để thêm" : "";
  }

  /* ---------- Firebase (Firestore + Auth) ---------- */
  var FB = CFG.firebase || {};
  var ST = CFG.store || { metaPath: "pnw/meta", eventsPath: "pnw/meta/events" };
  var db = null, auth = null;
  try {
    firebase.initializeApp(FB);
    db = firebase.firestore();
    auth = firebase.auth();
  } catch (e) { console.error("Firebase init", e); }

  function fbError(x, fallback) {
    var c = (x && x.code) || "";
    if (c === "permission-denied") return "Tài khoản này không có quyền ghi. Hãy đăng nhập bằng tài khoản admin.";
    if (c === "unavailable") return "Mất kết nối tới máy chủ dữ liệu. Kiểm tra mạng rồi thử lại.";
    if (/auth\/(invalid-credential|wrong-password|user-not-found|invalid-email)/.test(c)) return "Email hoặc mật khẩu chưa đúng.";
    if (c === "auth/too-many-requests") return "Đăng nhập sai quá nhiều lần. Hãy chờ ít phút rồi thử lại.";
    return fallback + (c ? " (" + c + ")" : "");
  }

  function clean(o) { var r = {}; Object.keys(o).forEach(function (k) { if (o[k] !== undefined) r[k] = o[k]; }); return r; }

  // Đọc toàn bộ dữ liệu từ Firestore: null nếu chưa có dữ liệu (chưa chuyển)
  function readRemote() {
    if (!db) return Promise.reject(new Error("Chưa tải được thư viện Firebase"));
    return Promise.all([db.doc(ST.metaPath).get(), db.collection(ST.eventsPath).get()]).then(function (r) {
      if (!r[0].exists) return null;
      var meta = r[0].data();
      var events = r[1].docs.map(function (d) { return d.data(); });
      return normalize({ version: meta.version || 1, updated: meta.updated || "", categories: meta.categories || [], events: events });
    });
  }

  // Ghi một thay đổi: áp dụng lên bản sao, so sánh với dữ liệu hiện tại và chỉ ghi phần thay đổi
  function commit(mutate) {
    if (!db) return Promise.reject(new Error("Chưa kết nối được máy chủ dữ liệu. Tải lại trang rồi thử lại."));
    var before = JSON.parse(JSON.stringify(store));
    var data = JSON.parse(JSON.stringify(store));
    mutate(data);
    data.updated = new Date().toISOString();
    var batch = db.batch();
    var oldMap = {};
    before.events.forEach(function (e) { oldMap[e.id] = JSON.stringify(e); });
    var newIds = {};
    data.events.forEach(function (e) {
      newIds[e.id] = true;
      if (oldMap[e.id] !== JSON.stringify(e)) batch.set(db.collection(ST.eventsPath).doc(e.id), clean(e));
    });
    before.events.forEach(function (e) { if (!newIds[e.id]) batch.delete(db.collection(ST.eventsPath).doc(e.id)); });
    batch.set(db.doc(ST.metaPath), { version: data.version || 1, updated: data.updated, categories: data.categories });
    return batch.commit().then(function () { store = data; return data; })
      .catch(function (x) { throw new Error(fbError(x, "Không lưu được dữ liệu")); });
  }

  // Chuyển dữ liệu cũ (events.json trên GitHub) lên Firestore — chạy một lần khi admin đăng nhập lần đầu
  function migrateFrom(legacy) {
    var batch = db.batch();
    legacy.events.forEach(function (e) { batch.set(db.collection(ST.eventsPath).doc(e.id), clean(e)); });
    batch.set(db.doc(ST.metaPath), { version: legacy.version || 1, updated: new Date().toISOString(), categories: legacy.categories, migratedFrom: "github events.json" });
    return batch.commit();
  }

  function normalize(d) {
    d = d && typeof d === "object" ? d : {};
    if (!Array.isArray(d.categories)) d.categories = [];
    if (!Array.isArray(d.events)) d.events = [];
    return d;
  }

  /* ---------- Biểu mẫu công việc ---------- */
  var form = $("#eventForm");
  var dlg = $("#eventDialog");

  function anyDialogOpen() { return $("#eventDialog").open || $("#tokenDialog").open; }

  function fillCategorySelect(selected) {
    var sel = $("#categorySelect");
    sel.innerHTML = "";
    var ph = el("option", "", "— Chọn phân loại —"); ph.value = ""; sel.appendChild(ph);
    categories().forEach(function (c) { var o = el("option", "", c.name); o.value = c.id; sel.appendChild(o); });
    var add = el("option", "", "+ Thêm loại mới…"); add.value = "__new"; sel.appendChild(add);
    sel.value = selected && catById(selected) ? selected : "";
    $("#newCategoryWrap").hidden = true;
  }

  function syncMode() {
    var mode = form.elements.mode.value;
    $("#timeWrap").hidden = mode !== "time";
    $("#sessionWrap").hidden = mode !== "session";
    updateLessonHint();
  }

  function updateLessonHint() {
    var ev = { mode: form.elements.mode.value, start: form.elements.start.value, end: form.elements.end.value };
    var a = autoLessons(ev);
    var h = $("#lessonHint");
    if (ev.mode === "deadline") h.textContent = "(việc chốt hạn: mặc định 0 tiết)";
    else if (a != null) h.textContent = "(để trống: tự tính " + a + " tiết)";
    else h.textContent = "(để trống: tự tính khi có đủ giờ bắt đầu và kết thúc)";
  }

  function openForm(ev, preset) {
    if (!token) return;
    editingId = ev ? ev.id : null;
    var src = ev || preset || {};
    form.reset();
    $("#formError").textContent = "";
    $("#eventDialogTitle").textContent = ev ? "SỬA CÔNG VIỆC" : "THÊM CÔNG VIỆC";
    fillCategorySelect(src.category);
    form.elements.title.value = src.title || "";
    form.elements.date.value = src.date || todayISO();
    form.elements.mode.value = src.mode || "time";
    form.elements.start.value = src.start || "";
    form.elements.end.value = src.end || "";
    form.elements.session.value = String(src.session || 1);
    form.elements.location.value = src.location || "";
    form.elements.info.value = src.info || "";
    form.elements.lessons.value = hasLessonOverride(src) ? src.lessons : "";
    $("#deleteEvent").hidden = !ev;
    $("#duplicateEvent").hidden = !ev;
    syncMode();
    dlg.showModal();
    setTimeout(function () { (ev ? form.elements.title : (src.category ? form.elements.title : $("#categorySelect"))).focus(); }, 30);
  }

  function readForm() {
    var f = form.elements;
    var ev = {
      id: editingId || ("e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
      title: f.title.value.trim(),
      category: f.category.value,
      date: f.date.value,
      mode: f.mode.value,
      location: f.location.value.trim(),
      info: f.info.value.split("\n").map(function (l) { return l.trim(); }).filter(Boolean).join("\n")
    };
    if (ev.mode === "time") { ev.start = f.start.value; ev.end = f.end.value; }
    if (ev.mode === "session") ev.session = Number(f.session.value) || 1;
    if (f.lessons.value !== "") ev.lessons = Number(f.lessons.value);
    return ev;
  }

  function validate(ev, newCat) {
    if (!ev.title) return "Chưa nhập tên công việc.";
    if (!ev.category) return "Chưa chọn phân loại.";
    if (ev.category === "__new" && !newCat) return "Chưa nhập tên loại mới.";
    if (!validDate(ev.date)) return "Chưa chọn ngày.";
    if (ev.mode === "time" && !ev.start) return "Chưa nhập giờ bắt đầu (hoặc chọn “Theo buổi” nếu chưa rõ giờ).";
    if (ev.mode === "time" && ev.end && minutes(ev.end) <= minutes(ev.start)) return "Giờ kết thúc phải sau giờ bắt đầu.";
    if (ev.lessons !== undefined && (isNaN(ev.lessons) || ev.lessons < 0)) return "Số tiết không hợp lệ.";
    return "";
  }

  function busy(on) {
    form.querySelectorAll("button").forEach(function (b) { b.disabled = on; });
    $("#saveEvent").textContent = on ? "Đang lưu…" : "Lưu";
  }

  function afterSave(ev, msg) {
    dlg.close();
    if (ev && state.view !== "stats") {
      if (state.view !== "overview" && state.view !== ev.category) state.view = "overview";
      state.weekFrom = mondayOf(ev.date);
      history.replaceState(historyState(), "", "#" + state.view);
    }
    render();
    toast(msg + "", "ok");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ev = readForm();
    var newCat = form.elements.newCategory.value.trim();
    var err = validate(ev, newCat);
    if (err) { $("#formError").textContent = err; return; }
    var catToAdd = null;
    if (ev.category === "__new") {
      var exist = categories().filter(function (c) { return c.name.toLowerCase() === newCat.toLowerCase(); })[0];
      if (exist) ev.category = exist.id;
      else {
        var id = slug(newCat), n = 2, base = id;
        while (catById(id) || id === "overview" || id === "rmia" || id === "stats") id = base + "-" + (n++);
        catToAdd = { id: id, name: newCat, tab: newCat.toUpperCase() };
        ev.category = id;
      }
    }
    var isEdit = !!editingId;
    busy(true);
    commit(function (data) {
      if (catToAdd && !data.categories.some(function (c) { return c.id === catToAdd.id; })) data.categories.push(catToAdd);
      var i = data.events.findIndex(function (x) { return x.id === ev.id; });
      if (i >= 0) data.events[i] = ev; else data.events.push(ev);
    }, (isEdit ? "Sửa" : "Thêm") + " công việc: " + ev.title + " (" + fmt(ev.date) + ")")
      .then(function () { afterSave(ev, isEdit ? "Đã lưu thay đổi." : "Đã thêm công việc."); })
      .catch(function (x) { $("#formError").textContent = x.message || "Không lưu được."; })
      .then(function () { busy(false); });
  });

  $("#deleteEvent").addEventListener("click", function () {
    if (!editingId) return;
    var id = editingId;
    var ev = (store.events || []).filter(function (x) { return x.id === id; })[0];
    if (!window.confirm("Xóa công việc “" + (ev ? ev.title : "") + "”? Thao tác này xóa khỏi lịch và thống kê.")) return;
    busy(true);
    commit(function (data) { data.events = data.events.filter(function (x) { return x.id !== id; }); },
      "Xóa công việc: " + (ev ? ev.title + " (" + fmt(ev.date) + ")" : id))
      .then(function () { afterSave(null, "Đã xóa công việc."); })
      .catch(function (x) { $("#formError").textContent = x.message || "Không xóa được."; })
      .then(function () { busy(false); });
  });

  $("#duplicateEvent").addEventListener("click", function () {
    var ev = readForm();
    editingId = null;
    $("#eventDialogTitle").textContent = "NHÂN BẢN CÔNG VIỆC";
    $("#deleteEvent").hidden = true;
    $("#duplicateEvent").hidden = true;
    $("#formError").textContent = "Đã tạo bản sao. Hãy chọn ngày mới rồi bấm Lưu.";
    form.elements.date.value = addDays(ev.date || todayISO(), 7);
    form.elements.date.focus();
  });

  $("#categorySelect").addEventListener("change", function () {
    var isNew = this.value === "__new";
    $("#newCategoryWrap").hidden = !isNew;
    if (isNew) form.elements.newCategory.focus();
  });
  form.querySelectorAll("input[name=mode]").forEach(function (r) { r.addEventListener("change", syncMode); });
  form.elements.start.addEventListener("input", updateLessonHint);
  form.elements.end.addEventListener("input", updateLessonHint);

  document.querySelectorAll("dialog [data-close]").forEach(function (b) {
    b.addEventListener("click", function () { b.closest("dialog").close(); });
  });

  /* ---------- Đăng nhập admin = chế độ biên tập ---------- */
  var ADMIN_EMAILS = (CFG.adminEmails || []).map(function (e) { return e.toLowerCase(); });
  function isAdminUser(u) {
    if (!u || u.isAnonymous) return false;
    if (CFG.adminUid && u.uid === CFG.adminUid) return true;
    return !!u.email && u.emailVerified !== false && ADMIN_EMAILS.indexOf(u.email.toLowerCase()) >= 0;
  }
  // "token" giữ tài khoản admin đang đăng nhập (null = người xem). Firebase tự nhớ đăng nhập trên máy này.
  function updateEditorToggle() {
    var b = $("#editorToggle");
    b.textContent = token ? "THOÁT BIÊN TẬP" : "BIÊN TẬP";
    b.classList.toggle("on", !!token);
    $("#backupJson").hidden = !token;
    setSyncNote();
  }

  $("#editorToggle").addEventListener("click", function () {
    if (token) {
      if (!window.confirm("Đăng xuất khỏi hệ sinh thái Phúc Nguyên trên máy này? (PN Library, PN Work, PN Digital cùng đăng xuất)")) return;
      if (auth) auth.signOut();
      return;
    }
    $("#tokenForm").reset();
    $("#tokenError").textContent = "";
    $("#tokenDialog").showModal();
  });

  $("#tokenForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = this.elements.email.value.trim(), pass = this.elements.password.value;
    if (!email || !pass) { $("#tokenError").textContent = "Nhập email và mật khẩu admin."; return; }
    if (!auth) { $("#tokenError").textContent = "Chưa tải được thư viện đăng nhập. Kiểm tra mạng rồi tải lại trang."; return; }
    $("#tokenError").textContent = "Đang đăng nhập…";
    auth.signInWithEmailAndPassword(email, pass).then(function (r) {
      if (!isAdminUser(r.user)) throw { code: "not-admin" };
      $("#tokenDialog").close();
      toast("Đã bật chế độ biên tập.", "ok");
    }).catch(function (x) { $("#tokenError").textContent = x && x.code === "not-admin" ? "Tài khoản này không phải quản trị." : fbError(x, "Không đăng nhập được."); });
  });
  $("#googleLogin").addEventListener("click", function () {
    if (!auth) return;
    $("#tokenError").textContent = "Đang mở cửa sổ đăng nhập Google…";
    var prov = new firebase.auth.GoogleAuthProvider();
    prov.setCustomParameters({ prompt: "select_account" });
    auth.signInWithPopup(prov).then(function (r) {
      if (!isAdminUser(r.user)) { $("#tokenError").textContent = "Tài khoản " + r.user.email + " không phải quản trị (vẫn giữ đăng nhập để xem)."; return; }
      $("#tokenDialog").close(); toast("Đã bật chế độ biên tập.", "ok");
    }).catch(function (x) { $("#tokenError").textContent = fbError(x, "Không đăng nhập được."); });
  });

  // Tải bản sao lưu toàn bộ dữ liệu (JSON) về máy
  $("#backupJson").addEventListener("click", function () {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(store, null, 2)], { type: "application/json" }));
    a.download = "pnw-sao-luu-" + todayISO() + ".json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });

  /* ---------- Tải dữ liệu ---------- */
  var legacy = null;
  function loadLegacy() {
    return fetch(CFG.legacyDataPath + "?t=" + Date.now(), { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("load");
      return res.json();
    }).then(function (d) { legacy = normalize(d); return legacy; });
  }
  function loadPublic() {
    return readRemote().then(function (d) {
      if (d) { store = d; return; }
      // Firestore chưa có dữ liệu: hiển thị tạm bản cũ trên GitHub
      return loadLegacy().then(function (l) { store = JSON.parse(JSON.stringify(l)); });
    }).catch(function (x) {
      console.warn("Firestore", x);
      return loadLegacy().then(function (l) { store = JSON.parse(JSON.stringify(l)); toast("Đang hiển thị bản dự phòng (chưa kết nối được máy chủ dữ liệu).", "error"); });
    });
  }
  function ensureMigrated() {
    return db.doc(ST.metaPath).get().then(function (snap) {
      if (snap.exists) return false;
      return (legacy ? Promise.resolve(legacy) : loadLegacy()).then(function (l) {
        return migrateFrom(l).then(function () { return true; });
      });
    });
  }

  initStatsControls();
  token = null;
  updateEditorToggle();
  var startView = location.hash.slice(1) || "overview";
  var started = false;
  loadPublic().catch(function () {
    toast("Chưa tải được dữ liệu lịch. Hãy tải lại trang.", "error");
  }).then(function () {
    started = true;
    activate(startView, "replace");
  });

  if (auth) auth.onAuthStateChanged(function (user) {
    // Hệ sinh thái PN dùng chung phiên đăng nhập (cùng tên miền, cùng dự án Firebase):
    // không bao giờ tự đăng xuất tài khoản khác — chỉ coi là người xem.
    var isAdmin = isAdminUser(user);
    token = isAdmin ? user : null;
    updateEditorToggle();
    if (!token) { if (started) render(); return; }
    ensureMigrated().then(function (moved) {
      return readRemote().then(function (d) {
        if (d) store = d;
        if (started) render();
        if (moved) toast("Đã chuyển toàn bộ lịch cũ sang kho dữ liệu mới.", "ok");
      });
    }).catch(function (x) { toast(fbError(x, "Không đọc được dữ liệu"), "error"); });
  });
})();
