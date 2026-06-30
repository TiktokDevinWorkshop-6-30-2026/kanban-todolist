const COLUMN_META = {
    todo:     { body: 'bodyTodo',     count: 'countTodo',     icon: 'fa-clipboard-list', message: 'No tasks listed here.' },
    progress: { body: 'bodyProgress', count: 'countProgress', icon: 'fa-spinner',        message: 'Nothing in progress.' },
    done:     { body: 'bodyDone',     count: 'countDone',      icon: 'fa-check-double',   message: 'No completed tasks yet.' }
};

function moveButtonsHTML(task) {
    switch (task.column) {
        case 'todo':
            return `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to In Progress"><i class="fas fa-arrow-right"></i></button>`;
        case 'progress':
            return `<button class="btn-arrow" onclick="moveTask('${task.id}', 'todo')" title="Move to To Do"><i class="fas fa-arrow-left"></i></button>` +
                   `<button class="btn-arrow" onclick="moveTask('${task.id}', 'done')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>`;
        case 'done':
            return `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to In Progress"><i class="fas fa-arrow-left"></i></button>`;
        default:
            return '';
    }
}

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = 'task-card priority-' + task.priority;
    card.dataset.id = task.id;

    const descHTML = task.desc
        ? `<p class="task-desc-excerpt">${task.desc}</p>`
        : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

    const isDone = task.column === 'done';
    const editBtn = isDone
        ? `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="View Task"><i class="fas fa-expand-alt"></i></button>`
        : `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="Edit Task"><i class="fas fa-pencil-alt"></i></button>`;

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${task.priority}" onclick="openBadgePriorityMenu(event, '${task.id}')">${task.priority}</span>
            <span class="task-time">${formatRelativeTime(task.createdAt)}</span>
        </div>
        <h4 class="task-title">${task.title}</h4>
        ${descHTML}
        <div class="task-footer">
            <div class="card-actions-left">
                ${editBtn}
                <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete task"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="card-nav-arrows">${moveButtonsHTML(task)}</div>
        </div>
    `;

    if (!isDone) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => { card.classList.add('dragging'); e.dataTransfer.setData('text/plain', task.id); });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    }

    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, task.id);
    });

    return card;
}

function checkEmptyState(columnKey, bodyEl) {
    const meta = COLUMN_META[columnKey];
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = `<i class="fas ${meta.icon}"></i><p>${meta.message}</p>`;
    bodyEl.appendChild(placeholder);
}

function getVisibleTasks() {
    let filteredTasks = [...state.tasks];

    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(t =>
            t.title.toLowerCase().includes(q) || (t.desc || '').toLowerCase().includes(q));
    }
    if (state.filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === state.filterPriority);
    }
    filteredTasks.sort((a, b) => {
        if (state.sortBy === 'date-desc') return b.createdAt - a.createdAt;
        if (state.sortBy === 'date-asc')  return a.createdAt - b.createdAt;
        if (state.sortBy === 'priority-desc') {
            const w = { high: 3, medium: 2, low: 1 };
            return w[b.priority] - w[a.priority];
        }
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });
    return filteredTasks;
}

function render() {
    const visibleTasks = getVisibleTasks();
    const counts = { todo: 0, progress: 0, done: 0 };
    Object.keys(COLUMN_META).forEach(key => {
        document.getElementById(COLUMN_META[key].body).innerHTML = '';
    });

    visibleTasks.forEach(task => {
        const meta = COLUMN_META[task.column];
        if (!meta) return;
        document.getElementById(meta.body).appendChild(createTaskCardDOM(task));
        counts[task.column]++;
    });

    Object.keys(COLUMN_META).forEach(key => {
        const meta = COLUMN_META[key];
        document.getElementById(meta.count).textContent = counts[key];
        if (counts[key] === 0) {
            checkEmptyState(key, document.getElementById(meta.body));
        }
    });

    document.getElementById('todoTabBadge').textContent = counts.todo;
    document.getElementById('progressTabBadge').textContent = counts.progress;
    document.getElementById('doneTabBadge').textContent = counts.done;
}

function renderTimestampsOnly() {
    document.querySelectorAll('.task-card').forEach(card => {
        const task = state.tasks.find(t => t.id === card.dataset.id);
        if (!task) return;
        const timeEl = card.querySelector('.task-time');
        if (timeEl) timeEl.textContent = formatRelativeTime(task.createdAt);
    });
}
