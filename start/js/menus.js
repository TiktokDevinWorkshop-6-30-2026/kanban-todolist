let contextMenuTaskId = null;
let badgeMenuTaskId = null;

// ---- Right-click context menu ----
function showContextMenu(x, y, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    contextMenuTaskId = taskId;

    const menu = document.getElementById('contextMenu');
    const isDone = task.column === 'done';

    const setItem = (id, disabled, onClick) => {
        const el = document.getElementById(id);
        el.classList.toggle('disabled', disabled);
        el.onclick = disabled ? null : () => { onClick(); hideContextMenu(); };
    };

    setItem('ctxView', false, () => openViewModal(taskId));
    setItem('ctxEdit', isDone, () => openEditModal(taskId));
    setItem('ctxMoveTodo', task.column === 'todo', () => moveTask(taskId, 'todo'));
    setItem('ctxMoveProgress', task.column === 'progress', () => moveTask(taskId, 'progress'));
    setItem('ctxMoveDone', isDone || task.column === 'todo', () => moveTask(taskId, 'done'));
    setItem('ctxDelete', false, () => deleteTask(taskId));

    // Devin actions: shown contextually based on session state + config.
    const canRunDevin = (typeof devinEnabled !== 'undefined' && devinEnabled) && task.column === 'todo' && !task.devinSessionId;
    const canOpenDevin = Boolean(task.devinSessionId && task.devinSessionUrl);
    const ctxRunDevin = document.getElementById('ctxRunDevin');
    const ctxOpenDevin = document.getElementById('ctxOpenDevin');
    document.getElementById('ctxDevinDivider').style.display = (canRunDevin || canOpenDevin) ? 'block' : 'none';
    ctxRunDevin.style.display = canRunDevin ? 'flex' : 'none';
    ctxOpenDevin.style.display = canOpenDevin ? 'flex' : 'none';
    ctxRunDevin.onclick = canRunDevin ? () => { openDevinModal(taskId); hideContextMenu(); } : null;
    ctxOpenDevin.onclick = canOpenDevin ? () => { openDevinSession(taskId); hideContextMenu(); } : null;

    menu.classList.remove('hidden');
    const rect = menu.getBoundingClientRect();
    const clampedX = Math.min(x, window.innerWidth - rect.width - 8);
    const clampedY = Math.min(y, window.innerHeight - rect.height - 8);
    menu.style.left = `${Math.max(8, clampedX)}px`;
    menu.style.top = `${Math.max(8, clampedY)}px`;
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
    contextMenuTaskId = null;
}

// ---- Clickable priority badge dropdown ----
function openBadgePriorityMenu(event, taskId) {
    event.stopPropagation();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.column === 'done') {
        showToast('Priority is locked for completed tasks.', 'warning');
        return;
    }
    badgeMenuTaskId = taskId;

    const menu = document.getElementById('badgePriorityMenu');
    menu.querySelectorAll('.badge-dropdown-item').forEach((item) => {
        item.onclick = () => {
            changeTaskPriorityDirectly(taskId, item.dataset.priority);
            hideBadgePriorityMenu();
        };
    });

    menu.classList.remove('hidden');
    const rect = event.currentTarget.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - menuRect.width - 8);
    menu.style.left = `${Math.max(8, left)}px`;
    menu.style.top = `${rect.bottom + 4}px`;
}

function changeTaskPriorityDirectly(taskId, priority) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.priority = priority;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    showToast(`Priority set to ${priority}.`, 'success');
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
    badgeMenuTaskId = null;
}
