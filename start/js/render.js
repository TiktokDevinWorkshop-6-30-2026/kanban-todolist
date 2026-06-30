function createTaskCardDOM(task) {
    var card = document.createElement('article');
    card.className = 'task-card priority-' + task.priority;
    card.setAttribute('data-id', task.id);

    // Drag & drop (not for Done tasks)
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

    var editIcon, editTitle;
    if (task.column === 'done') {
        editIcon = 'fa-expand-alt';
        editTitle = 'View Task';
    } else {
        editIcon = 'fa-pencil-alt';
        editTitle = 'Edit Task';
    }

    // Devin status pill
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

    // Devin button
    var devinButton = '';
    if (devinEnabled && task.column === 'todo' && !task.devinSessionId) {
        devinButton = '<button class="btn-card-action btn-devin" onclick="openDevinModal(\'' + task.id + '\')" title="Run with Devin"><i class="fas fa-robot"></i></button>';
    } else if (task.devinSessionId) {
        devinButton = '<button class="btn-card-action btn-devin-open" onclick="openDevinSession(\'' + task.id + '\')" title="Open Devin session"><i class="fas fa-arrow-up-right-from-square"></i></button>';
    }

    card.innerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + task.priority + '" onclick="openBadgePriorityMenu(event, \'' + task.id + '\')">' + task.priority + '</span>' +
            devinPill +
            '<span class="task-time">' + formatRelativeTime(task.createdAt) + '</span>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer">' +
            '<div class="card-actions-left">' +
                '<button class="btn-card-action" onclick="openTaskModal(\'' + task.id + '\')" title="' + editTitle + '"><i class="fas ' + editIcon + '"></i></button>' +
                devinButton +
                '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete task"><i class="fas fa-trash-alt"></i></button>' +
            '</div>' +
            '<div class="card-nav-arrows">' + arrowsHtml + '</div>' +
        '</div>';

    return card;
}

function checkEmptyState(bodyEl, column) {
    if (bodyEl.children.length > 0) return;

    var icon, message;
    if (column === 'todo') {
        icon = 'fa-clipboard-list';
        message = 'No tasks listed here.';
    } else if (column === 'progress') {
        icon = 'fa-spinner';
        message = 'Nothing in progress.';
    } else {
        icon = 'fa-check-double';
        message = 'No completed tasks yet.';
    }

    var placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = '<i class="fas ' + icon + '"></i><p>' + message + '</p>';
    bodyEl.appendChild(placeholder);
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
            return t.title.toLowerCase().indexOf(q) !== -1 || (t.desc || '').toLowerCase().indexOf(q) !== -1;
        });
    }

    if (state.filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter(function(t) {
            return t.priority === state.filterPriority;
        });
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
        if (task.column === 'todo') {
            bodyTodo.appendChild(card);
            counts.todo++;
        } else if (task.column === 'progress') {
            bodyProgress.appendChild(card);
            counts.progress++;
        } else if (task.column === 'done') {
            bodyDone.appendChild(card);
            counts.done++;
        }
    });

    document.getElementById('countTodo').textContent = counts.todo;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countDone').textContent = counts.done;

    // Mobile tab badges
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
