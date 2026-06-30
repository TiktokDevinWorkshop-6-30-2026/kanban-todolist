const EMPTY_STATES = {
    todo:     { icon: 'fa-clipboard-list', text: 'No tasks listed here.' },
    progress: { icon: 'fa-spinner',        text: 'Nothing in progress.' },
    done:     { icon: 'fa-check-double',    text: 'No completed tasks yet.' }
};

const MOVE_ARROWS = {
    todo: [
        { target: 'progress', icon: 'fa-arrow-right', title: 'Move to Progress' }
    ],
    progress: [
        { target: 'todo', icon: 'fa-arrow-left', title: 'Move to To Do' },
        { target: 'done', icon: 'fa-arrow-right', title: 'Move to Done' }
    ],
    done: [
        { target: 'progress', icon: 'fa-arrow-left', title: 'Move to In Progress' }
    ]
};

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}`;
    card.setAttribute('data-id', task.id);

    if (task.column !== 'done') {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => { card.classList.add('dragging'); e.dataTransfer.setData('text/plain', task.id); });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    }
    card.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); showContextMenu(e.clientX, e.clientY, task.id); });

    const descHtml = task.desc
        ? `<p class="task-desc-excerpt">${task.desc}</p>`
        : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

    const arrows = (MOVE_ARROWS[task.column] || []).map(a =>
        `<button class="btn-arrow" onclick="moveTask('${task.id}', '${a.target}')" title="${a.title}"><i class="fas ${a.icon}"></i></button>`
    ).join('');

    const isDone = task.column === 'done';
    const editIcon = isDone ? 'fa-expand-alt' : 'fa-pencil-alt';
    const editTitle = isDone ? 'View Task' : 'Edit Task';

    card.innerHTML = `
        <div class="task-card-header">
            <div class="task-card-title-group">
                <span class="badge-priority ${task.priority}" onclick="openBadgePriorityMenu(event, '${task.id}')">${task.priority}</span>
                <h4 class="task-title">${task.title}</h4>
            </div>
            <span class="task-time">${formatRelativeTime(task.createdAt)}</span>
        </div>
        ${descHtml}
        <div class="task-footer">
            <div class="card-actions-left">
                <button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${editTitle}"><i class="fas ${editIcon}"></i></button>
                <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete task"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="card-nav-arrows">${arrows}</div>
        </div>
    `;
    return card;
}

function checkEmptyState(body, column) {
    if (body.children.length > 0) return;
    const { icon, text } = EMPTY_STATES[column];
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = `<i class="fas ${icon}"></i><p>${text}</p>`;
    body.appendChild(placeholder);
}

function render() {
    const bodies = {
        todo: document.getElementById('bodyTodo'),
        progress: document.getElementById('bodyProgress'),
        done: document.getElementById('bodyDone')
    };
    const counts = { todo: 0, progress: 0, done: 0 };

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

    Object.values(bodies).forEach(b => b.innerHTML = '');

    filteredTasks.forEach(task => {
        const body = bodies[task.column];
        if (!body) return;
        body.appendChild(createTaskCardDOM(task));
        counts[task.column]++;
    });

    document.getElementById('countTodo').textContent = counts.todo;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countDone').textContent = counts.done;

    document.getElementById('todoTabBadge').textContent = counts.todo;
    document.getElementById('progressTabBadge').textContent = counts.progress;
    document.getElementById('doneTabBadge').textContent = counts.done;

    Object.keys(bodies).forEach(column => checkEmptyState(bodies[column], column));
}

function renderTimestampsOnly() {
    document.querySelectorAll('.task-card').forEach(card => {
        const task = state.tasks.find(t => t.id === card.getAttribute('data-id'));
        if (!task) return;
        const timeEl = card.querySelector('.task-time');
        if (timeEl) timeEl.textContent = formatRelativeTime(task.createdAt);
    });
}
