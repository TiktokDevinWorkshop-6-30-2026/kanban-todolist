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

    card.innerHTML =
        '<div class="task-header">' +
            '<span class="badge-priority ' + task.priority + '">' + task.priority + '</span>' +
            '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
        '<h4 class="task-title">' + task.title + '</h4>' +
        descHtml +
        '<div class="task-footer">' +
            '<div class="card-actions-left"></div>' +
            arrowsHtml +
        '</div>';

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
