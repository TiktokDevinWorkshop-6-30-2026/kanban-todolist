function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (state.tasks.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No tasks yet — add your first one above!';
        list.appendChild(empty);
        return;
    }

    state.tasks.forEach((task) => {
        const row = document.createElement('div');
        row.className = 'task-row';

        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = 'Delete';
        delBtn.setAttribute('onclick', `deleteTask('${task.id}')`);

        row.appendChild(title);
        row.appendChild(delBtn);
        list.appendChild(row);
    });
}
