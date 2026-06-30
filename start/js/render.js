function checkEmptyState(bodyEl, column) {
    if (bodyEl.children.length > 0) return;
    var icons = { todo: 'fa-clipboard-list', progress: 'fa-spinner', done: 'fa-check-double' };
    var msgs = { todo: 'No tasks listed here.', progress: 'Nothing in progress.', done: 'No completed tasks yet.' };
    var placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = '<i class="fas ' + icons[column] + '"></i><p>' + msgs[column] + '</p>';
    bodyEl.appendChild(placeholder);
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
        arrowsHtml = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to Progress"><i class="fas fa-arrow-right"></i></button>';
    } else if (task.column === 'progress') {
        arrowsHtml =
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'todo\')" title="Move to To Do"><i class="fas fa-arrow-left"></i></button>' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'done\')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>';
    } else if (task.column === 'done') {
        arrowsHtml = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to Progress"><i class="fas fa-arrow-left"></i></button>';
    }

    card.innerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + (task.priority || 'low') + '">' + (task.priority || 'low') + '</span>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer">' +
            '<div class="card-actions-left">' +
                '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete task"><i class="fas fa-trash-alt"></i></button>' +
            '</div>' +
            '<div class="card-nav-arrows">' + arrowsHtml + '</div>' +
        '</div>';

    return card;
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
        var col = task.column || 'todo';
        var card = createTaskCardDOM(task);
        if (col === 'todo') {
            bodyTodo.appendChild(card);
        } else if (col === 'progress') {
            bodyProgress.appendChild(card);
        } else {
            bodyDone.appendChild(card);
        }
        counts[col] = (counts[col] || 0) + 1;
    });

    document.getElementById('countTodo').textContent = counts.todo;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countDone').textContent = counts.done;

    checkEmptyState(bodyTodo, 'todo');
    checkEmptyState(bodyProgress, 'progress');
    checkEmptyState(bodyDone, 'done');
}
