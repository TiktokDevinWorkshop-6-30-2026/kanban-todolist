var badgeActiveTaskId = null;

function openBadgePriorityMenu(event, taskId) {
    event.stopPropagation();
    event.preventDefault();

    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;

    if (task.column === 'done') {
        showToast('You cannot change priority of completed tasks.', 'warning');
        return;
    }

    badgeActiveTaskId = taskId;
    var menu = document.getElementById('badgePriorityMenu');
    menu.classList.remove('hidden');

    var rect = event.currentTarget.getBoundingClientRect();
    menu.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    menu.style.left = (rect.left + window.scrollX) + 'px';

    var items = menu.querySelectorAll('.badge-dropdown-item');
    items.forEach(function(item) {
        item.onclick = function(e) {
            e.stopPropagation();
            var newPriority = item.getAttribute('data-priority');
            changeTaskPriorityDirectly(badgeActiveTaskId, newPriority);
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
    showToast('Priority changed to ' + newPriority.toUpperCase() + '.', 'success');
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
    badgeActiveTaskId = null;
}

var contextActiveTaskId = null;

function showContextMenu(clientX, clientY, taskId) {
    contextActiveTaskId = taskId;
    var menu = document.getElementById('contextMenu');
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;

    menu.classList.remove('hidden');

    var menuWidth = 160;
    var menuHeight = 300;
    var posX = clientX;
    var posY = clientY;

    if (clientX + menuWidth > window.innerWidth) {
        posX = clientX - menuWidth;
    }
    if (clientY + menuHeight > window.innerHeight) {
        posY = clientY - menuHeight;
    }

    menu.style.top = (posY + window.scrollY) + 'px';
    menu.style.left = (posX + window.scrollX) + 'px';

    var isDone = task.column === 'done';
    var isTodo = task.column === 'todo';

    var ctxEdit = document.getElementById('ctxEdit');
    var ctxMoveTodo = document.getElementById('ctxMoveTodo');
    var ctxMoveProgress = document.getElementById('ctxMoveProgress');
    var ctxMoveDone = document.getElementById('ctxMoveDone');

    if (isDone) {
        ctxEdit.classList.add('disabled');
        ctxMoveTodo.classList.remove('disabled');
        ctxMoveProgress.classList.remove('disabled');
        ctxMoveDone.classList.add('disabled');
    } else {
        ctxEdit.classList.remove('disabled');
        if (isTodo) {
            ctxMoveTodo.classList.add('disabled');
            ctxMoveProgress.classList.remove('disabled');
            ctxMoveDone.classList.add('disabled');
        } else {
            ctxMoveTodo.classList.remove('disabled');
            ctxMoveProgress.classList.add('disabled');
            ctxMoveDone.classList.remove('disabled');
        }
    }

    document.getElementById('ctxView').onclick = function() { openViewModal(taskId); hideContextMenu(); };
    ctxEdit.onclick = function() { if (!isDone) openEditModal(taskId); hideContextMenu(); };
    ctxMoveTodo.onclick = function() { moveTask(taskId, 'todo'); hideContextMenu(); };
    ctxMoveProgress.onclick = function() { moveTask(taskId, 'progress'); hideContextMenu(); };
    ctxMoveDone.onclick = function() { moveTask(taskId, 'done'); hideContextMenu(); };
    document.getElementById('ctxDelete').onclick = function() { deleteTask(taskId); hideContextMenu(); };
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
    contextActiveTaskId = null;
}
