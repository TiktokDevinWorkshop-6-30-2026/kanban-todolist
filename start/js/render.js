function formatTimestamp(ms) {
    return new Date(ms).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
}

const COLUMN_BODIES = {
    todo: 'bodyTodo',
    progress: 'bodyProgress',
    done: 'bodyDone'
};

const COLUMN_COUNTS = {
    todo: 'countTodo',
    progress: 'countProgress',
    done: 'countDone'
};

const EMPTY_STATES = {
    todo:     { icon: 'fa-clipboard-list', text: 'No tasks listed here.' },
    progress: { icon: 'fa-spinner',        text: 'Nothing in progress.' },
    done:     { icon: 'fa-check-double',    text: 'No completed tasks yet.' }
};

const MOVE_BUTTONS = {
    todo:     `<button class="btn-arrow" onclick="moveTask('%ID%', 'progress')" title="Move to In Progress"><i class="fas fa-arrow-right"></i></button>`,
    progress: `<button class="btn-arrow" onclick="moveTask('%ID%', 'todo')" title="Move to To Do"><i class="fas fa-arrow-left"></i></button>
               <button class="btn-arrow" onclick="moveTask('%ID%', 'done')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>`,
    done:     `<button class="btn-arrow" onclick="moveTask('%ID%', 'progress')" title="Move to In Progress"><i class="fas fa-arrow-left"></i></button>`
};

// High-priority tasks are pinned to the top of To Do and In Progress.
// Done keeps its natural order. Sort is stable, so non-high tasks keep their order.
function orderTasksForColumn(tasks, column) {
    if (column === 'done') return tasks;
    return [...tasks].sort((a, b) => {
        return (a.priority === 'high' ? 0 : 1) - (b.priority === 'high' ? 0 : 1);
    });
}

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}`;
    card.dataset.id = task.id;

    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, task.id);
    });

    const descMarkup = task.desc
        ? `<p class="task-desc-excerpt">${task.desc}</p>`
        : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

    const moveButtons = MOVE_BUTTONS[task.column].replaceAll('%ID%', task.id);

    const completedMarkup = (task.column === 'done' && task.completedAt)
        ? `<span class="task-time"><i class="fas fa-check-circle"></i> Completed ${formatTimestamp(task.completedAt)}</span>`
        : `<span class="task-time">${formatRelativeTime(task.createdAt)}</span>`;

    const isDone = task.column === 'done';
    const editBtn = isDone
        ? `<button class="btn-card-action" title="View Task" onclick="openTaskModal('${task.id}')"><i class="fas fa-expand-alt"></i></button>`
        : `<button class="btn-card-action" title="Edit Task" onclick="openTaskModal('${task.id}')"><i class="fas fa-pencil-alt"></i></button>`;

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${task.priority}" onclick="openBadgePriorityMenu(event, '${task.id}')">${task.priority}</span>
            <button class="btn-card-action" title="Delete" onclick="deleteTask('${task.id}')"><i class="fas fa-trash-alt"></i></button>
        </div>
        <h4 class="task-title">${task.title}</h4>
        ${descMarkup}
        <div class="task-footer">
            <div class="card-actions-left">
                ${editBtn}
                ${completedMarkup}
            </div>
            <div class="card-nav-arrows">${moveButtons}</div>
        </div>
    `;

    return card;
}

function checkEmptyState(body, column) {
    const { icon, text } = EMPTY_STATES[column];
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = `<i class="fas ${icon}"></i><p>${text}</p>`;
    body.appendChild(placeholder);
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
    const counts = { todo: 0, progress: 0, done: 0 };
    const visibleTasks = getVisibleTasks();

    Object.keys(COLUMN_BODIES).forEach((column) => {
        const body = document.getElementById(COLUMN_BODIES[column]);
        body.innerHTML = '';

        const tasks = visibleTasks.filter(t => t.column === column);
        counts[column] = tasks.length;

        if (tasks.length === 0) {
            checkEmptyState(body, column);
            return;
        }

        orderTasksForColumn(tasks, column).forEach((task) => {
            body.appendChild(createTaskCardDOM(task));
        });
    });

    document.getElementById(COLUMN_COUNTS.todo).textContent = counts.todo;
    document.getElementById(COLUMN_COUNTS.progress).textContent = counts.progress;
    document.getElementById(COLUMN_COUNTS.done).textContent = counts.done;

    document.getElementById('todoTabBadge').textContent = counts.todo;
    document.getElementById('progressTabBadge').textContent = counts.progress;
    document.getElementById('doneTabBadge').textContent = counts.done;
}

// Refresh only the relative "time ago" labels without a full re-render.
function renderTimestampsOnly() {
    document.querySelectorAll('.task-card').forEach((card) => {
        const task = state.tasks.find(t => t.id === card.dataset.id);
        if (!task) return;
        const timeEl = card.querySelector('.card-actions-left .task-time');
        if (!timeEl) return;
        if (task.column === 'done' && task.completedAt) {
            timeEl.innerHTML = `<i class="fas fa-check-circle"></i> Completed ${formatTimestamp(task.completedAt)}`;
        } else {
            timeEl.textContent = formatRelativeTime(task.createdAt);
        }
    });
}
