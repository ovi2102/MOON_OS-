const MODULES = {
  'current-mission': {
    title: 'Current mission',
    description: 'The task currently in focus. Assign it from the command dashboard by typing a task or dropping a task card.'
  },
  'next-mission': {
    title: 'Next mission',
    description: 'The task queued for what comes next. Assign it from the command dashboard when your priorities shift.'
  },
  timetable: {
    title: 'Calendar timetable',
    description: 'AY 2026-27 · Semester 1 · Semiconductor Engineering · F3 schedule'
  },
  'daily-logs': {
    title: 'Daily logs',
    description: 'Choose a date to review, update, and keep an accountable record of your tasks.'
  },
  archive: {
    title: 'Archive',
    description: 'Completed tasks removed from the active board and kept here for reference.'
  },
  projects: {
    title: 'Projects',
    description: 'Create and keep track of your projects.'
  },
  project: {
    title: 'Project details',
    description: 'Project overview, notes, and linked tasks.'
  },
  'activity-timer': {
    title: 'Activity timer',
    description: 'Track time spent on an activity and save each session to Daily Logs.'
  }
};

const TIMETABLE_EVENTS = [
  { day: 1, start: '09:30', end: '10:30', title: 'ASIC Overview', professor: 'Dr. Rashmi Deshpande', venue: 'CR-20Y' },
  { day: 1, start: '10:30', end: '11:30', title: 'IKS', professor: 'Dr. Vanita Daddi', venue: 'CR-20Y' },
  { day: 1, start: '11:40', end: '13:40', title: 'BCP', batch: 'F3', professor: 'LB', venue: 'AIML' },
  { day: 1, start: '14:30', end: '15:30', title: 'ASIC Overview TUT F3', professor: 'Dr. Rashmi Deshpande', venue: 'AIML' },
  { day: 2, start: '09:30', end: '10:30', title: 'BEE', professor: 'Mrs. Munmun Kakkar', venue: 'CR-20Y' },
  { day: 2, start: '10:30', end: '11:30', title: 'BFE', professor: 'Mrs. Mohini S Avatade', venue: 'CR-20Y' },
  { day: 2, start: '11:40', end: '12:40', title: 'ACM-I', professor: 'Dr. Vanita Daddi', venue: 'CR-20X' },
  { day: 2, start: '12:40', end: '13:40', title: 'BEE', professor: 'Mrs. Munmun Kakkar', venue: 'CR-20X' },
  { day: 2, start: '14:30', end: '16:30', title: 'SELF-STUDY', venue: 'CR-20Y' },
  { day: 3, start: '09:30', end: '10:30', title: 'ACM-I TUT F3', professor: 'Dr. Vanita Daddi', venue: 'CR-20Y' },
  { day: 3, start: '11:40', end: '12:40', title: 'ASIC Overview', professor: 'Dr. Rashmi Deshpande', venue: 'CR-20X' },
  { day: 3, start: '12:40', end: '13:40', title: 'ACM-I', professor: 'Dr. Vanita Daddi', venue: 'CR-20X' },
  { day: 3, start: '14:30', end: '16:30', title: 'BEE', batch: 'F3', professor: 'Mrs. Munmun Kakkar', venue: 'ADSL' },
  { day: 4, start: '09:30', end: '10:30', title: 'EG', professor: 'Mr. Chetan Pawar', venue: 'CR-20Y' },
  { day: 4, start: '10:30', end: '11:30', title: 'ACM-I TUT F3', professor: 'Dr. Vanita Daddi', venue: 'CR-20Y' },
  { day: 4, start: '11:40', end: '12:40', title: 'BEE', professor: 'Mrs. Munmun Kakkar', venue: 'CR-20X' },
  { day: 4, start: '12:40', end: '13:40', title: 'SELF-STUDY', venue: 'CR-20X' },
  { day: 4, start: '14:30', end: '16:30', title: 'EG', batch: 'F3', professor: 'Mr. Chetan Pawar', venue: 'CR-20Z' },
  { day: 5, start: '09:30', end: '10:30', title: 'ASIC Overview', professor: 'Dr. Rashmi Deshpande', venue: 'CR-20Z' },
  { day: 5, start: '10:30', end: '11:30', title: 'BEE', professor: 'Mrs. Munmun Kakkar', venue: 'CR-20Z' },
  { day: 5, start: '11:40', end: '12:40', title: 'TG Meet' },
  { day: 5, start: '12:40', end: '13:40', title: 'Library' },
  { day: 5, start: '14:30', end: '16:30', title: 'SELF-STUDY', venue: 'CR-20Y' },
  { day: 6, start: '09:30', end: '11:30', title: 'Revision Session' },
  { day: 6, start: '11:40', end: '13:40', title: 'Value Added Courses' },
  { day: 6, start: '14:30', end: '16:30', title: 'Guest Lecture/Industry Visit' }
];

const DAILY_LOG_STORAGE_KEY = 'moon_daily_logs_v1';
const PROJECT_STORAGE_KEY = 'moon_projects_v1';
const ACTIVITY_TIMER_STORAGE_KEY = 'moon_activity_timer_v1';
let dailyLogEntries = [];
let selectedLogDateKey = '';
let displayedLogMonth = '';
let editingLogId = null;
let dailyLogWorkspace = null;
let selectedTimetableDateKey = '';

function addText(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function renderClock() {
  const now = new Date();
  document.getElementById('module-clock').textContent = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(now) + ' IST';
}

function readStorage(key, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    return stored ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function renderMission(content, key) {
  const assignments = readStorage('moon_mission_assignments_v1', {});
  const task = assignments[key];
  const list = addText(content, 'div', 'module-data-list', '');
  const row = document.createElement('div');
  row.className = 'module-data-row';
  addText(row, 'span', '', task ? task.title : 'No task assigned');
  addText(row, 'span', '', task ? 'ASSIGNED' : 'EMPTY');
  list.append(row);
}

function getISTDateKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isValidDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || '')) return false;
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function getLogDateKey(log) {
  if (isValidDateKey(log.dateKey)) return log.dateKey;
  const createdAt = new Date(log.createdAt);
  return Number.isNaN(createdAt.getTime()) ? getISTDateKey(new Date()) : getISTDateKey(createdAt);
}

function makeDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function formatLogDate(dateKey, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat('en-IN', { ...options, timeZone: 'UTC' }).format(dateFromKey(dateKey));
}

function saveDailyLogEntries() {
  localStorage.setItem(DAILY_LOG_STORAGE_KEY, JSON.stringify(dailyLogEntries));
}

function updateSelectedDate(dateKey) {
  selectedLogDateKey = dateKey;
  displayedLogMonth = dateKey.slice(0, 7);
  editingLogId = null;
  const url = new URL(window.location.href);
  url.searchParams.set('date', dateKey);
  window.history.replaceState({}, '', url);
  renderDailyLogWorkspace();
}

function changeDisplayedMonth(amount) {
  const [year, month] = displayedLogMonth.split('-').map(Number);
  const nextMonth = new Date(Date.UTC(year, month - 1 + amount, 1));
  const nextYear = nextMonth.getUTCFullYear();
  const nextMonthNumber = nextMonth.getUTCMonth() + 1;
  const selectedDay = Number(selectedLogDateKey.slice(-2));
  const daysInMonth = new Date(Date.UTC(nextYear, nextMonthNumber, 0)).getUTCDate();
  updateSelectedDate(makeDateKey(nextYear, nextMonthNumber, Math.min(selectedDay, daysInMonth)));
}

function renderDailyLogWorkspace() {
  dailyLogWorkspace.replaceChildren();
  const [year, month] = displayedLogMonth.split('-').map(Number);
  const calendar = document.createElement('section');
  calendar.className = 'daily-calendar-panel';
  const toolbar = document.createElement('div');
  toolbar.className = 'daily-calendar-toolbar';

  const previousMonth = addText(toolbar, 'button', 'calendar-nav-button', '<');
  previousMonth.type = 'button';
  previousMonth.setAttribute('aria-label', 'Previous month');
  previousMonth.addEventListener('click', () => changeDisplayedMonth(-1));
  addText(toolbar, 'h2', '', formatLogDate(`${displayedLogMonth}-01`, { month: 'long', year: 'numeric' }));
  const todayButton = addText(toolbar, 'button', 'calendar-today-button', 'TODAY');
  todayButton.type = 'button';
  todayButton.addEventListener('click', () => updateSelectedDate(getISTDateKey(new Date())));
  const nextMonth = addText(toolbar, 'button', 'calendar-nav-button', '>');
  nextMonth.type = 'button';
  nextMonth.setAttribute('aria-label', 'Next month');
  nextMonth.addEventListener('click', () => changeDisplayedMonth(1));
  calendar.append(toolbar);

  const grid = document.createElement('div');
  grid.className = 'daily-calendar-grid';
  ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].forEach(day => addText(grid, 'div', 'daily-weekday', day));
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const counts = new Map();
  dailyLogEntries.forEach(log => {
    const key = getLogDateKey(log);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  for (let blank = 0; blank < offset; blank += 1) addText(grid, 'div', 'daily-date-empty', '');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = makeDateKey(year, month, day);
    const count = counts.get(dateKey) || 0;
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'daily-date-cell';
    cell.setAttribute('aria-label', `${formatLogDate(dateKey)}, ${count} log task${count === 1 ? '' : 's'}`);
    if (dateKey === selectedLogDateKey) cell.classList.add('is-selected');
    if (dateKey === getISTDateKey(new Date())) cell.classList.add('is-today');
    if (count) cell.classList.add('has-logs');
    addText(cell, 'span', 'daily-date-number', String(day));
    if (count) addText(cell, 'span', 'daily-date-count', String(count));
    cell.addEventListener('click', () => updateSelectedDate(dateKey));
    grid.append(cell);
  }
  calendar.append(grid);
  dailyLogWorkspace.append(calendar);

  const selectedPanel = document.createElement('section');
  selectedPanel.className = 'daily-selected-panel';
  addText(selectedPanel, 'div', 'module-kicker', 'ACCOUNTABILITY RECORD');
  addText(selectedPanel, 'h2', 'daily-selected-date', formatLogDate(selectedLogDateKey));
  const dateLogs = dailyLogEntries.filter(log => getLogDateKey(log) === selectedLogDateKey);
  const doneCount = dateLogs.filter(log => log.completed).length;
  addText(selectedPanel, 'p', 'daily-selected-summary', `${doneCount} / ${dateLogs.length} TASKS COMPLETE`);

  const addForm = document.createElement('form');
  addForm.className = 'daily-entry-form';
  const addInput = document.createElement('input');
  addInput.type = 'text';
  addInput.placeholder = 'Add a task for this date';
  addInput.setAttribute('aria-label', 'Task for selected date');
  addInput.required = true;
  const addButton = addText(addForm, 'button', '', 'ADD TASK');
  addButton.type = 'submit';
  addForm.prepend(addInput);
  addForm.addEventListener('submit', event => {
    event.preventDefault();
    const text = addInput.value.trim();
    if (!text) return;
    dailyLogEntries.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      completed: false,
      dateKey: selectedLogDateKey,
      createdAt: new Date().toISOString()
    });
    saveDailyLogEntries();
    renderDailyLogWorkspace();
  });
  selectedPanel.append(addForm);

  const entryList = document.createElement('div');
  entryList.className = 'daily-entry-list';
  if (!dateLogs.length) addText(entryList, 'p', 'daily-empty-state', 'No tasks recorded for this day.');
  dateLogs.forEach(log => renderDailyLogEntry(entryList, log));
  selectedPanel.append(entryList);
  dailyLogWorkspace.append(selectedPanel);
}

function renderDailyLogEntry(list, log) {
  const row = document.createElement('article');
  row.className = log.completed ? 'daily-entry is-complete' : 'daily-entry';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(log.completed);
  checkbox.setAttribute('aria-label', `Mark ${log.text} complete`);
  checkbox.addEventListener('change', () => {
    log.completed = checkbox.checked;
    saveDailyLogEntries();
    renderDailyLogWorkspace();
  });
  row.append(checkbox);

  if (String(log.id) === String(editingLogId)) {
    const editForm = document.createElement('form');
    editForm.className = 'daily-edit-form';
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = log.text;
    editInput.setAttribute('aria-label', 'Edit daily log task');
    editInput.required = true;
    editForm.prepend(editInput);
    const saveButton = addText(editForm, 'button', '', 'SAVE');
    saveButton.type = 'submit';
    const cancelButton = addText(editForm, 'button', '', 'CANCEL');
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', () => {
      editingLogId = null;
      renderDailyLogWorkspace();
    });
    editForm.addEventListener('submit', event => {
      event.preventDefault();
      const text = editInput.value.trim();
      if (!text) return;
      log.text = text;
      log.updatedAt = new Date().toISOString();
      editingLogId = null;
      saveDailyLogEntries();
      renderDailyLogWorkspace();
    });
    row.append(editForm);
  } else {
    addText(row, 'span', 'daily-entry-text', log.text);
    const time = log.createdAt ? new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit'
    }).format(new Date(log.createdAt)) : '';
    const duration = log.durationSeconds ? `${formatActivityDuration(log.durationSeconds)} // ` : '';
    addText(row, 'time', 'daily-entry-time', `${duration}${time}`);
    const actions = document.createElement('div');
    actions.className = 'daily-entry-actions';
    const editButton = addText(actions, 'button', '', 'EDIT');
    editButton.type = 'button';
    editButton.addEventListener('click', () => {
      editingLogId = log.id;
      renderDailyLogWorkspace();
    });
    const deleteButton = addText(actions, 'button', '', 'DELETE');
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', () => {
      dailyLogEntries = dailyLogEntries.filter(entry => String(entry.id) !== String(log.id));
      saveDailyLogEntries();
      renderDailyLogWorkspace();
    });
    row.append(actions);
  }
  list.append(row);
}

function renderDailyLogs(content) {
  const savedLogs = readStorage(DAILY_LOG_STORAGE_KEY, []);
  dailyLogEntries = Array.isArray(savedLogs) ? savedLogs : [];
  const todayKey = getISTDateKey(new Date());
  const requestedDate = new URLSearchParams(window.location.search).get('date');
  selectedLogDateKey = isValidDateKey(requestedDate) ? requestedDate : todayKey;
  displayedLogMonth = selectedLogDateKey.slice(0, 7);
  dailyLogWorkspace = document.createElement('div');
  dailyLogWorkspace.className = 'daily-log-workspace';
  content.append(dailyLogWorkspace);
  renderDailyLogWorkspace();
}

function renderArchive(content) {
  const tasks = readStorage('moon_archived_tasks_v1', []);
  const list = document.createElement('div');
  list.className = 'module-data-list';
  if (!tasks.length) {
    const row = document.createElement('div');
    row.className = 'module-data-row';
    addText(row, 'span', '', 'No archived tasks yet');
    list.append(row);
  }

  tasks.forEach(task => {
    const row = document.createElement('div');
    row.className = 'module-data-row';
    addText(row, 'span', '', task.title);
    const date = task.archivedAt ? new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date(task.archivedAt)) : 'ARCHIVED';
    addText(row, 'span', '', date);
    list.append(row);
  });
  content.append(list);
}

function renderProjects(content) {
  const savedProjects = readStorage(PROJECT_STORAGE_KEY, []);
  projectEntries = Array.isArray(savedProjects) ? savedProjects : [];

  const toolbar = document.createElement('div');
  toolbar.className = 'projects-toolbar';
  const addButton = addText(toolbar, 'button', 'project-add-button', '+ ADD PROJECT');
  addButton.type = 'button';
  addButton.addEventListener('click', openProjectModal);
  content.append(toolbar);

  projectListElement = document.createElement('div');
  projectListElement.className = 'project-list module-data-list';
  content.append(projectListElement);
  renderProjectList();
  bindProjectModal();
}

let projectEntries = [];
let projectListElement = null;

function renderProjectList() {
  projectListElement.replaceChildren();
  if (!projectEntries.length) {
    addText(projectListElement, 'p', 'daily-empty-state', 'No projects yet. Add your first project when you are ready.');
    return;
  }

  projectEntries.forEach(project => {
    const row = document.createElement('article');
    row.className = 'project-record';
    const copy = document.createElement('div');
    copy.className = 'project-record-copy';
    const nameLink = addText(copy, 'a', 'project-name-link', project.name);
    nameLink.href = `module.html?view=project&projectId=${encodeURIComponent(project.id)}`;
    if (project.description) addText(copy, 'p', '', project.description);
    if (project.startDate) addText(copy, 'p', 'project-start-date', `STARTED ${formatLogDate(project.startDate)}`);
    row.append(copy);
    const actions = document.createElement('div');
    actions.className = 'project-row-actions';
    if (project.phase) addText(actions, 'span', 'project-phase', project.phase);
    const deleteButton = addText(actions, 'button', 'project-delete-button', 'DELETE');
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Delete ${project.name}`);
    deleteButton.addEventListener('click', () => deleteProject(project));
    row.append(actions);
    projectListElement.append(row);
  });
}

function deleteProject(project) {
  const tasks = readStorage('moon_dashboard_tasks_v1', []);
  const linkedTasks = tasks.filter(task => String(task.projectId) === String(project.id)).length;
  const taskMessage = linkedTasks
    ? ` ${linkedTasks} linked task${linkedTasks === 1 ? '' : 's'} will stay on the dashboard as Unassigned.`
    : '';
  if (!window.confirm(`Delete project "${project.name}"?${taskMessage}`)) return;

  projectEntries = projectEntries.filter(item => String(item.id) !== String(project.id));
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectEntries));
  tasks.forEach(task => {
    if (String(task.projectId) !== String(project.id)) return;
    delete task.projectId;
    task.project = 'Unassigned';
  });
  localStorage.setItem('moon_dashboard_tasks_v1', JSON.stringify(tasks));
  renderProjectList();
}

function openProjectModal() {
  document.getElementById('project-form').reset();
  document.getElementById('project-form-error').textContent = '';
  document.getElementById('project-start-date-input').value = getISTDateKey(new Date());
  document.getElementById('project-modal').classList.remove('hidden');
  document.getElementById('project-name-input').focus();
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.add('hidden');
}

function bindProjectModal() {
  document.getElementById('close-project-modal').addEventListener('click', closeProjectModal);
  document.getElementById('cancel-project').addEventListener('click', closeProjectModal);
  document.getElementById('project-modal').addEventListener('click', event => {
    if (event.target.id === 'project-modal') closeProjectModal();
  });
  document.getElementById('project-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('project-name-input').value.trim();
    const description = document.getElementById('project-description-input').value.trim();
    const startDate = document.getElementById('project-start-date-input').value;
    const error = document.getElementById('project-form-error');
    if (projectEntries.some(project => project.name.toLowerCase() === name.toLowerCase())) {
      error.textContent = 'A project with this name already exists.';
      return;
    }
    projectEntries.unshift({
      id: Date.now(),
      name,
      description,
      startDate,
      notes: '',
      phase: '',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectEntries));
    closeProjectModal();
    renderProjectList();
  });
}

function renderProjectDetail(content) {
  const projectId = new URLSearchParams(window.location.search).get('projectId');
  const savedProjects = readStorage(PROJECT_STORAGE_KEY, []);
  projectEntries = Array.isArray(savedProjects) ? savedProjects : [];
  const project = projectEntries.find(item => String(item.id) === String(projectId));
  content.replaceChildren();

  const backLink = addText(content, 'a', 'project-back-link', '< ALL PROJECTS');
  backLink.href = 'module.html?view=projects';
  if (!project) {
    addText(content, 'h1', '', 'Project not found');
    addText(content, 'p', 'module-description', 'This project may have been removed.');
    return;
  }

  addText(content, 'div', 'module-kicker', 'MOON_OS / PROJECT RECORD');
  addText(content, 'h1', 'project-detail-title', project.name);
  const detailsForm = document.createElement('form');
  detailsForm.id = 'project-details-form';
  detailsForm.className = 'project-details-form';
  addProjectField(detailsForm, 'Project name', 'project-detail-name', 'text', project.name);
  addProjectField(detailsForm, 'Start date', 'project-detail-start', 'date', project.startDate || '');
  addProjectField(detailsForm, 'Current phase', 'project-detail-phase', 'text', project.phase || '');
  addProjectField(detailsForm, 'Description', 'project-detail-description', 'textarea', project.description || '');
  addProjectField(detailsForm, 'Notes', 'project-detail-notes', 'textarea', project.notes || '');
  const saveButton = addText(detailsForm, 'button', 'project-save-button', 'SAVE PROJECT DETAILS');
  saveButton.type = 'submit';
  detailsForm.addEventListener('submit', event => {
    event.preventDefault();
    const previousName = project.name;
    project.name = document.getElementById('project-detail-name').value.trim() || previousName;
    project.startDate = document.getElementById('project-detail-start').value;
    project.phase = document.getElementById('project-detail-phase').value.trim();
    project.description = document.getElementById('project-detail-description').value.trim();
    project.notes = document.getElementById('project-detail-notes').value;
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectEntries));

    const tasks = readStorage('moon_dashboard_tasks_v1', []);
    tasks.forEach(task => {
      if (String(task.projectId) === String(project.id)) task.project = project.name;
    });
    localStorage.setItem('moon_dashboard_tasks_v1', JSON.stringify(tasks));
    renderProjectDetail(content);
  });
  content.append(detailsForm);

  addText(content, 'h2', 'project-tasks-heading', 'TASK LIST');
  const taskForm = document.createElement('form');
  taskForm.className = 'project-task-form';
  const taskTitle = document.createElement('input');
  taskTitle.type = 'text';
  taskTitle.placeholder = 'Task name';
  taskTitle.setAttribute('aria-label', 'New project task');
  taskTitle.required = true;
  taskForm.append(taskTitle);
  const dueDate = document.createElement('input');
  dueDate.type = 'date';
  dueDate.setAttribute('aria-label', 'Task due date');
  taskForm.append(dueDate);
  const priority = document.createElement('select');
  priority.setAttribute('aria-label', 'Task priority');
  ['High', 'Medium', 'Low'].forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    priority.append(option);
  });
  priority.value = 'Medium';
  taskForm.append(priority);
  const addTaskButton = addText(taskForm, 'button', '', 'ADD TO TASK BOARD');
  addTaskButton.type = 'submit';
  taskForm.addEventListener('submit', event => {
    event.preventDefault();
    const title = taskTitle.value.trim();
    if (!title) return;
    const tasks = readStorage('moon_dashboard_tasks_v1', []);
    tasks.push({
      id: Date.now(),
      title,
      project: project.name,
      projectId: project.id,
      priority: priority.value,
      due: dueDate.value,
      tag: '',
      status: 'todo'
    });
    localStorage.setItem('moon_dashboard_tasks_v1', JSON.stringify(tasks));
    renderProjectDetail(content);
  });
  content.append(taskForm);

  const taskList = document.createElement('div');
  taskList.className = 'project-task-list';
  const linkedTasks = readStorage('moon_dashboard_tasks_v1', []).filter(task => String(task.projectId) === String(project.id));
  if (!linkedTasks.length) addText(taskList, 'p', 'daily-empty-state', 'No tasks for this project yet.');
  linkedTasks.forEach(task => renderProjectTask(taskList, project, task));
  content.append(taskList);
}

function addProjectField(form, labelText, id, type, value) {
  const label = document.createElement('label');
  label.className = 'project-field';
  addText(label, 'span', '', labelText);
  const control = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
  control.id = id;
  if (type !== 'textarea') control.type = type;
  control.value = value;
  if (id === 'project-detail-description') control.rows = 3;
  if (id === 'project-detail-notes') control.rows = 5;
  label.append(control);
  form.append(label);
}

function renderProjectTask(list, project, task) {
  const row = document.createElement('article');
  row.className = 'project-task-row';
  addText(row, 'strong', '', task.title);

  const due = document.createElement('input');
  due.type = 'date';
  due.value = /^\d{4}-\d{2}-\d{2}$/.test(task.due || '') ? task.due : '';
  due.setAttribute('aria-label', `Due date for ${task.title}`);
  due.addEventListener('change', () => updateLinkedTask(project, task.id, { due: due.value }));
  row.append(due);

  const status = document.createElement('select');
  status.setAttribute('aria-label', `Status for ${task.title}`);
  [['todo', 'To-do'], ['due-soon', 'Due soon'], ['in-progress', 'In progress'], ['done', 'Done']].forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    status.append(option);
  });
  status.value = task.status;
  status.addEventListener('change', () => updateLinkedTask(project, task.id, { status: status.value }));
  row.append(status);

  const deleteButton = addText(row, 'button', 'project-task-delete', 'REMOVE');
  deleteButton.type = 'button';
  deleteButton.addEventListener('click', () => {
    const tasks = readStorage('moon_dashboard_tasks_v1', []).filter(item => item.id !== task.id);
    localStorage.setItem('moon_dashboard_tasks_v1', JSON.stringify(tasks));
    renderProjectDetail(document.getElementById('module-content'));
  });
  list.append(row);
}

function updateLinkedTask(project, taskId, updates) {
  const tasks = readStorage('moon_dashboard_tasks_v1', []);
  const task = tasks.find(item => item.id === taskId && String(item.projectId) === String(project.id));
  if (!task) return;
  Object.assign(task, updates);
  localStorage.setItem('moon_dashboard_tasks_v1', JSON.stringify(tasks));
}

let activityTimerState = null;
let activityTimerRefreshHandle = null;

function loadActivityTimerState() {
  const saved = readStorage(ACTIVITY_TIMER_STORAGE_KEY, null);
  if (!saved || typeof saved !== 'object') {
    return { taskName: '', taskId: null, status: 'idle', elapsedMs: 0, startedAt: null, sessionStartedAt: null, feedback: '' };
  }
  const status = ['idle', 'running', 'paused'].includes(saved.status) ? saved.status : 'idle';
  return {
    taskName: typeof saved.taskName === 'string' ? saved.taskName : '',
    taskId: saved.taskId == null ? null : String(saved.taskId),
    status,
    elapsedMs: Number.isFinite(saved.elapsedMs) ? Math.max(0, saved.elapsedMs) : 0,
    startedAt: status === 'running' && Number.isFinite(saved.startedAt) ? saved.startedAt : null,
    sessionStartedAt: Number.isFinite(saved.sessionStartedAt)
      ? saved.sessionStartedAt
      : status === 'running' && Number.isFinite(saved.startedAt) ? saved.startedAt : null,
    feedback: ''
  };
}

function saveActivityTimerState() {
  localStorage.setItem(ACTIVITY_TIMER_STORAGE_KEY, JSON.stringify(activityTimerState));
}

function getActivityElapsedMs() {
  if (!activityTimerState) return 0;
  const runningMs = activityTimerState.status === 'running' && activityTimerState.startedAt
    ? Date.now() - activityTimerState.startedAt
    : 0;
  return Math.max(0, activityTimerState.elapsedMs + runningMs);
}

function formatActivityDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function updateActivityTimerDisplay() {
  const display = document.getElementById('timer-display');
  if (!display || !activityTimerState) return;
  display.textContent = formatActivityDuration(getActivityElapsedMs() / 1000);

  const status = document.getElementById('timer-status');
  status.textContent = activityTimerState.feedback || (activityTimerState.status === 'running'
    ? 'SESSION RUNNING'
    : activityTimerState.status === 'paused' ? 'SESSION PAUSED' : 'READY');
  const taskSelect = document.getElementById('timer-task-select');
  const taskInput = document.getElementById('timer-task-name');
  const taskLocked = activityTimerState.status === 'running'
    || (activityTimerState.status === 'paused' && activityTimerState.elapsedMs > 0);
  taskSelect.disabled = taskLocked;
  taskInput.disabled = taskLocked || taskSelect.value !== '__custom__';
  taskInput.hidden = taskSelect.value !== '__custom__';
  document.getElementById('timer-start').disabled = activityTimerState.status === 'running';
  document.getElementById('timer-pause').disabled = activityTimerState.status !== 'running';
  document.getElementById('timer-stop').disabled = activityTimerState.status === 'idle';
}

function populateActivityTaskSelect(select) {
  const tasks = readStorage('moon_dashboard_tasks_v1', []);
  const availableTasks = Array.isArray(tasks)
    ? tasks.filter(task => task && task.id != null && typeof task.title === 'string' && task.title.trim() && task.status !== 'done')
    : [];
  select.replaceChildren();

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'SELECT A DASHBOARD TASK';
  select.append(placeholder);

  availableTasks.forEach(task => {
    const option = document.createElement('option');
    option.value = String(task.id);
    option.textContent = task.title;
    select.append(option);
  });

  const customOption = document.createElement('option');
  customOption.value = '__custom__';
  customOption.textContent = 'NEW INDEPENDENT TASK';
  select.append(customOption);

  const savedTask = availableTasks.find(task => String(task.id) === activityTimerState.taskId);
  if (savedTask) {
    select.value = String(savedTask.id);
    activityTimerState.taskName = savedTask.title;
  } else if (activityTimerState.taskName) {
    select.value = '__custom__';
    activityTimerState.taskId = null;
  } else {
    select.value = '';
  }
}

function syncActivityTimerFromStorage() {
  if (!document.getElementById('timer-display')) return;
  activityTimerState = loadActivityTimerState();
  populateActivityTaskSelect(document.getElementById('timer-task-select'));
  const taskInput = document.getElementById('timer-task-name');
  taskInput.value = activityTimerState.taskName;
  updateActivityTimerDisplay();
}

function startActivityTimer() {
  if (activityTimerState.status === 'running') return;
  if (activityTimerState.status === 'idle' || activityTimerState.elapsedMs === 0) {
    const taskSelect = document.getElementById('timer-task-select');
    const taskName = document.getElementById('timer-task-name').value.trim();
    const selectedTask = taskSelect.selectedOptions[0];
    if (taskSelect.value && taskSelect.value !== '__custom__') {
      activityTimerState.taskId = taskSelect.value;
      activityTimerState.taskName = selectedTask.textContent.trim();
    } else {
      activityTimerState.taskId = null;
      activityTimerState.taskName = taskName;
    }
    const selectedTaskName = activityTimerState.taskName;
    if (!selectedTaskName) {
      activityTimerState.feedback = 'ENTER A TASK NAME FIRST';
      updateActivityTimerDisplay();
      return;
    }
    if (!activityTimerState.sessionStartedAt) activityTimerState.sessionStartedAt = Date.now();
  }
  activityTimerState.status = 'running';
  activityTimerState.startedAt = Date.now();
  activityTimerState.feedback = '';
  saveActivityTimerState();
  updateActivityTimerDisplay();
}

function pauseActivityTimer() {
  if (activityTimerState.status !== 'running') return;
  activityTimerState.elapsedMs = getActivityElapsedMs();
  activityTimerState.status = 'paused';
  activityTimerState.startedAt = null;
  activityTimerState.feedback = '';
  saveActivityTimerState();
  updateActivityTimerDisplay();
}

function stopActivityTimer() {
  if (activityTimerState.status === 'idle') return;
  const elapsedMs = getActivityElapsedMs();
  const taskName = activityTimerState.taskName.trim();
  if (!taskName || elapsedMs < 1000) {
    activityTimerState.feedback = 'RUN FOR AT LEAST ONE SECOND TO LOG';
    updateActivityTimerDisplay();
    return;
  }

  const stoppedAt = new Date();
  const dailyLogs = readStorage(DAILY_LOG_STORAGE_KEY, []);
  dailyLogs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: taskName,
    completed: true,
    createdAt: stoppedAt.toISOString(),
    startedAt: new Date(activityTimerState.sessionStartedAt || stoppedAt.getTime() - elapsedMs).toISOString(),
    endedAt: stoppedAt.toISOString(),
    dateKey: getISTDateKey(stoppedAt),
    durationSeconds: Math.max(1, Math.floor(elapsedMs / 1000)),
    logType: 'work-session',
    taskId: activityTimerState.taskId
  });
  localStorage.setItem(DAILY_LOG_STORAGE_KEY, JSON.stringify(dailyLogs));

  activityTimerState.status = 'idle';
  activityTimerState.elapsedMs = 0;
  activityTimerState.startedAt = null;
  activityTimerState.sessionStartedAt = null;
  activityTimerState.feedback = 'SESSION SAVED TO DAILY LOGS';
  saveActivityTimerState();
  updateActivityTimerDisplay();
}

function renderActivityTimer(content) {
  activityTimerState = loadActivityTimerState();
  if (activityTimerRefreshHandle) window.clearInterval(activityTimerRefreshHandle);
  content.replaceChildren();

  const view = document.createElement('section');
  view.className = 'activity-timer-view';
  const returnLink = addText(view, 'a', 'timer-return-link', '< RETURN TO COMMAND');
  returnLink.href = 'index.html';
  addText(view, 'div', 'timer-kicker', 'MOON_OS // ACTIVITY TRACKER');

  const taskSelect = document.createElement('select');
  taskSelect.id = 'timer-task-select';
  taskSelect.className = 'activity-timer-task';
  taskSelect.setAttribute('aria-label', 'Choose a task from the dashboard or create an independent task');
  populateActivityTaskSelect(taskSelect);
  taskSelect.addEventListener('change', () => {
    const selectedTask = taskSelect.selectedOptions[0];
    activityTimerState.taskId = taskSelect.value && taskSelect.value !== '__custom__' ? taskSelect.value : null;
    activityTimerState.taskName = activityTimerState.taskId ? selectedTask.textContent.trim() : '';
    document.getElementById('timer-task-name').value = activityTimerState.taskName;
    activityTimerState.feedback = '';
    saveActivityTimerState();
    updateActivityTimerDisplay();
  });
  view.append(taskSelect);

  const taskInput = document.createElement('input');
  taskInput.id = 'timer-task-name';
  taskInput.type = 'text';
  taskInput.maxLength = 100;
  taskInput.placeholder = 'NAME YOUR INDEPENDENT TASK';
  taskInput.setAttribute('aria-label', 'Name an independent task');
  taskInput.value = activityTimerState.taskName;
  taskInput.addEventListener('input', () => {
    if (activityTimerState.status !== 'idle' || activityTimerState.elapsedMs > 0) return;
    activityTimerState.taskName = taskInput.value;
    activityTimerState.taskId = null;
    saveActivityTimerState();
  });
  view.append(taskInput);

  addText(view, 'div', 'activity-timer-display', '00:00:00').id = 'timer-display';
  addText(view, 'div', 'activity-timer-status', '').id = 'timer-status';
  const controls = document.createElement('div');
  controls.className = 'activity-timer-controls';
  [['timer-start', 'START', startActivityTimer], ['timer-stop', 'STOP', stopActivityTimer], ['timer-pause', 'PAUSE', pauseActivityTimer]].forEach(([id, label, action]) => {
    const button = addText(controls, 'button', 'activity-timer-button', label);
    button.id = id;
    button.type = 'button';
    button.addEventListener('click', action);
  });
  view.append(controls);
  content.append(view);

  updateActivityTimerDisplay();
  activityTimerRefreshHandle = window.setInterval(updateActivityTimerDisplay, 250);
  window.addEventListener('storage', event => {
    if (event.key === ACTIVITY_TIMER_STORAGE_KEY) syncActivityTimerFromStorage();
    if (event.key === 'moon_dashboard_tasks_v1') {
      populateActivityTaskSelect(document.getElementById('timer-task-select'));
      updateActivityTimerDisplay();
    }
  });
  window.addEventListener('focus', syncActivityTimerFromStorage);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncActivityTimerFromStorage();
  });
}

function renderTimetable(content) {
  const requestedDate = new URLSearchParams(window.location.search).get('date');
  selectedTimetableDateKey = isValidDateKey(requestedDate) ? requestedDate : getISTDateKey(new Date());
  renderTimetableWorkspace(content);
}

function formatTimetableTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function renderTimetableWorkspace(content) {
  content.replaceChildren();
  addText(content, 'div', 'module-kicker', 'MOON_OS / PERSONAL WORKSPACE');
  addText(content, 'h1', '', 'Calendar timetable');
  addText(content, 'p', 'module-description', 'AY 2026-27 · Semester 1 · Semiconductor Engineering · F3 schedule');

  const selectedDate = dateFromKey(selectedTimetableDateKey);
  const weekStart = new Date(selectedDate);
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const week = document.createElement('section');
  week.className = 'timetable-week';
  const toolbar = document.createElement('div');
  toolbar.className = 'timetable-week-toolbar';
  const previous = addText(toolbar, 'button', 'timetable-week-nav', '‹');
  previous.type = 'button';
  previous.setAttribute('aria-label', 'Previous week');
  previous.addEventListener('click', () => shiftTimetableWeek(-7));
  addText(toolbar, 'h2', '', `${formatLogDate(makeDateKey(weekStart.getUTCFullYear(), weekStart.getUTCMonth() + 1, weekStart.getUTCDate()), { month: 'short', day: 'numeric' })} — ${formatLogDate(makeDateKey(weekEnd.getUTCFullYear(), weekEnd.getUTCMonth() + 1, weekEnd.getUTCDate()), { month: 'short', day: 'numeric', year: 'numeric' })}`);
  const todayButton = addText(toolbar, 'button', 'timetable-today-button', 'TODAY');
  todayButton.type = 'button';
  todayButton.addEventListener('click', () => selectTimetableDate(getISTDateKey(new Date())));
  const next = addText(toolbar, 'button', 'timetable-week-nav', '›');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next week');
  next.addEventListener('click', () => shiftTimetableWeek(7));
  week.append(toolbar);

  const dayStrip = document.createElement('div');
  dayStrip.className = 'timetable-day-strip';
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + offset);
    const dateKey = makeDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'timetable-day';
    if (dateKey === selectedTimetableDateKey) button.classList.add('is-selected');
    if (dateKey === getISTDateKey(new Date())) button.classList.add('is-today');
    addText(button, 'span', 'timetable-day-name', new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(date));
    addText(button, 'span', 'timetable-day-number', String(date.getUTCDate()));
    button.addEventListener('click', () => selectTimetableDate(dateKey));
    dayStrip.append(button);
  }
  week.append(dayStrip);
  content.append(week);

  const selectedDay = dateFromKey(selectedTimetableDateKey).getUTCDay();
  const events = TIMETABLE_EVENTS.filter(event => event.day === selectedDay)
    .sort((first, second) => first.start.localeCompare(second.start));
  const agendaTitle = `${new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(selectedDate)} · ${formatLogDate(selectedTimetableDateKey, { day: 'numeric', month: 'short' })} · ${events.length} ${events.length === 1 ? 'class' : 'classes'}`;
  addText(content, 'h2', 'timetable-agenda-title', agendaTitle);

  const agenda = document.createElement('div');
  agenda.className = 'timetable-agenda';
  if (!events.length) {
    addText(agenda, 'p', 'timetable-empty-state', 'No scheduled classes for this day.');
  }
  events.forEach(event => {
    const item = document.createElement('article');
    item.className = 'timetable-event';
    const times = document.createElement('div');
    times.className = 'timetable-event-times';
    addText(times, 'strong', '', formatTimetableTime(event.start));
    addText(times, 'span', '', formatTimetableTime(event.end));
    const marker = document.createElement('span');
    marker.className = 'timetable-event-marker';
    marker.setAttribute('aria-hidden', 'true');
    const card = document.createElement('div');
    card.className = 'timetable-event-card';
    const title = addText(card, 'h3', '', event.title);
    if (event.batch) addText(title, 'span', 'timetable-batch', event.batch);
    if (event.professor) addText(card, 'p', 'timetable-event-detail', event.professor);
    if (event.venue) addText(card, 'p', 'timetable-event-detail', event.venue);
    item.append(times, marker, card);
    agenda.append(item);
  });
  content.append(agenda);
}

function selectTimetableDate(dateKey) {
  selectedTimetableDateKey = dateKey;
  const url = new URL(window.location.href);
  url.searchParams.set('date', dateKey);
  window.history.replaceState({}, '', url);
  renderTimetableWorkspace(document.getElementById('module-content'));
}

function shiftTimetableWeek(days) {
  const nextDate = dateFromKey(selectedTimetableDateKey);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  selectTimetableDate(makeDateKey(nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, nextDate.getUTCDate()));
}

function initModule() {
  const view = new URLSearchParams(window.location.search).get('view');
  const module = MODULES[view] || MODULES.timetable;
  const content = document.getElementById('module-content');
  addText(content, 'div', 'module-kicker', 'MOON_OS / PERSONAL WORKSPACE');
  addText(content, 'h1', '', module.title);
  addText(content, 'p', 'module-description', module.description);

  if (view === 'current-mission' || view === 'next-mission') renderMission(content, view === 'current-mission' ? 'current' : 'next');
  else if (view === 'daily-logs') renderDailyLogs(content);
  else if (view === 'archive') renderArchive(content);
  else if (view === 'projects') renderProjects(content);
  else if (view === 'project') renderProjectDetail(content);
  else if (view === 'activity-timer') {
    document.body.classList.add('timer-mode');
    renderActivityTimer(content);
  }
  else renderTimetable(content);

  if (view === 'daily-logs') {
    window.addEventListener('storage', event => {
      if (event.key !== DAILY_LOG_STORAGE_KEY) return;
      const savedLogs = readStorage(DAILY_LOG_STORAGE_KEY, []);
      dailyLogEntries = Array.isArray(savedLogs) ? savedLogs : [];
      renderDailyLogWorkspace();
    });
  }

  const projectId = new URLSearchParams(window.location.search).get('projectId');
  const activeProject = view === 'project'
    ? readStorage(PROJECT_STORAGE_KEY, []).find(project => String(project.id) === String(projectId))
    : null;
  document.title = `MOON_OS // ${(activeProject?.name || module.title).toUpperCase()}`;
  renderClock();
  setInterval(renderClock, 1000);
}

window.addEventListener('DOMContentLoaded', initModule);