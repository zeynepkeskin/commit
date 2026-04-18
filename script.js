/* ========================= */
/* GLOBAL STATE */
/* ========================= */

let shuffleCount = 0;
let mode = "normal";
let currentTasks = [];
let selectedTask = null;
let commitCount = 0; 

/* Hold system */
let holdProgress = 0;
let holdInterval = null;
let isHolding = false;
let holdStartTime = 0;

/* Radial progress constants */
const radius = 70;
const circumference = 2 * Math.PI * radius;

/* Timer system */
let timerInterval = null;
let timeLeft = 0;
let totalTime = 0;
let isPaused = false;

/* ========================= */
/* TASK DATA */
/* ========================= */

const tasks = {
  normal: [
    { name: "Study", time: 10 },
    { name: "Clean your desk", time: 10 },
    { name: "Read", time: 10 },
    { name: "Stretch", time: 5 },
  ],

  tired: [
    { name: "Drink water", time: 1 },
    { name: "Sit up", time: 1 },
    { name: "Open notes", time: 1 },
    { name: "Take 3 breaths", time: 1 },
  ],
};

/* ========================= */
/* INIT */
/* ========================= */

window.onload = () => {
  shuffleTasks();
  initHoldEvents();
  resetRadial();
};

/* ========================= */
/* TASK SHUFFLING */
/* ========================= */

function shuffleTasks() {
  shuffleCount++;

  const pool = tasks[mode];

  // randomize task order
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  // take first 3 tasks
  currentTasks = shuffled.slice(0, 3);

  // update UI
  document.getElementById("task1").textContent =
    `${currentTasks[0].name} (${currentTasks[0].time} min)`;

  document.getElementById("task2").textContent =
    `${currentTasks[1].name} (${currentTasks[1].time} min)`;

  document.getElementById("task3").textContent =
    `${currentTasks[2].name} (${currentTasks[2].time} min)`;

  // reveal "too tired" option after multiple shuffles
  if (shuffleCount >= 4 && mode === "normal") {
    document.getElementById("too-tired-btn").classList.remove("hidden");
  }
}

/* ========================= */
/* MODE SWITCHING */
/* ========================= */

function showEasyMode() {
  mode = "tired";
  shuffleCount = 0;
  shuffleTasks();
}

/* ========================= */
/* TASK SELECTION */
/* ========================= */

function selectTask(index) {
  selectedTask = currentTasks[index];
  if (!selectedTask) return;

  // reset animation speed
  document.getElementById("progress-circle").style.transition =
    "stroke-dashoffset 0.05s linear";

  // update hold screen text
  document.getElementById("hold-task-name").textContent = selectedTask.name;
  document.getElementById("hold-task-time").textContent =
    `${selectedTask.time} ${selectedTask.time === 1 ? "minute" : "minutes"}`;

  // switch screens
  document.getElementById("home-screen").classList.add("hidden");
  document.getElementById("hold-screen").classList.remove("hidden");

  resetHoldState();
}

/* ========================= */
/* HOLD SYSTEM */
/* ========================= */

function initHoldEvents() {
  const holdArea = document.getElementById("hold-area");

  // mouse events
  holdArea.addEventListener("mousedown", startHold);
  holdArea.addEventListener("mouseup", stopHold);
  holdArea.addEventListener("mouseleave", stopHold);

  // touch events (mobile)
  holdArea.addEventListener("touchstart", startHold);
  holdArea.addEventListener("touchend", stopHold);
}

function startHold() {
  if (isHolding) return;

  isHolding = true;
  holdProgress = 0;
  holdStartTime = Date.now();

  holdInterval = setInterval(() => {
    const elapsed = Date.now() - holdStartTime;

    // accelerating progress (ramps up over time)
    const speedMultiplier = 1 + elapsed / 1000;
    holdProgress += speedMultiplier * 0.8;

    // completion check
    if (holdProgress >= 100) {
      holdProgress = 100;
      updateHoldUI();
      stopHold();
      startLockAnimation();
      return;
    }

    updateHoldUI();
  }, 16); // ~60fps
}

function stopHold() {
  isHolding = false;

  clearInterval(holdInterval);
  holdInterval = null;

  // reset if not completed
  if (holdProgress < 100) {
    holdProgress = 0;
    updateHoldUI();
  }
}

/* ========================= */
/* RADIAL PROGRESS */
/* ========================= */

function updateHoldUI() {
  const circle = document.getElementById("progress-circle");

  const offset = circumference - (holdProgress / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

function resetRadial() {
  const circle = document.getElementById("progress-circle");

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference;
  circle.style.transition = "stroke-dashoffset 0.05s linear";
}

/* ========================= */
/* HOLD RESET */
/* ========================= */

function resetHoldState() {
  holdProgress = 0;
  stopHold();

  const circle = document.getElementById("progress-circle");
  const container = document.querySelector(".progress-container");

  circle.style.transition = "stroke-dashoffset 0.05s linear";
  circle.style.stroke = "limegreen";
  circle.style.strokeWidth = "6";

  circle.style.strokeDashoffset = circumference;

  container.style.transform = "scale(1)";
}

/* ========================= */
/* LOCK ANIMATION + TRANSITION */
/* ========================= */

function startLockAnimation() {
  const circle = document.getElementById("progress-circle");
  const container = document.querySelector(".progress-container");
  const text = document.getElementById("hold-task-name");

  // 1. LOCK TEXT
  text.textContent = "Locked in.";

  // 2. SNAP CIRCLE FULL
  circle.style.transition = "stroke-dashoffset 0.15s ease-out";
  circle.style.strokeDashoffset = "0";

  // 3. VISUAL EMPHASIS (thicker + brighter + scale)
  circle.style.stroke = "#00ff88";
  circle.style.strokeWidth = "10";

  container.style.transform = "scale(1.08)";
  container.style.transition = "transform 0.2s ease-out";

  // 4. FREEZE MOMENT (intentional pause)
  setTimeout(() => {
    goToTimerScreen();
  }, 500);
}

/* ========================= */
/* TIMER SYSTEM */
/* ========================= */

function startTimer(minutes) {
  clearInterval(timerInterval);

  totalTime = minutes * 60;
  timeLeft = totalTime;
  isPaused = false;

  updateTimerUI();

  timerInterval = setInterval(() => {
    if (isPaused) return;

    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerFinished();
    }
  }, 1000);
}

function updateTimerUI() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // update text display
  document.getElementById("timer-countdown").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // update progress bar
  const progress = 1 - timeLeft / totalTime;
  const bar = document.getElementById("timer-bar");

  if (bar) {
    bar.style.width = `${progress * 100}%`;
  }
}

function timerFinished() {
commitCount++;
document.getElementById("completion-streak").textContent =
  `Today’s commits: ${commitCount}`;

  document.getElementById("timer-screen").classList.add("hidden");
  document.getElementById("completion-screen").classList.remove("hidden");

  // populate completion screen
  document.getElementById("completion-task-name").textContent =
    selectedTask.name;

  document.getElementById("completion-time-spent").textContent =
    `${selectedTask.time} ${selectedTask.time === 1 ? "minute" : "minutes"} completed`;

  document.getElementById("completion-title").textContent = "Task Complete";

  // simple reinforcement stat (placeholder for now)
  document.getElementById("completion-streak").textContent =
    "Today’s commits: 1";
}

function returnToHome() {
  document.getElementById("timer-screen").classList.add("hidden");
  document.getElementById("home-screen").classList.remove("hidden");

  selectedTask = null;
}

/* ========================= */
/* TIMER CONTROLS */
/* ========================= */

function goToTimerScreen() {
  document.getElementById("hold-screen").classList.add("hidden");
  document.getElementById("timer-screen").classList.remove("hidden");

  document.getElementById("timer-task-name").textContent =
    selectedTask.name;

  resetTimerUI();
  startTimer(selectedTask.time);
}

function toggleTimer() {
  isPaused = !isPaused;

  const btn = document.getElementById("pause-btn");
  const quitBtn = document.getElementById("quit-btn");
  const msg = document.getElementById("pause-message");

  if (isPaused) {
    btn.textContent = "Resume";
    quitBtn.classList.remove("hidden");
    msg.classList.remove("hidden");
  } else {
    btn.textContent = "Pause";
    quitBtn.classList.add("hidden");
    msg.classList.add("hidden");
  }
}

function quitToHome() {
  clearInterval(timerInterval);

  document.getElementById("timer-screen").classList.add("hidden");
  document.getElementById("home-screen").classList.remove("hidden");

  resetHoldState();
}

function resetTimerUI() {
  isPaused = false;

  document.getElementById("pause-btn").textContent = "Pause";
  document.getElementById("quit-btn").classList.add("hidden");
  document.getElementById("pause-message").classList.add("hidden");
}

function returnToHomeFromCompletion() {
  document.getElementById("completion-screen").classList.add("hidden");
  document.getElementById("home-screen").classList.remove("hidden");

  // reset state
  selectedTask = null;

  // optional cleanup (prevents weird carryover bugs)
  timeLeft = 0;
  totalTime = 0;
  isPaused = false;
}

/* ========================= */
/* CUSTOM TASK */
/* ========================= */

function createCustomTask() {
  const name = document.getElementById("custom-task-name").value;
  const time = parseInt(document.getElementById("custom-task-time").value);

  if (!name || !time || time <= 0) return;

  selectedTask = {
    name: name,
    time: time,
  };

  // clear inputs (UX)
  document.getElementById("custom-task-name").value = "";
  document.getElementById("custom-task-time").value = "";

  // go directly to hold screen
  document.getElementById("hold-task-name").textContent = selectedTask.name;
  document.getElementById("hold-task-time").textContent =
    `${selectedTask.time} ${selectedTask.time === 1 ? "minute" : "minutes"}`;

  document.getElementById("home-screen").classList.add("hidden");
  document.getElementById("hold-screen").classList.remove("hidden");

  resetHoldState();
}
