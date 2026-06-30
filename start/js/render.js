function checkEmptyState(bodyEl, column) {
    if (bodyEl.children.length > 0) return;
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    let icon, msg;
    if (column === 'todo') { icon = 'fa-clipboard-list'; msg = 'No tasks listed here.'; }
    else if (column === 'progress') { icon = 'fa-spinner'; msg = 'Nothing in progress.'; }
    else { icon = 'fa-check-double'; msg = 'No completed tasks yet.'; }
    placeholder.innerHTML = '<i class="fas ' + icon + '"></i><p>' + msg + '</p>';
    bodyEl.appendChild(placeholder);
}

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = 'task-card priority-' + task.priority;
    card.setAttribute('data-id', task.id);

    const descHtml = task.desc
        ? '<p class="task-desc-excerpt">' + task.desc + '</p>'
        : '<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>';

    let arrowsHtml = '';
    if (task.column === 'todo') {
        arrowsHtml = '<div class="card-nav-arrows"><button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to In Progress"><i class="fas fa-arrow-right"></i></button></div>';
    } else if (task.column === 'progress') {
        arrowsHtml = '<div class="card-nav-arrows">' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'todo\')" title="Move to To Do"><i class="fas fa-arrow-left"></i></button>' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'done\')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>' +
            '</div>';
    } else {
        arrowsHtml = '<div class="card-nav-arrows"><button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to In Progress"><i class="fas fa-arrow-left"></i></button></div>';
    }

    const editIcon = task.column === 'done' ? 'fa-expand-alt' : 'fa-pencil-alt';
    const editTitle = task.column === 'done' ? 'View Task' : 'Edit Task';

    card.innerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + task.priority + '">' + task.priority + '</span>' +
            '<span class="task-time">' + formatRelativeTime(task.createdAt) + '</span>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer">' +
            '<div class="card-actions-left">' +
                '<button class="btn-card-action" onclick="openTaskModal(\'' + task.id + '\')" title="' + editTitle + '"><i class="fas ' + editIcon + '"></i></button>' +
                '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
            '</div>' +
            arrowsHtml +
        '</div>';

    return card;
}

function renderTimestampsOnly() {
    document.querySelectorAll('.task-card').forEach(card => {
        const id = card.getAttribute('data-id');
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            const timeEl = card.querySelector('.task-time');
            if (timeEl) timeEl.textContent = formatRelativeTime(task.createdAt);
        }
    });
}

function render() {
    const bodyTodo = document.getElementById('bodyTodo');
    const bodyProgress = document.getElementById('bodyProgress');
    const bodyDone = document.getElementById('bodyDone');
    bodyTodo.innerHTML = '';
    bodyProgress.innerHTML = '';
    bodyDone.innerHTML = '';

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

    let countTodo = 0, countProgress = 0, countDone = 0;

    filteredTasks.forEach(task => {
        const card = createTaskCardDOM(task);
        if (task.column === 'todo') {
            bodyTodo.appendChild(card);
            countTodo++;
        } else if (task.column === 'progress') {
            bodyProgress.appendChild(card);
            countProgress++;
        } else {
            bodyDone.appendChild(card);
            countDone++;
        }
    });

    document.getElementById('countTodo').textContent = countTodo;
    document.getElementById('countProgress').textContent = countProgress;
    document.getElementById('countDone').textContent = countDone;

    checkEmptyState(bodyTodo, 'todo');
    checkEmptyState(bodyProgress, 'progress');
    checkEmptyState(bodyDone, 'done');
}
