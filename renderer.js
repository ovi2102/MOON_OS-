//const THREE = require('three');

// GLOBAL STATE
let state = {
    tasks: JSON.parse(localStorage.getItem('moon_tasks')) || [],
    habits: JSON.parse(localStorage.getItem('moon_habits')) || [],
    totalTime: parseFloat(localStorage.getItem('moon_time')) || 0,
    playlist: [],
    currentTrackIndex: -1
};

window.addEventListener('DOMContentLoaded', () => {
    initUI();
    initMoon();
    initTasks();
    initHabits();
    initFlowtime();
    initCraters();
    initTides();
    updateReflections();
});

// --- 1. FREE-SCROLL UNIVERSE NAVIGATION ---
function initUI() {
    // Simply confirm we are locking onto the center dashboard on startup
    setTimeout(() => {
        panTo('dashboard');
    }, 200);
}

// Allows buttons to gracefully glide the canvas using CSS transitions
window.panTo = (sector) => {
    const map = document.getElementById('universe-map');
    if (!map) return;
    
    switch(sector) {
        case 'craters':   
            map.style.transform = 'translate(0, 0)'; 
            break;
        case 'dashboard': 
            map.style.transform = 'translate(-100vw, 0)'; 
            break;
        case 'tides':     
            map.style.transform = 'translate(-200vw, 0)'; 
            break;
        case 'flowtime':  
            map.style.transform = 'translate(-100vw, -100vh)'; 
            break;
    }
};
    
    switch(sector) {
        case 'dashboard': 
            viewport.scrollLeft = currentW; 
            viewport.scrollTop = 0; 
            break;
        case 'craters':   
            viewport.scrollLeft = 0; 
            viewport.scrollTop = 0; 
            break;
        case 'tides':     
            viewport.scrollLeft = currentW * 2; 
            viewport.scrollTop = 0; 
            break;
        case 'flowtime':  
            viewport.scrollLeft = currentW; 
            viewport.scrollTop = currentH; 
            break;
    }


// --- 2. THREE.JS MAJESTIC MOON ---
function initMoon() {
    const container = document.getElementById('moon-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // High-tech wireframe
    const geometry = new THREE.IcosahedronGeometry(2.4, 4); 
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 });
    const moon = new THREE.Mesh(geometry, material);
    scene.add(moon);
    
    // Solid Black Core to hide back-facing lines
    const core = new THREE.Mesh(
        new THREE.SphereGeometry(2.35, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    scene.add(core);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        moon.rotation.y += 0.001;
        moon.rotation.x += 0.0005;
        renderer.render(scene, camera);
    }
    animate();
}

// --- 3. ORBIT (TASKS) & ZIG-ZAG CONSTELLATION ---
function initTasks() {
    document.getElementById('btn-add-task').onclick = addTask;
    document.getElementById('todo-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') addTask(); });
    renderTasks();
}

function addTask() {
    const inp = document.getElementById('todo-input');
    if(!inp.value.trim()) return;
    state.tasks.push({ id: Date.now(), text: inp.value.trim(), completed: false });
    inp.value = '';
    saveData(); renderTasks(); updateReflections();
}

window.toggleTask = (id) => {
    const t = state.tasks.find(x => x.id === id);
    if(t) t.completed = !t.completed;
    saveData(); renderTasks(); updateReflections();
};

window.deleteTask = (id) => {
    state.tasks = state.tasks.filter(x => x.id !== id);
    saveData(); renderTasks(); updateReflections();
};

function renderTasks() {
    const list = document.getElementById('todo-list');
    list.innerHTML = state.tasks.map(t => `
        <div class="task-item">
            <span class="${t.completed ? 'task-done' : ''}" onclick="toggleTask(${t.id})">> ${t.text}</span>
            <button class="del-btn" onclick="deleteTask(${t.id})">×</button>
        </div>
    `).join('');
    drawConstellation();
}

function drawConstellation() {
    const svg = document.getElementById('constellation-lines');
    const dotsContainer = document.getElementById('constellation-dots');
    svg.innerHTML = ''; dotsContainer.innerHTML = '';
    
    const centerX = 300, centerY = 300;
    let completedPoints = [];

    state.tasks.forEach((t, i) => {
        const angle = (i / Math.max(8, state.tasks.length)) * Math.PI * 2;
        const radius = 230 + (i % 2 === 0 ? 30 : -30);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const dot = document.createElement('div');
        dot.className = 'const-dot';
        dot.style.left = `${x}px`; dot.style.top = `${y}px`;
        dot.style.opacity = t.completed ? '1' : '0.2';
        dotsContainer.appendChild(dot);

        if(t.completed) completedPoints.push(`${x},${y}`);
    });

    if(completedPoints.length > 1) {
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', completedPoints.join(' '));
        polyline.setAttribute('class', 'const-line');
        polyline.setAttribute('fill', 'none');
        svg.appendChild(polyline);
    }
}

// --- 4. FLOWTIME (TIMER) ---
let timerInterval = null;
let currentSessionSecs = 0;

function initFlowtime() {
    const display = document.getElementById('big-timer');
    
    const updateTimeUI = (secs) => {
        const h = String(Math.floor(secs / 3600)).padStart(2, '0');
        const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        display.innerText = `${h}:${m}:${s}`;
    };

    document.getElementById('btn-orbit').onclick = () => { // Start
        if(timerInterval) return;
        timerInterval = setInterval(() => {
            currentSessionSecs++;
            updateTimeUI(currentSessionSecs);
        }, 1000);
    };

    document.getElementById('btn-stasis').onclick = () => { // Pause
        clearInterval(timerInterval);
        timerInterval = null;
    };

    document.getElementById('btn-drift').onclick = () => { // End
        clearInterval(timerInterval);
        timerInterval = null;
        state.totalTime += currentSessionSecs;
        currentSessionSecs = 0;
        updateTimeUI(0);
        saveData(); updateReflections();
    };
}

// --- 5. REFLECTIONS (STATS) ---
function updateReflections() {
    const hrs = (state.totalTime / 3600).toFixed(2);
    const completed = state.tasks.filter(t => t.completed).length;
    document.getElementById('stat-time').innerText = `${hrs}h`;
    document.getElementById('stat-tasks').innerText = completed;
}

// --- 6. LUMINESCENCE (HABITS) ---
function initHabits() {
    document.getElementById('btn-add-habit').onclick = () => {
        const inp = document.getElementById('habit-input');
        if(!inp.value.trim()) return;
        state.habits.push({ id: Date.now(), text: inp.value.trim(), log: [false,false,false,false,false,false,false] });
        inp.value = ''; saveData(); renderHabits();
    };
    renderHabits();
}

function renderHabits() {
    const list = document.getElementById('habit-list');
    list.innerHTML = state.habits.map((h, hIdx) => `
        <div class="habit-item">
            <span>${h.text}</span>
            <div class="habit-days">
                ${h.log.map((done, dIdx) => `<div class="h-box ${done ? 'active' : ''}" onclick="toggleHabit(${hIdx}, ${dIdx})"></div>`).join('')}
                <button class="del-btn" style="margin-left:5px" onclick="deleteHabit(${hIdx})">×</button>
            </div>
        </div>
    `).join('');
}

window.toggleHabit = (hIdx, dIdx) => { state.habits[hIdx].log[dIdx] = !state.habits[hIdx].log[dIdx]; saveData(); renderHabits(); };
window.deleteHabit = (hIdx) => { state.habits.splice(hIdx, 1); saveData(); renderHabits(); };

// --- 7. CRATERS (FILE VIEWER) ---
function initCraters() {
    const iframe = document.getElementById('craters-iframe');
    
    document.getElementById('btn-load-craters').onclick = () => {
        const link = document.getElementById('craters-input').value;
        if(link) { iframe.src = link; panTo('craters'); }
    };

    document.getElementById('local-file-picker').onchange = (e) => {
        const file = e.target.files[0];
        if(file) {
            const fileURL = URL.createObjectURL(file);
            iframe.src = fileURL;
            document.getElementById('craters-input').value = file.name;
            panTo('craters');
        }
    };
}

// --- 8. TIDES (MUSIC PLAYER) ---
function initTides() {
    const audio = document.getElementById('tides-audio-player');
    const playBtn = document.getElementById('btn-play-pause');
    const progressFill = document.getElementById('tides-progress-fill');
    
    document.getElementById('tides-file-picker').onchange = (e) => {
        const files = Array.from(e.target.files);
        if(!files.length) return;
        
        state.playlist = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
        renderPlaylist();
        playTrack(0);
    };

    window.playTrack = (index) => {
        if(index < 0 || index >= state.playlist.length) return;
        state.currentTrackIndex = index;
        audio.src = state.playlist[index].url;
        audio.play();
        playBtn.innerText = "⏸";
        document.getElementById('tides-current-track').innerText = state.playlist[index].name;
        renderPlaylist();
    };

    playBtn.onclick = () => {
        if(!audio.src) return;
        if(audio.paused) { audio.play(); playBtn.innerText = "⏸"; } 
        else { audio.pause(); playBtn.innerText = "⏵"; }
    };

    document.getElementById('btn-prev').onclick = () => playTrack(state.currentTrackIndex - 1);
    document.getElementById('btn-next').onclick = () => playTrack(state.currentTrackIndex + 1);
    audio.onended = () => playTrack(state.currentTrackIndex + 1);

    audio.ontimeupdate = () => {
        if(!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${pct}%`;
        
        const format = (time) => `${Math.floor(time/60)}:${String(Math.floor(time%60)).padStart(2, '0')}`;
        document.getElementById('tides-time-curr').innerText = format(audio.currentTime);
        document.getElementById('tides-time-total').innerText = format(audio.duration);
    };
    
    document.getElementById('tides-progress-bg').onclick = (e) => {
        if(!audio.duration) return;
        const rect = e.target.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    };
}

function renderPlaylist() {
    const list = document.getElementById('tides-playlist');
    list.innerHTML = state.playlist.map((t, i) => `
        <div class="playlist-item ${i === state.currentTrackIndex ? 'playing' : ''}" onclick="playTrack(${i})">
            ${i === state.currentTrackIndex ? '▶ ' : ''}${t.name}
        </div>
    `).join('');
}

// --- 9. DATA PERSISTENCE ---
function saveData() {
    localStorage.setItem('moon_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('moon_habits', JSON.stringify(state.habits));
    localStorage.setItem('moon_time', state.totalTime.toString());
}