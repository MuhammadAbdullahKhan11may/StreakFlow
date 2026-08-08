// ===============================
// 📦 LOAD / INIT DATA
// ===============================
let data = JSON.parse(localStorage.getItem("streakData")) || {
  streak: 0,
  days: {}
};

// Get today's date
function getToday() {
  return new Date().toISOString().split("T")[0];
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
  let yDate = yesterday.toISOString().split("T")[0];

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
// 📊 UPDATE DAY LIST (DYNAMIC)
// ===============================
function updateProgressList() {
  let items = document.querySelectorAll(".day-item");

  let dates = Object.keys(data.days);

  items.forEach((item, index) => {
    let date = dates[index];
    if (!date) return;

    let status = data.days[date];

    let pill = item.querySelector(".status-pill");
    let icon = item.querySelector(".status-icon");

    if (status === "done") {
      pill.innerText = "DONE";
      pill.className = "status-pill done-pill";
      icon.innerText = "✓";
    } else if (status === "missed") {
      pill.innerText = "MISSED";
      pill.className = "status-pill missed-pill";
      icon.innerText = "✕";
    }
  });
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
