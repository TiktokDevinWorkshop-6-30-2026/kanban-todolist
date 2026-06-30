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

    // Drag-and-drop (not for Done tasks)
    if (task.column !== 'done') {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => { card.classList.add('dragging'); e.dataTransfer.setData('text/plain', task.id); });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    }

    // Context menu
    card.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); showContextMenu(e.clientX, e.clientY, task.id); });

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

    // Devin status pill
    let devinPillHtml = '';
    if (task.devinSessionId) {
        const label = devinStatusLabel(task);
        const working = isDevinWorking(task);
        let pillClass = 'devin-status-pill devin-' + label.replace(/\s+/g, '-');
        if (working) pillClass += ' devin-working';
        if (task.devinSessionUrl) pillClass += ' devin-clickable';
        const iconHtml = working ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fas fa-robot"></i>';
        const onclick = task.devinSessionUrl ? ' onclick="openDevinSession(\'' + task.id + '\')"' : '';
        devinPillHtml = '<span class="' + pillClass + '"' + onclick + '>' + iconHtml + ' ' + label + '</span>';
    }

    // Devin card buttons
    let devinBtnHtml = '';
    if (typeof devinEnabled !== 'undefined' && devinEnabled) {
        if (task.column === 'todo' && !task.devinSessionId) {
            devinBtnHtml = '<button class="btn-card-action btn-devin" onclick="openDevinModal(\'' + task.id + '\')" title="Run with Devin"><i class="fas fa-robot"></i></button>';
        } else if (task.devinSessionUrl) {
            devinBtnHtml = '<button class="btn-card-action btn-devin-open" onclick="openDevinSession(\'' + task.id + '\')" title="Open Devin session"><i class="fas fa-arrow-up-right-from-square"></i></button>';
        }
    }

    card.innerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + task.priority + '" onclick="openBadgePriorityMenu(event, \'' + task.id + '\')">' + task.priority + '</span>' +
            devinPillHtml +
            '<span class="task-time">' + formatRelativeTime(task.createdAt) + '</span>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer">' +
            '<div class="card-actions-left">' +
                '<button class="btn-card-action" onclick="openTaskModal(\'' + task.id + '\')" title="' + editTitle + '"><i class="fas ' + editIcon + '"></i></button>' +
                '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
                devinBtnHtml +
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

    // Update mobile tab badges
    const todoTabBadge = document.getElementById('todoTabBadge');
    const progressTabBadge = document.getElementById('progressTabBadge');
    const doneTabBadge = document.getElementById('doneTabBadge');
    if (todoTabBadge) todoTabBadge.textContent = countTodo;
    if (progressTabBadge) progressTabBadge.textContent = countProgress;
    if (doneTabBadge) doneTabBadge.textContent = countDone;

    checkEmptyState(bodyTodo, 'todo');
    checkEmptyState(bodyProgress, 'progress');
    checkEmptyState(bodyDone, 'done');

    renderTicker(countTodo, countProgress, countDone);
}

function renderTicker(countTodo, countProgress, countDone) {
    const el = document.getElementById('tickerContent');
    if (!el) return;

    const tips = [
        'Break large tasks into smaller steps for faster progress',
        'Set high priority only for truly urgent items',
        'Review your Done column weekly to celebrate wins',
        'Use descriptions to capture context you will forget later',
        'Drag cards between columns for quick status updates',
        'Right-click any card for a quick-action context menu',
        'Use the search bar to instantly find any task by title or description',
        'Filter by priority to focus on what matters most',
        'Click a priority badge to change it without opening the modal'
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const total = countTodo + countProgress + countDone;
    const items = [];
    items.push('<span class="ticker-item"><i class="fas fa-tasks"></i> ' + total + ' total tasks</span>');
    items.push('<span class="ticker-sep">\u2022</span>');
    items.push('<span class="ticker-item ticker-todo"><i class="fas fa-clipboard-list"></i> ' + countTodo + ' To Do</span>');
    items.push('<span class="ticker-sep">\u2022</span>');
    items.push('<span class="ticker-item ticker-progress"><i class="fas fa-spinner"></i> ' + countProgress + ' In Progress</span>');
    items.push('<span class="ticker-sep">\u2022</span>');
    items.push('<span class="ticker-item ticker-done"><i class="fas fa-check-circle"></i> ' + countDone + ' Done</span>');
    items.push('<span class="ticker-sep">\u2022</span>');
    items.push('<span class="ticker-item ticker-tip"><i class="fas fa-lightbulb"></i> Tip: ' + tip + '</span>');
    items.push('<span class="ticker-sep">\u2022</span>');
    items.push('<span class="ticker-item ticker-date"><i class="fas fa-calendar-day"></i> ' + dateStr + ' \u2014 ' + timeStr + '</span>');

    // Duplicate for seamless loop
    const content = items.join(' ');
    el.innerHTML = content + ' &nbsp;&nbsp;&nbsp;&nbsp; ' + content;
}
