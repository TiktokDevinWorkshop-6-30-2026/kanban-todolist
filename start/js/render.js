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

    card.innerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + (task.priority || 'low') + '">' + (task.priority || 'low') + '</span>' +
            '<span class="task-time">' + timeStr + '</span>' +
            '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete task"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer">' +
            '<div class="card-actions-left">' +
                '<button class="btn-card-action" onclick="openTaskModal(\'' + task.id + '\')" title="' + editTitle + '"><i class="fas ' + editIcon + '"></i></button>' +
            '</div>' +
            '<div class="card-nav-arrows">' + arrowsHtml + '</div>' +
        '</div>';

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

    checkEmptyState(bodyTodo, 'todo');
    checkEmptyState(bodyProgress, 'progress');
    checkEmptyState(bodyDone, 'done');
}
