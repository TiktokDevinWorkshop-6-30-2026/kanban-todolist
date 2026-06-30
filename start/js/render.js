function render() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (state.tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">No tasks yet. Add one above!</div>';
        return;
    }

    state.tasks.forEach(task => {
        const row = document.createElement('div');
        row.className = 'task-row' + (task.done ? ' done' : '');
        row.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="done-checkbox" ${task.done ? 'checked' : ''} onchange="toggleDone('${task.id}')" title="Mark as done">
                <span class="task-title">${task.title}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask('${task.id}')" title="Delete task">&times;</button>
        `;
        taskList.appendChild(row);
    });
}
