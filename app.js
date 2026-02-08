const form = document.getElementById("workForm");
const totalHours = document.getElementById("totalHours");
const historyList = document.getElementById("historyList");
const emptyState = document.getElementById("emptyState");
const clearButton = document.getElementById("clearHistory");

const historyKey = "workHoursHistory";

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} ч ${mins} мин`;
};

const parseTimeToMinutes = (value) => {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
};

const loadHistory = () => {
  const stored = localStorage.getItem(historyKey);
  return stored ? JSON.parse(stored) : [];
};

const saveHistory = (entries) => {
  localStorage.setItem(historyKey, JSON.stringify(entries));
};

const renderHistory = (entries) => {
  historyList.innerHTML = "";
  if (entries.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <div>
        <strong>${entry.total}</strong>
        <div class="meta">${entry.date}</div>
      </div>
      <div class="meta">
        ${entry.start} – ${entry.end} · Перерыв ${entry.breakMinutes} мин
      </div>
    `;
    historyList.appendChild(item);
  });
};

const updateTotal = (entries) => {
  if (entries.length === 0) {
    totalHours.textContent = "0 ч 0 мин";
    return;
  }

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  totalHours.textContent = formatMinutes(totalMinutes);
};

const initialHistory = loadHistory();
renderHistory(initialHistory);
updateTotal(initialHistory);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const dateValue = document.getElementById("workDate").value;
  const startValue = document.getElementById("startTime").value;
  const endValue = document.getElementById("endTime").value;
  const breakValue = Number(document.getElementById("breakMinutes").value || 0);

  if (!dateValue || !startValue || !endValue) {
    return;
  }

  const startMinutes = parseTimeToMinutes(startValue);
  const endMinutes = parseTimeToMinutes(endValue);
  const shiftMinutes = endMinutes - startMinutes - breakValue;

  if (shiftMinutes <= 0) {
    alert("Проверьте время: смена должна быть больше нуля.");
    return;
  }

  const entry = {
    date: new Date(dateValue).toLocaleDateString("ru-RU"),
    start: startValue,
    end: endValue,
    breakMinutes: breakValue,
    minutes: shiftMinutes,
    total: formatMinutes(shiftMinutes),
  };

  const updated = [entry, ...loadHistory()];
  saveHistory(updated);
  renderHistory(updated);
  updateTotal(updated);
  form.reset();
});

clearButton.addEventListener("click", () => {
  saveHistory([]);
  renderHistory([]);
  updateTotal([]);
});
