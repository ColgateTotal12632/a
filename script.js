const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const filters = document.querySelectorAll(".filter");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let draggedIndex = null;


function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


function renderTasks() {
    taskList.innerHTML = "";
    let filteredTasks = tasks.filter(task => {
        const matchesFilter = (currentFilter === "all") ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);
        const matchesSearch = task.text.toLowerCase().includes(searchInput.value.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    filteredTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.draggable = true;
        li.dataset.index = index;
        if (task.completed) li.classList.add("completed");

        const span = document.createElement("span");
        span.textContent = task.text;
        span.addEventListener("click", () => toggleComplete(index));

        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("task-buttons");

        const editBtn = document.createElement("button");
        editBtn.innerHTML = "✏️";
        editBtn.addEventListener("click", () => editTask(index));

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.addEventListener("click", () => deleteTask(index));

        buttonsDiv.appendChild(editBtn);
        buttonsDiv.appendChild(deleteBtn);

        li.appendChild(span);
        li.appendChild(buttonsDiv);
        taskList.appendChild(li);


        li.addEventListener("dragstart", (e) => {
            draggedIndex = index;
            e.dataTransfer.effectAllowed = "move";
        });
        li.addEventListener("dragover", (e) => e.preventDefault());
        li.addEventListener("drop", (e) => {
            e.preventDefault();
            const targetIndex = parseInt(e.target.closest("li").dataset.index);
            if (draggedIndex !== null && draggedIndex !== targetIndex) {
                const [removed] = tasks.splice(draggedIndex, 1);
                tasks.splice(targetIndex, 0, removed);
                saveTasks();
                renderTasks();
            }
        });
    });
}


function addTask() {
    const text = taskInput.value.trim();
    if (text === "") {
        alert("Por favor, insira uma tarefa válida.");
        return;
    }
    tasks.push({ text, completed: false });
    taskInput.value = "";
    saveTasks();
    renderTasks();
}


function deleteTask(index) {
    if (confirm("Tem certeza de que deseja excluir esta tarefa?")) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
}


function editTask(index) {
    const newText = prompt("Editar tarefa:", tasks[index].text);
    if (newText !== null && newText.trim() !== "") {
        tasks[index].text = newText.trim();
        saveTasks();
        renderTasks();
    }
}

function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}


function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeToggle.innerHTML = newTheme === "light" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}


filters.forEach(filter => {
    filter.addEventListener("click", () => {
        filters.forEach(btn => btn.classList.remove("active"));
        filter.classList.add("active");
        currentFilter = filter.dataset.filter;
        renderTasks();
    });
});

searchInput.addEventListener("input", renderTasks);
themeToggle.addEventListener("click", toggleTheme);
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});


const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.innerHTML = savedTheme === "light" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
renderTasks();
