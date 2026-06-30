let editingTaskId = null;

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
        completed: false,
        completedAt: null
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

async function deleteTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const ok = await requestConfirmation('Delete Task', `Are you sure you want to permanently delete "${task.title}"?`);
    if (!ok) return;
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}

function openTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    editingTaskId = taskId;

    const titleInput = document.getElementById('taskTitleInput');
    const priorityInput = document.getElementById('taskPriorityInput');
    const descInput = document.getElementById('taskDescInput');

    titleInput.value = task.title;
    priorityInput.value = task.priority;
    descInput.value = task.desc || '';
    document.getElementById('taskTitleCounter').textContent = `${40 - titleInput.value.length} left`;
    document.getElementById('taskDescCounter').textContent = `${150 - descInput.value.length} left`;
    document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
    document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

    const isDone = task.column === 'done';
    titleInput.disabled = isDone;
    priorityInput.disabled = isDone;
    descInput.disabled = isDone;
    document.getElementById('taskModalTitle').textContent = isDone ? 'Task Details' : 'Edit Task';
    document.getElementById('saveEditBtn').style.display = isDone ? 'none' : '';

    openModal('taskModal');
}

const openViewModal = openTaskModal;
const openEditModal = openTaskModal;

function saveEditedTask() {
    const task = state.tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const titleInput = document.getElementById('taskTitleInput');
    const descInput = document.getElementById('taskDescInput');
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();

    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        titleInput.focus();
        return;
    }
    if (desc.length > 150) {
        alert('Description must be 150 characters or fewer.');
        descInput.focus();
        return;
    }

    task.title = title;
    task.desc = desc;
    task.priority = document.getElementById('taskPriorityInput').value;
    task.editedAt = Date.now();
    saveToStorage();
    closeModal('taskModal');
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
        task.completedAt = Date.now();
    }
    if (targetColumn === 'todo') task.completed = false;
    if ((oldColumn === 'done' || oldColumn === 'progress') && (targetColumn === 'todo' || targetColumn === 'progress')) {
        task.completed = false;
    }
    // Leaving Done clears the completion timestamp.
    if (oldColumn === 'done' && targetColumn !== 'done') {
        task.completedAt = null;
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
