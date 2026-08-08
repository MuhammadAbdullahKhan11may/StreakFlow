// ===============================
// 📦 LOAD / INIT DATA
// ===============================
let data = JSON.parse(localStorage.getItem("streakData")) || {
  streak: 0,
  days: {}
};

// Get today's date
function getToday() {
  let d = new Date();
  let year = d.getFullYear();
  let month = String(d.getMonth() + 1).padStart(2, "0");
  let day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ===============================
// 🔥 MARK TODAY AS DONE
// ===============================
function markTodayDone() {
  let today = getToday();

  // Prevent double marking
  if (data.days[today] === "done") {
    alert("Already marked as done today!");
    return;
  }

  data.days[today] = "done";

  // Check yesterday
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let yDate = yesterday.getFullYear() + "-" +
    String(yesterday.getMonth() + 1).padStart(2, "0") + "-" +
    String(yesterday.getDate()).padStart(2, "0");

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
// 🔄 UPDATE UI
// ===============================
function updateUI() {
  updateStreak();
  updateTodayStatus();
  updateProgressList();
  updateStats();
  updateMarkDoneButton();
  updateWeekRow();
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

  let todayItem = document.querySelector(".today-item");

  if (!todayItem) return;

  let pill = todayItem.querySelector(".status-pill");

  if (data.days[today] === "done") {
    pill.innerText = "DONE";
    pill.classList.remove("today-pill");
    pill.classList.add("done-pill");
  }
}

// ===============================
// 📅 UPDATE TODAY STATUS
// ===============================
function updateTodayStatus() {
  let today = getToday();

  let todayItem = document.querySelector(".today-item");

  if (!todayItem) return;

  let pill = todayItem.querySelector(".status-pill");

  if (data.days[today] === "done") {
    pill.innerText = "DONE";
    pill.classList.remove("today-pill");
    pill.classList.add("done-pill");
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
  }
}

// ===============================
// 📊 UPDATE DAY LIST (DYNAMIC)
// ===============================
function updateProgressList() {
  let items = document.querySelectorAll(".day-item");

  items.forEach((item) => {
    let date = item.getAttribute("data-date");
    if (!date) return;

    let status = data.days[date];
    if (!status) return;

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

  if (percentEl) percentEl.innerText = percent + "%";
  if (bar) bar.style.width = percent + "%";
}

// ===============================
// 🚀 INIT ON LOAD
// ===============================
window.onload = function () {
  updateUI();

  // Attach button if exists
  let btn = document.querySelector(".mark-done-btn");
  if (btn) {
    btn.addEventListener("click", markTodayDone);
  }
};
