let contextMenuTaskId = null;
let badgeMenuTaskId = null;

function showContextMenu(x, y, taskId) {
    const menu = document.getElementById('contextMenu');
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    contextMenuTaskId = taskId;

    menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 300) + 'px';
    menu.classList.remove('hidden');

    const ctxEdit = document.getElementById('ctxEdit');
    const ctxMoveTodo = document.getElementById('ctxMoveTodo');
    const ctxMoveProgress = document.getElementById('ctxMoveProgress');
    const ctxMoveDone = document.getElementById('ctxMoveDone');

    ctxEdit.style.display = '';
    ctxMoveTodo.style.display = '';
    ctxMoveProgress.style.display = '';
    ctxMoveDone.style.display = '';

    if (task.column === 'todo') {
        ctxMoveTodo.style.display = 'none';
        ctxMoveDone.style.display = 'none';
    } else if (task.column === 'progress') {
        ctxMoveProgress.style.display = 'none';
    } else {
        ctxEdit.style.display = 'none';
        ctxMoveDone.style.display = 'none';
    }

    // Devin context items
    const ctxDevinDivider = document.getElementById('ctxDevinDivider');
    const ctxRunDevin = document.getElementById('ctxRunDevin');
    const ctxOpenDevin = document.getElementById('ctxOpenDevin');
    if (ctxDevinDivider) ctxDevinDivider.style.display = 'none';
    if (ctxRunDevin) ctxRunDevin.style.display = 'none';
    if (ctxOpenDevin) ctxOpenDevin.style.display = 'none';

    if (typeof isDevinConfigured === 'function' && isDevinConfigured()) {
        if (ctxDevinDivider) ctxDevinDivider.style.display = '';
        if (task.column === 'todo' && ctxRunDevin) {
            ctxRunDevin.style.display = '';
        }
        if (task.devinSessionUrl && ctxOpenDevin) {
            ctxOpenDevin.style.display = '';
        }
    }

    document.getElementById('ctxView').onclick = () => { hideContextMenu(); openTaskModal(contextMenuTaskId); };
    ctxEdit.onclick = () => { hideContextMenu(); openTaskModal(contextMenuTaskId); };
    ctxMoveTodo.onclick = () => { hideContextMenu(); moveTask(contextMenuTaskId, 'todo'); };
    ctxMoveProgress.onclick = () => { hideContextMenu(); moveTask(contextMenuTaskId, 'progress'); };
    ctxMoveDone.onclick = () => { hideContextMenu(); moveTask(contextMenuTaskId, 'done'); };
    document.getElementById('ctxDelete').onclick = () => { hideContextMenu(); deleteTask(contextMenuTaskId); };
    if (ctxRunDevin) ctxRunDevin.onclick = () => { hideContextMenu(); if (typeof openDevinModal === 'function') openDevinModal(contextMenuTaskId); };
    if (ctxOpenDevin) ctxOpenDevin.onclick = () => { hideContextMenu(); if (task.devinSessionUrl) window.open(task.devinSessionUrl, '_blank'); };
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
    contextMenuTaskId = null;
}

function openBadgePriorityMenu(event, taskId) {
    event.stopPropagation();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.column === 'done') {
        showToast('Cannot change priority of completed tasks.', 'warning');
        return;
    }
    badgeMenuTaskId = taskId;
    const menu = document.getElementById('badgePriorityMenu');
    const rect = event.target.getBoundingClientRect();
    menu.style.left = rect.left + 'px';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.classList.remove('hidden');

    menu.querySelectorAll('.badge-dropdown-item').forEach(item => {
        item.onclick = () => {
            changeTaskPriorityDirectly(badgeMenuTaskId, item.getAttribute('data-priority'));
            hideBadgePriorityMenu();
        };
    });
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
    badgeMenuTaskId = null;
}

function changeTaskPriorityDirectly(taskId, newPriority) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.priority = newPriority;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    showToast('Priority changed to ' + newPriority + '.', 'success');
}

document.addEventListener('click', (e) => {
    if (!document.getElementById('contextMenu').contains(e.target)) hideContextMenu();
    if (!document.getElementById('badgePriorityMenu').contains(e.target) && !e.target.closest('.badge-priority')) hideBadgePriorityMenu();
});
