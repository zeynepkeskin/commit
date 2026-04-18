let shuffleCount = 0;
let mode = "normal";
let currentTasks = [];
let selectedTask = null;

let holdProgress = 0;
let holdInterval = null;
let isHolding = false;
let holdStartTime = 0;


/* ---------------- TASK DATA ---------------- */

const tasks = {
  normal: [
    { name: "Study", time: 10 },
    { name: "Clean your desk", time: 10 },
    { name: "Read", time: 10 },
    { name: "Stretch", time: 5 }
  ],

  tired: [
    { name: "Drink water", time: 1 },
    { name: "Sit up", time: 1 },
    { name: "Open notes", time: 1 },
    { name: "Take 3 breaths", time: 1 }
  ]
};

/* ---------------- INIT ---------------- */

window.onload = () => {
  shuffleTasks();
  initHoldEvents();
  resetRadial();
};

/* ---------------- SHUFFLE ---------------- */

function shuffleTasks() {
  shuffleCount++;

  const pool = tasks[mode];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  currentTasks = shuffled.slice(0, 3);

  document.getElementById("task1").textContent =
    `${currentTasks[0].name} (${currentTasks[0].time} min)`;

  document.getElementById("task2").textContent =
    `${currentTasks[1].name} (${currentTasks[1].time} min)`;

  document.getElementById("task3").textContent =
    `${currentTasks[2].name} (${currentTasks[2].time} min)`;

  if (shuffleCount >= 4 && mode === "normal") {
    document.getElementById("too-tired-btn").classList.remove("hidden");
  }
}

/* ---------------- MODE ---------------- */

function showEasyMode() {
  mode = "tired";
  shuffleCount = 0;
  shuffleTasks();
}

/* ---------------- TASK SELECT ---------------- */

function selectTask(index) {
  selectedTask = currentTasks[index];
  if (!selectedTask) return;

  document.getElementById("progress-circle").style.transition =
  "stroke-dashoffset 0.05s linear";

  document.getElementById("hold-task-name").textContent =
    selectedTask.name;

  document.getElementById("hold-task-time").textContent =
    `${selectedTask.time} minutes`;

  document.getElementById("home-screen").classList.add("hidden");
  document.getElementById("hold-screen").classList.remove("hidden");

  resetHoldState();
}

/* ---------------- HOLD SYSTEM ---------------- */

function initHoldEvents() {
  const holdArea = document.getElementById("hold-area");

  holdArea.addEventListener("mousedown", startHold);
  holdArea.addEventListener("mouseup", stopHold);
  holdArea.addEventListener("mouseleave", stopHold);

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

    const speedMultiplier = 1 + elapsed / 1000;
    holdProgress += speedMultiplier * 0.8;

    if (holdProgress >= 100) {
      holdProgress = 100;
      updateHoldUI();
      stopHold();
      startLockAnimation();
      return;
    }

    updateHoldUI();
  }, 16);
}

function stopHold() {
  isHolding = false;
  clearInterval(holdInterval);
  holdInterval = null;

  if (holdProgress < 100) {
    holdProgress = 0;
    updateHoldUI();
  }
}

/* ---------------- RADIAL PROGRESS ---------------- */

function updateHoldUI() {
  const circle = document.getElementById("progress-circle");
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference - (holdProgress / 100) * circumference;

  circle.style.strokeDashoffset = offset;
}

function resetRadial() {
  const circle = document.getElementById("progress-circle");
  circle.style.strokeDasharray = 2 * Math.PI * 70;
  circle.style.strokeDashoffset = 2 * Math.PI * 70;
}

/* ---------------- HOLD RESET ---------------- */

function resetHoldState() {
  holdProgress = 0;
  stopHold();
  resetRadial();
}

/* ---------------- LOCK + TRANSITION ---------------- */

function startLockAnimation() {
  const circle = document.getElementById("progress-circle");
  const text = document.getElementById("hold-task-name");

  text.textContent = "Starting...";

  // Phase 2: quick full sweep animation
  circle.style.transition = "stroke-dashoffset 0.4s ease-out";
  circle.style.strokeDashoffset = "0";

  setTimeout(() => {
    goToNextScreen();
  }, 700);
}

function goToNextScreen() {
  document.getElementById("hold-screen").classList.add("hidden");

  alert("Task started: " + selectedTask.name);
}