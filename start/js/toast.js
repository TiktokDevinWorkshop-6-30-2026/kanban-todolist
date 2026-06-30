var _toastTimer = null;

function showToast(message, action) {
    var container = document.getElementById('toastContainer');
    if (!container) return;

    clearTimeout(_toastTimer);
    container.innerHTML = '';

    var toast = document.createElement('div');
    toast.className = 'toast';

    var msg = document.createElement('span');
    msg.className = 'toast-message';
    msg.textContent = message;
    toast.appendChild(msg);

    if (action && action.label && action.onClick) {
        var btn = document.createElement('button');
        btn.className = 'toast-action';
        btn.textContent = action.label;
        btn.addEventListener('click', function () {
            action.onClick();
            dismissToast(toast);
        });
        toast.appendChild(btn);
    }

    container.appendChild(toast);

    requestAnimationFrame(function () {
        toast.classList.add('show');
    });

    _toastTimer = setTimeout(function () {
        dismissToast(toast);
    }, 5000);
}

function dismissToast(toast) {
    clearTimeout(_toastTimer);
    toast.classList.remove('show');
    setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
}
