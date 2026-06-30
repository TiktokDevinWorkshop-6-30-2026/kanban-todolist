function createTaskCardDOM(task) {
    var card = document.createElement('article');
    card.className = 'task-card priority-' + task.priority;
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

    card.innerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + task.priority + '">' + task.priority + '</span>' +
            '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete task"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer">' +
            '<div class="card-actions-left"></div>' +
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

    var counts = { todo: 0, progress: 0, done: 0 };

    state.tasks.forEach(function(task) {
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

    checkEmptyState(bodyTodo, 'todo');
    checkEmptyState(bodyProgress, 'progress');
    checkEmptyState(bodyDone, 'done');
}
