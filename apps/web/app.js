(function () {
  "use strict";

  var TITLES = {
    teaching: "LỊCH GIẢNG",
    meetings: "LỊCH HỌP",
    study: "LỊCH HỌC",
    invigilation: "COI THI",
    grading: "CHẤM THI",
    research: "NCKH",
    other: "KHÁC",
    rmia: "LỊCH R'MIA"
  };
  var MIN_ROWS = 3;
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
    return (DATA[view] || []).slice().sort(function (a, b) { return parse(b.from) - parse(a.from); });
  }

  function defaultWeekIndex(weeks) {
    var now = new Date(); now.setHours(0, 0, 0, 0);
    for (var i = 0; i < weeks.length; i++) {
      if (parse(weeks[i].from) <= now && now <= parse(weeks[i].to)) return i;
    }
    return 0;
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

    for (var r = 1; r <= rows; r++) {
      var tr = el("tr");
      for (var d = 1; d <= 7; d++) {
        var td = el("td");
        if (d === tcol) td.classList.add("today-col");
        items.filter(function (it) { return it.day === d && it.row === r; }).forEach(function (it) {
          td.classList.add("filled");
          (it.lines || []).forEach(function (line, i) {
            td.appendChild(el("div", i === 0 ? "first" : "", line));
          });
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
      b.addEventListener("click", function () { state.weekIndex = i; render(); });
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
      b.addEventListener("click", function () { state.classIndex = i; renderTimetable(); });
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
    renderTable(week);
    renderWeekList(weeks);
  }

  function activate(view) {
    if (!TITLES[view]) view = "teaching";
    state.view = view;
    state.weekIndex = defaultWeekIndex(weeksOf(view));
    if (location.hash.slice(1) !== view) history.replaceState(null, "", "#" + view);
    render();
  }

  $("#navigation").addEventListener("click", function (e) {
    var b = e.target.closest("[data-view]");
    if (b) activate(b.dataset.view);
  });

  activate(location.hash.slice(1) || "teaching");
})();
