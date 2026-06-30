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

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${task.priority}">${task.priority}</span>
            <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete task"><i class="fas fa-trash-alt"></i></button>
        </div>
        <h4 class="task-title">${task.title}</h4>
        ${descHTML}
        <div class="task-footer">
            <div class="card-nav-arrows">${moveButtonsHTML(task)}</div>
        </div>
    `;
    return card;
}

function checkEmptyState(columnKey, bodyEl) {
    const meta = COLUMN_META[columnKey];
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = `<i class="fas ${meta.icon}"></i><p>${meta.message}</p>`;
    bodyEl.appendChild(placeholder);
}

function render() {
    const counts = { todo: 0, progress: 0, done: 0 };
    Object.keys(COLUMN_META).forEach(key => {
        document.getElementById(COLUMN_META[key].body).innerHTML = '';
    });

    state.tasks.forEach(task => {
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
}
