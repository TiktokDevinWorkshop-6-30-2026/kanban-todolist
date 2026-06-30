let current3DShape = 'cube';
let viewMode = '2d';
let rotateX = -20;
let rotateY = 30;
let isDragging3D = false;
let lastMouseX = 0;
let lastMouseY = 0;
let autoRotate = true;
let autoRotateInterval = null;

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

    if (viewMode === '3d') {
        board.style.display = 'none';
        if (mobileTabs) mobileTabs.style.display = 'none';
        container3d.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-table-columns"></i> 2D Board';
        toggleBtn.title = 'Switch to 2D Board';
        render3D();
        autoRotate = true;
        startAutoRotate();
        document.getElementById('autoRotateBtn').classList.add('active');
    } else {
        board.style.display = '';
        if (mobileTabs) mobileTabs.style.display = '';
        container3d.classList.add('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-cube"></i> 3D View';
        toggleBtn.title = 'Switch to 3D View';
        stopAutoRotate();
    }
}

function setShape(shapeName) {
    if (!SHAPES[shapeName]) return;
    current3DShape = shapeName;

    document.querySelectorAll('.shape-option').forEach(el => {
        el.classList.toggle('active', el.dataset.shape === shapeName);
    });

    if (viewMode === '3d') render3D();
}

function render3D() {
    const scene = document.getElementById('scene3d');
    if (!scene) return;
    scene.innerHTML = '';

    const tasks = state.tasks.filter(t => t.column !== 'done');
    const faceCount = SHAPES[current3DShape].faces;

    const shape = document.createElement('div');
    shape.className = `shape-3d shape-${current3DShape}`;
    shape.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    const size = 280;

    for (let i = 0; i < faceCount; i++) {
        const face = document.createElement('div');
        face.className = `face-3d face-${i}`;

        const faceTransform = getFaceTransform(current3DShape, i, size);
        face.style.transform = faceTransform;
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
            card.innerHTML = `
                <div class="card-3d-header">
                    <span class="badge-priority ${task.priority}">${task.priority}</span>
                    <span class="card-3d-time">${formatRelativeTime(task.createdAt)}</span>
                </div>
                <div class="card-3d-title">${task.title}</div>
            `;
            card.onclick = () => openTaskModal(task.id);
            faceContent.appendChild(card);
        });

        if (faceTasks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'face-empty';
            empty.innerHTML = '<i class="fas fa-cube"></i><p>No tasks on this face</p>';
            faceContent.appendChild(empty);
        }

        face.appendChild(faceContent);
        shape.appendChild(face);
    }

    scene.appendChild(shape);
}

function getFaceTransform(shapeName, index, size) {
    const half = size / 2;

    if (shapeName === 'cube') {
        const transforms = [
            `rotateY(0deg) translateZ(${half}px)`,
            `rotateY(90deg) translateZ(${half}px)`,
            `rotateY(180deg) translateZ(${half}px)`,
            `rotateY(-90deg) translateZ(${half}px)`,
            `rotateX(90deg) translateZ(${half}px)`,
            `rotateX(-90deg) translateZ(${half}px)`
        ];
        return transforms[index];
    }

    if (shapeName === 'pyramid') {
        const angle = 55;
        const dist = half * 0.7;
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
        return `rotateY(${index * angleStep}deg) translateZ(${radius * 0.6}px)`;
    }

    if (shapeName === 'diamond') {
        if (index < 4) {
            const angle = 45;
            return `rotateY(${index * 90}deg) rotateX(${angle}deg) translateZ(${half * 0.75}px)`;
        } else {
            return `rotateY(${(index - 4) * 90}deg) rotateX(-${45}deg) translateZ(${half * 0.75}px)`;
        }
    }

    if (shapeName === 'cylinder') {
        const angleStep = 360 / 10;
        const radius = half * 1.2;
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
    });
}

function updateShapeRotation() {
    const shape = document.querySelector('.shape-3d');
    if (shape) {
        shape.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
}

function startAutoRotate() {
    stopAutoRotate();
    autoRotateInterval = setInterval(() => {
        rotateY += 0.3;
        updateShapeRotation();
    }, 30);
}

function stopAutoRotate() {
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
    }
    autoRotate = false;
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    const btn = document.getElementById('autoRotateBtn');
    if (autoRotate) {
        startAutoRotate();
        if (btn) btn.classList.add('active');
    } else {
        stopAutoRotate();
        if (btn) btn.classList.remove('active');
    }
}
