// Базовое состояние игры
const gameState = {
    day: 1,
    timeIndex: 0, // 0-Утро, 1-День, 2-Вечер, 3-Ночь
    times: ['Утро', 'День', 'Вечер', 'Ночь'],
    money: 500,
    metNPCs: [],
    currentLocation: '',
    currentNPC: null
};

// База данных NPC (пока те, что мы придумали)
const npcsDB = {
    'Общежитие': [
        { id: 'mark', name: 'Марк', desc: 'Сосед по общежитию. Общительный.', chance: 1.0 } // Всегда там
    ],
    'Клуб Маяк': [
        { id: 'alina', name: 'Алина', desc: 'Сотрудница клуба. Остроумная.', chance: 0.6 },
        { id: 'anton', name: 'Антон', desc: 'Менеджер клуба. Строгий.', chance: 0.3 }
    ],
    'Офис Пиксель': [
        { id: 'timur', name: 'Тимур', desc: 'Разработчик-наставник.', chance: 0.8 },
        { id: 'polina', name: 'Полина', desc: 'Стажёрка QA. Вдумчивая.', chance: 0.5 }
    ],
    'Кампус': [
        { id: 'dasha', name: 'Даша', desc: 'Ведёт кампусное радио.', chance: 0.7 }
    ],
    'Парк': [], // Скрытые NPC будут тут (чистый рандом)
    'Центр': []
};

// Обновление UI (верхняя панель)
function updateUI() {
    document.getElementById('ui-day').innerText = `День ${gameState.day}`;
    document.getElementById('ui-time').innerText = gameState.times[gameState.timeIndex];
    document.getElementById('ui-money').innerText = `💵 ${gameState.money}₽`;
}

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// Переход на локацию
function goToLocation(locationName) {
    gameState.currentLocation = locationName;
    document.getElementById('loc-title').innerText = locationName;
    
    const log = document.getElementById('loc-log');
    log.innerHTML = `Ты пришёл в локацию: <b>${locationName}</b>. Время: ${gameState.times[gameState.timeIndex]}.`;

    // Генерация действий
    const actionsContainer = document.getElementById('loc-actions');
    actionsContainer.innerHTML = ''; // Очистить

    // Кнопка "Осмотреться" (поиск NPC и случайные события)
    const exploreBtn = document.createElement('button');
    exploreBtn.innerText = '👀 Осмотреться / Найти знакомых';
    exploreBtn.onclick = () => exploreLocation();
    actionsContainer.appendChild(exploreBtn);

    showScreen('screen-location');
}

// Логика осмотра локации (Рандом и знакомства)
function exploreLocation() {
    const loc = gameState.currentLocation;
    const availableNPCs = npcsDB[loc] || [];
    let foundNPC = null;

    // Проверяем, есть ли кто-то из базы в этой локации (по шансу)
    for (let npc of availableNPCs) {
        if (Math.random() < npc.chance) {
            foundNPC = npc;
            break; 
        }
    }

    // Если никого из базы нет, шанс на случайного скрытого NPC (Рандом-событие)
    if (!foundNPC && Math.random() < 0.2) { // 20% шанс встретить кого-то
        foundNPC = { id: 'random_' + Date.now(), name: 'Случайный прохожий', desc: 'Незнакомец, который ищет свой путь.' };
    }

    if (foundNPC) {
        // Проверяем, знакомы ли мы уже
        if (!gameState.metNPCs.includes(foundNPC.id)) {
            document.getElementById('loc-log').innerHTML += `<br><br><span style="color: #3b82f6;">Ты встретил(а) нового персонажа: <b>${foundNPC.name}</b>!</span>`;
            gameState.metNPCs.push(foundNPC.id);
        }
        startDialog(foundNPC);
    } else {
        // Никого не нашли
        document.getElementById('loc-log').innerHTML += `<br><br>Ты никого не встретил.`;
        advanceTime(); // Тратим время
    }
}

// Начало диалога с NPC
function startDialog(npc) {
    gameState.currentNPC = npc;
    document.getElementById('npc-name').innerText = `${npc.name} (${npc.desc})`;
    document.getElementById('npc-text').innerText = `Привет! Что хотел(а)?`;

    const options = document.getElementById('dialog-options');
    options.innerHTML = '';

    // Кнопки действий (Гибридная система - пока без поля ввода для простоты MVP)
    const btnFlirt = document.createElement('button');
    btnFlirt.innerText = '😏 Флиртовать';
    btnFlirt.onclick = () => handleAction('flirt');

    const btnTalk = document.createElement('button');
    btnTalk.innerText = '💬 Поболтать о жизни';
    btnTalk.onclick = () => handleAction('talk');

    const btnLeave = document.createElement('button');
    btnLeave.className = 'secondary-btn';
    btnLeave.innerText = '🚪 Попрощаться';
    btnLeave.onclick = () => {
        showScreen('screen-location');
        advanceTime(); // Тратим время на общение
    };

    options.appendChild(btnTalk);
    options.appendChild(btnFlirt);
    options.appendChild(btnLeave);

    showScreen('screen-dialog');
}

// Обработка действий в диалоге
function handleAction(action) {
    const textBox = document.getElementById('npc-text');
    
    if (action === 'talk') {
        textBox.innerText = `"О, классно поболтали! Ты новенький тут, да?"`;
    } else if (action === 'flirt') {
        // Проверка на порог доверия (заглушка для MVP)
        textBox.innerText = `"Эй, мы даже не знакомы толком. Притормози." (Ты получил отказ. Нужно больше доверия).`;
    }
}

// Продвижение времени
function advanceTime() {
    gameState.timeIndex++;
    if (gameState.timeIndex > 3) {
        gameState.timeIndex = 0;
        gameState.day++;
    }
    updateUI();
}

// Инициализация
updateUI();