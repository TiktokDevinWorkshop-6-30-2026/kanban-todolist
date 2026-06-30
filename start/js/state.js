const LOCAL_STORAGE_KEY = 'daily-task-tracker';
let state = { tasks: [], filterPriority: 'all', sortBy: 'date-desc', searchQuery: '', activeTab: 'todo' };

function createDemoTasks() {
    return [
        { id:'demo-1', title:'Escape HTML in task text', desc:'Sanitize titles/descriptions to prevent injection.', priority:'high',   column:'todo',     createdAt:Date.now()-40*60*1000,   editedAt:null,                  completed:false },
        { id:'demo-2', title:'Add undo for deleted tasks', desc:'Show a toast with an Undo action after deleting.',  priority:'medium', column:'todo',     createdAt:Date.now()-15*60*1000,   editedAt:null,                  completed:false },
        { id:'demo-3', title:'Improve keyboard accessibility', desc:'Move/edit cards via keyboard; add ARIA roles.', priority:'medium', column:'progress', createdAt:Date.now()-3*3600*1000,  editedAt:null,                  completed:false },
        { id:'demo-4', title:'Add tests for task rules', desc:'Unit-test the move/add/edit logic.',                  priority:'medium', column:'progress', createdAt:Date.now()-6*3600*1000,  editedAt:null,                  completed:false },
        { id:'demo-5', title:'Export and import tasks as JSON', desc:'Backup/restore so data is not trapped here.',  priority:'low',    column:'done',     createdAt:Date.now()-25*3600*1000, editedAt:Date.now()-24*3600*1000, completed:true  }
    ];
}

function loadFromStorage() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
        try { state = JSON.parse(saved); } catch (e) { console.error('Storage loading error:', e); }
        state.searchQuery = '';
    } else {
        state.tasks = createDemoTasks();
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

function loadDemoData() {
    state.tasks = createDemoTasks();
    saveToStorage();
}

/* ── Metric history ──────────────────────────────────────────────────── */
const METRICS_STORAGE_KEY = 'daily-task-tracker-metrics';

function loadMetricHistory() {
    try {
        const saved = localStorage.getItem(METRICS_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
}

function saveMetricHistory(history) {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(history));
}

function recordMetricSnapshot() {
    const history = loadMetricHistory();
    const now = Date.now();
    const counts = { todo: 0, progress: 0, done: 0 };
    state.tasks.forEach(t => { if (counts[t.column] !== undefined) counts[t.column]++; });

    /* Deduplicate: skip if the last snapshot has identical counts and is < 5 s old */
    const last = history[history.length - 1];
    if (last && (now - last.ts < 5000) &&
        last.todo === counts.todo && last.progress === counts.progress && last.done === counts.done) {
        return;
    }

    history.push({ ts: now, todo: counts.todo, progress: counts.progress, done: counts.done });

    /* Keep at most 200 data-points so localStorage doesn't bloat */
    if (history.length > 200) history.splice(0, history.length - 200);

    saveMetricHistory(history);
}
