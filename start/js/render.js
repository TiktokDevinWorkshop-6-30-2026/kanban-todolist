function render() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (state.tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">No tasks yet. Add one above!</div>';
        return;
    }

    state.tasks.forEach(task => {
        const card = document.createElement('article');
        card.className = 'task-card priority-' + (task.priority || 'low');
        card.setAttribute('data-id', task.id);

        const descHtml = task.desc
            ? '<p class="task-desc-excerpt">' + task.desc + '</p>'
            : '<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>';

        card.innerHTML =
            '<div class="task-card-header">' +
                '<span class="badge-priority ' + (task.priority || 'low') + '">' + (task.priority || 'low') + '</span>' +
                '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete task"><i class="fas fa-trash-alt"></i></button>' +
            '</div>' +
            '<h4 class="task-title">' + task.title + '</h4>' +
            descHtml;

        taskList.appendChild(card);
    });
}
