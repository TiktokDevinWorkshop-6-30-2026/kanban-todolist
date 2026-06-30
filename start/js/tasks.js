function addNewTodo() {
    var input = document.getElementById('todoTitleInput');
    var title = input.value.trim();

    if (!title || title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        return;
    }

    var descInput = document.getElementById('todoDescInput');
    var desc = descInput.value.trim();

    if (desc.length > 150) {
        alert('Description must be 150 characters or fewer.');
        return;
    }

    var priorityInput = document.getElementById('todoPriorityInput');
    var priority = priorityInput.value;

    var task = {
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        desc: desc,
        priority: priority,
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
}

function moveTask(taskId, targetColumn) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task || task.column === targetColumn) return;

    var oldColumn = task.column;

    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            alert('Tasks must go through "In Progress" before entering "Done"!');
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
}

var editingTaskId = null;

function openTaskModal(taskId) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;

    editingTaskId = taskId;
    var readOnly = task.column === 'done';

    var titleInput = document.getElementById('taskTitleInput');
    var descInput = document.getElementById('taskDescInput');
    var priorityInput = document.getElementById('taskPriorityInput');

    titleInput.value = task.title;
    descInput.value = task.desc || '';
    priorityInput.value = task.priority;

    titleInput.disabled = readOnly;
    descInput.disabled = readOnly;
    priorityInput.disabled = readOnly;

    document.getElementById('taskTitleCounter').textContent = (40 - task.title.length) + ' left';
    document.getElementById('taskDescCounter').textContent = (150 - (task.desc ? task.desc.length : 0)) + ' left';

    document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
    document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

    document.getElementById('taskModalTitle').textContent = readOnly ? 'Task Details' : 'Edit Task';
    document.getElementById('saveEditBtn').style.display = readOnly ? 'none' : '';

    openModal('taskModal');
}

var openViewModal = openTaskModal;
var openEditModal = openTaskModal;

function saveEditedTask() {
    if (!editingTaskId) return;

    var task = state.tasks.find(function(t) { return t.id === editingTaskId; });
    if (!task) return;

    var title = document.getElementById('taskTitleInput').value.trim();
    var desc = document.getElementById('taskDescInput').value.trim();
    var priority = document.getElementById('taskPriorityInput').value;

    if (title.length < 3) { alert('Task title must be at least 3 characters long!'); return; }
    if (title.length > 40) { alert('Task title cannot exceed 40 characters!'); return; }
    if (desc.length > 150) { alert('Description cannot exceed 150 characters!'); return; }

    task.title = title;
    task.desc = desc;
    task.priority = priority;
    task.editedAt = Date.now();

    saveToStorage();
    closeModal('taskModal');
    render();
    editingTaskId = null;
}

async function deleteTask(taskId) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;

    var confirmed = await requestConfirmation(
        'Delete Task',
        'Are you sure you want to permanently delete "' + task.title + '"?'
    );
    if (confirmed) {
        state.tasks = state.tasks.filter(function(t) { return t.id !== taskId; });
        saveToStorage();
        render();
    }
}
