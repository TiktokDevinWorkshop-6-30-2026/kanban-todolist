function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (state.tasks.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-message';
        empty.textContent = 'No tasks yet. Add one above to get started!';
        list.appendChild(empty);
        return;
    }

    state.tasks.forEach(task => {
        const row = document.createElement('div');
        row.className = 'task-row';

        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteTask(task.id);

        row.appendChild(title);
        row.appendChild(deleteBtn);
        list.appendChild(row);
    });
}
