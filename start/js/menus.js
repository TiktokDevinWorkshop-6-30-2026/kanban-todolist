var activeContextTaskId = null;
var activeBadgeTaskId = null;

function showContextMenu(x, y, taskId) {
    var menu = document.getElementById('contextMenu');
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;

    activeContextTaskId = taskId;
    menu.classList.remove('hidden');

    var menuW = menu.offsetWidth;
    var menuH = menu.offsetHeight;
    var posX = Math.min(x, window.innerWidth - menuW - 10);
    var posY = Math.min(y, window.innerHeight - menuH - 10);
    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    var ctxView = document.getElementById('ctxView');
    var ctxEdit = document.getElementById('ctxEdit');
    var ctxMoveTodo = document.getElementById('ctxMoveTodo');
    var ctxMoveProgress = document.getElementById('ctxMoveProgress');
    var ctxMoveDone = document.getElementById('ctxMoveDone');
    var ctxDelete = document.getElementById('ctxDelete');

    ctxMoveTodo.classList.remove('disabled');
    ctxMoveProgress.classList.remove('disabled');
    ctxMoveDone.classList.remove('disabled');
    ctxEdit.classList.remove('disabled');

    if (task.column === 'todo') {
        ctxMoveTodo.classList.add('disabled');
        ctxMoveDone.classList.add('disabled');
    } else if (task.column === 'progress') {
        ctxMoveProgress.classList.add('disabled');
    } else if (task.column === 'done') {
        ctxMoveDone.classList.add('disabled');
        ctxEdit.classList.add('disabled');
    }

    ctxView.onclick = function() { hideContextMenu(); openTaskModal(activeContextTaskId); };
    ctxEdit.onclick = function() { hideContextMenu(); openTaskModal(activeContextTaskId); };
    ctxMoveTodo.onclick = function() { hideContextMenu(); moveTask(activeContextTaskId, 'todo'); };
    ctxMoveProgress.onclick = function() { hideContextMenu(); moveTask(activeContextTaskId, 'progress'); };
    ctxMoveDone.onclick = function() { hideContextMenu(); moveTask(activeContextTaskId, 'done'); };
    ctxDelete.onclick = function() { hideContextMenu(); deleteTask(activeContextTaskId); };

    // Devin context menu items
    var ctxDevinDivider = document.getElementById('ctxDevinDivider');
    var ctxRunDevin = document.getElementById('ctxRunDevin');
    var ctxOpenDevin = document.getElementById('ctxOpenDevin');

    if (ctxDevinDivider && ctxRunDevin && ctxOpenDevin) {
        var showRunDevin = devinEnabled && task.column === 'todo' && !task.devinSessionId;
        var showOpenDevin = Boolean(task.devinSessionUrl);

        ctxRunDevin.classList.toggle('hidden', !showRunDevin);
        ctxOpenDevin.classList.toggle('hidden', !showOpenDevin);
        ctxDevinDivider.classList.toggle('hidden', !showRunDevin && !showOpenDevin);

        ctxRunDevin.onclick = function() { hideContextMenu(); openDevinModal(activeContextTaskId); };
        ctxOpenDevin.onclick = function() { hideContextMenu(); openDevinSession(activeContextTaskId); };
    }
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
    activeContextTaskId = null;
}

function openBadgePriorityMenu(event, taskId) {
    event.stopPropagation();
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    if (task.column === 'done') {
        showToast('Cannot change priority of completed tasks.', 'warning');
        return;
    }

    activeBadgeTaskId = taskId;
    var menu = document.getElementById('badgePriorityMenu');
    menu.classList.remove('hidden');

    var rect = event.target.getBoundingClientRect();
    menu.style.left = rect.left + 'px';
    menu.style.top = (rect.bottom + 4) + 'px';

    var items = menu.querySelectorAll('.badge-dropdown-item');
    items.forEach(function(item) {
        item.onclick = function() {
            changeTaskPriorityDirectly(activeBadgeTaskId, item.getAttribute('data-priority'));
            hideBadgePriorityMenu();
        };
    });
}

function changeTaskPriorityDirectly(taskId, newPriority) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    if (task.priority === newPriority) return;
    task.priority = newPriority;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    showToast('Priority changed to ' + newPriority + '.', 'success');
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
    activeBadgeTaskId = null;
}

document.addEventListener('click', function(e) {
    var ctx = document.getElementById('contextMenu');
    if (!ctx.classList.contains('hidden') && !ctx.contains(e.target)) {
        hideContextMenu();
    }
    var badge = document.getElementById('badgePriorityMenu');
    if (!badge.classList.contains('hidden') && !badge.contains(e.target)) {
        hideBadgePriorityMenu();
    }
    var actMenu = document.getElementById('headerActionsMenu');
    var actBtn = document.getElementById('headerActionsBtn');
    if (actMenu && !actMenu.classList.contains('hidden') && !actMenu.contains(e.target) && !actBtn.contains(e.target)) {
        actMenu.classList.add('hidden');
    }
});
