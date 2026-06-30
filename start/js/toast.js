// Toast notifications. Supports an optional action button (e.g. "Undo").
// showToast('Saved')                       -> simple info toast
// showToast('Deleted', 'info', {           -> toast with an action button
//     actionLabel: 'Undo',
//     onAction: () => { ... }
// })
function showToast(message, type = 'info', options = {}) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const msg = document.createElement('span');
    msg.className = 'toast-message';
    msg.textContent = message;
    toast.appendChild(msg);

    const duration = typeof options.duration === 'number' ? options.duration : 4000;
    let dismissTimer = null;

    const dismiss = () => {
        if (dismissTimer) clearTimeout(dismissTimer);
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };

    if (options.actionLabel && typeof options.onAction === 'function') {
        const actionBtn = document.createElement('button');
        actionBtn.className = 'toast-action';
        actionBtn.type = 'button';
        actionBtn.textContent = options.actionLabel;
        actionBtn.addEventListener('click', () => {
            options.onAction();
            dismiss();
        });
        toast.appendChild(actionBtn);
    }

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    dismissTimer = setTimeout(dismiss, duration);
}
