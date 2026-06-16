//#region Создание элементов блок-схемы драг энд аут
const svg = document.getElementById('canvas-svg');
const mainLayer = document.getElementById('main-layer');


const dragGhost = document.createElement('div');
dragGhost.style.cssText = `
    position: absolute; 
    top: -1000px; 
    border: 2px solid #333; 
    background: white; 
    pointer-events: none;
`;
document.body.appendChild(dragGhost);

document.querySelectorAll('.draggable-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
        const type = item.getAttribute('data-type');
        e.dataTransfer.setData('shapeType', type);

        // ПОЛНЫЙ СБРОС СТИЛЕЙ ПРИЗРАКА
        dragGhost.innerHTML = '';
        dragGhost.style.border = 'none';
        dragGhost.style.background = 'transparent';
        dragGhost.style.borderRadius = '0';
        dragGhost.style.transform = 'none';
        dragGhost.style.width = 'auto';
        dragGhost.style.height = 'auto';

        if (type === 'decision') {
            // Ромб
            dragGhost.innerHTML = `
                <svg width="60" height="60" style="display: block;">
                    <rect x="5" y="5" width="50" height="50" fill="white" stroke="black" stroke-width="2" transform="rotate(45, 30, 30)"/>
                </svg>`;
            e.dataTransfer.setDragImage(dragGhost, 30, 30);
        } 
        else if (type === 'data') {
            // Параллелограмм
            dragGhost.innerHTML = `
                <svg width="100" height="50" style="display: block;">
                    <polygon points="15,2 95,2 85,48 5,48" fill="white" stroke="black" stroke-width="2"/>
                </svg>`;
            e.dataTransfer.setDragImage(dragGhost, 50, 25);
        }
        else if (type === 'terminal') {
            // Терминатор (овал)
            dragGhost.innerHTML = `
                <svg width="100" height="50" style="display: block;">
                    <rect x="0" y="0" width="100" height="50" rx="25" ry="25" fill="white" stroke="black" stroke-width="2"/>
                </svg>`;
            e.dataTransfer.setDragImage(dragGhost, 50, 25);
        }
        else if (type === 'predefined') {
            // Предопределенный процесс (с вертикальными линиями)
            dragGhost.innerHTML = `
                <svg width="100" height="50" style="display: block;">
                    <rect x="0" y="0" width="100" height="50" fill="white" stroke="black" stroke-width="2"/>
                    <line x1="20" y1="0" x2="20" y2="50" stroke="black" stroke-width="2"/>
                    <line x1="80" y1="0" x2="80" y2="50" stroke="black" stroke-width="2"/>
                </svg>`;
            e.dataTransfer.setDragImage(dragGhost, 50, 25);
        }
        else if (type === 'connector') {
            // Соединитель (круг)
            dragGhost.innerHTML = `
                <svg width="40" height="40" style="display: block;">
                    <circle cx="20" cy="20" r="18" fill="white" stroke="black" stroke-width="2"/>
                </svg>`;
            e.dataTransfer.setDragImage(dragGhost, 20, 20);
        }
        else {
            // Обычный процесс
            dragGhost.innerHTML = `
                <svg width="100" height="50" style="display: block;">
                    <rect x="0" y="0" width="100" height="50" fill="white" stroke="black" stroke-width="2"/>
                </svg>`;
            e.dataTransfer.setDragImage(dragGhost, 50, 25);
        }
    });
});

// 2. Логика сброса (Drop) на SVG
svg.addEventListener('dragover', (e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'copy';
});

svg.addEventListener('drop', (e) => {
    e.preventDefault();
    console.log("Объект брошен!");

    const type = e.dataTransfer.getData('shapeType');
    console.log("Тип объекта:", type);

    const rect = svg.getBoundingClientRect();
    const canvasArea = document.querySelector('.canvas-area');
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (type) {
        createNode(type, x, y);
    } else {
        console.error("Тип не передан! Проверь setData в dragstart");
    }
});

function createNode(type, x, y, existingBlockId) {
    const ns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(ns, "g");
    
    // Присваиваем data-id сразу: либо переданный (удалённый блок), либо новый
    const blockId = existingBlockId || ('block_' + Math.random().toString(36).substr(2, 9));
    g.setAttribute("data-id", blockId);
    g.setAttribute("transform", `translate(${x}, ${y})`);
    g.setAttribute("data-type", type);
    
    let shape;
    
    if (type === 'decision') {
        // Ромб
        shape = document.createElementNS(ns, "polygon");
        shape.setAttribute("points", "-25,0 0,-25 25,0 0,25");
        shape.setAttribute("fill", "#ffffff");
        shape.setAttribute("stroke", "#1a1a1a");
        shape.setAttribute("stroke-width", "2");
    } 
    else if (type === 'data') {
        // Параллелограмм
        shape = document.createElementNS(ns, "polygon");
        shape.setAttribute("points", "-35,-25 65,-25 55,25 -45,25");
        shape.setAttribute("fill", "#ffffff");
        shape.setAttribute("stroke", "#1a1a1a");
        shape.setAttribute("stroke-width", "2");
    }
    else if (type === 'predefined') {
        // Предопределенный процесс (с вертикальными линиями)
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", "-50");
        rect.setAttribute("y", "-25");
        rect.setAttribute("width", "100");
        rect.setAttribute("height", "50");
        rect.setAttribute("fill", "#ffffff");
        rect.setAttribute("stroke", "#1a1a1a");
        rect.setAttribute("stroke-width", "2");
        shape = rect;
        
        // Добавляем вертикальные линии на 10% и 90% от ширины
        const line1 = document.createElementNS(ns, "line");
        const leftX = -50 + 100 * 0.1; // -50 + 10 = -40
        line1.setAttribute("x1", leftX);
        line1.setAttribute("x2", leftX);
        line1.setAttribute("y1", "-25");
        line1.setAttribute("y2", "25");
        line1.setAttribute("stroke", "#1a1a1a");
        line1.setAttribute("stroke-width", "2");
        
        const line2 = document.createElementNS(ns, "line");
        const rightX = -50 + 100 * 0.9; // -50 + 90 = 40
        line2.setAttribute("x1", rightX);
        line2.setAttribute("x2", rightX);
        line2.setAttribute("y1", "-25");
        line2.setAttribute("y2", "25");
        line2.setAttribute("stroke", "#1a1a1a");
        line2.setAttribute("stroke-width", "2");
        
        g.appendChild(rect);
        g.appendChild(line1);
        g.appendChild(line2);
        mainLayer.appendChild(g);
        
        makeTextEditable(g, type);
        makeDraggable(g);
        makeSelectable(g);
        addResizeHandles(g);
        updateHandlesPosition(g, -50, -25, 100, 50);
        // Emit только если это локальное создание (не remote)
        if (!existingBlockId) {
            emitEvent('block:create', { blockId: g.getAttribute('data-id'), blockType: type, x, y });
        }
        return;
    }
    else if (type === 'connector') {
        // Соединитель (эллипс изначально в виде круга)
        shape = document.createElementNS(ns, "ellipse");
        shape.setAttribute("cx", "0");
        shape.setAttribute("cy", "0");
        shape.setAttribute("rx", "15");
        shape.setAttribute("ry", "15");
        shape.setAttribute("fill", "#ffffff");
        shape.setAttribute("stroke", "#1a1a1a");
        shape.setAttribute("stroke-width", "2");
    }
    else if (type === 'terminal') {
        // Терминатор (скругленный прямоугольник)
        shape = document.createElementNS(ns, "rect");
        shape.setAttribute("x", "-50");
        shape.setAttribute("y", "-25");
        shape.setAttribute("width", "100");
        shape.setAttribute("height", "50");
        shape.setAttribute("rx", "25");
        shape.setAttribute("fill", "#ffffff");
        shape.setAttribute("stroke", "#1a1a1a");
        shape.setAttribute("stroke-width", "2");
    }
    else {
        // Обычный процесс
        shape = document.createElementNS(ns, "rect");
        shape.setAttribute("x", "-50");
        shape.setAttribute("y", "-25");
        shape.setAttribute("width", "100");
        shape.setAttribute("height", "50");
        shape.setAttribute("fill", "#ffffff");
        shape.setAttribute("stroke", "#1a1a1a");
        shape.setAttribute("stroke-width", "2");
    }

    if (shape) {
        g.appendChild(shape);
    }
    
    mainLayer.appendChild(g);
    // Emit только если это локальное создание (не remote)
    if (!existingBlockId) {
        emitEvent('block:create', { blockId: g.getAttribute('data-id'), blockType: type, x, y });
    }
    makeTextEditable(g, type);
    makeDraggable(g);
    makeSelectable(g);

    addResizeHandles(g);

    if (type === 'decision') {
        updateHandlesPosition(g, -25, -25, 50, 50);
    } else if (type === 'connector') {
        updateHandlesPosition(g, -15, -15, 30, 30);
    } else if (type === 'data') {
        const bbox = shape.getBBox();
        updateHandlesPosition(g, bbox.x, bbox.y, bbox.width, bbox.height);
    } else {
        updateHandlesPosition(g, -50, -25, 100, 50);
    }
}

// Функция для добавления и редактирования текста
function makeTextEditable(group, type) {
    const ns = "http://www.w3.org/2000/svg";
    let text = document.createElementNS(ns, "text");
    
    let defaultText = "";
    switch(type) {
        case 'terminal':
            defaultText = "Пуск";
            break;
        case 'process':
            defaultText = "Процесс";
            break;
        case 'predefined':
            defaultText = "Подпрограмма";
            break;
        case 'decision':
            defaultText = "Решение";
            break;
        case 'document':
            defaultText = "Документ";
            break;
        case 'data':
            defaultText = "Данные";
            break;
        case 'connector':
            defaultText = "Соединитель";
            break;
    }
    
    text.setAttribute("x", "0");
    text.setAttribute("y", "5");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-family", "'Inter', sans-serif");
    text.setAttribute("fill", "#1a1a1a");
    text.setAttribute("pointer-events", "none");
    text.textContent = defaultText;
    
    group.appendChild(text);
    
    // Добавляем возможность редактирования по двойному клику
    group.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (!canEdit()) return; // viewer не может редактировать текст
        editText(group, text);
    });
}

// Функция для редактирования текста
function editText(group, textElement) {


    if (isBlockLocked(group.getAttribute('data-id'))) return;

    const blockId = group.getAttribute('data-id');
    if (roomId) socket.emit('block:lock', { blockId });

    const tspans = textElement.querySelectorAll('tspan');
    const currentText = tspans.length > 0 
        ? Array.from(tspans).map(tspan => tspan.textContent.trim()).join('\n')
        : textElement.textContent;
    const groupRect = group.getBoundingClientRect();

    textElement.style.visibility = 'hidden';
    
    // Используем textarea для поддержки многострочного текста (Shift+Enter)
    const textarea = document.createElement('textarea');
    textarea.value = currentText;

    textarea.value = currentText;
    textarea.style.position = 'fixed';

    const paddingOffset = 8; 
    const dynamicWidth = Math.max(groupRect.width - paddingOffset * 2, 60); 
    const dynamicHeight = Math.max(groupRect.height - paddingOffset * 2, 30);

    textarea.style.left = `${groupRect.left + (groupRect.width - dynamicWidth) / 2}px`;
    textarea.style.top = `${groupRect.top + (groupRect.height - dynamicHeight) / 2}px`;

    textarea.style.width = `${dynamicWidth}px`;
    textarea.style.minHeight = `${dynamicHeight}px`;

    textarea.style.minHeight = '48px';
    textarea.style.fontSize = '12px';
    textarea.style.fontFamily = "'Inter', sans-serif";
    textarea.style.textAlign = 'center';
    textarea.style.border = '2px solid #0066cc';
    textarea.style.borderRadius = '4px';
    textarea.style.outline = 'none';
    textarea.style.zIndex = '1000';
    textarea.style.backgroundColor = 'white';
    textarea.style.resize = 'none';
    textarea.style.overflow = 'hidden';
    textarea.style.lineHeight = '1.4';
    textarea.style.padding = '4px';
    textarea.style.boxSizing = 'border-box';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const initialHeight = 48;
    const centerY = groupRect.top + groupRect.height / 2;

    // Авторастяжка по высоте
    const autoResize = () => {
        textarea.style.height = 'auto';
        const newHeight = textarea.scrollHeight;
        textarea.style.height = `${newHeight}px`;
        textarea.style.top = `${centerY - newHeight / 2}px`;
    };
    autoResize();
    textarea.addEventListener('input', autoResize);

    let saved = false;

     const closeEditor = () => {
        if (textarea.parentNode) {
            textarea.parentNode.removeChild(textarea);
            if (roomId) socket.emit('block:unlock', { blockId });
        }
        // Возвращаем видимость SVG-тексту в любом сценарии (сохранение или отмена)
        textElement.style.visibility = 'visible';
    };

    // Функция сохранения текста
    const saveText = () => {
        if (saved) return;
        saved = true;
        // Заменяем переносы строк на символ переноса SVG (используем \n как разделитель)
        const newText = textarea.value.trim();
        if (newText) {
            // Поддержка многострочного текста в SVG через tspan
            setMultilineText(textElement, newText);
            emitEvent('block:text', {
                blockId: group.getAttribute('data-id'),
                text: newText
            });
        } else {
            textElement.textContent = currentText;
        }
        closeEditor();
    };

    // Enter = сохранить, Shift+Enter = новая строка
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveText();
        } else if (e.key === 'Escape') {
            saved = true;
            saveText();
            closeEditor();
        }
    });

    textarea.addEventListener('blur', saveText);
}

// Вспомогательная функция для многострочного текста в SVG
function setMultilineText(textEl, text) {
    // Удаляем старые tspan'ы
    while (textEl.firstChild) textEl.removeChild(textEl.firstChild);

    const lines = text.split('\n');
    const lineHeight = 14; // px
    const totalHeight = lines.length * lineHeight;
    const startDy = -((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
        const ns = "http://www.w3.org/2000/svg";
        const tspan = document.createElementNS(ns, 'tspan');
        tspan.setAttribute('x', textEl.getAttribute('x') || '0');
        tspan.setAttribute('dy', i === 0 ? `${startDy}` : `${lineHeight}`);
        tspan.textContent = line || ' ';
        textEl.appendChild(tspan);
    });
}

// Функция для перемещения блоков на холсте
function makeDraggable(group) {
    let isDragging = false;
    let startX, startY;
    let originalX, originalY;
    let hasMoved = false;
    
    group.style.cursor = 'move';
    group.setAttribute('cursor', 'move');
    
    group.addEventListener('mousedown', (e) => {
        // Не перемещаем при двойном клике или если кликнули на текст
       if (e.target.tagName === 'text' || e.ctrlKey || e.metaKey) return;
        if (!canEdit()) return; // viewer не может двигать блоки

        // Блок занят другим участником
        if (isBlockLocked(group.getAttribute('data-id'))) return;
        
        e.stopPropagation();
        isDragging = true;
        hasMoved = false;

        // БАГ 4 FIX: захватываем блок локально немедленно (оптимистично),
        // потом сервер подтвердит или отклонит через block:locked/block:unlocked
        const blockId = group.getAttribute('data-id');
        if (roomId) {
            // Предварительно ставим локальную блокировку чтобы второй клиент
            // не смог захватить блок до ответа сервера
            lockedBlocks.set(blockId, { userId: myUserId, username: myUsername, color: getUserColor(myUserId) });
            socket.emit('block:lock', { blockId });
        }
        
        // Получаем текущую позицию
        const transform = group.getAttribute('transform');
        const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (match) {
            originalX = parseFloat(match[1]);
            originalY = parseFloat(match[2]);
        }
        
        startX = e.clientX;
        startY = e.clientY;
        
        const onMouseMove = (moveEvent) => {
            if (!isDragging) return;
            
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                hasMoved = true;
            }
            
            const newX = originalX + dx;
            const newY = originalY + dy;
            group.setAttribute('transform', `translate(${newX}, ${newY})`);

            // Обновляем соединения локально в реальном времени
            updateAllConnections();

            // Транслируем live-позицию другим участникам
            if (roomId && !isApplyingRemote && (myRole === 'editor' || myRole === 'owner')) {
                socket.emit('block:live_move', {
                    blockId: group.getAttribute('data-id'),
                    x: newX, y: newY
                });
            }
        };
        
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            updateAllConnections();
            saveFlowchart();

            // Освобождаем блок
            const blockId = group.getAttribute('data-id');
            if (roomId) socket.emit('block:unlock', { blockId });

            const match2 = group.getAttribute('transform').match(/translate\(([^,]+),\s*([^)]+)\)/);
            emitEvent('block:move', {
            blockId: group.getAttribute('data-id'),
            x: parseFloat(match2[1]),
            y: parseFloat(match2[2])
            });
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

//#endregion

//#region Выделение и удаление блоков

// Хранилище для выделенных блоков
let selectedBlocks = new Set();

// Функция для очистки выделения
function clearSelection() {
    selectedBlocks.forEach(block => {
        block.classList.remove('selected-block');
        // Сбрасываем цвет соединений
        if (block.classList.contains('connection-group')) {
            const path = block.querySelector('path');
            if (path) {
                path.setAttribute('stroke', '#1a1a1a');
                path.setAttribute('stroke-width', '2');
            }
        }
        // Скрываем маркеры у блоков
        if (block.hasAttribute('data-type')) {
            toggleResizeHandles(block, false);
        }
    });
    selectedBlocks.clear();
}

// Функция для выделения блока
function selectBlock(block, isMultiSelect = false) {
    if (!isMultiSelect) {
        clearSelection();
    }
    block.classList.add('selected-block'); 
    selectedBlocks.add(block);
}

// Функция для удаления выделенных блоков
function deleteSelectedBlocks() {
    const layer = getConnectionsLayer();
    
    for (const block of selectedBlocks) {
        if (block.hasAttribute('data-type')) {
            const blockId = block.getAttribute('data-id');
            if (isBlockLocked(blockId)) return; // Выходим полностью, не удаляем ничего
        }
    }

    const blockIds = [];
        selectedBlocks.forEach(block => {
        if (block.hasAttribute('data-type')) blockIds.push(block.getAttribute('data-id'));
            if (block.classList.contains('connection-group')) {
                emitEvent('conn:delete', { connId: block.getAttribute('data-connection-id') });
            }
        });
    if (blockIds.length) emitEvent('block:delete', { blockIds });

    selectedBlocks.forEach(block => {
        // Если это блок — удаляем его соединения
        if (block.hasAttribute('data-type')) {
            const blockId = block.getAttribute('data-id');
            if (blockId) {
                removeConnectionsForBlock(blockId);
            }
        }
        
        // Если это соединение — удаляем его
        if (block.classList.contains('connection-group')) {
            const connId = block.getAttribute('data-connection-id');
            // Удаляем из массива
            connections = connections.filter(conn => conn.id !== connId);
            // Удаляем маркер стрелки
            const arrowId = 'arrow_' + connId;
            const defs = svg.querySelector('defs');
            if (defs) {
                const marker = defs.querySelector(`#${arrowId}`);
                if (marker) marker.remove();
            }
        }
        
        block.remove();
    });
    
    clearSelection();
}

function removeConnectionsForBlock(blockId) {
    const layer = getConnectionsLayer();
    
    // Находим все соединения, связанные с блоком
    const toRemove = connections.filter(conn => 
        conn.fromBlockId === blockId || conn.toBlockId === blockId
    );
    
    // Удаляем их из DOM
    toRemove.forEach(conn => {
        const element = layer.querySelector(`[data-connection-id="${conn.id}"]`);
        if (element) element.remove();
        
        // Удаляем маркер стрелки
        const arrowId = 'arrow_' + conn.id;
        const defs = svg.querySelector('defs');
        if (defs) {
            const marker = defs.querySelector(`#${arrowId}`);
            if (marker) marker.remove();
        }
    });
    
    // Удаляем из массива
    connections = connections.filter(conn => 
        conn.fromBlockId !== blockId && conn.toBlockId !== blockId
    );
}

// Обработчик клика по блоку для выделения
function makeSelectable(group) {
    group.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (e.ctrlKey || e.metaKey) {
            // Множественное выделение с Ctrl/Cmd
            if (selectedBlocks.has(group)) {
                // Снимаем выделение
                group.classList.remove('selected-block');
                selectedBlocks.delete(group);
            } else {
                selectBlock(group, true);
            }
        } else {
            // Одиночное выделение
            selectBlock(group);
        }
    });
}

// Обработчик клавиши Delete
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && selectedBlocks.size > 0) {
        if (!canEdit()) return;
        e.preventDefault();
        deleteSelectedBlocks();
    }
});

// Очистка выделения при клике на пустую область холста
svg.addEventListener('click', (e) => {
    if (e.ctrlKey || e.metaKey) return;
    
    // Проверяем, кликнули ли по блоку или соединению
    const clickedBlock = e.target.closest('g[data-type]');
    const clickedConnection = e.target.closest('.connection-group');
    
    // Если кликнули по path внутри connection-group, поднимаемся до группы
    let connectionGroup = clickedConnection;
    if (!connectionGroup && e.target.tagName === 'path') {
        connectionGroup = e.target.parentElement;
        if (connectionGroup && !connectionGroup.classList.contains('connection-group')) {
            connectionGroup = null;
        }
    }

    // Если кликнули НЕ по блоку и НЕ по соединению, очищаем выделение
    if (!clickedBlock && !connectionGroup) {
        clearSelection();
    }
});

//#endregion

//#region Изменение размера блоков

// Добавляем маркеры для изменения размера
function addResizeHandles(group) {
    const ns = "http://www.w3.org/2000/svg";
    const handles = [
        { x: -55, y: -30, cursor: 'nw-resize', dir: 'top-left' },
        { x: 55, y: -30, cursor: 'ne-resize', dir: 'top-right' },
        { x: -55, y: 30, cursor: 'sw-resize', dir: 'bottom-left' },
        { x: 55, y: 30, cursor: 'se-resize', dir: 'bottom-right' }
    ];
    
    handles.forEach(handle => {
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", handle.x);
        rect.setAttribute("y", handle.y);
        rect.setAttribute("width", "10");
        rect.setAttribute("height", "10");
        rect.setAttribute("fill", "#3b82f6");
        rect.setAttribute("stroke", "#ffffff");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("cursor", handle.cursor);
        rect.setAttribute("class", "resize-handle");
        rect.style.display = "none";
        
        rect.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            if (!canEdit()) return; // viewer не может ресайзить
            if (isBlockLocked(group.getAttribute('data-id'))) return;
            startResize(group, handle.dir, e);
        });
        
        group.appendChild(rect);
    });
}

// Функция изменения размера надеюсь работает

function startResize(group, direction, startEvent) {
    startEvent.stopPropagation();
    startEvent.preventDefault();

    const blockId = group.getAttribute('data-id');
    if (roomId) socket.emit('block:lock', { blockId });
    
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    
    // Получаем текущий transform
    const transform = group.getAttribute('transform');
    const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    let posX = match ? parseFloat(match[1]) : 0;
    let posY = match ? parseFloat(match[2]) : 0;
    
    const type = group.getAttribute('data-type');
    const shape = group.querySelector('rect, polygon, ellipse, path')
    let startWidth, startHeight, startXPos, startYPos;
    const bbox = shape.getBBox();
    startWidth = bbox.width;
    startHeight = bbox.height;
    startXPos = bbox.x;
    startYPos = bbox.y;

    if(type === 'data'){
        const points = shape.getAttribute('points').split(' ').map(p => p.split(',').map(Number));
        startXPos = points[0][0];
        startYPos = points[0][1];
        startWidth = points[1][0] - startXPos;
        startHeight = points[3][1] - startYPos;
    }

    const onMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        let newWidth = 0;
        let newHeight = 0;
        let newX = 0;
        let newY = 0;
        
        switch(direction) {
            case 'top-left':
                newWidth = startWidth - dx;
                newHeight = startHeight - dy;
                newX = startXPos + dx;
                newY = startYPos + dy;
                break;
            case 'top-right':
                newWidth = startWidth + dx;
                newHeight = startHeight - dy;
                newX = startXPos;
                newY = startYPos + dy;
                break;
            case 'bottom-left':
                newWidth = startWidth - dx;
                newHeight = startHeight + dy;
                newX = startXPos + dx;
                newY = startYPos;
                break;
            case 'bottom-right':
                newWidth = startWidth + dx;
                newHeight = startHeight + dy;
                newX = startXPos;
                newY = startYPos;
                break;
        }
        
        const minWidth = 30;
        const minHeight = 30;
        if (newWidth < minWidth) newWidth = minWidth;
        if (newHeight < minHeight) newHeight = minHeight;
        
        // Применяем изменения в зависимости от типа фигуры
        
        if (type === 'decision') {
            // Ромб - растягивается как прямоугольник
            const points = `${newX + newWidth/2},${newY} ${newX + newWidth},${newY + newHeight/2} ${newX + newWidth/2},${newY + newHeight} ${newX},${newY + newHeight/2}`;
            shape.setAttribute('points', points);
        }
        else if (type === 'connector') {
            const rx = newWidth / 2;
            const ry = newHeight / 2;

            shape.setAttribute('rx', rx);
            shape.setAttribute('ry', ry);
            shape.setAttribute('cx', newX + rx);
            shape.setAttribute('cy', newY + ry);
        }
        else if (type === 'data') {
            // Параллелограмм - растягивается как прямоугольник
            const skew = 20; // величина скоса
            const points = `${newX},${newY} ${newX + newWidth},${newY} ${newX + newWidth - skew},${newY + newHeight} ${newX - skew},${newY + newHeight}`;
            shape.setAttribute('points', points);
        }
        else {
            // Прямоугольные блоки
            shape.setAttribute('width', newWidth);
            shape.setAttribute('height', newHeight);
            shape.setAttribute('x', newX);
            shape.setAttribute('y', newY);
            
            if (type === 'terminal') {
                shape.setAttribute('rx', newHeight / 2);
                shape.setAttribute('ry', newHeight / 2);
            }
            
            if (type === 'predefined') {
                const lines = group.querySelectorAll('line');
                if (lines.length === 2) {
                    const leftLineX = newX + newWidth * 0.1;
                    const rightLineX = newX + newWidth * 0.9;
                    
                    lines[0].setAttribute('x1', leftLineX);
                    lines[0].setAttribute('x2', leftLineX);
                    lines[0].setAttribute('y1', newY);
                    lines[0].setAttribute('y2', newY + newHeight);
                    
                    lines[1].setAttribute('x1', rightLineX);
                    lines[1].setAttribute('x2', rightLineX);
                    lines[1].setAttribute('y1', newY);
                    lines[1].setAttribute('y2', newY + newHeight);
                }
            }
        }

        const text = group.querySelector('text');
        if (text) {
            const textX = newX + newWidth / 2;
            const textY = newY + newHeight / 2;

            text.setAttribute('x', textX);
            text.setAttribute('y', textY);
            
            // Настраиваем встроенное центрирование, если оно сбросилось
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');

        
            const tspans = text.querySelectorAll('tspan');
            tspans.forEach(tspan => {
                tspan.setAttribute('x', textX);
            });
        }
        
        // Обновляем маркеры
        updateHandlesPosition(group, newX, newY, newWidth, newHeight);
        updatePortsPosition(group);


        updateAllConnections();
        // Транслируем live-ресайз
        if (roomId && !isApplyingRemote && (myRole === 'editor' || myRole === 'owner')) {
            const shape2 = group.querySelector('rect, polygon, ellipse');
            socket.emit('block:live_resize', {
                blockId: group.getAttribute('data-id'),
                type: group.getAttribute('data-type'),
                points: shape2.getAttribute('points'),
                rx: shape2.getAttribute('rx'), ry: shape2.getAttribute('ry'),
                cx: shape2.getAttribute('cx'), cy: shape2.getAttribute('cy'),
                x: shape2.getAttribute('x'),  y: shape2.getAttribute('y'),
                width: shape2.getAttribute('width'), height: shape2.getAttribute('height'),
                hx: newX, hy: newY, hw: newWidth, hh: newHeight
            });
        }
    };
    
    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        saveFlowchart();

        // Освобождаем блок
        if (roomId) socket.emit('block:unlock', { blockId });

        const shape2 = group.querySelector('rect, polygon, ellipse');
        const bbox2 = shape2.getBBox();
        emitEvent('block:resize', {
        blockId: group.getAttribute('data-id'),
        type: group.getAttribute('data-type'),
        points: shape2.getAttribute('points'),
        rx: shape2.getAttribute('rx'), ry: shape2.getAttribute('ry'),
        cx: shape2.getAttribute('cx'), cy: shape2.getAttribute('cy'),
        x: shape2.getAttribute('x'),  y: shape2.getAttribute('y'),
        width: shape2.getAttribute('width'), height: shape2.getAttribute('height'),
        hx: bbox2.x, hy: bbox2.y, hw: bbox2.width, hh: bbox2.height
        });
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// Обновление позиции маркеров
function updateHandlesPosition(group, x, y, width, height) {
    const handles = group.querySelectorAll('.resize-handle');
    if (handles.length === 4) {
        handles[0].setAttribute('x', x - 5);
        handles[0].setAttribute('y', y - 5);
        handles[1].setAttribute('x', x + width - 5);
        handles[1].setAttribute('y', y - 5);
        handles[2].setAttribute('x', x - 5);
        handles[2].setAttribute('y', y + height - 5);
        handles[3].setAttribute('x', x + width - 5);
        handles[3].setAttribute('y', y + height - 5);
    }
}

// Показываем/скрываем маркеры при выделении
function toggleResizeHandles(group, show) {
    const handles = group.querySelectorAll('.resize-handle');
    handles.forEach(handle => {
        handle.style.display = show ? 'block' : 'none';
    });
}

// Переопределяем функции выделения
const originalSelectBlock = window.selectBlock || function() {};
const originalClearSelection = window.clearSelection || function() {};

window.selectBlock = function(block, isMultiSelect = false) {
    if (originalSelectBlock) originalSelectBlock(block, isMultiSelect);
    toggleResizeHandles(block, true);
};


//#endregion

//#region Сохранение и загрузка блок-схемы

// Получаем ID схемы из URL (?id=123) если открыли существующую
const urlParams = new URLSearchParams(window.location.search);
let currentFlowchartId = urlParams.get('id') || null;

function getPreviewImage() {
  const ns = "http://www.w3.org/2000/svg";

  // Находим реальные блоки и считаем их bbox
  const blocks = mainLayer.querySelectorAll('g[data-type]');
  if (blocks.length === 0) return '';

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  blocks.forEach(block => {
    const transform = block.getAttribute('transform') || '';
    const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;

    const shape = block.querySelector('rect, polygon, ellipse');
    if (!shape) return;
    const bbox = shape.getBBox();

    minX = Math.min(minX, tx + bbox.x);
    minY = Math.min(minY, ty + bbox.y);
    maxX = Math.max(maxX, tx + bbox.x + bbox.width);
    maxY = Math.max(maxY, ty + bbox.y + bbox.height);
  });

  const padding = 20;
  minX -= padding; minY -= padding;
  maxX += padding; maxY += padding;
  const w = maxX - minX;
  const h = maxY - minY;

  // Собираем мини-SVG только с нужной областью
  const miniSvg = document.createElementNS(ns, "svg");
  miniSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  miniSvg.setAttribute("viewBox", `${minX} ${minY} ${w} ${h}`);
  miniSvg.setAttribute("width", "280");
  miniSvg.setAttribute("height", "160");

  // Копируем defs (стрелки маркеры)
  const defs = svg.querySelector('defs');
  if (defs) miniSvg.appendChild(defs.cloneNode(true));

  // Копируем соединения
  const connLayer = document.getElementById('connections-layer');
  if (connLayer) {
    const connClone = connLayer.cloneNode(true);
    // Убираем лишнее
    connClone.querySelectorAll('.connection-port, .resize-handle').forEach(el => el.remove());
    miniSvg.appendChild(connClone);
  }

  // Копируем блоки
  const layerClone = mainLayer.cloneNode(true);
  layerClone.querySelectorAll('.connection-port, .resize-handle').forEach(el => el.remove());
  // Убираем прозрачный фоновый rect
  const bgRect = layerClone.querySelector('rect[fill="transparent"]');
  if (bgRect) bgRect.remove();
  miniSvg.appendChild(layerClone);

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(miniSvg);
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
}

function getSvgContent() {
  var clone = mainLayer.cloneNode(true);
  clone.querySelectorAll('.block-lock-overlay').forEach(function(el) { el.remove(); });
  clone.querySelectorAll('.block-locked').forEach(function(el) { el.classList.remove('block-locked'); });
  return JSON.stringify({
    blocks: clone.innerHTML,
    connections: connections,
    notes: textNotes
  });
}

// Автосохранение в локал сторэдж
function saveFlowchart() {
  localStorage.setItem('flowchart_html', getSvgContent());
}

async function loadFlowchart() {
  if (currentFlowchartId) {
    try {
      const res = await fetch(`/flowcharts/single/${currentFlowchartId}`);
      const data = await res.json();
      if (data.ok && data.flowchart.svg_content) {
        restoreFromContent(data.flowchart.svg_content);
        return;
      }
    } catch (e) {
      console.error('Ошибка загрузки схемы:', e);
    }
  }

  const savedHtml = localStorage.getItem('flowchart_html');
  if (savedHtml) restoreFromContent(savedHtml);
}

function restoreFromContent(content) {
  var blocksHtml, savedConnections, savedNotes;

  try {
    var parsed = JSON.parse(content);
    blocksHtml = parsed.blocks;
    savedConnections = parsed.connections || [];
    savedNotes = parsed.notes || [];
  } catch(e) {
    blocksHtml = content;
    savedConnections = [];
    savedNotes = [];
  }

  mainLayer.innerHTML = blocksHtml;
  restoreBlockHandlers();

  // Восстанавливаем connections-layer
  let connLayer = document.getElementById('connections-layer');
  if (!connLayer) {
    const ns = "http://www.w3.org/2000/svg";
    connLayer = document.createElementNS(ns, "g");
    connLayer.setAttribute('id', 'connections-layer');
    svg.insertBefore(connLayer, mainLayer);
    connectionsLayer = connLayer;
  } else {
    connLayer.innerHTML = '';
    connectionsLayer = connLayer;
  }

  // Восстанавливаем массив и перерисовываем соединения
  connections = savedConnections;
  
  // Находим максимальный номер соединения чтобы счётчик не дублировал
  connectionCounter = connections.reduce((max, conn) => {
    const num = parseInt(conn.id.replace('conn_', '')) || 0;
    return Math.max(max, num);
  }, 0);

  connections.forEach(conn => drawConnection(conn));

  // Восстанавливаем текстовые заметки
  textNotes = [];
  textNoteCounter = 0;
  var nl = document.getElementById('notes-layer');
  if (nl) { nl.innerHTML = ''; notesLayer = nl; }
  savedNotes.forEach(function(note) {
    if (note.id) {
      var num = parseInt(note.id.replace('note_', '')) || 0;
      if (num > textNoteCounter) textNoteCounter = num;
    }
    textNotes.push(note);
    renderTextNote(note);
  });
}

function restoreBlockHandlers() {
  const blocks = mainLayer.querySelectorAll('g[data-type]');
  blocks.forEach(block => {
    makeDraggable(block);
    makeSelectable(block);
    addPortsToBlock(block, block.getAttribute('data-type'));

    const text = block.querySelector('text');
    if (text) {
      const newText = text.cloneNode(true);
      text.parentNode.replaceChild(newText, text);
      block.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const currentText = block.querySelector('text');
        if (currentText) editText(block, currentText);
      });
    }

    const handles = block.querySelectorAll('.resize-handle');
    const directionMap = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    handles.forEach((handle, index) => {
      const newHandle = handle.cloneNode(true);
      handle.parentNode.replaceChild(newHandle, handle);
      newHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        startResize(block, directionMap[index], e);
      });
    });
  });
}

window.addEventListener('load', async () => {
  await loadFlowchart();

  const exitBtn = document.querySelector('.btn-exit');
  if (exitBtn) {
    exitBtn.closest('a').addEventListener('click', (e) => {
      e.preventDefault();

      const userId = localStorage.getItem('userid');
      if (!userId) {
        window.location.href = '/MainMenu.html';
        return;
      }

      // Если схема уже существует в БД — сохраняем без диалога названия
      if (currentFlowchartId) {
        saveToServer().then(() => {
          localStorage.removeItem('flowchart_html');
          window.location.href = '/MainMenu.html';
        });
        return;
      }

      // Новая схема — спрашиваем название
      showSaveModal(
        async (title) => {
          await saveToServer(title);
          localStorage.removeItem('flowchart_html');
          window.location.href = '/MainMenu.html';
        },
        () => {
          localStorage.removeItem('flowchart_html');
          window.location.href = '/MainMenu.html';
        }
      );
    });
  }
});

// Сохранение на сервер
async function saveToServer(title) {
  const userId = localStorage.getItem('userid');
  if (!userId) { alert('Войдите в аккаунт'); return; }

  const preview = getPreviewImage();
  const svgContent = getSvgContent();

  if (currentFlowchartId) {
    // Обновляем существующую схему; если передан новый title — обновляем и его
    const body = { preview, svgContent };
    if (title) body.title = title;
    await fetch(`/flowcharts/${currentFlowchartId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } else {
    const res = await fetch('/flowcharts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, preview, svgContent })
    });
    const data = await res.json();
    if (data.ok) currentFlowchartId = data.flowchartId;
  }

  console.log('Схема сохранена на сервер');
}

// Показываем модалку при выходе
function showSaveModal(onConfirm, onSkip) {
  const overlay = document.getElementById('saveModalOverlay');
  const input = document.getElementById('flowchartTitleInput');
  const confirmBtn = document.getElementById('saveConfirmBtn');
  const skipBtn = document.getElementById('saveSkipBtn');

  input.value = '';
  input.placeholder = 'Название схемы';
  overlay.style.display = 'flex';
  setTimeout(() => input.focus(), 100);

  const confirm = async () => {
    const title = input.value.trim();
    if (!title) { alert('Введите название'); return; }
    overlay.style.display = 'none';
    await onConfirm(title);
  };

  const skip = () => {
    overlay.style.display = 'none';
    onSkip();
  };

  confirmBtn.onclick = confirm;
  skipBtn.onclick = skip;

  input.onkeydown = (e) => { if (e.key === 'Enter') confirm(); };
}

const originalDeleteSelectedBlocks = deleteSelectedBlocks;
deleteSelectedBlocks = function() {
  originalDeleteSelectedBlocks();
  saveFlowchart();
};

const originalEditTextFunction = editText;
editText = function(group, textElement) {
  originalEditTextFunction(group, textElement);
  const input = document.querySelector('input');
  if (input) {
    input.addEventListener('blur', () => saveFlowchart());
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveFlowchart(); });
  }
};

//#endregion

//#region СОЕДИНЕНИЯ - Шаг 1: Порты

function addPortsToBlock(group, type) {
    const ns = "http://www.w3.org/2000/svg";
    
    // Получаем размеры блока
    let bbox;
    const shape = group.querySelector('rect, polygon, ellipse');
    if (shape) {
        bbox = shape.getBBox();
    } else {
        bbox = { x: -50, y: -25, width: 100, height: 50 };
    }
    
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    
    const portPositions = {
        top:    { x: cx, y: bbox.y },
        bottom: { x: cx, y: bbox.y + bbox.height },
        left:   { x: bbox.x, y: cy },
        right:  { x: bbox.x + bbox.width, y: cy }
    };
    
    ['top', 'bottom', 'left', 'right'].forEach(portName => {
        const pos = portPositions[portName];
        const circle = document.createElementNS(ns, "circle");
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', '#3b82f6');
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '1');
        circle.setAttribute('data-port', portName);
        circle.classList.add('connection-port');
        circle.style.display = 'none';
        circle.style.cursor = 'crosshair';
        group.appendChild(circle);
    });
    
    group.addEventListener('mouseenter', () => {
        const ports = group.querySelectorAll('.connection-port');
        ports.forEach(p => { p.style.display = 'block'; });
    });
    
    group.addEventListener('mouseleave', () => {
        const ports = group.querySelectorAll('.connection-port');
        ports.forEach(p => { p.style.display = 'none'; });
    });
    makePortsInteractive(group);
}

// Модифицируем createNode — добавляем вызов addPortsToBlock
const _createNode = createNode;
createNode = function(type, x, y, existingBlockId) {
    _createNode(type, x, y, existingBlockId);
    const allGroups = mainLayer.querySelectorAll('g[data-type]');
    const lastGroup = allGroups[allGroups.length - 1];
    addPortsToBlock(lastGroup, type);
};

function updatePortsPosition(group) {
    const ports = group.querySelectorAll('.connection-port');
    const shape = group.querySelector('rect, polygon, ellipse');
    if (!shape) return;
    
    const bbox = shape.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    
    const newPositions = {
        top:    { x: cx, y: bbox.y },
        bottom: { x: cx, y: bbox.y + bbox.height },
        left:   { x: bbox.x, y: cy },
        right:  { x: bbox.x + bbox.width, y: cy }
    };
    
    ports.forEach(port => {
        const portName = port.getAttribute('data-port');
        const pos = newPositions[portName];
        port.setAttribute('cx', pos.x);
        port.setAttribute('cy', pos.y);
    });
}

let isDrawing = false;
let tempLine = null;
let drawingFromGroup = null;
let drawingFromPort = null;

// Делаем порты кликабельными для начала рисования
function makePortsInteractive(group) {
    const ports = group.querySelectorAll('.connection-port');
    
    ports.forEach(port => {
        port.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            // БАГ 2 FIX: читатель не может рисовать связи
            if (!canEdit()) return;
            startDrawingLine(group, port, e);
        });
    });
}

function startDrawingLine(group, port, event) {

    if (isBlockLocked(group.getAttribute('data-id'))) return;

    isDrawing = true;
    drawingFromGroup = group;
    drawingFromPort = port.getAttribute('data-port');
    
    const blockId = group.getAttribute('data-id');
    if (roomId) socket.emit('block:lock', { blockId });

    // Получаем координаты порта относительно SVG
    const svgRect = svg.getBoundingClientRect();
    const cx = parseFloat(port.getAttribute('cx'));
    const cy = parseFloat(port.getAttribute('cy'));
    const transform = group.getAttribute('transform');
    const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    const blockX = match ? parseFloat(match[1]) : 0;
    const blockY = match ? parseFloat(match[2]) : 0;
    
    const startX = blockX + cx;
    const startY = blockY + cy;
    
    // Создаем временную линию
    const ns = "http://www.w3.org/2000/svg";
    tempLine = document.createElementNS(ns, "line");
    tempLine.setAttribute('x1', startX);
    tempLine.setAttribute('y1', startY);
    tempLine.setAttribute('x2', startX);
    tempLine.setAttribute('y2', startY);
    tempLine.setAttribute('stroke', '#3b82f6');
    tempLine.setAttribute('stroke-width', '2');
    tempLine.setAttribute('stroke-dasharray', '6,4');
    tempLine.setAttribute('fill', 'none');
    tempLine.setAttribute('pointer-events', 'none');
    
    // Добавляем линию в отдельный слой, если его нет
    let connectionsLayer = document.getElementById('connections-layer');
    if (!connectionsLayer) {
        connectionsLayer = document.createElementNS(ns, "g");
        connectionsLayer.setAttribute('id', 'connections-layer');
        svg.insertBefore(connectionsLayer, mainLayer);
    }
    connectionsLayer.appendChild(tempLine);
    
    // Показываем все порты на всех блоках
    showAllPorts();
    
    const onMouseMove = (moveEvent) => {
        const svgP = clientToSvg(moveEvent.clientX, moveEvent.clientY);

        tempLine.setAttribute('x2', svgP.x);
        tempLine.setAttribute('y2', svgP.y);

        highlightPortUnderCursor(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = (upEvent) => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        const svgP = clientToSvg(upEvent.clientX, upEvent.clientY);

        const targetPort = findPortAtPosition(upEvent.clientX, upEvent.clientY);

        if (targetPort) {
            const targetGroup = targetPort.closest('g[data-type]');
            const targetPortName = targetPort.getAttribute('data-port');
            if (targetGroup !== drawingFromGroup) {
                createConnection(drawingFromGroup, drawingFromPort, targetGroup, targetPortName, null, null);
            }
        } else {
            createConnection(drawingFromGroup, drawingFromPort, null, null, svgP.x, svgP.y);
            const blockId = group.getAttribute('data-id');
            if (roomId) socket.emit('block:unlock', { blockId });
        }

        if (tempLine) { tempLine.remove(); tempLine = null; }

        isDrawing = false;
        drawingFromGroup = null;
        drawingFromPort = null;

        resetAllPortsHighlight();
        hideAllPorts();
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function showAllPorts() {
    const allBlocks = mainLayer.querySelectorAll('g[data-type]');
    allBlocks.forEach(block => {
        const ports = block.querySelectorAll('.connection-port');
        ports.forEach(p => { p.style.display = 'block'; });
    });
}

function hideAllPorts() {
    const allBlocks = mainLayer.querySelectorAll('g[data-type]');
    allBlocks.forEach(block => {
        const ports = block.querySelectorAll('.connection-port');
        ports.forEach(p => { p.style.display = 'none'; });
    });
}

function highlightPortUnderCursor(clientX, clientY) {
    // Сначала сбрасываем все
    resetAllPortsHighlight();
    
    const port = findPortAtPosition(clientX, clientY);
    if (port) {
        port.setAttribute('fill', '#10b981');
        port.setAttribute('r', '7');
    }
}

function findPortAtPosition(clientX, clientY) {
    const allPorts = document.querySelectorAll('.connection-port');
    for (const port of allPorts) {
        if (port.style.display !== 'none') {
            const rect = port.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const distance = Math.sqrt((clientX - cx) ** 2 + (clientY - cy) ** 2);
            
            if (distance <= 10) {
                return port;
            }
        }
    }
    return null;
}

function resetAllPortsHighlight() {
    const allPorts = document.querySelectorAll('.connection-port');
    allPorts.forEach(port => {
        port.setAttribute('fill', '#3b82f6');
        port.setAttribute('r', '5');
    });
}


let connections = [];
let connectionCounter = 0;
let connectionsLayer = null;

function getConnectionsLayer() {
    if (!connectionsLayer) {
        const ns = "http://www.w3.org/2000/svg";
        connectionsLayer = document.getElementById('connections-layer');
        if (!connectionsLayer) {
            connectionsLayer = document.createElementNS(ns, "g");
            connectionsLayer.setAttribute('id', 'connections-layer');
            svg.insertBefore(connectionsLayer, mainLayer);
        }
    }
    return connectionsLayer;
}

function createConnection(fromGroup, fromPort, toGroup, toPort, freeEndX, freeEndY) {
    const ns = "http://www.w3.org/2000/svg";
    const layer = getConnectionsLayer();
    
    // Даем блокам ID, если их нет
    if (!fromGroup.getAttribute('data-id')) {
        fromGroup.setAttribute('data-id', 'block_' + Math.random().toString(36).substr(2, 9));
    }
    
    const fromBlockId = fromGroup.getAttribute('data-id');
    
    let toBlockId = null;
    if (toGroup) {
        if (!toGroup.getAttribute('data-id')) {
            toGroup.setAttribute('data-id', 'block_' + Math.random().toString(36).substr(2, 9));
        }
        toBlockId = toGroup.getAttribute('data-id');
    }
    
    const connection = {
        id: 'conn_' + (++connectionCounter),
        fromBlockId: fromBlockId,
        fromPort: fromPort,
        toBlockId: toBlockId,
        toPort: toPort,
        freeEndX: freeEndX,
        freeEndY: freeEndY
    };
    
    connections.push(connection);
    emitEvent('conn:create', { connection });
    drawConnection(connection);
    console.log('Создано соединение:', connection);
}

function selectConnection(group, path) {
    group.classList.add('selected-block');
    selectedBlocks.add(group);
    path.setAttribute('stroke', '#0066cc');
    path.setAttribute('stroke-width', '3');
}

function drawConnection(connection) {
    const ns = "http://www.w3.org/2000/svg";
    const layer = getConnectionsLayer();
    
    const fromGroup = mainLayer.querySelector(`[data-id="${connection.fromBlockId}"]`);
    if (!fromGroup) return;
    
    // Получаем начальную точку
    const fromPortCircle = fromGroup.querySelector(`[data-port="${connection.fromPort}"]`);
    const fromTransform = fromGroup.getAttribute('transform');
    const fromMatch = fromTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    const fromBlockX = fromMatch ? parseFloat(fromMatch[1]) : 0;
    const fromBlockY = fromMatch ? parseFloat(fromMatch[2]) : 0;
    const fromX = fromBlockX + parseFloat(fromPortCircle.getAttribute('cx'));
    const fromY = fromBlockY + parseFloat(fromPortCircle.getAttribute('cy'));
    
    let toX, toY, toPort = null;
    
    if (connection.toBlockId) {
        const toGroup = mainLayer.querySelector(`[data-id="${connection.toBlockId}"]`);
        if (!toGroup) return;
        const toPortCircle = toGroup.querySelector(`[data-port="${connection.toPort}"]`);
        const toTransform = toGroup.getAttribute('transform');
        const toMatch = toTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        const toBlockX = toMatch ? parseFloat(toMatch[1]) : 0;
        const toBlockY = toMatch ? parseFloat(toMatch[2]) : 0;
        toX = toBlockX + parseFloat(toPortCircle.getAttribute('cx'));
        toY = toBlockY + parseFloat(toPortCircle.getAttribute('cy'));
        toPort = connection.toPort;
    } else {
        toX = connection.freeEndX;
        toY = connection.freeEndY;
    }
    
    // Удаляем старую линию, если есть
    const existing = layer.querySelector(`[data-connection-id="${connection.id}"]`);
    if (existing) existing.remove();
    
    // Создаем группу для соединения
    const group = document.createElementNS(ns, "g");
    group.setAttribute('data-connection-id', connection.id);
    group.classList.add('connection-group');
    
    // Строим ортогональный путь
    const fromPort = connection.fromPort;
    const pathData = buildOrthogonalPath(fromX, fromY, toX, toY, fromPort, toPort);
    
    // Определяем, нужна ли стрелка (последний сегмент идет справа налево или снизу вверх)
    const needsArrow = checkNeedsArrow(fromX, fromY, toX, toY, fromPort, toPort);
    
    const path = document.createElementNS(ns, "path");
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#1a1a1a');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    
    // Добавляем стрелку только если нужно
    if (needsArrow) {
        const arrowId = 'arrow_' + connection.id;
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS(ns, "defs");
            svg.insertBefore(defs, svg.firstChild);
        }
        
        const oldMarker = defs.querySelector(`#${arrowId}`);
        if (oldMarker) oldMarker.remove();
        
        const marker = document.createElementNS(ns, "marker");
        marker.setAttribute('id', arrowId);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.innerHTML = '<polygon points="0 0, 10 3, 0 6" fill="#1a1a1a" />';
        defs.appendChild(marker);
        
        path.setAttribute('marker-end', 'url(#' + arrowId + ')');
    }
    
    group.appendChild(path);

    path.style.cursor = 'pointer';
    path.setAttribute('stroke-width', '2');

    path.addEventListener('click', function(e) {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            if (selectedBlocks.has(group)) {
                group.classList.remove('selected-block');
                selectedBlocks.delete(group);
                path.setAttribute('stroke', '#1a1a1a');
                path.setAttribute('stroke-width', '2');
            } else {
                selectConnection(group, path);
            }
        } else {
            clearSelection();
            selectConnection(group, path);
        }
    });

    layer.appendChild(group);
}


function buildOrthogonalPath(x1, y1, x2, y2, fromPort, toPort) {
    const offset = 30;
    
    // Точка выхода из порта
    let ex = x1, ey = y1;
    switch(fromPort) {
        case 'top':    ey = y1 - offset; break;
        case 'bottom': ey = y1 + offset; break;
        case 'left':   ex = x1 - offset; break;
        case 'right':  ex = x1 + offset; break;
    }
    
    // Точка входа в порт
    let ix = x2, iy = y2;
    if (toPort) {
        switch(toPort) {
            case 'top':    iy = y2 - offset; break;
            case 'bottom': iy = y2 + offset; break;
            case 'left':   ix = x2 - offset; break;
            case 'right':  ix = x2 + offset; break;
        }
    }
    
    let path = `M ${x1} ${y1} `;
    
    if (!toPort) {
        // Свободный конец
        if (fromPort === 'top' || fromPort === 'bottom') {
            // Выход вертикально, потом горизонтально до цели
            path += `L ${x1} ${ey} L ${x2} ${ey} L ${x2} ${y2}`;
        } else {
            // Выход горизонтально, потом вертикально до цели
            path += `L ${ex} ${y1} L ${ex} ${y2} L ${x2} ${y2}`;
        }
    } else {
        const fromVert = (fromPort === 'top' || fromPort === 'bottom');
        const toVert = (toPort === 'top' || toPort === 'bottom');
        
        if (fromVert && toVert) {
            const midY = (ey + iy) / 2;
            path += `L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${iy} `;
        } else if (!fromVert && !toVert) {
            const midX = (ex + ix) / 2;
            path += `L ${midX} ${y1} L ${midX} ${y2} L ${ix} ${y2} `;
        } else {
            path += `L ${ex} ${ey} L ${ix} ${iy} `;
        }
        
        path += `L ${x2} ${y2}`;
    }
    
    return path;
}

function checkNeedsArrow(x1, y1, x2, y2, fromPort, toPort) {
    // Простая проверка: стрелка нужна если конечная точка левее или выше начальной
    return (x2 < x1) || (y2 < y1);
}

function updateAllConnections() {
    connections.forEach(conn => drawConnection(conn))
}

const style = document.createElement('style');
style.textContent = `
    .connection-group.selected-block path {
        stroke: #0066cc !important;
        stroke-width: 3 !important;
    }
    .connection-group:hover path {
        stroke: #3b82f6;
    }

    /* Заблокированный блок — визуальная индикация */
    .block-locked {
        cursor: not-allowed !important;
    }
    .block-locked * {
        cursor: not-allowed !important;
    }
    .block-lock-overlay {
        pointer-events: none;
    }
`;
document.head.appendChild(style);

//#endregion

//#region Панорамирование холста (ЛКМ на пустом месте)

(function initPan() {
    const canvasArea = document.querySelector('.canvas-area');
    if (!canvasArea) return;

    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let scrollStartX = 0;
    let scrollStartY = 0;

    // mousedown на SVG — начинаем пан только если кликнули по пустому месту
    svg.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        // Пропускаем клики по блокам, соединениям, хэндлам и портам
        if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') {
        document.activeElement.blur();}
        if (e.target.closest('g[data-type]')) return;
        if (e.target.closest('.connection-group')) return;
        if (e.target.classList.contains('resize-handle')) return;
        if (e.target.classList.contains('connection-port')) return;

        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        scrollStartX = canvasArea.scrollLeft;
        scrollStartY = canvasArea.scrollTop;

        svg.style.cursor = 'grabbing';
        // Предотвращаем выделение текста при перетаскивании
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        const dx = e.clientX - panStartX;
        const dy = e.clientY - panStartY;
        canvasArea.scrollLeft = scrollStartX - dx;
        canvasArea.scrollTop  = scrollStartY - dy;
    });

    document.addEventListener('mouseup', () => {
        if (!isPanning) return;
        isPanning = false;
        svg.style.cursor = '';
    });

    // Сбрасываем пан если окно теряет фокус (например Alt+Tab)
    window.addEventListener('blur', () => {
        isPanning = false;
        svg.style.cursor = '';
    });
})();

//#endregion

//#region Сокет — совместное редактирование

const socket = io();
const urlParamsSocket = new URLSearchParams(window.location.search);
const roomId = urlParamsSocket.get('room') || null;

// Блокировки: blockId -> { userId, username, color }
const lockedBlocks = new Map();

function isBlockLocked(blockId) {
    const lock = lockedBlocks.get(blockId);
    return lock && lock.userId !== myUserId;
}

function applyLockVisual(blockId, lockerUsername, lockerColor) {
    const block = mainLayer.querySelector(`[data-id="${blockId}"]`);
    if (!block) return;

    block.classList.add('block-locked');

    // Убираем старый оверлей
    const old = block.querySelector('.block-lock-overlay');
    if (old) old.remove();

    const ns = "http://www.w3.org/2000/svg";
    const shape = block.querySelector('rect, polygon, ellipse');
    if (!shape) return;
    const bbox = shape.getBBox();

    const overlay = document.createElementNS(ns, "g");
    overlay.classList.add('block-lock-overlay');
    // Сохраняем данные локера на оверлее для переотрисовки
    overlay.dataset.lockerUsername = lockerUsername;
    overlay.dataset.lockerColor = lockerColor;

    const border = document.createElementNS(ns, "rect");
    border.setAttribute('x', bbox.x - 3);
    border.setAttribute('y', bbox.y - 3);
    border.setAttribute('width', bbox.width + 6);
    border.setAttribute('height', bbox.height + 6);
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', lockerColor);
    border.setAttribute('stroke-width', '2');
    border.setAttribute('stroke-dasharray', '5,3');
    border.setAttribute('rx', '3');
    border.setAttribute('opacity', '0.85');
    border.innerHTML = `<animate attributeName="stroke-dashoffset" from="0" to="16" dur="4s" repeatCount="indefinite"/>`;

    const badgePad = 4;
    const badgeH = 16;
    const estimatedW = lockerUsername.length * 6.5 + badgePad * 2 + 16;

    const badgeG = document.createElementNS(ns, "g");
    const badgeBg = document.createElementNS(ns, "rect");
    badgeBg.setAttribute('x', bbox.x - 3);
    badgeBg.setAttribute('y', bbox.y - 3 - badgeH - 2);
    badgeBg.setAttribute('width', estimatedW);
    badgeBg.setAttribute('height', badgeH);
    badgeBg.setAttribute('fill', lockerColor);
    badgeBg.setAttribute('rx', '3');

    const badgeTxt = document.createElementNS(ns, "text");
    badgeTxt.setAttribute('x', bbox.x - 3 + badgePad);
    badgeTxt.setAttribute('y', bbox.y - 3 - badgeH - 2 + badgeH - 4);
    badgeTxt.setAttribute('font-size', '9');
    badgeTxt.setAttribute('fill', '#fff');
    badgeTxt.setAttribute('font-weight', '600');
    badgeTxt.setAttribute('font-family', "'Inter', sans-serif");
    badgeTxt.textContent = lockerUsername;

    badgeG.appendChild(badgeBg);
    badgeG.appendChild(badgeTxt);
    overlay.appendChild(border);
    overlay.appendChild(badgeG);
    block.appendChild(overlay);
}

// Новая функция — обновить рамку у уже залоченного блока (после ресайза)
function refreshLockVisual(blockId) {
    const lock = lockedBlocks.get(blockId);
    if (!lock) return;
    applyLockVisual(blockId, lock.username, lock.color);
}

function removeLockVisual(blockId) {
    const block = mainLayer.querySelector(`[data-id="${blockId}"]`);
    if (!block) return;
    block.classList.remove('block-locked');
    const overlay = block.querySelector('.block-lock-overlay');
    if (overlay) overlay.remove();
}

let isApplyingRemote = false;
let myRole = 'viewer'; // будет обновлено при подключении
let ownerId = null;
const myUserId = localStorage.getItem('userid');
const myUsername = localStorage.getItem('username') || 'Гость';

function emitEvent(type, payload) {
    if (isApplyingRemote) return;
    if (!roomId) return;
    if (myRole !== 'editor' && myRole !== 'owner') return; // только редакторы
    socket.emit('editor:event', { type, payload });
}

function clientToSvg(clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}


if (roomId) {
    let cursorThrottle = 0;
    svg.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - cursorThrottle < 30) return;
        cursorThrottle = now;

        const svgP = clientToSvg(e.clientX, e.clientY);
        socket.emit('cursor:move', { x: svgP.x, y: svgP.y });
    });
}
function canEdit() {
    if (!roomId) return true; // не в сессии — можно всё
    return myRole === 'editor' || myRole === 'owner';
}



function initHotbar() {
    const hotbar = document.getElementById('hotbar');
    hotbar.style.display = 'flex';

    document.getElementById('hotbarSessionId').textContent = roomId;

    document.getElementById('hotbarCopyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(roomId);
        const btn = document.getElementById('hotbarCopyBtn');
        btn.textContent = 'Скопировано!';
        setTimeout(() => btn.textContent = 'Скопировать', 1500);
    });
}

function renderUsers(users) {
    const container = document.getElementById('hotbarUsers');
    container.innerHTML = '';

    users.forEach(user => {
        const isMe = user.userId === myUserId;
        const isOwnerMe = myUserId === ownerId;

        const card = document.createElement('div');
        card.className = 'hotbar-user';
        card.id = 'hotbar-user-' + user.userId;

        const dot = document.createElement('div');
        dot.className = `hotbar-user-dot ${user.role}`;

        const name = document.createElement('span');
        name.className = 'hotbar-user-name';
        name.textContent = user.username + (isMe ? ' (вы)' : '');

        card.appendChild(dot);
        card.appendChild(name);

        // Если я владелец и это не я — показываю селект роли
        if (isOwnerMe && user.role !== 'owner') {
            const select = document.createElement('select');
            select.className = 'hotbar-role-select';
            select.innerHTML = `
                <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>Читатель</option>
                <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>Редактор</option>
            `;
            select.addEventListener('change', () => {
                socket.emit('room:set_role', {
                    targetUserId: user.userId,
                    role: select.value
                });
            });
            card.appendChild(select);
        } else if (user.role !== 'owner') {
            // Просто бейдж роли
            const badge = document.createElement('span');
            badge.className = `hotbar-role-badge ${user.role}`;
            badge.textContent = user.role === 'editor' ? 'Редактор' : 'Читатель';
            badge.id = `role-badge-${user.userId}`;
            card.appendChild(badge);
        }

        container.appendChild(card);
    });
}

function updateUserRole(userId, role) {
    // Обновляем точку
    const card = document.getElementById('hotbar-user-' + userId);
    if (!card) return;
    const dot = card.querySelector('.hotbar-user-dot');
    if (dot) dot.className = `hotbar-user-dot ${role}`;

    // Обновляем бейдж (для не-владельца)
    const badge = document.getElementById(`role-badge-${userId}`);
    if (badge) {
        badge.className = `hotbar-role-badge ${role}`;
        badge.textContent = role === 'editor' ? 'Редактор' : 'Читатель';
    }

    // Если это я — обновляем myRole
    if (userId === myUserId) {
        // БАГ 1 FIX: если я стал viewer/reader — отпускаем все блоки которые держим
        if (role === 'viewer') {
            lockedBlocks.forEach((lock, blockId) => {
                if (lock.userId === myUserId) {
                    socket.emit('block:unlock', { blockId });
                }
            });
        }
        myRole = role;
        updateEditingUI();
    }
}

function updateEditingUI() {
    // Блокируем/разблокируем сайдбар если нет прав
    const sidebar = document.querySelector('.element-list');
    if (!canEdit()) {
        sidebar.style.opacity = '0.4';
        sidebar.style.pointerEvents = 'none';
    } else {
        sidebar.style.opacity = '1';
        sidebar.style.pointerEvents = 'auto';
    }
}

// --- Подключение ---

if (roomId) {
    socket.on('connect', () => {
        const isCreating = urlParamsSocket.get('creating') === '1';

        if (!isCreating) {
            // Гость: проверяем, существует ли комната
            socket.emit('room:check', { roomId }, ({ exists }) => {
                if (!exists) {
                    showRoomNotFound();
                    return;
                }
                joinRoom();
            });
        } else {
            joinRoom();
        }
    });

    // Автоматический re-join при переподключении (например, после кратковременного обрыва)
    socket.on('reconnect', () => {
        console.log('Socket reconnected, re-joining room...');
        joinRoom();
    });

    function joinRoom() {
        const isCreating = urlParamsSocket.get('creating') === '1';
        socket.emit('room:join', {
            roomId,
            userId: myUserId,
            username: myUsername,
            isCreating
        });
        initHotbar();
    }

    socket.on('room:not_found', () => {
        showRoomNotFound();
    });

    // Владелец вышел — показываем сообщение и уходим в меню
    socket.on('room:owner_left', () => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
            display:flex;align-items:center;justify-content:center;z-index:9999;
        `;
        overlay.innerHTML = `
            <div style="background:#fff;padding:36px 32px;max-width:320px;width:100%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.15);">
                <div style="font-size:32px;margin-bottom:12px;">👋</div>
                <h3 style="margin:0 0 10px;font-size:17px;letter-spacing:1px;text-transform:uppercase;">Сессия завершена</h3>
                <div style="border:1px solid #333;padding:10px 12px;margin-bottom:20px;font-size:13px;text-align:left;color:#555;line-height:1.5;">
                    Владелец схемы покинул сессию. Совместное редактирование завершено.
                </div>
                <button onclick="window.location.href='/MainMenu.html'" style="width:100%;padding:11px;background:transparent;border:1px solid #333;font-size:14px;letter-spacing:1px;cursor:pointer;transition:0.2s;" onmouseover="this.style.background='#333';this.style.color='#fff'" onmouseout="this.style.background='transparent';this.style.color='#333'">← Вернуться в меню</button>
            </div>
        \\`;
        document.body.appendChild(overlay);
    });

    function showRoomNotFound() {
        // Показываем красивое сообщение и редиректим
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
            display:flex;align-items:center;justify-content:center;z-index:9999;
        `;
        overlay.innerHTML = `
            <div style="background:#fff;padding:36px 32px;max-width:320px;width:100%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.15);">
                <div style="font-size:32px;margin-bottom:12px;">🔍</div>
                <h3 style="margin:0 0 10px;font-size:17px;letter-spacing:1px;text-transform:uppercase;">Комната не найдена</h3>
                <div style="border:1px solid #333;padding:10px 12px;margin-bottom:20px;font-size:13px;text-align:left;color:#555;line-height:1.5;">
                    Сессия с кодом <strong>${roomId}</strong> не существует.<br>Проверьте код или создайте новую схему.
                </div>
                <button onclick="window.location.href='/MainMenu.html'" style="width:100%;padding:11px;background:transparent;border:1px solid #333;font-size:14px;letter-spacing:1px;cursor:pointer;transition:0.2s;" onmouseover="this.style.background='#333';this.style.color='#fff'" onmouseout="this.style.background='transparent';this.style.color='#333'">← Вернуться в меню</button>
            </div>
        \\`;
        document.body.appendChild(overlay);
    }

    // Получаем полный список при входе
    socket.on('room:init', ({ ownerId: ownerIdFromServer, users }) => {
        ownerId = ownerIdFromServer;
        const me = users.find(u => u.userId === myUserId);
        if (me) myRole = me.role;
        renderUsers(users);
        updateEditingUI();
    });

    // Кто-то вошёл
    socket.on('room:user_joined', ({ userId, username, role }) => {
        const container = document.getElementById('hotbarUsers');
        // Перерисовываем — проще всего запросить актуальный список
        // Но у нас нет эндпоинта, поэтому добавляем вручную
        const existing = document.getElementById('hotbar-user-' + userId);
        if (!existing) {
            renderUsers([...getCurrentUsers(), { userId, username, role }]);
        }
    });

    // Запрос снапшота — только владелец отвечает
    socket.on('room:request_snapshot', ({ requesterId }) => {
        if (myRole !== 'owner') return;
        const snapshot = getSvgContent();
        socket.emit('room:send_snapshot', { requesterId, snapshot });
    });

    // Получаем снапшот холста от владельца
    socket.on('room:snapshot', ({ snapshot }) => {
        if (!snapshot) return;
        // Очищаем текущий холст и восстанавливаем состояние
        restoreFromContent(snapshot);
    });

    // Кто-то вышел
    socket.on('room:user_left', ({ userId }) => {
        const card = document.getElementById('hotbar-user-' + userId);
        if (card) card.remove();
        // Убираем курсор ушедшего
        removeCursor(userId);
    });

    // Роль изменена
    socket.on('room:role_changed', ({ userId, role }) => {
        updateUserRole(userId, role);
    });

    // Событие редактирования
    socket.on('editor:event', (event) => {
        isApplyingRemote = true;
        applyRemoteEvent(event);
        isApplyingRemote = false;
    });

    // --- Курсоры участников ---
    socket.on('cursor:move', ({ userId, username, x, y }) => {
        renderCursor(userId, username, x, y);
    });

    // --- Live перемещение блока ---
    socket.on('block:live_move', ({ blockId, x, y }) => {
        const block = mainLayer.querySelector(`[data-id="${blockId}"]`);
        if (block) {
            block.setAttribute('transform', `translate(${x}, ${y})`);
            updateAllConnections();
        }
    });

    // --- Live ресайз блока ---
    socket.on('block:live_resize', (payload) => {
        isApplyingRemote = true;
        applyRemoteEvent({ type: 'block:resize', payload });
        isApplyingRemote = false;
        // Обновляем рамку лока после ресайза
        refreshLockVisual(payload.blockId);
    });

    // --- Блокировки блоков ---
    socket.on('block:locked', ({ blockId, userId, username }) => {
        const color = getUserColor(userId);
        lockedBlocks.set(blockId, { userId, username, color });
        if (userId !== myUserId) {
            applyLockVisual(blockId, username, color);
        }
    });

    socket.on('block:unlocked', ({ blockId }) => {
        lockedBlocks.delete(blockId);
        removeLockVisual(blockId);
    });
}

// Вспомогательная — собрать текущих юзеров из DOM
function getCurrentUsers() {
    const cards = document.querySelectorAll('.hotbar-user');
    return Array.from(cards).map(card => ({
        userId: card.id.replace('hotbar-user-', ''),
        username: card.querySelector('.hotbar-user-name').textContent.replace(' (вы)', ''),
        role: card.querySelector('.hotbar-user-dot').classList[1]
    }));
}

// Кнопка запуска сессии
window.addEventListener('load', () => {
    const startBtn = document.getElementById('startSessionBtn');
    if (!startBtn) return;

    if (roomId) {
        startBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span>ID: ${roomId}</span>
        `;
        startBtn.style.color = '#10b981';
        startBtn.style.borderColor = '#10b981';
        startBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(roomId);
            startBtn.querySelector('span').textContent = 'Скопировано!';
            setTimeout(() => startBtn.querySelector('span').textContent = `ID: ${roomId}`, 1500);
        });
        return;
    }

    startBtn.addEventListener('click', () => {
        const newRoomId = Math.random().toString(36).substr(2, 8).toUpperCase();
        const flowchartId = currentFlowchartId ? `&id=${currentFlowchartId}` : '';
        window.location.href = `editor.html?room=${newRoomId}&creating=1${flowchartId}`;
    });
});

// --- Система курсоров участников ---

const CURSOR_COLORS = [
    '#6366f1', // индиго
    '#10b981', // зелёный
    '#f59e0b', // жёлтый
    '#ef4444', // красный
    '#8b5cf6', // фиолетовый
    '#06b6d4', // голубой
    '#f97316', // оранжевый
];
const userColorMap = new Map(); // userId -> color
let colorIndex = 0;

function getUserColor(userId) {
    if (!userColorMap.has(userId)) {
        userColorMap.set(userId, CURSOR_COLORS[colorIndex % CURSOR_COLORS.length]);
        colorIndex++;
    }
    return userColorMap.get(userId);
}

// Курсоры рисуем прямо в SVG чтобы они двигались вместе с холстом
let cursorsLayer = null;
function getCursorsLayer() {
    if (!cursorsLayer) {
        const ns = "http://www.w3.org/2000/svg";
        cursorsLayer = document.createElementNS(ns, "g");
        cursorsLayer.setAttribute('id', 'cursors-layer');
        svg.appendChild(cursorsLayer); // поверх всего
    }
    return cursorsLayer;
}

function renderCursor(userId, username, x, y) {
    const layer = getCursorsLayer();
    const color = getUserColor(userId);
    const existingId = 'cursor-' + userId;
    let group = layer.querySelector('#' + existingId);

    if (!group) {
        // Создаём курсор
        const ns = "http://www.w3.org/2000/svg";
        group = document.createElementNS(ns, "g");
        group.setAttribute('id', existingId);
        group.style.pointerEvents = 'none';
        group.style.transition = 'transform 0.06s linear'; // плавность

        // SVG-стрелка курсора
        const arrow = document.createElementNS(ns, "path");
        arrow.setAttribute('d', 'M 0 0 L 0 14 L 3.5 10.5 L 6 16 L 8 15 L 5.5 9.5 L 10 9.5 Z');
        arrow.setAttribute('fill', color);
        arrow.setAttribute('stroke', '#fff');
        arrow.setAttribute('stroke-width', '1.2');
        arrow.setAttribute('stroke-linejoin', 'round');

        // Бейдж с именем
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute('x', '12');
        rect.setAttribute('y', '-4');
        rect.setAttribute('rx', '3');
        rect.setAttribute('height', '18');
        rect.setAttribute('fill', color);

        const text = document.createElementNS(ns, "text");
        text.setAttribute('x', '16');
        text.setAttribute('y', '9');
        text.setAttribute('font-size', '10');
        text.setAttribute('font-family', "'Inter', sans-serif");
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-weight', '600');
        text.textContent = username;

        group.appendChild(arrow);
        group.appendChild(rect);
        group.appendChild(text);
        layer.appendChild(group);

        // Подгоняем ширину rect под текст после рендера
        // Используем двойной requestAnimationFrame для гарантии рендера
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                try {
                    const bbox = text.getBBox();
                    const textWidth = bbox.width;
                    rect.setAttribute('width', textWidth + 8);
                } catch(e) {
                    // Fallback если getBBox не сработал
                    rect.setAttribute('width', username.length * 6.5 + 8);
                }
            });
        });
    }

    group.setAttribute('transform', `translate(${x}, ${y})`);

    // Сбрасываем таймер исчезновения
    clearTimeout(group._hideTimer);
    group.style.opacity = '1';
    group._hideTimer = setTimeout(() => {
        group.style.transition = 'opacity 0.5s ease';
        group.style.opacity = '0';
    }, 3000); // исчезает через 3с без движения
}

function removeCursor(userId) {
    const layer = getCursorsLayer();
    const el = layer.querySelector('#cursor-' + userId);
    if (el) el.remove();
}

// Применяем чужое событие
function applyRemoteEvent({ type, payload }) {
    switch (type) {
        case 'block:create':
            createNode(payload.blockType, payload.x, payload.y, payload.blockId);
            break;

        case 'block:move': {
            const block = mainLayer.querySelector(`[data-id="${payload.blockId}"]`);
            if (block) block.setAttribute('transform', `translate(${payload.x}, ${payload.y})`);
            updateAllConnections();
            break;
        }

        case 'block:resize': {
            const block = mainLayer.querySelector(`[data-id="${payload.blockId}"]`);
            if (!block) break;
            const shape = block.querySelector('rect, polygon, ellipse');
            if (!shape) break;
            const type = block.getAttribute('data-type');
            if (type === 'decision' || type === 'data') {
                shape.setAttribute('points', payload.points);
            } else if (type === 'connector') {
                shape.setAttribute('rx', payload.rx); shape.setAttribute('ry', payload.ry);
                shape.setAttribute('cx', payload.cx); shape.setAttribute('cy', payload.cy);
            } else {
                shape.setAttribute('x', payload.x); shape.setAttribute('y', payload.y);
                shape.setAttribute('width', payload.width); shape.setAttribute('height', payload.height);
                if (type === 'terminal') shape.setAttribute('rx', payload.rx);
                if (type === 'predefined') {
                    const lines = block.querySelectorAll('line');
                    if (lines.length === 2) {
                        const nx = parseFloat(payload.x), nw = parseFloat(payload.width), ny = parseFloat(payload.y), nh = parseFloat(payload.height);
                        lines[0].setAttribute('x1', nx + nw * 0.1); lines[0].setAttribute('x2', nx + nw * 0.1);
                        lines[0].setAttribute('y1', ny); lines[0].setAttribute('y2', ny + nh);
                        lines[1].setAttribute('x1', nx + nw * 0.9); lines[1].setAttribute('x2', nx + nw * 0.9);
                        lines[1].setAttribute('y1', ny); lines[1].setAttribute('y2', ny + nh);
                    }
                }
            }
            // Центрируем текст через bbox самой фигуры (работает для всех типов)
            const text = block.querySelector('text');
            if (text) {
                try {
                    const bbox = shape.getBBox();
                    const cx = bbox.x + bbox.width / 2;
                    const cy = bbox.y + bbox.height / 2;
                    text.setAttribute('x', cx);
                    text.setAttribute('y', cy + 5);
                    // Обновляем x у tspan'ов если есть многострочный текст
                    text.querySelectorAll('tspan').forEach(ts => ts.setAttribute('x', cx));
                } catch(e) {
                    // Fallback если getBBox недоступен
                    if (payload.x != null && payload.width != null) {
                        const cx = parseFloat(payload.x) + parseFloat(payload.width) / 2;
                        const cy = parseFloat(payload.y) + parseFloat(payload.height) / 2;
                        text.setAttribute('x', cx);
                        text.setAttribute('y', cy + 5);
                        text.querySelectorAll('tspan').forEach(ts => ts.setAttribute('x', cx));
                    }
                }
            }
            updateHandlesPosition(block, payload.hx, payload.hy, payload.hw, payload.hh);
            updatePortsPosition(block);
            updateAllConnections();
            refreshLockVisual(payload.blockId);
            break;
        }

        case 'block:text': {
            const block = mainLayer.querySelector(`[data-id="${payload.blockId}"]`);
            if (block) {
                const textEl = block.querySelector('text');
                if (textEl) {
                    setMultilineText(textEl, payload.text);
                }
            }
            break;
        }

        case 'block:delete':
            payload.blockIds.forEach(id => {
                const block = mainLayer.querySelector(`[data-id="${id}"]`);
                if (block) block.remove();
                removeConnectionsForBlock(id);
            });
            break;

        case 'conn:create':
            connections.push(payload.connection);
            drawConnection(payload.connection);
            break;

        case 'conn:delete': {
            const connEl = document.querySelector('[data-connection-id="' + payload.connId + '"]');
            if (connEl) connEl.remove();
            connections = connections.filter(function(c) { return c.id !== payload.connId; });
            break;
        }

        case 'note:create':
        case 'note:update': {
            var existing = textNotes.find(function(n) { return n.id === payload.note.id; });
            if (existing) {
                existing.text = payload.note.text;
                existing.x = payload.note.x;
                existing.y = payload.note.y;
                renderTextNote(existing);
            } else {
                textNotes.push(payload.note);
                renderTextNote(payload.note);
            }
            break;
        }

        case 'note:move_live': {
            var noteEl = document.querySelector('[data-note-id="' + payload.noteId + '"]');
            if (noteEl) noteEl.setAttribute('transform', 'translate(' + payload.x + ',' + payload.y + ')');
            var n = textNotes.find(function(n) { return n.id === payload.noteId; });
            if (n) { n.x = payload.x; n.y = payload.y; }
            break;
        }

        case 'note:delete': {
            var noteElD = document.querySelector('[data-note-id="' + payload.noteId + '"]');
            if (noteElD) noteElD.remove();
            textNotes = textNotes.filter(function(n) { return n.id !== payload.noteId; });
            break;
        }
    }
}

//#endregion


//#region Текстовые заметки (двойной клик на пустом месте холста)

var textNotes = []; // { id, x, y, text }
var textNoteCounter = 0;
var notesLayer = null;

function getNotesLayer() {
    if (!notesLayer) {
        var ns = "http://www.w3.org/2000/svg";
        notesLayer = document.getElementById('notes-layer');
        if (!notesLayer) {
            notesLayer = document.createElementNS(ns, "g");
            notesLayer.setAttribute('id', 'notes-layer');
            svg.appendChild(notesLayer);
        }
    }
    return notesLayer;
}

// Двойной клик на пустом месте SVG
svg.addEventListener('dblclick', function(e) {
    if (!canEdit()) return;
    // Если кликнули по блоку, соединению или заметке — не создаём новую
    if (e.target.closest('g[data-type]')) return;
    if (e.target.closest('.connection-group')) return;
    if (e.target.closest('.text-note-group')) return;

    var svgP = clientToSvg(e.clientX, e.clientY);
    openNoteInput(svgP.x, svgP.y, null);
});

function openNoteInput(svgX, svgY, existingNote) {
    // Переводим SVG координаты в экранные
    var pt = svg.createSVGPoint();
    pt.x = svgX;
    pt.y = svgY;
    var screen = pt.matrixTransform(svg.getScreenCTM());

    var input = document.createElement('textarea');
    input.value = existingNote ? existingNote.text : '';
    input.placeholder = 'Введите текст...';
    input.rows = 3;
    input.style.position = 'fixed';
    input.style.left = (screen.x) + 'px';
    input.style.top = (screen.y) + 'px';
    input.style.minWidth = '120px';
    input.style.minHeight = '60px';
    input.style.padding = '6px 8px';
    input.style.fontSize = '12px';
    input.style.fontFamily = 'Inter, sans-serif';
    input.style.border = '1.5px solid #3b82f6';
    input.style.borderRadius = '4px';
    input.style.outline = 'none';
    input.style.background = '#fffde7';
    input.style.zIndex = '9999';
    input.style.resize = 'both';
    input.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    input.style.lineHeight = '1.4';
    document.body.appendChild(input);
    input.focus();

    var saved = false;
    var save = function() {
        if (saved) return;
        saved = true;
        var text = input.value.trim();
        if (input.parentNode) input.parentNode.removeChild(input);
        if (!text) {
            // Если редактировали существующую и очистили — удаляем
            if (existingNote) {
                deleteTextNote(existingNote.id);
            }
            return;
        }
        if (existingNote) {
            existingNote.text = text;
            renderTextNote(existingNote);
            emitEvent('note:update', { note: existingNote });
        } else {
            var note = { id: 'note_' + (++textNoteCounter), x: svgX, y: svgY, text: text };
            textNotes.push(note);
            renderTextNote(note);
            emitEvent('note:create', { note: note });
        }
        saveFlowchart();
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', function(e) {
        // Ctrl+Enter или просто Escape — сохраняем
        if ((e.key === 'Enter' && e.ctrlKey) || e.key === 'Escape') {
            e.preventDefault();
            save();
        }
    });
}

function renderTextNote(note) {
    var ns = "http://www.w3.org/2000/svg";
    var layer = getNotesLayer();

    // Убираем старый рендер этой заметки
    var old = layer.querySelector('[data-note-id="' + note.id + '"]');
    if (old) old.remove();

    var g = document.createElementNS(ns, "g");
    g.setAttribute('data-note-id', note.id);
    g.setAttribute('transform', 'translate(' + note.x + ',' + note.y + ')');
    g.classList.add('text-note-group');
    g.style.cursor = 'move';

    // Текст
    var textEl = document.createElementNS(ns, "text");
    textEl.setAttribute('font-size', '12');
    textEl.setAttribute('font-family', 'Inter, sans-serif');
    textEl.setAttribute('fill', '#333');

    var lines = note.text.split('\n');
    var lineH = 16;
    var pad = 8;
    var maxW = 0;

    lines.forEach(function(line, i) {
        var tspan = document.createElementNS(ns, "tspan");
        tspan.setAttribute('x', pad);
        tspan.setAttribute('y', pad + lineH + i * lineH);
        tspan.textContent = line || ' ';
        // Примерная ширина
        var w = line.length * 6.5 + pad * 2;
        if (w > maxW) maxW = w;
        textEl.appendChild(tspan);
    });

    g.appendChild(textEl);
    layer.appendChild(g);

    // Двойной клик — редактировать
    g.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        if (!canEdit()) return;
        openNoteInput(note.x, note.y, note);
    });

    // Delete при выделении
    g.addEventListener('click', function(e) {
        e.stopPropagation();
        // Снимаем другие выделения
        layer.querySelectorAll('.text-note-group text').forEach(function(t) {
            t.setAttribute('fill', '#333');
        });
        textEl.setAttribute('fill', '#3b82f6');
        selectedNoteId = note.id;
    });

    // Перетаскивание
    makeNoteDraggable(g, note);
}

var selectedNoteId = null;

// Delete удаляет выделенную заметку
document.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' && selectedNoteId && selectedBlocks.size === 0) {
        deleteTextNote(selectedNoteId);
        selectedNoteId = null;
    }
});

function deleteTextNote(noteId) {
    var layer = getNotesLayer();
    var el = layer.querySelector('[data-note-id="' + noteId + '"]');
    if (el) el.remove();
    textNotes = textNotes.filter(function(n) { return n.id !== noteId; });
    emitEvent('note:delete', { noteId: noteId });
    saveFlowchart();
}

function makeNoteDraggable(g, note) {
    var isDragging = false;
    var startX, startY, origX, origY;

    g.addEventListener('mousedown', function(e) {
        if (e.target.closest && e.target.closest('.text-note-group') !== g) return;
        if (!canEdit()) return;
        e.stopPropagation();
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origX = note.x;
        origY = note.y;

        var onMove = function(me) {
            if (!isDragging) return;
            var dx = me.clientX - startX;
            var dy = me.clientY - startY;
            // Переводим экранное смещение в SVG-координаты
            var pt1 = svg.createSVGPoint(); pt1.x = 0; pt1.y = 0;
            var pt2 = svg.createSVGPoint(); pt2.x = dx; pt2.y = dy;
            var m = svg.getScreenCTM().inverse();
            var s1 = pt1.matrixTransform(m);
            var s2 = pt2.matrixTransform(m);
            var svgDx = s2.x - s1.x;
            var svgDy = s2.y - s1.y;
            note.x = origX + svgDx;
            note.y = origY + svgDy;
            g.setAttribute('transform', 'translate(' + note.x + ',' + note.y + ')');
            // Live трансляция
            if (roomId) {
                emitEvent('note:move_live', { noteId: note.id, x: note.x, y: note.y });
            }
        };

        var onUp = function() {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            emitEvent('note:update', { note: note });
            saveFlowchart();
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
}

// Снять выделение с заметки при клике на пустое место
svg.addEventListener('click', function(e) {
    if (!e.target('.text-note-group')) {
        var layer = getNotesLayer();
        if (layer) {
            layer.querySelectorAll('.text-note-group text').forEach(function(t) {
                t.setAttribute('fill', '#333');
            });
        }
        selectedNoteId = null;
    }
});

//#endregion