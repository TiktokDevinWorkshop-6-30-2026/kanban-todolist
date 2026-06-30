function render() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (state.tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">No tasks yet. Add one above!</div>';
        return;
    }

    state.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card priority-' + (task.priority || 'low');

        const descHtml = task.desc
            ? '<p class="task-desc-excerpt">' + task.desc + '</p>'
            : '<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>';

        card.innerHTML =
            '<div class="task-header">' +
                '<span class="badge-priority ' + (task.priority || 'low') + '">' + (task.priority || 'low') + '</span>' +
                '<button class="btn-card-action" onclick="deleteTask(\'' + task.id + '\')" title="Delete task"><i class="fas fa-trash-alt"></i></button>' +
            '</div>' +
            '<div class="task-title">' + task.title + '</div>' +
            descHtml;

        taskList.appendChild(card);
    });
}
