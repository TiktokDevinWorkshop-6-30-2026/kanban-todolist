function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Never';
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    return new Date(timestamp).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function formatFullTime(timestamp) {
    if (!timestamp) return 'Never edited';
    return new Date(timestamp).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
}

function formatDuration(ms) {
    if (!ms || ms < 0) return '—';
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (days > 0) return days + 'd ' + hours + 'h';
    if (hours > 0) return hours + 'h ' + mins + 'm';
    if (mins > 0) return mins + 'm';
    return totalSec + 's';
}

function getTaskDuration(task) {
    if (task.completedAt && task.startedAt) return task.completedAt - task.startedAt;
    if (task.startedAt && task.column === 'progress') return Date.now() - task.startedAt;
    return null;
}

function computeAnalytics(tasks) {
    const total = tasks.length;
    const doneTasks = tasks.filter(t => t.column === 'done');
    const todoTasks = tasks.filter(t => t.column === 'todo');
    const progressTasks = tasks.filter(t => t.column === 'progress');
    const completionRate = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0;

    const completedDurations = doneTasks
        .filter(t => t.startedAt && t.completedAt)
        .map(t => t.completedAt - t.startedAt);
    const avgDuration = completedDurations.length > 0
        ? completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length
        : 0;
    const fastest = completedDurations.length > 0 ? Math.min(...completedDurations) : 0;
    const slowest = completedDurations.length > 0 ? Math.max(...completedDurations) : 0;

    const byPriority = { low: 0, medium: 0, high: 0 };
    tasks.forEach(t => { if (byPriority[t.priority] !== undefined) byPriority[t.priority]++; });

    const doneByPriority = { low: 0, medium: 0, high: 0 };
    doneTasks.forEach(t => { if (doneByPriority[t.priority] !== undefined) doneByPriority[t.priority]++; });

    // Tasks completed per day (last 7 days)
    const dailyCompletions = [];
    for (let i = 6; i >= 0; i--) {
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        dayStart.setDate(dayStart.getDate() - i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const count = doneTasks.filter(t => t.completedAt && t.completedAt >= dayStart.getTime() && t.completedAt < dayEnd.getTime()).length;
        const label = dayStart.toLocaleDateString('en-US', { weekday: 'short' });
        dailyCompletions.push({ label: label, count: count });
    }

    // In-progress elapsed times
    const inProgressTimes = progressTasks
        .filter(t => t.startedAt)
        .map(t => ({ title: t.title, elapsed: Date.now() - t.startedAt, priority: t.priority }));

    // Completed task durations for table
    const completedDetails = doneTasks
        .filter(t => t.startedAt && t.completedAt)
        .map(t => ({ title: t.title, duration: t.completedAt - t.startedAt, priority: t.priority, completedAt: t.completedAt }))
        .sort((a, b) => b.completedAt - a.completedAt);

    return {
        total, todoCount: todoTasks.length, progressCount: progressTasks.length,
        doneCount: doneTasks.length, completionRate, avgDuration, fastest, slowest,
        byPriority, doneByPriority, dailyCompletions, inProgressTimes, completedDetails
    };
}
