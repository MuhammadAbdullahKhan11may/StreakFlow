// ===============================
// 📦 LOAD / INIT DATA
// ===============================
let data = JSON.parse(localStorage.getItem("streakData")) || {
  streak: 0,
  days: {}
};

let calendarYear, calendarMonth; // state for the calendar view

// Get today's date
// Get today's date in Pakistan Standard Time (UTC+5, no DST)
function getToday() {
  let now = new Date();
  // Convert current UTC time to PKT by adding 5 hours to UTC
  let utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  let pktMs = utcMs + (5 * 60 * 60 * 1000);
  let pkt = new Date(pktMs);

  let year = pkt.getFullYear();
  let month = String(pkt.getMonth() + 1).padStart(2, "0");
  let day = String(pkt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ===============================
// 🔥 MARK TODAY AS DONE
// ===============================
function markTodayDone() {
  let today = getToday();

  // Prevent double marking
  if (data.days[today] === "done") {
    let modal = document.getElementById("alreadyDoneModal");
    if (modal) modal.classList.add("show");
    return;
  }

  data.days[today] = "done";

  // Check yesterday (based on PKT "today")
  let [ty, tm, td] = today.split("-").map(Number);
  let yesterdayDate = new Date(ty, tm - 1, td - 1);
  let yDate = yesterdayDate.getFullYear() + "-" +
    String(yesterdayDate.getMonth() + 1).padStart(2, "0") + "-" +
    String(yesterdayDate.getDate()).padStart(2, "0");

  if (data.days[yDate] === "done") {
    data.streak++;
  } else {
    data.streak = 1;
  }

  saveData();
  updateUI();
}

// ===============================
// 💾 SAVE DATA
// ===============================
function saveData() {
  localStorage.setItem("streakData", JSON.stringify(data));
}

// ===============================
// 🚩 ENSURE TRACKING START DATE
// ===============================
// Days before this date are shown as neutral/white in the calendar —
// only days from this date onward can be marked "missed" (red).
function ensureTrackingStartDate() {
  if (!data.trackingStartDate) {
    data.trackingStartDate = getToday();
    saveData();
  }
}

// ===============================
// 🗓️ RENDER CALENDAR VIEW
// ===============================
function renderCalendar(year, month) {
  let grid = document.getElementById("calendarGrid");
  let label = document.getElementById("calendarMonthLabel");
  if (!grid || !label) return;

  let monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  label.innerText = `${monthNames[month]} ${year}`;

  let today = getToday();
  let firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay(); // 0 = Sunday
  let daysInMonth = new Date(year, month + 1, 0).getDate();

  grid.innerHTML = "";

  for (let i = 0; i < startOffset; i++) {
    let empty = document.createElement("div");
    empty.className = "cal-cell cal-empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    let dateStr = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    let cell = document.createElement("div");
    cell.className = "cal-cell";
    cell.innerText = day;

    let isDone = data.days[dateStr] === "done";
    let isToday = dateStr === today;
    let isBeforeTracking = dateStr < data.trackingStartDate;
    let isPast = dateStr < today;

    if (isDone) {
      cell.classList.add("cal-done");
    } else if (!isBeforeTracking && isPast && !isToday) {
      cell.classList.add("cal-missed");
    }

    if (isToday) {
      cell.classList.add("cal-today");
    }

    grid.appendChild(cell);
  }
}

function shiftCalendarMonth(delta) {
  let grid = document.getElementById("calendarGrid");
  if (!grid) {
    calendarMonth += delta;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    renderCalendar(calendarYear, calendarMonth);
    return;
  }

  let outClass = delta > 0 ? "slide-left" : "slide-right";
  let inClass = delta > 0 ? "slide-right" : "slide-left";

  grid.classList.add(outClass);

  setTimeout(() => {
    calendarMonth += delta;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }

    renderCalendar(calendarYear, calendarMonth);

    let newGrid = document.getElementById("calendarGrid");
    if (newGrid) {
      newGrid.classList.remove(outClass);
      newGrid.classList.add(inClass);
      // force reflow so the browser registers the starting position before transitioning
      void newGrid.offsetWidth;
      newGrid.classList.remove(inClass);
    }
  }, 200);
}

// ===============================
// 🔄 UPDATE UI
// ===============================
function updateUI() {
  renderProgressList();
  updateStreak();
  updateTodayStatus();
  updateProgressList();
  updateStats();
  updateMarkDoneButton();
  updateWeekRow();
  updateBadges();
  updateTodayBadge();
}

// ===============================
// 🔥 UPDATE STREAK TEXT
// ===============================
function updateStreak() {
  let el = document.querySelector(".streak-title");
  if (el) {
    el.innerText = "🔥 " + data.streak + " Days";
  }
}

// ===============================
// 📅 UPDATE TODAY STATUS
// ===============================
function updateTodayStatus() {
  let today = getToday();

  let todayItem = document.querySelector(`.day-item[data-date="${today}"]`);

  if (!todayItem) return;

  todayItem.classList.add("today-item");

  let pill = todayItem.querySelector(".status-pill");
  let icon = todayItem.querySelector(".status-icon");

  if (data.days[today] === "done") {
    pill.innerText = "DONE";
    pill.className = "status-pill done-pill";
    if (icon) { icon.innerText = "✓"; icon.className = "status-icon done-icon"; }
  } else {
    pill.innerText = "TODAY";
    pill.className = "status-pill today-pill";
    if (icon) { icon.innerText = "🔥"; icon.className = "status-icon today-icon"; }
  }
}
// ===============================
// ✅ UPDATE MARK AS DONE BUTTON
// ===============================
function updateMarkDoneButton() {
  let today = getToday();
  let btn = document.querySelector(".mark-done-btn");
  let text = document.getElementById("markDoneText");
  if (!btn) return;

  if (data.days[today] === "done") {
    btn.classList.add("completed");
    if (text) text.innerHTML = "✓ Completed";
  } else {
    btn.classList.remove("completed");
    if (text) text.innerHTML = "Mark Today's Progress";
  }
}

// ===============================
// 🗓️ RENDER ROLLING 14-DAY WINDOW
// ===============================
function renderProgressList() {
  let container = document.getElementById("progressList");
  if (!container) return;

  let today = getToday();
  let [ty, tm, td] = today.split("-").map(Number);
  let baseDate = new Date(ty, tm - 1, td);

  let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  container.innerHTML = "";

  for (let offset = -6; offset <= 7; offset++) {
    let d = new Date(baseDate);
    d.setDate(d.getDate() + offset);

    let dateStr = d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");

    let dayName = dayNames[d.getDay()];
    let subDate = `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    let isToday = offset === 0;

    let item = document.createElement("div");
    item.className = "day-item" + (isToday ? " today-item" : "");
    item.setAttribute("data-date", dateStr);

    item.innerHTML = `
      <div class="day-item-left">
        <div class="status-icon ${isToday ? "today-icon" : "upcoming-icon"}">${isToday ? "🔥" : "📅"}</div>
        <div>
          <p class="day-title">${dayName}${isToday ? " · Today" : ""}</p>
          <p class="day-sub">${subDate}${isToday ? " · In progress" : ""}</p>
        </div>
      </div>
      <div class="day-item-right">
        <span class="status-pill ${isToday ? "today-pill" : "soon-pill"}">${isToday ? "TODAY" : "SOON"}</span>
        <span class="chevron">›</span>
      </div>
    `;

    container.appendChild(item);
  }

  let todayItem = container.querySelector(".today-item");
  if (todayItem) {
    todayItem.scrollIntoView({ block: "center" });
  }
}

// ===============================
// 📊 UPDATE DAY LIST (DYNAMIC)
// ===============================
function updateProgressList() {
  let items = document.querySelectorAll(".day-item");
  let today = getToday();

  items.forEach((item) => {
    let date = item.getAttribute("data-date");
    if (!date) return;
    if (date === today) return; // today's row is handled by updateTodayStatus()

    let status = data.days[date];

    // Only treat as missed if it's past, unmarked, AND on/after tracking start date
    if (!status && date < today && date >= data.trackingStartDate) {
      status = "missed";
    }

    let pill = item.querySelector(".status-pill");
    let icon = item.querySelector(".status-icon");

    if (status === "done") {
      pill.innerText = "DONE";
      pill.className = "status-pill done-pill";
      icon.innerText = "✓";
      icon.className = "status-icon done-icon";
    } else if (status === "missed") {
      pill.innerText = "MISSED";
      pill.className = "status-pill missed-pill";
      icon.innerText = "✕";
      icon.className = "status-icon missed-icon";
    }
    // else: future date with no status — leave as "SOON" default from HTML
  });
}

// ===============================
// 📆 UPDATE WEEK ROW (MON–SUN)
// ===============================
function updateWeekRow() {
  let today = getToday();
  let circles = document.querySelectorAll(".day-circle");

  circles.forEach((circle) => {
    let date = circle.getAttribute("data-date");
    if (!date) return;

    let status = data.days[date];

    if (date === today) {
      circle.className = "day-circle today";
      circle.innerText = "🔥";
    } else if (status === "done") {
      circle.className = "day-circle done";
      circle.innerText = "✓";
    } else if (status === "missed") {
      circle.className = "day-circle missed";
      circle.innerText = "✕";
    } else {
      circle.className = "day-circle upcoming";
      circle.innerText = "—";
    }
  });
}

// ===============================
// 🏆 UPDATE LONGEST STREAK
// ===============================
function updateLongestStreak() {
  let dates = Object.keys(data.days)
    .filter(date => data.days[date] === "done")
    .sort(); // ascending order, e.g. "2026-08-04" before "2026-08-05"

  let longest = 0;
  let longestEndDate = null;
  let current = 0;
  let prevDate = null;

  dates.forEach((dateStr) => {
    let date = new Date(dateStr);

    if (prevDate) {
      let diffDays = (date - prevDate) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        current++;
      } else {
        current = 1;
      }
    } else {
      current = 1;
    }

    if (current > longest) {
      longest = current;
      longestEndDate = dateStr;
    }

    prevDate = date;
  });

  let valueEl = document.getElementById("longestStreakValue");
  let subEl = document.getElementById("longestStreakSub");

  if (valueEl) valueEl.innerText = longest;

  if (subEl) {
    if (longestEndDate) {
      let d = new Date(longestEndDate);
      let month = d.toLocaleString("default", { month: "long" });
      let year = d.getFullYear();
      subEl.innerText = `days · ${month} ${year}`;
    } else {
      subEl.innerText = "days";
    }
  }

  return longest;
}

// ===============================
// 🏅 UPDATE BADGES
// ===============================
function updateBadges() {
  let longest = updateLongestStreak();

  let personalBest = document.getElementById("personalBestBadge");
  let onFire = document.getElementById("onFireBadge");

  if (personalBest) {
    personalBest.style.display =
      (data.streak > 0 && data.streak >= longest) ? "inline-block" : "none";
  }

  if (onFire) {
    onFire.style.display = (data.streak >= 3) ? "inline-block" : "none";
  }
}

// ===============================
// 📈 UPDATE STATS
// ===============================
function updateStats() {
  let totalDays = Object.keys(data.days).length;
  let doneDays = Object.values(data.days).filter(d => d === "done").length;

  let percent = totalDays === 0 ? 0 : Math.round((doneDays / totalDays) * 100);

  let percentEl = document.querySelector(".progress-percent");
  let bar = document.querySelector(".progress-bar-fill");
  let completionRateEl = document.getElementById("completionRateValue");

  if (percentEl) percentEl.innerText = percent + "%";
  if (bar) bar.style.width = percent + "%";
  if (completionRateEl) completionRateEl.innerText = percent + "%";
}

// ===============================
// 🚀 INIT ON LOAD
// ===============================
window.onload = function () {
  ensureTrackingStartDate();
  updateUI();

  let today = getToday();
  let [cy, cm] = today.split("-").map(Number);
  calendarYear = cy;
  calendarMonth = cm - 1;

  let viewAllBtn = document.getElementById("viewAllBtn");
  let backToListBtn = document.getElementById("backToListBtn");
  let progressList = document.getElementById("progressList");
  let calendarView = document.getElementById("calendarView");

  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", function (e) {
      e.preventDefault();
      progressList.style.display = "none";
      calendarView.style.display = "block";
      renderCalendar(calendarYear, calendarMonth);
    });
  }

  if (backToListBtn) {
    backToListBtn.addEventListener("click", function (e) {
      e.preventDefault();
      calendarView.style.display = "none";
      progressList.style.display = "flex";
    });
  }

  let prevBtn = document.getElementById("calendarPrevBtn");
  let nextBtn = document.getElementById("calendarNextBtn");
  if (prevBtn) prevBtn.addEventListener("click", () => shiftCalendarMonth(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => shiftCalendarMonth(1));

  

  let resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetData);
  }

  let confirmBtn = document.getElementById("modalConfirmBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", confirmReset);
  }

 let cancelBtn = document.getElementById("modalCancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeResetModal);
  }

  let alreadyDoneOkBtn = document.getElementById("alreadyDoneOkBtn");
  if (alreadyDoneOkBtn) {
    alreadyDoneOkBtn.addEventListener("click", function () {
      let modal = document.getElementById("alreadyDoneModal");
      if (modal) modal.classList.remove("show");
    });
  }

  let markDoneBtn = document.getElementById("markDoneBtn");
  if (markDoneBtn) {
    markDoneBtn.addEventListener("click", function (e) {
      let today = getToday();
      if (data.days[today] === "done") {
        e.preventDefault();
        let modal = document.getElementById("alreadyDoneModal");
        if (modal) modal.classList.add("show");
      }
    });
  }
};

// ===============================
// ✅ UPDATE TODAY BADGE (DASHBOARD)
// ===============================
function updateTodayBadge() {
  let today = getToday();
  let badge = document.getElementById("todayBadge");
  if (!badge) return;

  if (data.days[today] === "done") {
    badge.classList.add("show");
  } else {
    badge.classList.remove("show");
  }
}

// ===============================
// ♻️ RESET ALL DATA
// ===============================
function resetData() {
  let modal = document.getElementById("resetModal");
  if (modal) modal.classList.add("show");
}

function confirmReset() {
  localStorage.removeItem("streakData");
  data = { streak: 0, days: {} };
  ensureTrackingStartDate();
  updateUI();
  updateMarkDoneButton();
  closeResetModal();
  let calendarView = document.getElementById("calendarView");
  if (calendarView && calendarView.style.display === "block") {
    renderCalendar(calendarYear, calendarMonth);
  }
  closeResetModal();
}

function closeResetModal() {
  let modal = document.getElementById("resetModal");
  if (modal) modal.classList.remove("show");
}
