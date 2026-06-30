function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const priorityInput = document.getElementById('todoPriorityInput');
    const descInput = document.getElementById('todoDescInput');

    const title = input.value.trim();
    const priority = priorityInput.value;
    const desc = descInput.value.trim();

    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        input.focus();
        return;
    }
    if (desc.length > 150) {
        alert('Description must be 150 characters or fewer.');
        descInput.focus();
        return;
    }

    state.tasks.push({
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        desc: desc,
        priority: priority,
        column: 'todo',
        createdAt: Date.now(),
        editedAt: null,
        completed: false
    });
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

// Apply the To Do -> In Progress -> Done workflow rules to a column transition.
// Returns true if the transition is allowed (and updates completed flags), false otherwise.
function applyColumnTransition(task, targetColumn) {
    const oldColumn = task.column;
    if (oldColumn === targetColumn) return true;

    // Must pass through In Progress before Done.
    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            alert('Move this task to In Progress before marking it Done.');
            return false;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo') task.completed = false;
    if ((oldColumn === 'done' || oldColumn === 'progress') && (targetColumn === 'todo' || targetColumn === 'progress')) {
        task.completed = false;
    }

    task.column = targetColumn;
    return true;
}

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;
    if (!applyColumnTransition(task, targetColumn)) return;
    saveToStorage();
    render();
}

// Drag-and-drop: move a task to targetColumn and position it before `beforeId`
// (or at the end of the column when beforeId is null). Reorders within a column too.
function handleTaskDrop(taskId, targetColumn, beforeId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || taskId === beforeId) return;
    if (!applyColumnTransition(task, targetColumn)) return;

    // Reposition within the global task array so column order reflects the drop.
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    const beforeIndex = beforeId ? state.tasks.findIndex(t => t.id === beforeId) : -1;
    if (beforeIndex === -1) {
        state.tasks.push(task);
    } else {
        state.tasks.splice(beforeIndex, 0, task);
    }

    saveToStorage();
    render();
}
