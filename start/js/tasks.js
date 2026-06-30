let editingTaskId = null;

function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();
    if (!title) return;
    if (title.length < 3 || title.length > 40) {
        showToast('Title must be between 3 and 40 characters.', 'warning');
        return;
    }

    const descInput = document.getElementById('todoDescInput');
    const desc = descInput.value.trim();
    if (desc.length > 150) {
        showToast('Description must be 150 characters or fewer.', 'warning');
        return;
    }

    const priorityInput = document.getElementById('todoPriorityInput');

    const task = {
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        desc: desc,
        priority: priorityInput.value,
        column: 'todo',
        createdAt: Date.now(),
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
    showToast('Task added to To Do.', 'success');
}

async function deleteTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const confirmed = await requestConfirmation('Delete Task', 'Are you sure you want to permanently delete "' + task.title + '"?');
    if (!confirmed) return;
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
    showToast('Task deleted.', 'info');
}

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;
    const oldColumn = task.column;
    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            showToast('Tasks must pass through In Progress before moving to Done.', 'warning');
            return;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo') task.completed = false;
    if ((oldColumn === 'done' || oldColumn === 'progress') && (targetColumn === 'todo' || targetColumn === 'progress')) task.completed = false;
    task.column = targetColumn;
    saveToStorage();
    render();
    const colNames = { todo: 'To Do', progress: 'In Progress', done: 'Done' };
    showToast('Moved to ' + colNames[targetColumn] + '.', 'success');
}

function openTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    editingTaskId = taskId;

    const titleInput = document.getElementById('taskTitleInput');
    const priorityInput = document.getElementById('taskPriorityInput');
    const descInput = document.getElementById('taskDescInput');
    const saveBtn = document.getElementById('saveEditBtn');
    const modalTitle = document.getElementById('taskModalTitle');

    titleInput.value = task.title;
    priorityInput.value = task.priority;
    descInput.value = task.desc || '';

    document.getElementById('taskTitleCounter').textContent = (40 - task.title.length) + ' left';
    document.getElementById('taskDescCounter').textContent = (150 - (task.desc || '').length) + ' left';

    document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
    document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

    if (task.column === 'done') {
        titleInput.disabled = true;
        priorityInput.disabled = true;
        descInput.disabled = true;
        saveBtn.style.display = 'none';
        modalTitle.textContent = 'Task Details';
    } else {
        titleInput.disabled = false;
        priorityInput.disabled = false;
        descInput.disabled = false;
        saveBtn.style.display = '';
        modalTitle.textContent = 'Edit Task';
    }

    openModal('taskModal');
}

const openViewModal = openTaskModal;
const openEditModal = openTaskModal;

function saveEditedTask() {
    if (!editingTaskId) return;
    const task = state.tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const title = document.getElementById('taskTitleInput').value.trim();
    if (title.length < 3 || title.length > 40) {
        showToast('Title must be between 3 and 40 characters.', 'warning');
        return;
    }
    const desc = document.getElementById('taskDescInput').value.trim();
    if (desc.length > 150) {
        showToast('Description must be 150 characters or fewer.', 'warning');
        return;
    }

    task.title = title;
    task.desc = desc;
    task.priority = document.getElementById('taskPriorityInput').value;
    task.editedAt = Date.now();

    saveToStorage();
    closeModal('taskModal');
    render();
    showToast('Task updated.', 'success');
}
