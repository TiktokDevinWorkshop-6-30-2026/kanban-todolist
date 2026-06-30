function render() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (state.tasks.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-msg';
        empty.textContent = 'No tasks yet — add one above!';
        taskList.appendChild(empty);
        return;
    }

    state.tasks.forEach(task => {
        const row = document.createElement('div');
        row.className = 'task-row';

        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = '\u00D7';
        delBtn.onclick = function () { deleteTask(task.id); };

        row.appendChild(title);
        row.appendChild(delBtn);
        taskList.appendChild(row);
    });
}
