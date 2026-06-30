// ===== Right-click context menu =====
function showContextMenu(x, y, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const menu = document.getElementById('contextMenu');
    const isDone = task.column === 'done';
    const isTodo = task.column === 'todo';

    const view = document.getElementById('ctxView');
    const edit = document.getElementById('ctxEdit');
    const moveTodo = document.getElementById('ctxMoveTodo');
    const moveProgress = document.getElementById('ctxMoveProgress');
    const moveDone = document.getElementById('ctxMoveDone');
    const del = document.getElementById('ctxDelete');

    const ctxDevinDivider = document.getElementById('ctxDevinDivider');
    const ctxRunDevin = document.getElementById('ctxRunDevin');
    const ctxOpenDevin = document.getElementById('ctxOpenDevin');

    edit.classList.toggle('disabled', isDone);
    moveTodo.classList.toggle('disabled', task.column === 'todo');
    moveProgress.classList.toggle('disabled', task.column === 'progress');
    moveDone.classList.toggle('disabled', task.column === 'done' || task.column === 'todo');

    const showRunDevin = devinEnabled && isTodo && !task.devinSessionId;
    const showOpenDevin = Boolean(task.devinSessionUrl);
    ctxRunDevin.classList.toggle('hidden', !showRunDevin);
    ctxOpenDevin.classList.toggle('hidden', !showOpenDevin);
    ctxDevinDivider.classList.toggle('hidden', !showRunDevin && !showOpenDevin);

    view.onclick = () => { openViewModal(taskId); hideContextMenu(); };
    edit.onclick = () => { if (!isDone) openEditModal(taskId); hideContextMenu(); };
    moveTodo.onclick = () => { moveTask(taskId, 'todo'); hideContextMenu(); };
    moveProgress.onclick = () => { moveTask(taskId, 'progress'); hideContextMenu(); };
    moveDone.onclick = () => { moveTask(taskId, 'done'); hideContextMenu(); };
    del.onclick = () => { deleteTask(taskId); hideContextMenu(); };
    ctxRunDevin.onclick = () => { openDevinModal(taskId); hideContextMenu(); };
    ctxOpenDevin.onclick = () => { openDevinSession(taskId); hideContextMenu(); };

    menu.classList.remove('hidden');
    const rect = menu.getBoundingClientRect();
    const px = Math.min(x, window.innerWidth - rect.width - 8);
    const py = Math.min(y, window.innerHeight - rect.height - 8);
    menu.style.left = px + 'px';
    menu.style.top = py + 'px';
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
}

// ===== Clickable priority badge dropdown =====
let badgeMenuTaskId = null;

function openBadgePriorityMenu(event, taskId) {
    event.stopPropagation();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.column === 'done') {
        showToast('Completed tasks cannot be changed.', 'warning');
        return;
    }
    badgeMenuTaskId = taskId;
    const menu = document.getElementById('badgePriorityMenu');
    menu.classList.remove('hidden');

    const rect = event.currentTarget.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const px = Math.min(rect.left, window.innerWidth - menuRect.width - 8);
    const py = Math.min(rect.bottom + 4, window.innerHeight - menuRect.height - 8);
    menu.style.left = px + 'px';
    menu.style.top = py + 'px';

    menu.querySelectorAll('.badge-dropdown-item').forEach(item => {
        item.onclick = () => changeTaskPriorityDirectly(taskId, item.dataset.priority);
    });
}

function changeTaskPriorityDirectly(taskId, priority) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.priority = priority;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    hideBadgePriorityMenu();
    showToast(`Priority set to ${priority}.`, 'success');
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
    badgeMenuTaskId = null;
}
