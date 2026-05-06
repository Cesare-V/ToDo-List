import "./style.css";
import Project from "./models/Project.js";
import { loadFromStorage, saveToStorage } from "./storage.js";
import { renderProjects, renderMain, initSideBarFilters } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const addProjectBtn = document.querySelector(".add-btn");

  let projects = loadFromStorage();

  // Quando selezioni un progetto, salva anche l'indice
  function setCurrentProject(project) {
    currentProject = project;
    const index = projects.indexOf(project);
    localStorage.setItem("currentProjectIndex", index);
  }

  let currentProject = null;

  if (projects.length > 0) {
    const savedIndex = localStorage.getItem("currentProjectIndex");
    const index = savedIndex !== null ? parseInt(savedIndex) : 0;
    currentProject = projects[index] ?? projects[0];
  }

  const inboxBtn = document.querySelector(".menu-item.active");

  inboxBtn.addEventListener("click", (e) => {
    e.preventDefault();
    renderMain(currentProject, projects);
  });

  addProjectBtn.addEventListener("click", () => {
    const name = prompt("Nome progetto:");
    if (!name) return;

    const newProject = new Project(name);
    projects.push(newProject);
    currentProject = newProject;


    saveToStorage(projects);
    renderProjects(projects, currentProject, setCurrentProject, renderMain);
    renderMain(currentProject, projects);
  });

  if (projects.length > 0) {
    currentProject = projects[0];
    renderMain(currentProject, projects);
  }

  renderProjects(projects, currentProject, setCurrentProject, renderMain);
  initSideBarFilters(projects, () => currentProject, renderMain);
});