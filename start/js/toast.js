var _toastTimer = null;

function showToast(message, type, undoCallback) {
    var container = document.getElementById('toastContainer');
    // Clear any existing toast
    container.innerHTML = '';
    if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');

    var msgSpan = document.createElement('span');
    msgSpan.className = 'toast-message';
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);

    if (typeof undoCallback === 'function') {
        var btn = document.createElement('button');
        btn.className = 'toast-undo-btn';
        btn.textContent = 'Undo';
        btn.onclick = function () {
            undoCallback();
            dismissToast(toast);
        };
        toast.appendChild(btn);
    }

    container.appendChild(toast);

    setTimeout(function () { toast.classList.add('show'); }, 50);

    _toastTimer = setTimeout(function () {
        dismissToast(toast);
    }, 5000);
}

function dismissToast(toast) {
    if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }
    toast.classList.remove('show');
    setTimeout(function () { toast.remove(); }, 300);
}
