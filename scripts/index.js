// Función para calcular el tiempo exacto juntos
function calculateTimeTogether() {
    const startDate = new Date('2023-01-27T00:00:00'); // 27 de enero de 2023
    const now = new Date();
    
    // Calcular diferencia en milisegundos
    const diffMs = now - startDate;
    
    // Convertir a días, horas, minutos y segundos
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
}
// Función para actualizar el tiempo juntos
function updateTimeTogether() {
    const timeTogether = calculateTimeTogether();
    
    const timeString = `${timeTogether.days} días, ${timeTogether.hours}h ${timeTogether.minutes}m ${timeTogether.seconds}s`;
    
    document.getElementById('time-together').textContent = timeString;
}
// Función para actualizar la fecha actual
function updateCurrentDate() {
    const now = new Date();
    const dateString = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('current-date').textContent = dateString;
}
function updateLoveCounter() {
    const startDate = new Date('2023-01-27T00:00:00'); // 27 de enero de 2023
    const now = new Date();
    const secondsTogether = Math.floor((now - startDate) / 1000);
    
    const formattedSeconds = secondsTogether.toLocaleString('es-ES');
    document.getElementById('love-counter').textContent = formattedSeconds;
}
function updateAll() {
    updateTimeTogether();
    updateCurrentDate();
    updateLoveCounter();
}
// Detección de colisiones mejorada
function isColliding(rect1, rect2, buffer = 20) {
    return !(rect1.right + buffer < rect2.left || 
            rect1.left - buffer > rect2.right || 
            rect1.bottom + buffer < rect2.top || 
            rect1.top - buffer > rect2.bottom);
}
function getObstacles() {
    const obstacles = [];
    const container = document.querySelector('.container');
    
    if (container) {
        const containerRect = container.getBoundingClientRect();
        obstacles.push(containerRect);
    }
    
    return obstacles;
}
function createLoveBubble(creature) {
    const messages = [
        "Charles te ama ♥",
        "Te amo María Claudia",
        "Eres mi vida ♥",
        "Mi amor eterno",
        "Siempre juntos ♥",
        "Eres mi todo",
        "Te adoro ♥",
        "Mi princesa ♥",
        "Para siempre tuyo",
        "Eres perfecta ♥"
    ];
    
    const bubble = document.createElement('div');
    bubble.className = 'love-bubble';
    bubble.textContent = messages[Math.floor(Math.random() * messages.length)];
    
    // Posicionar exactamente encima de la criatura
    const creatureRect = creature.getBoundingClientRect();
    const x = creatureRect.left + (creatureRect.width / 2);
    const y = creatureRect.top;
    
    bubble.style.left = (x - 70) + 'px'; // Centrar el mensaje (140px/2 = 70px)
    bubble.style.top = (y - 80) + 'px'; // Posicionar encima con espacio
    
    document.body.appendChild(bubble);
    
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
    }, 4000);
}
function initializeCreature() {
    const creature = document.getElementById('creature');
    let isMoving = false;
    let currentX = 0;
    let currentY = 0;
    
    // Mejorado: Función para obtener posición válida con mejor control de bordes
    function getValidPosition() {
        const maxAttempts = 100;
        let attempts = 0;
        
        // Definir márgenes más grandes para evitar bordes
        const EDGE_MARGIN = 80; // Margen desde los bordes (aumentado de 60 a 80)
        const CREATURE_SIZE = 50;
        
        const minX = EDGE_MARGIN;
        const maxX = window.innerWidth - EDGE_MARGIN - CREATURE_SIZE;
        const minY = EDGE_MARGIN;
        const maxY = window.innerHeight - EDGE_MARGIN - CREATURE_SIZE;
        
        while (attempts < maxAttempts) {
            // Generar posición aleatoria dentro del área segura
            const x = minX + Math.random() * (maxX - minX);
            const y = minY + Math.random() * (maxY - minY);
            
            const creatureRect = {
                left: x,
                top: y,
                right: x + CREATURE_SIZE,
                bottom: y + CREATURE_SIZE
            };
            
            const obstacles = getObstacles();
            let colliding = false;
            
            // Verificar colisión con obstáculos con buffer más grande
            for (let obstacle of obstacles) {
                if (isColliding(creatureRect, obstacle, 50)) {
                    colliding = true;
                    break;
                }
            }
            
            if (!colliding) {
                return { x, y };
            }
            
            attempts++;
        }
        
        // Si no encuentra posición válida, usar posiciones seguras en las esquinas
        const safePositions = [
            { x: EDGE_MARGIN, y: EDGE_MARGIN }, // Esquina superior izquierda
            { x: maxX, y: EDGE_MARGIN }, // Esquina superior derecha
            { x: EDGE_MARGIN, y: maxY }, // Esquina inferior izquierda
            { x: maxX, y: maxY } // Esquina inferior derecha
        ];
        
        return safePositions[Math.floor(Math.random() * safePositions.length)];
    }
    
    function moveCreature() {
        if (isMoving) return;
        
        isMoving = true;
        const newPos = getValidPosition();
        
        // Orientar criatura hacia la dirección de movimiento
        const deltaX = newPos.x - currentX;
        if (Math.abs(deltaX) > 10) { // Solo cambiar orientación si el movimiento es significativo
            if (deltaX > 0) {
                creature.style.transform = 'scaleX(1)';
            } else {
                creature.style.transform = 'scaleX(-1)';
            }
        }
        
        creature.classList.add('walking');
        
        // Calcular duración del movimiento basada en la distancia
        const distance = Math.sqrt(Math.pow(newPos.x - currentX, 2) + Math.pow(newPos.y - currentY, 2));
        const moveDuration = Math.max(2000, Math.min(4000, distance * 3)); // Entre 2-4 segundos
        
        creature.style.transition = `left ${moveDuration}ms ease-in-out, top ${moveDuration}ms ease-in-out`;
        creature.style.left = newPos.x + 'px';
        creature.style.top = newPos.y + 'px';
        
        currentX = newPos.x;
        currentY = newPos.y;
        
        setTimeout(() => {
            creature.classList.remove('walking');
            isMoving = false;
        }, moveDuration);
    }
    
    function jumpCreature() {
        creature.classList.add('jumping');
        setTimeout(() => {
            creature.classList.remove('jumping');
        }, 800);
    }
    
    function showLoveMessage() {
        createLoveBubble(creature);
    }
    
    // Posición inicial segura
    const initialPos = getValidPosition();
    creature.style.left = initialPos.x + 'px';
    creature.style.top = initialPos.y + 'px';
    currentX = initialPos.x;
    currentY = initialPos.y;
    
    function scheduleNextMove() {
        const delay = Math.random() * 4000 + 4000; // 4-8 segundos (un poco más de tiempo)
        setTimeout(() => {
            moveCreature();
            scheduleNextMove();
        }, delay);
    }
    
    function scheduleJump() {
        const delay = Math.random() * 5000 + 3000; // 3-8 segundos
        setTimeout(() => {
            if (!isMoving) jumpCreature();
            scheduleJump();
        }, delay);
    }
    
    function scheduleLoveMessage() {
        const delay = Math.random() * 3000 + 4000; // Cada 4-7 segundos
        setTimeout(() => {
            showLoveMessage();
            scheduleLoveMessage();
        }, delay);
    }
    
    creature.addEventListener('click', () => {
        if (!isMoving) {
            jumpCreature();
            showLoveMessage();
        }
    });
    
    scheduleNextMove();
    scheduleJump();
    scheduleLoveMessage();
    
    // Mostrar primer mensaje después de 2 segundos
    setTimeout(showLoveMessage, 2000);
}
// Inicializar todo
document.addEventListener('DOMContentLoaded', () => {
    updateAll();
    setInterval(updateAll, 1000);
    initializeCreature();
});
// Prevenir zoom en móviles
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
// Redimensionar ventana con reposicionamiento mejorado
window.addEventListener('resize', () => {
    const creature = document.getElementById('creature');
    const rect = creature.getBoundingClientRect();
    const EDGE_MARGIN = 80;
    
    // Verificar si la criatura está demasiado cerca de los bordes después del redimensionamiento
    if (rect.left < EDGE_MARGIN || 
        rect.right > window.innerWidth - EDGE_MARGIN || 
        rect.top < EDGE_MARGIN || 
        rect.bottom > window.innerHeight - EDGE_MARGIN) {
        
        // Reposicionar la criatura a una posición segura
        const safeX = Math.max(EDGE_MARGIN, Math.min(window.innerWidth - EDGE_MARGIN - 50, rect.left));
        const safeY = Math.max(EDGE_MARGIN, Math.min(window.innerHeight - EDGE_MARGIN - 50, rect.top));
        
        creature.style.left = safeX + 'px';
        creature.style.top = safeY + 'px';
    }
});
