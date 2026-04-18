let shuffleCount = 0;
let mode = "normal";

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

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  document.getElementById("task1").textContent =
    `${selected[0].name} (${selected[0].time} min)`;

  document.getElementById("task2").textContent =
    `${selected[1].name} (${selected[1].time} min)`;

  document.getElementById("task3").textContent =
    `${selected[2].name} (${selected[2].time} min)`;

    if ( shuffleCount >= 3 && mode === "normal") {
        document.getElementById("too-tired-btn").classList.remove("hidden");
    }

}

function showEasyMode() {
  mode = "tired";
  shuffleTasks();
}

