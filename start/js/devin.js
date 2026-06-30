var DEVIN_API_BASE = '/api/devin';
var DEVIN_POLL_INTERVAL_MS = 8000;

var devinKickoffTaskId = null;
var devinPollTimer = null;
var devinEnabled = false;

async function refreshDevinConfig() {
    try {
        var res = await fetch(DEVIN_API_BASE + '/config');
        if (!res.ok) return;
        var data = await res.json();
        var next = Boolean(data && data.enabled);
        if (next !== devinEnabled) {
            devinEnabled = next;
            render();
        }
    } catch (e) {
        // No backend / not configured — leave Devin features hidden.
    }
}

function openDevinModal(taskId) {
    if (!devinEnabled) {
        showToast('Devin is not configured on the server.', 'warning');
        return;
    }
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    if (task.column !== 'todo') {
        showToast('Devin sessions can only be started from To Do tasks.', 'warning');
        return;
    }
    if (task.devinSessionId) {
        showToast('This task already has a Devin session.', 'warning');
        return;
    }

    devinKickoffTaskId = taskId;
    document.getElementById('devinModalTaskTitle').textContent = task.title;

    var promptInput = document.getElementById('devinPromptInput');
    promptInput.value = task.desc ? task.title + '\n\n' + task.desc : task.title;

    var btn = document.getElementById('devinKickoffBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-rocket"></i> Start Devin Session';

    openModal('devinModal');
    promptInput.focus();
}

function closeDevinModal() {
    closeModal('devinModal');
    devinKickoffTaskId = null;
}

async function confirmDevinKickoff() {
    if (!devinKickoffTaskId) return;
    var task = state.tasks.find(function(t) { return t.id === devinKickoffTaskId; });
    if (!task) return;

    var promptInput = document.getElementById('devinPromptInput');
    var prompt = promptInput.value.trim();
    if (prompt.length < 5) {
        showToast('Please describe what Devin should do (min 5 characters).', 'error');
        return;
    }

    var btn = document.getElementById('devinKickoffBtn');
    var originalLabel = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';

    try {
        var res = await fetch(DEVIN_API_BASE + '/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt, title: task.title })
        });
        var data = await res.json().catch(function() { return null; });
        if (!res.ok || !data || !data.session_id) {
            var msg = (data && data.error) ? data.error : 'Request failed (' + res.status + ')';
            throw new Error(msg);
        }

        task.devinSessionId = data.session_id;
        task.devinSessionUrl = data.url;
        task.devinStatus = data.status || 'running';
        task.devinStatusDetail = null;
        task.devinPrompt = prompt;
        task.devinStartedAt = Date.now();

        task.column = 'progress';
        task.completed = false;

        saveToStorage();
        closeDevinModal();
        render();
        showToast('Devin session started — task moved to In Progress.', 'success');

        startDevinPolling();
        pollDevinSessions();
    } catch (err) {
        showToast('Failed to start Devin session: ' + err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = originalLabel;
    }
}

function openDevinSession(taskId) {
    var task = state.tasks.find(function(t) { return t.id === taskId; });
    if (!task || !task.devinSessionUrl) return;
    window.open(task.devinSessionUrl, '_blank', 'noopener');
}

function devinStatusLabel(task) {
    var detail = task.devinStatusDetail;
    var status = task.devinStatus || 'running';
    if (detail === 'finished' || status === 'exit') return 'finished';
    if (detail === 'waiting_for_user') return 'complete';
    if (detail === 'blocked') return 'blocked';
    if (status === 'error') return 'error';
    if (status === 'suspended') return 'suspended';
    return 'in Devin';
}

function isDevinWorking(task) {
    var label = devinStatusLabel(task);
    return ['finished', 'complete', 'error', 'suspended', 'waiting', 'blocked'].indexOf(label) === -1;
}

function isDevinComplete(status, detail) {
    return status === 'exit' || status === 'error' || status === 'suspended'
        || detail === 'finished' || detail === 'waiting_for_user';
}

async function pollDevinSessions() {
    var tracked = state.tasks.filter(function(t) { return t.devinSessionId && t.column !== 'done'; });
    if (tracked.length === 0) return;

    var changed = false;
    for (var i = 0; i < tracked.length; i++) {
        var task = tracked[i];
        try {
            var res = await fetch(DEVIN_API_BASE + '/sessions/' + encodeURIComponent(task.devinSessionId));
            if (!res.ok) continue;
            var data = await res.json();

            if (data.status && data.status !== task.devinStatus) {
                task.devinStatus = data.status;
                changed = true;
            }
            if (data.status_detail !== undefined && data.status_detail !== task.devinStatusDetail) {
                task.devinStatusDetail = data.status_detail;
                changed = true;
            }

            if (isDevinComplete(data.status, data.status_detail) && task.column === 'progress') {
                task.completed = true;
                task.column = 'done';
                task.editedAt = Date.now();
                changed = true;
                showToast('Devin finished "' + task.title + '" — moved to Done.', 'success');
            }
        } catch (e) {
            // Backend unreachable — skip silently.
        }
    }

    if (changed) {
        saveToStorage();
        render();
    }
}

function startDevinPolling() {
    if (devinPollTimer) return;
    devinPollTimer = setInterval(pollDevinSessions, DEVIN_POLL_INTERVAL_MS);
}
