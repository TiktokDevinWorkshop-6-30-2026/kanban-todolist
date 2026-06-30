function showToast(message, type = 'info', action) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-exclamation-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let html = `<i class="fas ${icons[type] || icons.info}"></i><span class="toast-message">${message}</span>`;
    if (action && action.label) {
        html += `<button class="toast-action">${action.label}</button>`;
    }
    toast.innerHTML = html;
    container.appendChild(toast);

    if (action && action.onClick) {
        toast.querySelector('.toast-action').addEventListener('click', () => {
            action.onClick();
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }

    setTimeout(() => toast.classList.add('show'), 50);
    const duration = action ? 5000 : 3000;
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
