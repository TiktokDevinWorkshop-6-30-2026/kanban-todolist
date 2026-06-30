function showToast(message, type = 'info', action = null) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const msg = document.createElement('span');
    msg.className = 'toast-message';
    msg.textContent = message;
    toast.appendChild(msg);

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };

    if (action && action.label) {
        const btn = document.createElement('button');
        btn.className = 'toast-action';
        btn.textContent = action.label;
        btn.onclick = () => {
            if (typeof action.onClick === 'function') action.onClick();
            dismiss();
        };
        toast.appendChild(btn);
    }

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(dismiss, action ? 6000 : 3000);
}
