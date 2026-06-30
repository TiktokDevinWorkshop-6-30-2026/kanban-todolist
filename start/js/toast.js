function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    var iconClass;
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    else if (type === 'error') iconClass = 'fa-exclamation-circle';
    else iconClass = 'fa-info-circle';

    toast.innerHTML = '<i class="fas ' + iconClass + '"></i><span class="toast-message">' + message + '</span>';
    container.appendChild(toast);

    setTimeout(function() { toast.classList.add('show'); }, 50);
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}
