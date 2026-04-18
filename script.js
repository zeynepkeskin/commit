let shuffleCount = 0;
let mode = "normal";
let currentTasks = [];
let selectedTask = null;

let holdProgress = 0;
let holdInterval = null;
let isHolding = false;
let holdStartTime = 0;


const holdArea = document.getElementById("hold-area");
holdArea.addEventListener("mousedown", startHold);
holdArea.addEventListener("mouseup", stopHold);
holdArea.addEventListener("mouseleave", stopHold);

// mobile support
holdArea.addEventListener("touchstart", startHold);
holdArea.addEventListener("touchend", stopHold);

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

function shuffleTasks() {
  shuffleCount++;

  const pool = tasks[mode];

  // shuffle + select 3
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  currentTasks = shuffled.slice(0, 3);

  document.getElementById("task1").textContent =
    `${currentTasks[0].name} (${currentTasks[0].time} min)`;

  document.getElementById("task2").textContent =
    `${currentTasks[1].name} (${currentTasks[1].time} min)`;

  document.getElementById("task3").textContent =
    `${currentTasks[2].name} (${currentTasks[2].time} min)`;

    if ( shuffleCount >= 4 && mode === "normal") {
        document.getElementById("too-tired-btn").classList.remove("hidden");
    }

}
shuffleTasks();

function showEasyMode() {
  mode = "tired";
  shuffleTasks();
}

function selectTask(index) {
    // get task from current state
    selectedTask = currentTasks[index];

    if (!selectedTask) return;

    // update hold screen UI
    document.getElementById("hold-task-name").textContent = selectedTask.name;

    document.getElementById("hold-task-time").textContent = `${selectedTask.time} minutes`;

    // switch screens
    document.getElementById("home-screen").classList.add("hidden");
    document.getElementById("hold-screen").classList.remove("hidden");
}

function startHold() {
  if (isHolding) return;

  isHolding = true;
  holdProgress = 0;
  holdStartTime = Date.now();

  holdInterval = setInterval(() => {
    const elapsed = Date.now() - holdStartTime;

    // acceleration curve 
    // starts slow, speeds up over time
    const speedMultiplier = 1 + elapsed / 1000; // ramps up

    holdProgress += speedMultiplier * 0.8;

    if (holdProgress >= 100) {
      holdProgress = 100;
      updateHoldUI();
      startLockAnimation();
      stopHold();
      return;
    }

    updateHoldUI();
  }, 16); // ~60fps
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

function updateHoldUI() {
  const circle = document.getElementById("progress-circle");
  circle.style.transform = `scale(${holdProgress / 100})`;
}

function startLockAnimation() {
  const circle = document.getElementById("progress-circle");
  const text = document.getElementById("hold-task-name");

  text.textContent = "Starting...";

  circle.classList.add("lock-spin");

  setTimeout(() => {
    goToNextScreen();
  }, 600);
}

function goToNextScreen() {
  document.getElementById("hold-screen").classList.add("hidden");
  // placeholder for next screen (timer screen later)
  alert("Task started: " + selectedTask.name);
}


