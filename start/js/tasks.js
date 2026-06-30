function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();
    if (!title) return;
    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        return;
    }

    const descInput = document.getElementById('todoDescInput');
    const desc = descInput.value.trim();
    if (desc.length > 150) {
        alert('Description must be 150 characters or fewer.');
        return;
    }

    const priorityInput = document.getElementById('todoPriorityInput');

    const task = {
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        desc: desc,
        priority: priorityInput.value,
        column: 'todo',
        createdAt: new Date().toISOString(),
        editedAt: null,
        completed: false
    };

    state.tasks.push(task);
    saveToStorage();

    input.value = '';
    descInput.value = '';
    priorityInput.value = 'low';
    document.getElementById('titleCounter').textContent = '40 left';
    document.getElementById('descCounter').textContent = '150 left';
    document.getElementById('addTodoCard').classList.remove('expanded');

    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;
    const oldColumn = task.column;
    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            alert('Tasks must pass through In Progress before moving to Done.');
            return;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo') task.completed = false;
    if ((oldColumn === 'done' || oldColumn === 'progress') && (targetColumn === 'todo' || targetColumn === 'progress')) task.completed = false;
    task.column = targetColumn;
    saveToStorage();
    render();
}
