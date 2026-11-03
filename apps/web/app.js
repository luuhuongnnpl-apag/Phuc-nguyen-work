(function () {
  "use strict";

  var TITLES = {
    overview: "LỊCH TỔNG",
    teaching: "LỊCH GIẢNG",
    meetings: "LỊCH HỌP",
    study: "LỊCH HỌC",
    invigilation: "COI THI",
    grading: "CHẤM THI",
    research: "NCKH",
    other: "KHÁC",
    rmia: "LỊCH R'MIA"
  };
  var MIN_ROWS = 4;
  var DATA = window.PNW_DATA || {};

  var $ = function (s) { return document.querySelector(s); };
  var RMIA = window.PNW_RMIA || [];
  var state = { view: "teaching", weekIndex: 0, classIndex: 0 };

  function parse(d) { var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmt(d) {
    var x = parse(d);
    return String(x.getDate()).padStart(2, "0") + "/" + String(x.getMonth() + 1).padStart(2, "0") + "/" + x.getFullYear();
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Tuần mới nhất lên đầu, tuần ban hành trước xếp xuống dưới
  function weeksOf(view) {
    if (view === "overview") {
      var map = {};
      Object.keys(TITLES).forEach(function (type) {
        if (type === "overview" || type === "rmia") return;
        (DATA[type] || []).forEach(function (w) { map[w.from + "|" + w.to] = { from: w.from, to: w.to }; });
      });
      return Object.keys(map).map(function (key) { return map[key]; })
        .sort(function (a, b) { return parse(b.from) - parse(a.from); });
    }
    return (DATA[view] || []).slice().sort(function (a, b) { return parse(b.from) - parse(a.from); });
  }

  function defaultWeekIndex(weeks) {
    var now = new Date(); now.setHours(0, 0, 0, 0);
    for (var i = 0; i < weeks.length; i++) {
      if (parse(weeks[i].from) <= now && now <= parse(weeks[i].to)) return i;
    }
    return 0;
  }

  // Chỉ làm mờ ngày đã qua; không loại bỏ sự kiện lịch khỏi giao diện.
  function isPastDate(week, day) {
    if (!week) return false;
    var eventDate = parse(week.from);
    eventDate.setDate(eventDate.getDate() + day - 1);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return eventDate < today;
  }

  function todayColumn(week) {
    if (!week) return -1;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var start = parse(week.from), end = parse(week.to);
    if (now < start || now > end) return -1;
    return Math.round((now - start) / 86400000) + 1;
  }

  var DAY_NAMES = ["THỨ HAI", "THỨ 3", "THỨ 4", "THỨ 5", "THỨ 6", "THỨ 7", "CHỦ NHẬT"];
  function renderHeads(week) {
    document.querySelectorAll(".week-table th.dh").forEach(function (th, i) {
      th.innerHTML = "";
      th.appendChild(el("div", "dname", DAY_NAMES[i]));
      if (week) {
        var d = parse(week.from); d.setDate(d.getDate() + i);
        var s = String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
        th.appendChild(el("div", "ddate", "(" + s + ")"));
        var today = new Date(); today.setHours(0, 0, 0, 0);
        if (d < today) th.classList.add("past-date-head");
      }
    });
  }

  function renderTable(week) {
    renderHeads(week);
    var body = $("#weekBody");
    body.innerHTML = "";
    var items = week ? week.items || [] : [];
    var rows = MIN_ROWS;
    items.forEach(function (it) { if (it.row > rows) rows = it.row; });
    var tcol = todayColumn(week);
    var spanUntil = {};

    for (var r = 1; r <= rows; r++) {
      var tr = el("tr", "time-slot-row time-slot-row-" + r + (r === 4 ? " deadline-row" : ""));
      for (var d = 1; d <= 7; d++) {
        if (spanUntil[d] >= r) continue;
        var td = el("td");
        if (d === tcol) td.classList.add("today-col");
        if (isPastDate(week, d)) td.classList.add("past-date-cell");
        var cellItems = items.filter(function (it) { return it.day === d && it.row === r; });
        cellItems.forEach(function (it) {
          td.classList.add("filled");
          if (r === 4 || it.fixedDate) td.classList.add("fixed-date-cell");
          if (it.span > 1) {
            td.rowSpan = it.span;
            spanUntil[d] = r + it.span - 1;
          }
          var entry = el("div", "schedule-entry" + (r === 4 || it.fixedDate ? " fixed-date-entry" : ""));
          (it.lines || []).forEach(function (line, i) {
            entry.appendChild(el("div", i === 0 ? "first" : "", line));
          });
          td.appendChild(entry);
        });
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }

    if (!week) {
      var n = el("tr", "notice");
      var c = el("td", "", "Chưa có lịch được ban hành.");
      c.colSpan = 7; n.appendChild(c); body.appendChild(n);
    }
  }

  function renderOverview(week) {
    renderHeads(week);
    var body = $("#weekBody");
    body.innerHTML = "";
    if (!week) {
      var empty = el("tr", "notice");
      var msg = el("td", "", "Chưa có lịch được ban hành.");
      msg.colSpan = 7; empty.appendChild(msg); body.appendChild(empty);
      return;
    }
    var categoryNames = TITLES;
    var spanUntil = {};
    for (var session = 1; session <= 4; session++) {
      var tr = el("tr", "overview-row time-slot-row time-slot-row-" + session + (session === 4 ? " deadline-row" : ""));
      for (var day = 1; day <= 7; day++) {
        if (spanUntil[day] >= session) continue;
        var td = el("td", "overview-day");
        var events = [];
        Object.keys(categoryNames).forEach(function (type) {
          if (type === "overview" || type === "rmia") return;
          (DATA[type] || []).forEach(function (w) {
            if (w.from !== week.from || w.to !== week.to) return;
            (w.items || []).forEach(function (item) {
              if (item.day === day && Number(item.row || 1) === session) {
                events.push({ type: type, lines: item.lines || [], span: Number(item.span || 1), fixedDate: !!item.fixedDate });
              }
            });
          });
        });
        if (day === todayColumn(week)) td.classList.add("today-col");
        if (isPastDate(week, day)) td.classList.add("past-date-cell");
        if (events.some(function (event) { return event.fixedDate || session === 4; })) td.classList.add("fixed-date-cell");
        if (events.length === 1 && events[0].span > 1) {
          td.rowSpan = events[0].span;
          spanUntil[day] = session + events[0].span - 1;
        }
        events.forEach(function (event) {
          var card = el("div", "overview-event" + (session === 4 || event.fixedDate ? " fixed-date-event" : ""));
          card.appendChild(el("div", "overview-category", categoryNames[event.type]));
          (event.lines || []).forEach(function (line, i) {
            card.appendChild(el("div", i === 0 ? "first" : "overview-detail", line));
          });
          td.appendChild(card);
        });
        if (!events.length) td.appendChild(el("div", "overview-empty", "—"));
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }
  }

  function pushWorkHistory() {
    history.pushState({ pnWorkState: { view: state.view, weekIndex: state.weekIndex, classIndex: state.classIndex } }, "", location.href);
  }

  function renderWeekList(weeks) {
    var list = $("#weekList");
    list.innerHTML = "";
    if (!weeks.length) return;
    weeks.forEach(function (w, i) {
      var li = el("li");
      var b = el("button", "week-btn" + (i === state.weekIndex ? " active" : ""));
      b.type = "button";
      b.setAttribute("aria-pressed", i === state.weekIndex ? "true" : "false");
      var label = el("span", "label");
      label.appendChild(document.createTextNode("- Tuần từ " + fmt(w.from) + " - "));
      label.appendChild(el("span", "to", fmt(w.to)));
      b.appendChild(label);
      b.addEventListener("click", function () { if (state.weekIndex === i) return; state.weekIndex = i; pushWorkHistory(); render(); });
      li.appendChild(b);
      list.appendChild(li);
    });
  }

  function cellNode(tag, c) {
    var n = el(tag);
    if (c && typeof c === "object") {
      if (c.rs > 1) n.rowSpan = c.rs;
      if (c.tone) n.className = "tone-" + c.tone;
      String(c.t || "").split("\n").forEach(function (line, i) {
        n.appendChild(el("div", i === 0 ? "first" : "sub", line));
      });
    } else {
      n.textContent = c || "";
    }
    return n;
  }

  function renderTimetable() {
    var sw = $("#classSwitch"), table = $("#ttTable"), notes = $("#ttNotes");
    sw.innerHTML = ""; table.innerHTML = ""; notes.innerHTML = "";
    if (!RMIA.length) {
      $("#ttNote").textContent = "Chưa có thời khóa biểu.";
      return;
    }
    if (state.classIndex >= RMIA.length) state.classIndex = 0;
    RMIA.forEach(function (k, i) {
      var b = el("button", "class-btn" + (i === state.classIndex ? " active" : ""), k.name);
      b.type = "button"; b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === state.classIndex ? "true" : "false");
      b.addEventListener("click", function () { if (state.classIndex === i) return; state.classIndex = i; pushWorkHistory(); renderTimetable(); });
      sw.appendChild(b);
    });
    var k = RMIA[state.classIndex];
    $("#ttNote").textContent = k.note || "";

    var thead = el("thead"), hr = el("tr");
    ["BUỔI", "TIẾT", "THỜI GIAN"].concat(k.days).forEach(function (h, i) {
      hr.appendChild(el("th", i < 3 ? "meta" : "", h));
    });
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

  function render() {
    var isTT = state.view === "rmia";
    $("#weekPanel").hidden = isTT;
    $("#ttPanel").hidden = !isTT;
    var weeks = weeksOf(state.view);
    if (state.weekIndex >= weeks.length) state.weekIndex = 0;
    var week = weeks[state.weekIndex];
    $("#sectionTitle").textContent = TITLES[state.view];
    $("#weekCaption").textContent = TITLES[state.view] + (week ? " — tuần " + fmt(week.from) + " đến " + fmt(week.to) : "");
    document.querySelectorAll(".nav-item").forEach(function (b) {
      var on = b.dataset.view === state.view;
      b.classList.toggle("active", on);
      b.setAttribute("aria-current", on ? "page" : "false");
    });
    if (isTT) { renderTimetable(); return; }
    if (state.view === "overview") renderOverview(week);
    else renderTable(week);
    renderWeekList(weeks);
  }

  function activate(view, historyMode) {
    if (!TITLES[view]) view = "teaching";
    state.view = view;
    state.weekIndex = defaultWeekIndex(weeksOf(view));
    if (historyMode === "replace") {
      history.replaceState({ pnWorkState: { view: view, weekIndex: state.weekIndex, classIndex: state.classIndex } }, "", "#" + view);
    } else if (historyMode !== "none" && location.hash.slice(1) !== view) {
      history.pushState({ pnWorkState: { view: view, weekIndex: state.weekIndex, classIndex: state.classIndex } }, "", "#" + view);
    }
    render();
  }

  $("#navigation").addEventListener("click", function (e) {
    var b = e.target.closest("[data-view]");
    if (b) activate(b.dataset.view);
  });

  activate(location.hash.slice(1) || "overview", "replace");
  window.addEventListener("popstate", function (event) {
    var saved = event.state && event.state.pnWorkState;
    if (saved && TITLES[saved.view]) {
      state.view = saved.view;
      state.weekIndex = Number.isInteger(saved.weekIndex) ? saved.weekIndex : 0;
      state.classIndex = Number.isInteger(saved.classIndex) ? saved.classIndex : 0;
      render();
      return;
    }
    activate(location.hash.slice(1) || "overview", "none");
  });

  // Tự cập nhật theo đồng hồ thiết bị, không cần tải lại trang.
  window.setInterval(function () {
    if (state.view !== "rmia" && !document.hidden) render();
  }, 15000);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && state.view !== "rmia") render();
  });

  // Khi API được cấu hình và người dùng đã đăng nhập, lịch lưu trên D1
  // được ưu tiên hiển thị; dữ liệu tĩnh vẫn là phương án dự phòng khi offline.
  var apiBase = window.PNW_CONFIG && window.PNW_CONFIG.apiBaseUrl;
  if (apiBase) {
    fetch((apiBase.endsWith("/") ? apiBase.slice(0,-1) : apiBase) + "/api/schedules", { credentials: "include" })
      .then(function (res) { if (!res.ok) throw new Error("schedule_api_unavailable"); return res.json(); })
      .then(function (data) {
        var grouped = {};
        (data.items || []).forEach(function (item) {
          var dt = new Date(item.start_at), day = (dt.getDay() + 6) % 7 + 1;
          var monday = new Date(dt); monday.setHours(0,0,0,0); monday.setDate(monday.getDate() - day + 1);
          var sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
          function iso(d) { return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
          var from = iso(monday), key = item.type + "|" + from;
          if (!grouped[key]) grouped[key] = { from:from, to:iso(sunday), items:[] , type:item.type };
          var hour = dt.getHours(), row = hour >= 17 ? 3 : (hour >= 12 ? 2 : 1);
          var lines = [item.title];
          if (item.location) lines.push(item.location);
          lines.push(String(hour).padStart(2,"0")+":"+String(dt.getMinutes()).padStart(2,"0"));
          grouped[key].items.push({ day:day, row:row, lines:lines });
        });
        Object.keys(grouped).forEach(function (key) {
          var w = grouped[key], type = w.type;
          if (!DATA[type]) DATA[type] = [];
          DATA[type].push({ from:w.from, to:w.to, items:w.items });
        });
        Object.keys(DATA).forEach(function (type) {
          if (Array.isArray(DATA[type])) DATA[type].sort(function(a,b){return parse(b.from)-parse(a.from);});
        });
        state.weekIndex = defaultWeekIndex(weeksOf(state.view));
        render();
      }).catch(function () {});
  }
})();
