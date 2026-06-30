let editingTaskId = null;

function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const priorityInput = document.getElementById('todoPriorityInput');

    const title = input.value.trim();
    const desc = descInput.value.trim();
    const priority = priorityInput.value;

    if (title.length < 3 || title.length > 40) {
        showToast('Title must be between 3 and 40 characters.', 'warning');
        input.focus();
        return;
    }
    if (desc.length > 150) {
        showToast('Description must be 150 characters or fewer.', 'warning');
        descInput.focus();
        return;
    }

    state.tasks.push({
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title,
        desc,
        priority,
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
    input.focus();
    render();
    showToast('Task added.', 'success');
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
    document.getElementById('saveEditBtn').classList.toggle('hidden', isDone);

    openModal('taskModal');
}
const openViewModal = openTaskModal;
const openEditModal = openTaskModal;

function saveEditedTask() {
    const task = state.tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const titleInput = document.getElementById('taskTitleInput');
    const descInput = document.getElementById('taskDescInput');
    const priorityInput = document.getElementById('taskPriorityInput');

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();

    if (title.length < 3 || title.length > 40) {
        showToast('Title must be between 3 and 40 characters.', 'warning');
        titleInput.focus();
        return;
    }
    if (desc.length > 150) {
        showToast('Description must be 150 characters or fewer.', 'warning');
        descInput.focus();
        return;
    }

    task.title = title;
    task.desc = desc;
    task.priority = priorityInput.value;
    task.editedAt = Date.now();
    saveToStorage();
    closeModal('taskModal');
    render();
    showToast('Task updated.', 'success');
}

async function deleteTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const label = task.title;
    const confirmed = await requestConfirmation('Delete Task', `Are you sure you want to delete "${label}"?`);
    if (!confirmed) return;
    const deletedTask = { ...task };
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
    showToast('Task deleted.', 'info', {
        label: 'Undo',
        onClick: () => {
            state.tasks.push(deletedTask);
            saveToStorage();
            render();
            showToast('Task restored.', 'success');
        }
    });
}

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;
    const oldColumn = task.column;

    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            showToast('Move this task to In Progress before marking it Done.', 'warning');
            return;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo') task.completed = false;
    if ((oldColumn === 'done' || oldColumn === 'progress') && (targetColumn === 'todo' || targetColumn === 'progress')) {
        task.completed = false;
    }

    task.column = targetColumn;
    saveToStorage();
    render();
    const labels = { todo: 'To Do', progress: 'In Progress', done: 'Done' };
    showToast(`Moved to ${labels[targetColumn]}.`, 'success');
}
