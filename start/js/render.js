function checkEmptyState(columnBody, columnType) {
    if (columnBody.children.length > 0) return;

    const icons = { todo: 'fa-clipboard-list', progress: 'fa-spinner', done: 'fa-check-double' };
    const messages = { todo: 'No tasks listed here.', progress: 'Nothing in progress.', done: 'No completed tasks yet.' };

    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = '<i class="fas ' + icons[columnType] + '"></i><p>' + messages[columnType] + '</p>';
    columnBody.appendChild(placeholder);
}

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = 'task-card priority-' + (task.priority || 'low');
    card.setAttribute('data-id', task.id);

    const descHtml = task.desc
        ? '<p class="task-desc-excerpt">' + task.desc + '</p>'
        : '<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>';

    let arrowsHtml = '';
    if (task.column === 'todo') {
        arrowsHtml = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to Progress"><i class="fas fa-arrow-right"></i></button>';
    } else if (task.column === 'progress') {
        arrowsHtml = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'todo\')" title="Move to To Do"><i class="fas fa-arrow-left"></i></button>' +
            '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'done\')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>';
    } else if (task.column === 'done') {
        arrowsHtml = '<button class="btn-arrow" onclick="moveTask(\'' + task.id + '\', \'progress\')" title="Move to Progress"><i class="fas fa-arrow-left"></i></button>';
    }

    card.innerHTML =
        '<div class="task-card-header">' +
            '<span class="badge-priority ' + (task.priority || 'low') + '">' + (task.priority || 'low') + '</span>' +
            '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete task"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer"><div class="card-nav-arrows">' + arrowsHtml + '</div></div>';

    return card;
}

function render() {
    const bodyTodo = document.getElementById('bodyTodo');
    const bodyProgress = document.getElementById('bodyProgress');
    const bodyDone = document.getElementById('bodyDone');

    bodyTodo.innerHTML = '';
    bodyProgress.innerHTML = '';
    bodyDone.innerHTML = '';

    let countTodo = 0, countProgress = 0, countDone = 0;

    state.tasks.forEach(task => {
        const column = task.column || 'todo';
        const card = createTaskCardDOM(task);

        if (column === 'todo') {
            bodyTodo.appendChild(card);
            countTodo++;
        } else if (column === 'progress') {
            bodyProgress.appendChild(card);
            countProgress++;
        } else if (column === 'done') {
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
