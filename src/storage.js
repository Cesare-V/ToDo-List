import Project from "./models/Project.js";
import Todo from "./models/Todo.js";

export function loadFromStorage() {
  const data = localStorage.getItem("projects");

  if (!data) return [];

  const parsed = JSON.parse(data);

  return parsed.map((proj) => {
    const project = new Project(proj.name);

    proj.todos.forEach((todo) => {
      const newTodo = new Todo(todo.title, todo.dueDate); newTodo.completed = todo.completed;
      newTodo.completed = todo.completed;
      project.addTodo(newTodo);
    });

    return project;
  });
}

export function saveToStorage(projects) {
  localStorage.setItem("projects", JSON.stringify(projects));
}