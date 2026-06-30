function checkEmptyState(bodyEl, column) {
    if (bodyEl.children.length > 0) return;
    var iconClass, message;
    if (column === 'todo') { iconClass = 'fas fa-clipboard-list'; message = 'No tasks listed here.'; }
    else if (column === 'progress') { iconClass = 'fas fa-spinner'; message = 'Nothing in progress.'; }
    else { iconClass = 'fas fa-check-double'; message = 'No completed tasks yet.'; }
    bodyEl.innerHTML = '<div class="empty-column-placeholder"><i class="' + iconClass + '"></i><p>' + message + '</p></div>';
}

function createTaskCardDOM(task) {
    var card = document.createElement('article');
    card.className = 'task-card priority-' + (task.priority || 'low');
    card.setAttribute('data-id', task.id);

    var descHtml = task.desc
        ? '<p class="task-desc-excerpt">' + task.desc + '</p>'
        : '<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>';

    var arrowsHtml = '';
    if (task.column === 'todo') {
        arrowsHtml = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to In Progress"><i class="fas fa-arrow-right"></i></button>';
    } else if (task.column === 'progress') {
        arrowsHtml = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'todo\')" title="Move to To Do"><i class="fas fa-arrow-left"></i></button>' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'done\')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>';
    } else if (task.column === 'done') {
        arrowsHtml = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to In Progress"><i class="fas fa-arrow-left"></i></button>';
    }

    var editIcon = task.column === 'done' ? 'fa-expand-alt' : 'fa-pencil-alt';
    var editTitle = task.column === 'done' ? 'View Task' : 'Edit Task';

    var timeStr = formatRelativeTime(task.createdAt);

    var isTodo = task.column === 'todo';

    var devinPill = '';
    if (task.devinSessionId) {
        var working = isDevinWorking(task);
        var label = devinStatusLabel(task);
        var labelSlug = label.replace(/\s+/g, '-').toLowerCase();
        var pillIcon = working ? 'fa-spinner fa-spin' : 'fa-robot';
        var workingClass = working ? ' devin-working' : '';
        var clickableClass = task.devinSessionUrl ? ' devin-clickable' : '';
        var pillTitle = task.devinSessionUrl ? 'Open Devin session' : 'Devin session status';
        var clickAttr = task.devinSessionUrl ? ' onclick="openDevinSession(\'' + task.id + '\')"' : '';
        devinPill = '<span class="devin-status-pill devin-' + labelSlug + workingClass + clickableClass + '" title="' + pillTitle + '"' + clickAttr + '><i class="fas ' + pillIcon + '"></i> ' + label + '</span>';
    }

    var devinButton = '';
    if (devinEnabled && isTodo && !task.devinSessionId) {
        devinButton = '<button class="btn-card-action btn-devin" onclick="openDevinModal(\'' + task.id + '\')" title="Run with Devin"><i class="fas fa-robot"></i></button>';
    } else if (task.devinSessionId) {
        devinButton = '<button class="btn-card-action btn-devin-open" onclick="openDevinSession(\'' + task.id + '\')" title="Open Devin session"><i class="fas fa-arrow-up-right-from-square"></i></button>';
    }

    card.innerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + (task.priority || 'low') + '" onclick="openBadgePriorityMenu(event, \'' + task.id + '\')">' + (task.priority || 'low') + '</span>' +
            devinPill +
            '<span class="task-time">' + timeStr + '</span>' +
            '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete task"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer">' +
            '<div class="card-actions-left">' +
                '<button class="btn-card-action" onclick="openTaskModal(\'' + task.id + '\')" title="' + editTitle + '"><i class="fas ' + editIcon + '"></i></button>' +
                devinButton +
            '</div>' +
            '<div class="card-nav-arrows">' + arrowsHtml + '</div>' +
        '</div>';

    // Drag-and-drop (not for Done tasks)
    if (task.column !== 'done') {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', function(e) {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.id);
        });
        card.addEventListener('dragend', function() {
            card.classList.remove('dragging');
        });
    }

    // Right-click context menu
    card.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, task.id);
    });

    return card;
}

function renderTimestampsOnly() {
    var cards = document.querySelectorAll('.task-card');
    cards.forEach(function(card) {
        var taskId = card.getAttribute('data-id');
        var task = state.tasks.find(function(t) { return t.id === taskId; });
        if (task) {
            var timeEl = card.querySelector('.task-time');
            if (timeEl) timeEl.textContent = formatRelativeTime(task.createdAt);
        }
    });
}

function render() {
    var bodyTodo = document.getElementById('bodyTodo');
    var bodyProgress = document.getElementById('bodyProgress');
    var bodyDone = document.getElementById('bodyDone');
    bodyTodo.innerHTML = '';
    bodyProgress.innerHTML = '';
    bodyDone.innerHTML = '';

    var filteredTasks = state.tasks.slice();
    if (state.searchQuery) {
        var q = state.searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(function(t) {
            return t.title.toLowerCase().includes(q) || (t.desc || '').toLowerCase().includes(q);
        });
    }
    if (state.filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter(function(t) { return t.priority === state.filterPriority; });
    }
    filteredTasks.sort(function(a, b) {
        if (state.sortBy === 'date-desc') return b.createdAt - a.createdAt;
        if (state.sortBy === 'date-asc') return a.createdAt - b.createdAt;
        if (state.sortBy === 'priority-desc') {
            var w = { high: 3, medium: 2, low: 1 };
            return w[b.priority] - w[a.priority];
        }
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });

    var counts = { todo: 0, progress: 0, done: 0 };

    filteredTasks.forEach(function(task) {
        var card = createTaskCardDOM(task);
        if (task.column === 'progress') {
            bodyProgress.appendChild(card);
            counts.progress++;
        } else if (task.column === 'done') {
            bodyDone.appendChild(card);
            counts.done++;
        } else {
            bodyTodo.appendChild(card);
            counts.todo++;
        }
    });

    document.getElementById('countTodo').textContent = counts.todo;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countDone').textContent = counts.done;

    // Update mobile tab badges
    var todoTabBadge = document.getElementById('todoTabBadge');
    var progressTabBadge = document.getElementById('progressTabBadge');
    var doneTabBadge = document.getElementById('doneTabBadge');
    if (todoTabBadge) todoTabBadge.textContent = counts.todo;
    if (progressTabBadge) progressTabBadge.textContent = counts.progress;
    if (doneTabBadge) doneTabBadge.textContent = counts.done;

    checkEmptyState(bodyTodo, 'todo');
    checkEmptyState(bodyProgress, 'progress');
    checkEmptyState(bodyDone, 'done');
}
