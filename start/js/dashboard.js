/* ==========================================================================
   Dashboard — trend chart for To Do / In Progress / Done counts
   ========================================================================== */

const SERIES_COLORS = {
    todo:     { line: '#94a3b8', fill: 'rgba(148,163,184,0.12)' },
    progress: { line: '#f59e0b', fill: 'rgba(245,158,11,0.12)' },
    done:     { line: '#10b981', fill: 'rgba(16,185,129,0.12)' }
};

const SERIES_LABELS = { todo: 'To Do', progress: 'In Progress', done: 'Done' };

function renderDashboard() {
    var canvas = document.getElementById('dashboardCanvas');
    if (!canvas) return;

    var history = loadMetricHistory();

    /* Seed first point when history is empty */
    if (history.length === 0) {
        recordMetricSnapshot();
        history = loadMetricHistory();
    }

    /* Need at least 1 data-point */
    if (history.length === 0) return;

    /* If only one snapshot, duplicate it so we can draw a flat line */
    if (history.length === 1) {
        history = [history[0], Object.assign({}, history[0], { ts: history[0].ts + 1000 })];
    }

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    var W = rect.width;
    var H = rect.height;

    ctx.clearRect(0, 0, W, H);

    /* Layout constants */
    var padLeft   = 48;
    var padRight  = 20;
    var padTop    = 20;
    var padBottom = 50;
    var chartW = W - padLeft - padRight;
    var chartH = H - padTop - padBottom;

    /* Compute global max for Y axis */
    var maxVal = 0;
    history.forEach(function (s) {
        var total = s.todo + s.progress + s.done;
        if (total > maxVal) maxVal = total;
        if (s.todo > maxVal) maxVal = s.todo;
        if (s.progress > maxVal) maxVal = s.progress;
        if (s.done > maxVal) maxVal = s.done;
    });
    maxVal = Math.max(maxVal, 1);
    /* Round up to a nice number */
    var niceMax = Math.ceil(maxVal / 5) * 5 || 5;

    /* Time range */
    var tsMin = history[0].ts;
    var tsMax = history[history.length - 1].ts;
    var tsRange = tsMax - tsMin || 1;

    /* Helper: map data to pixel coords */
    function xPos(ts)  { return padLeft + ((ts - tsMin) / tsRange) * chartW; }
    function yPos(val) { return padTop + chartH - (val / niceMax) * chartH; }

    /* ── Grid lines & Y labels ── */
    var yTicks = 5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (var i = 0; i <= yTicks; i++) {
        var val = Math.round((niceMax / yTicks) * i);
        var y   = yPos(val);
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(val, padLeft - 8, y);
    }

    /* ── X-axis time labels ── */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var labelCount = Math.min(history.length, Math.floor(chartW / 70));
    var step = Math.max(1, Math.floor(history.length / labelCount));
    for (var j = 0; j < history.length; j += step) {
        var d = new Date(history[j].ts);
        var label = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        ctx.fillText(label, xPos(history[j].ts), padTop + chartH + 10);
    }

    /* ── Draw each series ── */
    var keys = ['todo', 'progress', 'done'];
    keys.forEach(function (key) {
        var color = SERIES_COLORS[key];

        /* Filled area */
        ctx.beginPath();
        ctx.moveTo(xPos(history[0].ts), yPos(0));
        history.forEach(function (s) { ctx.lineTo(xPos(s.ts), yPos(s[key])); });
        ctx.lineTo(xPos(history[history.length - 1].ts), yPos(0));
        ctx.closePath();
        ctx.fillStyle = color.fill;
        ctx.fill();

        /* Line */
        ctx.beginPath();
        ctx.strokeStyle = color.line;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        history.forEach(function (s, idx) {
            if (idx === 0) ctx.moveTo(xPos(s.ts), yPos(s[key]));
            else ctx.lineTo(xPos(s.ts), yPos(s[key]));
        });
        ctx.stroke();

        /* Dots */
        history.forEach(function (s) {
            ctx.beginPath();
            ctx.arc(xPos(s.ts), yPos(s[key]), 3, 0, Math.PI * 2);
            ctx.fillStyle = color.line;
            ctx.fill();
        });
    });

    /* ── Legend ── */
    var legendX = padLeft;
    var legendY = padTop + chartH + 30;
    ctx.font = '12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    keys.forEach(function (key) {
        ctx.fillStyle = SERIES_COLORS[key].line;
        ctx.beginPath();
        ctx.arc(legendX + 5, legendY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.fillText(SERIES_LABELS[key], legendX + 15, legendY);
        legendX += ctx.measureText(SERIES_LABELS[key]).width + 36;
    });

    /* ── Summary cards ── */
    var latest = history[history.length - 1];
    document.getElementById('metricTodo').textContent     = latest.todo;
    document.getElementById('metricProgress').textContent = latest.progress;
    document.getElementById('metricDone').textContent     = latest.done;
    document.getElementById('metricTotal').textContent    = latest.todo + latest.progress + latest.done;
}
