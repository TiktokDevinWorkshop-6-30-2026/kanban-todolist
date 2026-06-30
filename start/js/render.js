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
        counts[task.column]++;
        var card = createTaskCardDOM(task);
        if (task.column === 'todo') bodyTodo.appendChild(card);
        else if (task.column === 'progress') bodyProgress.appendChild(card);
        else if (task.column === 'done') bodyDone.appendChild(card);
    });

    document.getElementById('countTodo').textContent = counts.todo;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countDone').textContent = counts.done;

    checkEmptyState('todo', bodyTodo, counts.todo);
    checkEmptyState('progress', bodyProgress, counts.progress);
    checkEmptyState('done', bodyDone, counts.done);
}

function checkEmptyState(columnName, element, count) {
    if (count === 0) {
        var icon = 'fa-clipboard-list';
        var msg = 'No tasks listed here.';
        if (columnName === 'progress') { icon = 'fa-spinner'; msg = 'Nothing in progress.'; }
        else if (columnName === 'done') { icon = 'fa-check-double'; msg = 'No completed tasks yet.'; }
        element.innerHTML = '<div class="empty-column-placeholder"><i class="fas ' + icon + '"></i><p>' + msg + '</p></div>';
    }
}

function renderTimestampsOnly() {
    state.tasks.forEach(function(task) {
        var badge = document.querySelector('.task-card[data-id="' + task.id + '"] .task-time');
        if (badge) badge.textContent = formatRelativeTime(task.createdAt);
    });
}

function createTaskCardDOM(task) {
    var card = document.createElement('article');
    card.className = 'task-card priority-' + task.priority;
    card.setAttribute('data-id', task.id);

    var isDone = task.column === 'done';
    var isProgress = task.column === 'progress';
    var isTodo = task.column === 'todo';

    var headerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + task.priority + '">' + task.priority + '</span>' +
            '<span class="task-time">' + formatRelativeTime(task.createdAt) + '</span>' +
        '</div>';

    var descHTML = task.desc
        ? '<p class="task-desc-excerpt">' + task.desc + '</p>'
        : '<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>';

    var navArrowsHTML = '';
    if (isTodo) {
        navArrowsHTML = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to Progress"><i class="fas fa-arrow-right"></i></button>';
    } else if (isProgress) {
        navArrowsHTML =
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'todo\')" title="Move back to To Do"><i class="fas fa-arrow-left"></i></button>' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'done\')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>';
    } else if (isDone) {
        navArrowsHTML = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move back to In Progress"><i class="fas fa-arrow-left"></i></button>';
    }

    var editButton = '<button class="btn-card-action" onclick="openTaskModal(\'' + task.id + '\')" title="' + (isDone ? 'View Task' : 'Edit Task') + '"><i class="fas ' + (isDone ? 'fa-expand-alt' : 'fa-pencil-alt') + '"></i></button>';

    var footerHTML =
        '<div class="task-footer">' +
            '<div class="card-actions-left">' + editButton + '</div>' +
            '<div class="card-nav-arrows">' + navArrowsHTML + '</div>' +
        '</div>';

    card.innerHTML =
        headerHTML +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHTML +
        footerHTML;

    return card;
}
