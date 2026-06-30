function showToast(message, type) {
    if (!type) type = 'info';
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    var icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    toast.innerHTML = '<i class="fas ' + icon + '"></i><span class="toast-message">' + message + '</span>';
    container.appendChild(toast);

    setTimeout(function() {
        toast.classList.add('show');
    }, 50);

    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}
