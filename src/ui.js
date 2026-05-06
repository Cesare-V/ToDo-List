import Todo from "./models/Todo.js";
import { loadFromStorage, saveToStorage } from "./storage.js";

export function renderProjects(projects, currentProject, setCurrentProject, renderMain) {
  const wrapper = document.querySelector(".project-wrapper");
  wrapper.innerHTML = "";

  projects.forEach((project, index) => {
    const div = document.createElement("div");
    div.textContent = project.name;
    div.classList.add("menu-item");

    div.addEventListener("click", () => {
      setCurrentProject(project);
      renderProjects(projects, project, setCurrentProject, renderMain);
      renderMain(project, projects);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      projects.splice(index, 1);

      const nextProject = projects.length > 0 ? projects[0] : null;
      setCurrentProject(nextProject); saveToStorage(projects); renderProjects(
        projects,
        nextProject,
        setCurrentProject,
        renderMain);
      renderMain(nextProject, projects
      );
      saveToStorage(projects);
      renderMain(currentProject, projects);
    });

    if (project === currentProject) {
      div.classList.add("active");
    }

    div.append(deleteBtn);
    wrapper.appendChild(div);
  });
}

export function renderMain(currentProject, projects) {
  const mainContent = document.querySelector(".main-content");
  mainContent.innerHTML = "";

  if (!currentProject) return;

  const title = document.createElement("h2");
  title.textContent = currentProject.name;

  const form = document.createElement("form");

  const dateInput = document.createElement("Input");
  dateInput.type = "date";

  const input = document.createElement("input");
  input.placeholder = "Nuovo todo...";

  const button = document.createElement("button");
  button.textContent = "Aggiungi";

  button.type = "submit";

  form.append(input, dateInput, button);

  // Evento click Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const value = input.value.trim();
    if (!value) return;

    const todo = new Todo(value, dateInput.value);
    currentProject.addTodo(todo);

    input.value = "";

    saveToStorage(projects);
    renderMain(currentProject, projects);
  });

  mainContent.append(title, form);

  renderTodos(currentProject, projects);
}

function renderTodos(currentProject, projects) {
  const mainContent = document.querySelector(".main-content");

  currentProject.todos.forEach((todo, index) => {
    const div = document.createElement("div");
    div.classList.add("todo-card");

    if (todo.completed) div.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    checkbox.addEventListener("change", () => {
      todo.completed = !todo.completed;
      saveToStorage(projects);
      renderMain(currentProject, projects);
    });

    const text = document.createElement("span");
    text.textContent = todo.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";

    deleteBtn.addEventListener("click", () => {
      currentProject.todos.splice(index, 1);
      saveToStorage(projects);
      renderMain(currentProject, projects);
    });

    div.append(checkbox, text, deleteBtn);
    mainContent.appendChild(div);
  });
}

// Todo di Oggi
function getTodayTodos(projects) {
  const today = new Date().toISOString().split("T")[0];

  return projects.flatMap(p =>
    p.todos.filter(todo => todo.dueDate === today)
  );
}

//Todo di Domani
function getTomorrowTodos(projects) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatted = tomorrow.toISOString().split("T")[0];

  return projects.flatMap(p =>
    p.todos.filter(todo => todo.dueDate === formatted)
  );
}

// Todo di Questa settimana
function getWeekTodos(projects) {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  return projects.flatMap(p =>
    p.todos.filter(todo => {
      if (!todo.dueDate) return false;

      const date = new Date(todo.dueDate);
      return date >= today && date <= nextWeek;
    })
  )
}

function renderFilteredTodos(todos, titleText, autoDate, currentProject, projects) {
  const mainContent = document.querySelector(".main-content");
  mainContent.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = titleText;

  // Form aggiunta todo
  const form = document.createElement("form");
  const input = document.createElement("input");
  input.placeholder = "Nuovo todo..."

  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "Aggiungi";

  form.append(input, button);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value || !currentProject) return;

    const todo = new Todo(value, autoDate); // data automatica
    currentProject.addTodo(todo);
    input.value = "";

    saveToStorage(projects);
    // ri-renderizza la vista filtrata aggiornata
    const updateTodos = getTodosByDate(projects);
    renderFilteredTodos(updatedTodos, titleText, autoDate, currentProject, projects);
  });

  mainContent.appendChild(title, form);

  // Render todos esistenti
  todos.forEach(todo => {
    const div = document.createElement("div");
    div.classList.add(todo - card);
    div.textContent = todo.title;
    mainContent.appendChild(div);
  });

  function getTodosByDate(projects, date) {
    return projects.flatMap(p =>
      p.todos.filter(todo => todo.dueDate === date)
    );
  }
}

export function initSideBarFilters(projects, getCurrentProject, renderMainFn) {
  const inboxBtn = document.querySelector(".menu-item.active");
  const todayBtn = document.querySelector(".today");
  const tomorrowBtn = document.querySelector(".tomorrow");
  const weekBtn = document.querySelector(".week");

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  inboxBtn.addEventListener("click", (e) => {
    e.preventDefault();
    renderMainFn(getCurrentProject(), projects);
  });

  todayBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const todos = getTodayTodos(projects);
    renderFilteredTodos(todos, "Oggi", today, getCurrentProject(), projects);
  });

  tomorrowBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const todos = getTomorrowTodos(projects);
    renderFilteredTodos(todos, "Domani", tomorrowStr, getCurrentProject(), projects);
  });

  weekBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const todos = getWeekTodos(projects);
    renderFilteredTodos(todos, "Questa settimana", today, getCurrentProject(), projects);
  });
}

