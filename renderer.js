const STORAGE_KEY = 'moon_dashboard_tasks_v1';
const MISSION_STORAGE_KEY = 'moon_mission_assignments_v1';
const DAILY_LOG_STORAGE_KEY = 'moon_daily_logs_v1';
const ARCHIVE_STORAGE_KEY = 'moon_archived_tasks_v1';
const PROJECT_STORAGE_KEY = 'moon_projects_v1';
const PROFILE_PHOTO_DATABASE = 'moon_os_profile_media_v1';

const state = {
  tasks: loadTasks(),
  missions: loadMissionAssignments(),
  dailyLogs: loadDailyLogs(),
  archivedTasks: loadArchivedTasks(),
  projects: loadProjects()
};

let profilePhotoUrl = '';

function loadMissionAssignments() {
  try {
    const saved = JSON.parse(localStorage.getItem(MISSION_STORAGE_KEY));
    if (saved && typeof saved === 'object') return { current: saved.current || null, next: saved.next || null };
  } catch (error) {
    console.warn('Unable to parse saved mission assignments', error);
  }
  return { current: null, next: null };
}

function loadDailyLogs() {
  try {
    const saved = JSON.parse(localStorage.getItem(DAILY_LOG_STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn('Unable to parse saved daily logs', error);
  }
  return [];
}

function loadArchivedTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn('Unable to parse archived tasks', error);
  }
  return [];
}

function loadProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn('Unable to parse saved projects', error);
  }
  return [];
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse saved tasks', error);
  }
  return [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function saveMissionAssignments() {
  localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(state.missions));
}

function saveDailyLogs() {
  localStorage.setItem(DAILY_LOG_STORAGE_KEY, JSON.stringify(state.dailyLogs));
}

function saveArchivedTasks() {
  localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(state.archivedTasks));
}

function renderClock() {
  const clockEl = document.getElementById('live-clock');
  if (!clockEl) return;

  const now = new Date();
  const time = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(now);
  const day = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long'
  }).format(now);
  const date = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(now);

  clockEl.replaceChildren();
  const timeLine = document.createElement('span');
  timeLine.className = 'clock-time';
  timeLine.textContent = `${time} IST`;
  const dateLine = document.createElement('span');
  dateLine.className = 'clock-day-date';
  dateLine.textContent = `${day.toUpperCase()} // ${date.toUpperCase()}`;
  clockEl.append(timeLine, dateLine);
}

function initHeaderWave() {
  const canvas = document.getElementById('header-wave');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const columns = 36;
  const rows = 10;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let lastFrameTime = 0;

  const draw = time => {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);

    const point = (column, row) => {
      const xRatio = column / columns;
      const yRatio = row / rows;
      const baseX = xRatio * width;
      const baseY = yRatio * height;
      const envelope = 0.35 + Math.exp(-Math.pow((yRatio - 0.5) / 0.5, 2)) * 0.65;
      const primary = Math.sin(xRatio * 8.5 - time * 0.00055 + yRatio * 2.8) * 0.72;
      const secondary = Math.sin(xRatio * 18 + time * 0.00038 + yRatio * 4.1) * 0.2;
      const horizontalWarp = Math.cos(yRatio * 7 + xRatio * 2 - time * 0.0003) * width * 0.008;
      return {
        x: baseX + horizontalWarp * envelope,
        y: baseY + (primary + secondary) * envelope * height * 0.34
      };
    };

    context.lineWidth = 0.7;
    context.strokeStyle = 'rgba(255,255,255,0.16)';
    for (let row = 0; row <= rows; row += 1) {
      context.beginPath();
      for (let column = 0; column <= columns; column += 1) {
        const vertex = point(column, row);
        if (column === 0) context.moveTo(vertex.x, vertex.y);
        else context.lineTo(vertex.x, vertex.y);
      }
      context.stroke();
    }

    context.strokeStyle = 'rgba(255,255,255,0.11)';
    for (let column = 0; column <= columns; column += 1) {
      context.beginPath();
      for (let row = 0; row <= rows; row += 1) {
        const vertex = point(column, row);
        if (row === 0) context.moveTo(vertex.x, vertex.y);
        else context.lineTo(vertex.x, vertex.y);
      }
      context.stroke();
    }
  };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw(0);
  };

  resize();
  window.addEventListener('resize', resize);
  if (!reducedMotion) {
    const animate = time => {
      if (time - lastFrameTime >= 40) {
        draw(time);
        lastFrameTime = time;
      }
      window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
  }
}

function openProfilePhotoDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PROFILE_PHOTO_DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('photos')) request.result.createObjectStore('photos');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveProfilePhoto(file) {
  return openProfilePhotoDatabase().then(database => new Promise((resolve, reject) => {
    const transaction = database.transaction('photos', 'readwrite');
    transaction.objectStore('photos').put(file, 'portrait');
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  }));
}

function readProfilePhoto() {
  return openProfilePhotoDatabase().then(database => new Promise((resolve, reject) => {
    const transaction = database.transaction('photos', 'readonly');
    const request = transaction.objectStore('photos').get('portrait');
    request.onsuccess = () => {
      const photo = request.result || null;
      database.close();
      resolve(photo);
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  }));
}

function deleteProfilePhoto() {
  return openProfilePhotoDatabase().then(database => new Promise((resolve, reject) => {
    const transaction = database.transaction('photos', 'readwrite');
    transaction.objectStore('photos').delete('portrait');
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  }));
}

function renderProfilePhoto(photo) {
  const image = document.getElementById('profile-photo-preview');
  const placeholder = document.getElementById('profile-photo-placeholder');
  const removeButton = document.getElementById('remove-profile-photo');
  const status = document.getElementById('profile-photo-status');
  if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl);
  profilePhotoUrl = photo ? URL.createObjectURL(photo) : '';
  image.hidden = !profilePhotoUrl;
  placeholder.hidden = Boolean(profilePhotoUrl);
  removeButton.hidden = !profilePhotoUrl;
  status.textContent = profilePhotoUrl ? 'PHOTO SAVED ON THIS DEVICE' : 'NO PHOTO SAVED';
  if (profilePhotoUrl) image.src = profilePhotoUrl;
  else image.removeAttribute('src');
}

async function loadProfilePhoto() {
  try {
    renderProfilePhoto(await readProfilePhoto());
  } catch (error) {
    console.warn('Unable to load profile photo', error);
    document.getElementById('profile-photo-status').textContent = 'PHOTO STORAGE UNAVAILABLE';
  }
}

async function handleProfilePhotoChange(event) {
  const input = event.currentTarget;
  const file = input.files[0];
  if (!file) return;
  const status = document.getElementById('profile-photo-status');
  if (!file.type.startsWith('image/')) {
    status.textContent = 'SELECT AN IMAGE FILE';
    input.value = '';
    return;
  }
  try {
    await saveProfilePhoto(file);
    renderProfilePhoto(file);
    status.textContent = 'PHOTO SAVED ON THIS DEVICE';
  } catch (error) {
    console.error('Unable to save profile photo', error);
    status.textContent = 'UNABLE TO SAVE PHOTO';
  }
  input.value = '';
}

function openProfileCard() {
  document.getElementById('profile-card-modal').classList.remove('hidden');
  document.getElementById('close-profile-card').focus();
}

function closeProfileCard() {
  document.getElementById('profile-card-modal').classList.add('hidden');
  document.getElementById('open-profile-card').focus();
}

function renderMissionAssignments() {
  [
    ['current', 'current-mission-task', 'No task assigned'],
    ['next', 'next-mission-task', 'No task planned']
  ].forEach(([key, elementId, emptyText]) => {
    const container = document.getElementById(elementId);
    const assignment = state.missions[key];
    container.replaceChildren();
    if (assignment) {
      const title = document.createElement('span');
      title.className = 'assigned-task-title';
      title.textContent = assignment.title;
      container.append(title, createTrashButton(`Delete ${key} mission task`, () => {
        state.missions[key] = null;
        saveMissionAssignments();
        renderMissionAssignments();
      }));
    } else {
      container.textContent = emptyText;
    }
    container.classList.toggle('is-empty', !assignment);
  });
}

function createTrashButton(label, onDelete) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'task-trash-button';
  button.setAttribute('aria-label', label);
  button.title = label;

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '1.7');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  [
    'M3 6h18',
    'M8 6V4h8v2',
    'M19 6l-1 14H6L5 6',
    'M10 11v5',
    'M14 11v5'
  ].forEach(pathData => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    icon.append(path);
  });
  button.append(icon);
  button.addEventListener('click', event => {
    event.stopPropagation();
    onDelete();
  });
  return button;
}

function assignMission(key, title) {
  state.missions[key] = { title };
  saveMissionAssignments();
  renderMissionAssignments();
}

function handleMissionEntry(event, key) {
  event.preventDefault();
  const input = event.currentTarget.querySelector('input');
  const title = input.value.trim();
  if (!title) return;
  assignMission(key, title);
  input.value = '';
}

function renderDailyLogs() {
  const list = document.getElementById('daily-log-list');
  list.replaceChildren();

  state.dailyLogs.forEach(log => {
    const item = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(log.completed);
    checkbox.setAttribute('aria-label', `Mark ${log.text} complete`);
    checkbox.addEventListener('change', () => {
      log.completed = checkbox.checked;
      saveDailyLogs();
      renderDailyLogs();
    });

    const text = document.createElement('span');
    text.className = log.completed ? 'log-task completed' : 'log-task';
    text.textContent = log.text;

    const timestamp = document.createElement('time');
    timestamp.className = 'log-time';
    timestamp.dateTime = log.createdAt;
    const timeText = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(log.createdAt));
    timestamp.textContent = log.durationSeconds
      ? `${formatLoggedDuration(log.durationSeconds)} // ${timeText}`
      : timeText;

    item.append(checkbox, text, timestamp);
    list.append(item);
  });
}

function formatLoggedDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function renderArchivePreview() {
  const list = document.getElementById('archive-preview');
  list.replaceChildren();
  document.getElementById('archive-count').textContent = state.archivedTasks.length;

  state.archivedTasks.slice(0, 3).forEach(task => {
    const item = document.createElement('li');
    const title = document.createElement('span');
    title.className = 'archive-task-title';
    title.textContent = task.title;
    item.append(title, createTrashButton(`Delete archived task ${task.title}`, () => {
      state.archivedTasks = state.archivedTasks.filter(archived => String(archived.id) !== String(task.id));
      saveArchivedTasks();
      renderArchivePreview();
    }));
    list.append(item);
  });
}

function renderProjectSummary() {
  const list = document.getElementById('project-summary-list');
  list.replaceChildren();
  const count = state.projects.length;
  document.getElementById('project-summary-count').textContent = `${count} PROJECT${count === 1 ? '' : 'S'}`;

  if (!count) {
    const item = document.createElement('li');
    item.textContent = 'No projects yet';
    list.append(item);
    return;
  }

  state.projects.slice(0, 3).forEach(project => {
    const item = document.createElement('li');
    item.textContent = project.name;
    list.append(item);
  });
}

function bindArchiveDrop() {
  const archivePanel = document.querySelector('[data-archive-target]');
  archivePanel.addEventListener('dragover', event => {
    event.preventDefault();
    archivePanel.classList.add('archive-drop-target');
  });
  archivePanel.addEventListener('dragleave', () => archivePanel.classList.remove('archive-drop-target'));
  archivePanel.addEventListener('drop', event => {
    event.preventDefault();
    archivePanel.classList.remove('archive-drop-target');
    const taskId = Number(event.dataTransfer.getData('text/plain'));
    const taskIndex = state.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1 || state.tasks[taskIndex].status !== 'done') return;

    const [task] = state.tasks.splice(taskIndex, 1);
    state.archivedTasks.unshift({ ...task, archivedAt: new Date().toISOString() });
    saveTasks();
    saveArchivedTasks();
    renderBoard();
    renderArchivePreview();
  });
}

function handleAddDailyLog(event) {
  event.preventDefault();
  const input = document.getElementById('daily-log-input');
  const text = input.value.trim();
  if (!text) return;

  state.dailyLogs.unshift({
    id: Date.now(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  });
  saveDailyLogs();
  renderDailyLogs();
  input.value = '';
}

function navigateToModule(panel) {
  window.location.href = `module.html?view=${encodeURIComponent(panel.dataset.module)}`;
}

function bindModuleNavigation() {
  document.querySelectorAll('[data-module]').forEach(panel => {
    panel.addEventListener('click', event => {
      if (event.target.closest('input, button, form, select, textarea')) return;
      navigateToModule(panel);
    });
    panel.addEventListener('keydown', event => {
      if (event.target !== panel || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      navigateToModule(panel);
    });
  });
}

function bindMissionAssignments() {
  document.getElementById('current-mission-form').addEventListener('submit', event => handleMissionEntry(event, 'current'));
  document.getElementById('next-mission-form').addEventListener('submit', event => handleMissionEntry(event, 'next'));

  document.querySelectorAll('[data-mission-target]').forEach(panel => {
    panel.addEventListener('dragover', event => {
      event.preventDefault();
      panel.classList.add('mission-drop-target');
    });
    panel.addEventListener('dragleave', () => panel.classList.remove('mission-drop-target'));
    panel.addEventListener('drop', event => {
      event.preventDefault();
      const taskId = Number(event.dataTransfer.getData('application/x-moon-task-copy'));
      const task = state.tasks.find(item => item.id === taskId);
      if (task) assignMission(panel.dataset.missionTarget, task.title);
      panel.classList.remove('mission-drop-target');
    });
  });
}

function renderBoard() {
  const columns = {
    todo: document.getElementById('todo-list'),
    'due-soon': document.getElementById('due-soon-list'),
    'in-progress': document.getElementById('in-progress-list'),
    done: document.getElementById('done-list')
  };

  Object.entries(columns).forEach(([status, listEl]) => {
    const tasks = state.tasks.filter(task => task.status === status);
    listEl.innerHTML = tasks
      .map(task => `
        <article class="task-card" draggable="true" data-id="${task.id}">
          <div class="task-top">
            <span class="priority-badge">${task.priority}</span>
            <span class="task-tag">${task.project}</span>
          </div>
          <h4>${task.title}</h4>
          <div class="task-meta">${task.due}</div>
          <div class="task-tags">
            <span class="task-tag">${task.tag}</span>
          </div>
        </article>
      `)
      .join('');
  });

  document.getElementById('count-todo').textContent = state.tasks.filter(t => t.status === 'todo').length;
  document.getElementById('count-due-soon').textContent = state.tasks.filter(t => t.status === 'due-soon').length;
  document.getElementById('count-in-progress').textContent = state.tasks.filter(t => t.status === 'in-progress').length;
  document.getElementById('count-done').textContent = state.tasks.filter(t => t.status === 'done').length;

  bindTaskDragEvents();
}

function bindTaskDragEvents() {
  const cards = document.querySelectorAll('.task-card');

  cards.forEach(card => {
    card.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', card.dataset.id);
      event.dataTransfer.setData('application/x-moon-task-copy', card.dataset.id);
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });

  document.querySelectorAll('.board-column').forEach(column => {
    column.addEventListener('dragover', event => {
      event.preventDefault();
      column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', () => column.classList.remove('drag-over'));

    column.addEventListener('drop', event => {
      event.preventDefault();
      const taskId = Number(event.dataTransfer.getData('text/plain'));
      const nextStatus = column.dataset.status;
      const task = state.tasks.find(item => item.id === taskId);
      if (task) {
        task.status = nextStatus;
        saveTasks();
        renderBoard();
      }
      column.classList.remove('drag-over');
    });
  });
}

function openTaskModal() {
  document.getElementById('task-modal').classList.remove('hidden');
}

function closeTaskModal() {
  document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('task-form').reset();
}

function handleAddTask(event) {
  event.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  if (!title) return;

  const project = document.getElementById('task-project').value.trim() || 'Unassigned';
  const priority = document.getElementById('task-priority').value;
  const due = document.getElementById('task-due').value.trim();
  const tag = document.getElementById('task-tag').value.trim();
  const status = document.getElementById('task-status').value;

  state.tasks.push({
    id: Date.now(),
    title,
    project,
    priority,
    due,
    tag,
    status
  });

  saveTasks();
  renderBoard();
  closeTaskModal();
}

function initEvents() {
  const profileModal = document.getElementById('profile-card-modal');
  document.getElementById('open-profile-card').addEventListener('click', openProfileCard);
  document.getElementById('close-profile-card').addEventListener('click', closeProfileCard);
  document.getElementById('choose-profile-photo').addEventListener('click', () => document.getElementById('profile-photo-input').click());
  document.getElementById('profile-photo-input').addEventListener('change', handleProfilePhotoChange);
  document.getElementById('remove-profile-photo').addEventListener('click', async () => {
    try {
      await deleteProfilePhoto();
      renderProfilePhoto(null);
      document.getElementById('profile-photo-status').textContent = 'PHOTO REMOVED';
    } catch (error) {
      console.error('Unable to remove profile photo', error);
      document.getElementById('profile-photo-status').textContent = 'UNABLE TO REMOVE PHOTO';
    }
  });
  profileModal.addEventListener('click', event => {
    if (event.target === profileModal) closeProfileCard();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !profileModal.classList.contains('hidden')) closeProfileCard();
  });

  document.getElementById('add-task-btn').addEventListener('click', openTaskModal);
  document.getElementById('close-modal-btn').addEventListener('click', closeTaskModal);
  document.getElementById('cancel-modal-btn').addEventListener('click', closeTaskModal);
  document.getElementById('task-form').addEventListener('submit', handleAddTask);

  document.getElementById('task-modal').addEventListener('click', (event) => {
    if (event.target.id === 'task-modal') closeTaskModal();
  });
  document.getElementById('daily-log-form').addEventListener('submit', handleAddDailyLog);
}

window.addEventListener('DOMContentLoaded', () => {
  renderClock();
  setInterval(renderClock, 1000);
  initHeaderWave();
  loadProfilePhoto();
  renderBoard();
  renderMissionAssignments();
  renderDailyLogs();
  renderArchivePreview();
  renderProjectSummary();
  bindMissionAssignments();
  bindArchiveDrop();
  bindModuleNavigation();
  initEvents();
});

window.addEventListener('beforeunload', saveTasks);
