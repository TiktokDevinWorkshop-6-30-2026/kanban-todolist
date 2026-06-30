let current3DShape = 'cube';
let viewMode = '2d';
let rotateX = -20;
let rotateY = 30;
let isDragging3D = false;
let lastMouseX = 0;
let lastMouseY = 0;
let autoRotate = true;
let rafId = null;
let shapeEl = null;

const SHAPES = {
    cube: { label: 'Cube', faces: 6 },
    pyramid: { label: 'Pyramid', faces: 4 },
    prism: { label: 'Hexagonal Prism', faces: 6 },
    diamond: { label: 'Diamond', faces: 8 },
    cylinder: { label: 'Cylinder', faces: 10 }
};

function toggle3DView() {
    viewMode = viewMode === '2d' ? '3d' : '2d';
    const board = document.querySelector('.board-container');
    const container3d = document.getElementById('view3dContainer');
    const toggleBtn = document.getElementById('toggle3DBtn');
    const mobileTabs = document.getElementById('mobileTabs');
    const appCard = document.getElementById('appCard');

    if (viewMode === '3d') {
        board.style.display = 'none';
        if (mobileTabs) mobileTabs.style.display = 'none';
        container3d.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-table-columns"></i> 2D Board';
        toggleBtn.title = 'Switch to 2D Board';
        render3D();
        // Trigger unfold animation
        requestAnimationFrame(() => {
            const shape = document.querySelector('.shape-3d');
            if (shape) shape.classList.add('unfolded');
        });
        autoRotate = false;
        document.getElementById('autoRotateBtn').classList.remove('active');
    } else {
        // Trigger fold animation before hiding
        const shape = document.querySelector('.shape-3d');
        if (shape) {
            shape.classList.remove('unfolded');
            shape.classList.add('folding');
        }
        setTimeout(() => {
            board.style.display = '';
            if (mobileTabs) mobileTabs.style.display = '';
            container3d.classList.add('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-cube"></i> 3D View';
            toggleBtn.title = 'Switch to 3D View';
            stopAutoRotate();
        }, 600);
    }
}

function setShape(shapeName) {
    if (!SHAPES[shapeName]) return;
    const oldShape = current3DShape;
    current3DShape = shapeName;

    document.querySelectorAll('.shape-option').forEach(el => {
        el.classList.toggle('active', el.dataset.shape === shapeName);
    });

    if (viewMode === '3d') {
        // Fold old shape, then unfold new shape
        const existingShape = document.querySelector('.shape-3d');
        if (existingShape) {
            existingShape.classList.remove('unfolded');
            existingShape.classList.add('folding');
            setTimeout(() => {
                render3D();
                requestAnimationFrame(() => {
                    const newShape = document.querySelector('.shape-3d');
                    if (newShape) newShape.classList.add('unfolded');
                });
            }, 500);
        } else {
            render3D();
            requestAnimationFrame(() => {
                const newShape = document.querySelector('.shape-3d');
                if (newShape) newShape.classList.add('unfolded');
            });
        }
    }
}

function render3D() {
    const scene = document.getElementById('scene3d');
    if (!scene) return;
    scene.innerHTML = '';

    const tasks = state.tasks;
    const faceCount = SHAPES[current3DShape].faces;

    const shape = document.createElement('div');
    shape.className = `shape-3d shape-${current3DShape}`;
    shape.style.willChange = 'transform';
    shape.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    shapeEl = shape;

    const size = 260;

    for (let i = 0; i < faceCount; i++) {
        const face = document.createElement('div');
        face.className = `face-3d face-${i}`;
        face.style.willChange = 'transform, opacity';

        const faceTransform = getFaceTransform(current3DShape, i, size);
        face.style.setProperty('--face-transform', faceTransform);
        face.style.width = size + 'px';
        face.style.height = size + 'px';

        const faceTasks = tasks.filter((_, idx) => idx % faceCount === i);
        const faceContent = document.createElement('div');
        faceContent.className = 'face-content';

        const faceLabel = document.createElement('div');
        faceLabel.className = 'face-label';
        faceLabel.textContent = `Face ${i + 1}`;
        faceContent.appendChild(faceLabel);

        faceTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `card-3d priority-${task.priority}`;
            card.draggable = true;
            card.dataset.taskId = task.id;
            card.innerHTML = `
                <div class="card-3d-header">
                    <span class="badge-priority ${task.priority}">${task.priority}</span>
                    <span class="card-3d-time">${formatRelativeTime(task.createdAt)}</span>
                </div>
                <div class="card-3d-title">${task.title}</div>
                <div class="card-3d-column">${task.column === 'todo' ? 'To Do' : task.column === 'progress' ? 'In Progress' : 'Done'}</div>
            `;
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', task.id);
                card.classList.add('dragging-3d');
                stopAutoRotate();
                document.getElementById('autoRotateBtn').classList.remove('active');
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging-3d');
                document.querySelectorAll('.face-3d.drag-over').forEach(f => f.classList.remove('drag-over'));
            });
            card.onclick = (e) => {
                if (!e.target.closest('.dragging-3d')) openTaskModal(task.id);
            };
            faceContent.appendChild(card);
        });

        if (faceTasks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'face-empty';
            empty.innerHTML = '<i class="fas fa-cube"></i><p>No tasks on this face</p>';
            faceContent.appendChild(empty);
        }

        // Drop zone for drag-and-drop between faces
        face.addEventListener('dragover', (e) => {
            e.preventDefault();
            face.classList.add('drag-over');
        });
        face.addEventListener('dragleave', () => {
            face.classList.remove('drag-over');
        });
        face.addEventListener('drop', (e) => {
            e.preventDefault();
            face.classList.remove('drag-over');
            const taskId = e.dataTransfer.getData('text/plain');
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;
            // Advance to next column: todo -> progress -> done
            const columns = ['todo', 'progress', 'done'];
            const currentIdx = columns.indexOf(task.column);
            const nextColumn = columns[(currentIdx + 1) % columns.length];
            task.column = nextColumn;
            if (nextColumn === 'done') task.completed = true;
            else task.completed = false;
            task.editedAt = Date.now();
            saveToStorage();
            render3D();
            requestAnimationFrame(() => {
                const s = document.querySelector('.shape-3d');
                if (s) s.classList.add('unfolded');
            });
            showToast(`Task moved to "${nextColumn === 'todo' ? 'To Do' : nextColumn === 'progress' ? 'In Progress' : 'Done'}"`, 'success');
        });

        face.appendChild(faceContent);
        shape.appendChild(face);
    }

    scene.appendChild(shape);
}

function getFaceTransform(shapeName, index, size) {
    const half = size / 2;

    if (shapeName === 'cube') {
        const d = half + 20;
        const transforms = [
            `rotateY(0deg) translateZ(${d}px)`,
            `rotateY(90deg) translateZ(${d}px)`,
            `rotateY(180deg) translateZ(${d}px)`,
            `rotateY(-90deg) translateZ(${d}px)`,
            `rotateX(90deg) translateZ(${d}px)`,
            `rotateX(-90deg) translateZ(${d}px)`
        ];
        return transforms[index];
    }

    if (shapeName === 'pyramid') {
        const angle = 55;
        const dist = half * 0.9;
        const transforms = [
            `rotateX(${angle}deg) translateZ(${dist}px)`,
            `rotateY(90deg) rotateX(${angle}deg) translateZ(${dist}px)`,
            `rotateY(180deg) rotateX(${angle}deg) translateZ(${dist}px)`,
            `rotateY(270deg) rotateX(${angle}deg) translateZ(${dist}px)`
        ];
        return transforms[index];
    }

    if (shapeName === 'prism') {
        const angleStep = 360 / 6;
        const radius = half / Math.tan(Math.PI / 6);
        return `rotateY(${index * angleStep}deg) translateZ(${radius * 0.75}px)`;
    }

    if (shapeName === 'diamond') {
        const dist = half * 0.95;
        if (index < 4) {
            return `rotateY(${index * 90}deg) rotateX(45deg) translateZ(${dist}px)`;
        } else {
            return `rotateY(${(index - 4) * 90}deg) rotateX(-45deg) translateZ(${dist}px)`;
        }
    }

    if (shapeName === 'cylinder') {
        const angleStep = 360 / 10;
        const radius = half * 1.5;
        return `rotateY(${index * angleStep}deg) translateZ(${radius}px)`;
    }

    return `rotateY(${index * (360 / faceCount)}deg) translateZ(${half}px)`;
}

function setup3DInteraction() {
    const container = document.getElementById('view3dContainer');
    if (!container) return;

    container.addEventListener('mousedown', (e) => {
        if (e.target.closest('.card-3d')) return;
        isDragging3D = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        stopAutoRotate();
        container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging3D) return;
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        rotateY += dx * 0.5;
        rotateX -= dy * 0.5;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        updateShapeRotation();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging3D) {
            isDragging3D = false;
            const container = document.getElementById('view3dContainer');
            if (container) container.style.cursor = 'grab';
        }
    });

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        rotateY += e.deltaX * 0.3;
        rotateX -= e.deltaY * 0.3;
        stopAutoRotate();
        updateShapeRotation();
    }, { passive: false });
}

function updateShapeRotation() {
    if (shapeEl) {
        shapeEl.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
}

function animateLoop() {
    if (!autoRotate) return;
    rotateY += 0.4;
    updateShapeRotation();
    rafId = requestAnimationFrame(animateLoop);
}

function startAutoRotate() {
    stopAutoRotate();
    autoRotate = true;
    rafId = requestAnimationFrame(animateLoop);
}

function stopAutoRotate() {
    autoRotate = false;
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

function toggleAutoRotate() {
    if (autoRotate) {
        stopAutoRotate();
        document.getElementById('autoRotateBtn').classList.remove('active');
    } else {
        startAutoRotate();
        document.getElementById('autoRotateBtn').classList.add('active');
    }
}
