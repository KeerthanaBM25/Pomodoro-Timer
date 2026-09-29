const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");
const progressBar = document.getElementById("progressBar");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const sessionCountDisplay =
    document.getElementById("sessionCount");

const settingsForm =
    document.getElementById("settingsForm");

const workInput =
    document.getElementById("workDuration");

const breakInput =
    document.getElementById("breakDuration");

const notificationSelect =
    document.getElementById("notification");

let timerInterval = null;
let isRunning = false;
let isWorkSession = true;

let workDuration = 25;
let breakDuration = 5;

let totalSeconds = workDuration * 60;
let remainingSeconds = totalSeconds;

let sessionCount =
    Number(localStorage.getItem("pomodoroSessions")) || 0;

sessionCountDisplay.textContent = sessionCount;


function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}

function updateDisplay() {

    timerDisplay.textContent =
        formatTime(remainingSeconds);

    const elapsed =
        totalSeconds - remainingSeconds;

    const progress =
        totalSeconds > 0
            ? (elapsed / totalSeconds) * 100
            : 0;

    progressBar.style.width =
        progress + "%";
}

function startTimer() {

    if (isRunning) {
        return;
    }

    isRunning = true;

    statusDisplay.textContent =
        isWorkSession
            ? "Focus Time"
            : "Break Time";

    timerInterval = setInterval(function () {

        if (remainingSeconds > 0) {

            remainingSeconds--;

            updateDisplay();

        } else {

            completeSession();

        }

    }, 1000);
}


function pauseTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    statusDisplay.textContent = "Paused";
}


function resetTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    isWorkSession = true;

    totalSeconds =
        workDuration * 60;

    remainingSeconds =
        totalSeconds;

    statusDisplay.textContent =
        "Ready to Focus";

    updateDisplay();
}


function completeSession() {

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    playNotification();

    if (isWorkSession) {

        sessionCount++;

        localStorage.setItem(
            "pomodoroSessions",
            sessionCount
        );

        sessionCountDisplay.textContent =
            sessionCount;

        isWorkSession = false;

        totalSeconds =
            breakDuration * 60;

        remainingSeconds =
            totalSeconds;

        statusDisplay.textContent =
            "Work Complete! Take a Break";

    } else {
        isWorkSession = true;

        totalSeconds =
            workDuration * 60;

        remainingSeconds =
            totalSeconds;

        statusDisplay.textContent =
            "Break Complete! Ready to Focus";
    }

    updateDisplay();
}

function playNotification() {

    if (
        notificationSelect.value === "silent"
    ) {
        return;
    }

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) {
        return;
    }

    const audioContext =
        new AudioContext();

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = 800;

    gain.gain.value = 0.2;

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.5
    );
}

settingsForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const newWorkDuration =
            Number(workInput.value);

        const newBreakDuration =
            Number(breakInput.value);
        if (
            !Number.isFinite(newWorkDuration) ||
            newWorkDuration < 1 ||
            newWorkDuration > 120
        ) {

            alert(
                "Please enter a work duration between 1 and 120 minutes."
            );

            return;
        }
        if (
            !Number.isFinite(newBreakDuration) ||
            newBreakDuration < 1 ||
            newBreakDuration > 60
        ) {
            alert(
                "Please enter a break duration between 1 and 60 minutes."
            );
            return;
        }
        workDuration =
            newWorkDuration;
        breakDuration =
            newBreakDuration;
        resetTimer();
        alert(
            "Timer settings updated successfully!"
        );
    }
);

startBtn.addEventListener(
    "click",
    startTimer
);

pauseBtn.addEventListener(
    "click",
    pauseTimer
);

resetBtn.addEventListener(
    "click",
    resetTimer
);

updateDisplay();