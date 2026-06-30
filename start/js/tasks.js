var editingTaskId = null;

function addNewTodo() {
    var input = document.getElementById('todoTitleInput');
    var title = input.value.trim();

    if (!title) {
        input.focus();
        return;
    }

    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        input.focus();
        return;
    }

    var descInput = document.getElementById('todoDescInput');
    var desc = descInput.value.trim();

    if (desc.length > 150) {
        alert('Description must be 150 characters or less.');
        descInput.focus();
        return;
    }

    var priorityInput = document.getElementById('todoPriorityInput');
    var priority = priorityInput.value;

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

function openTaskModal(taskId) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    editingTaskId = taskId;

    document.getElementById('taskTitleInput').value = task.title;
    document.getElementById('taskPriorityInput').value = task.priority || 'low';
    document.getElementById('taskDescInput').value = task.desc || '';
    document.getElementById('taskTitleCounter').textContent = (40 - task.title.length) + ' left';
    document.getElementById('taskDescCounter').textContent = (150 - (task.desc || '').length) + ' left';
    document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
    document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

    var isDone = task.column === 'done';
    document.getElementById('taskTitleInput').disabled = isDone;
    document.getElementById('taskPriorityInput').disabled = isDone;
    document.getElementById('taskDescInput').disabled = isDone;
    document.getElementById('taskModalTitle').textContent = isDone ? 'Task Details' : 'Edit Task';
    document.getElementById('saveEditBtn').style.display = isDone ? 'none' : '';

    openModal('taskModal');
}
var openViewModal = openTaskModal;
var openEditModal = openTaskModal;

function saveEditedTask() {
    if (!editingTaskId) return;
    var task = state.tasks.find(function(t) { return t.id === editingTaskId; });
    if (!task) return;

    var title = document.getElementById('taskTitleInput').value.trim();
    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        return;
    }
    var desc = document.getElementById('taskDescInput').value.trim();
    if (desc.length > 150) {
        alert('Description must be 150 characters or less.');
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

async function deleteTask(taskId) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    var taskTitle = task ? task.title : 'this task';
    var confirmed = await requestConfirmation('Delete Task', 'Are you sure you want to permanently delete "' + taskTitle + '"?');
    if (!confirmed) return;
    state.tasks = state.tasks.filter(function(t) { return t.id !== taskId; });
    saveToStorage();
    render();
}

function moveTask(taskId, targetColumn) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task || task.column === targetColumn) return;
    var oldColumn = task.column;
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
