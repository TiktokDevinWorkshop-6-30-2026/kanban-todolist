function render() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (state.tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">No tasks yet — add one above!</div>';
        return;
    }

    state.tasks.forEach(function(task) {
        const row = document.createElement('div');
        row.className = 'task-row';
        row.innerHTML = '<span class="task-title">' + task.title + '</span>' +
            '<button class="delete-btn" onclick="deleteTask(\'' + task.id + '\')">&times;</button>';
        taskList.appendChild(row);
    });
}
