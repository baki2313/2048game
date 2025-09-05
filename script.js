// Игровые переменные
let board;
let score = 0;
const rows = 4;
const columns = 4;
let gameOver = false;
let moved = false;
let gameStarted = false;
let startTime;
let timerInterval;
let elapsedTime = 0;
let isPaused = false;
let isMobileControl = false;
let gameMode = 'single'; // 'single' или 'twoPlayers'
let player1Name = "Игрок 1";
let player2Name = "Игрок 2";
const MAX_UNDO_STEPS = 3;
let moveHistory = [];
const SMOOTH_ANIMATION_DURATION = 300;

// Система рекордов
const MAX_RECORDS = 10;
let records = [];

// Доски и счета для двух игроков
let boardPlayer1, boardPlayer2;
let scorePlayer1 = 0, scorePlayer2 = 0;
let gameOverPlayer1 = false, gameOverPlayer2 = false;

// Инициализация игры
window.onload = function() {
    setGame();
    
    // Назначаем обработчики кнопок
    document.getElementById("new-game").addEventListener("click", newGame);
    document.getElementById("toggle-players-btn").addEventListener("click", togglePlayersMode);
    document.getElementById("pause-btn").addEventListener("click", togglePause);
    document.getElementById("exit-btn").addEventListener("click", exitGame);
    document.getElementById("undo-btn").addEventListener("click", undoMove);
    document.getElementById("switch-control-btn").addEventListener("click", toggleControlMode);
    document.getElementById("records-btn").addEventListener("click", showRecords);
    document.querySelector("#records-modal .close").addEventListener("click", closeRecords);
    document.getElementById("start-two-players").addEventListener("click", startTwoPlayersGame);
    
    // Обработчики для мобильных кнопок
    document.getElementById("up-btn").addEventListener("click", () => slideDirection('up'));
    document.getElementById("down-btn").addEventListener("click", () => slideDirection('down'));
    document.getElementById("left-btn").addEventListener("click", () => slideDirection('left'));
    document.getElementById("right-btn").addEventListener("click", () => slideDirection('right'));
    
    // Эффект сияния для счета
    const scoreContainer = document.getElementById("score-container");
    const scoreElement = document.getElementById("score");
    
    scoreContainer.addEventListener("mouseenter", () => {
        scoreElement.style.animation = "scoreGlow 1.5s ease-in-out infinite";
    });
    
    scoreContainer.addEventListener("mouseleave", () => {
        scoreElement.style.animation = "none";
    });
    
    // Загрузка сохраненной игры и рекордов
    loadGame();
    loadRecords();
    
    // Инициализация свайпов
    initSwipe();
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', (e) => {
        const recordsModal = document.getElementById("records-modal");
        const playersModal = document.getElementById("players-modal");
        
        if (e.target === recordsModal) closeRecords();
        if (e.target === playersModal) playersModal.style.display = "none";
    });
}

// Переключение режима игроков
function togglePlayersMode() {
    if (gameMode === 'single') {
        showPlayersModal();
    } else {
        // Возврат к одному игроку
        gameMode = 'single';
        document.getElementById("toggle-players-btn").textContent = "2 игрока";
        document.getElementById("single-player-container").classList.remove("hidden");
        document.getElementById("two-players-container").classList.add("hidden");
        updateInstructions();
    }
}

// Показать модальное окно для имен игроков
function showPlayersModal() {
    document.getElementById("players-modal").style.display = "block";
}

// Начать игру для двух игроков
function startTwoPlayersGame() {
    player1Name = document.getElementById("player1-input").value || "Игрок 1";
    player2Name = document.getElementById("player2-input").value || "Игрок 2";
    
    document.getElementById("players-modal").style.display = "none";
    document.getElementById("player1-name").textContent = player1Name;
    document.getElementById("player2-name").textContent = player2Name;
    
    gameMode = 'twoPlayers';
    document.getElementById("toggle-players-btn").textContent = "1 игрок";
    document.getElementById("single-player-container").classList.add("hidden");
    document.getElementById("two-players-container").classList.remove("hidden");
    
    // Обновляем инструкции
    updateInstructions();
    
    // Инициализация игры для двух игроков
    initTwoPlayersGame();
}

// Инициализация игры для двух игроков
function initTwoPlayersGame() {
    // Сброс состояний
    scorePlayer1 = 0;
    scorePlayer2 = 0;
    gameOverPlayer1 = false;
    gameOverPlayer2 = false;
    gameStarted = false;
    isPaused = false;
    moveHistory = [];
    
    // Обновление UI
    document.getElementById("score-player1").textContent = "0";
    document.getElementById("score-player2").textContent = "0";
    
    // Создание досок
    createBoardForPlayer(1);
    createBoardForPlayer(2);
    
    // Добавление начальных плиток
    setTwoForPlayer(1);
    setTwoForPlayer(1);
    setTwoForPlayer(2);
    setTwoForPlayer(2);
    
    // Сброс таймера
    resetTimer();
}

// Создание доски для игрока
function createBoardForPlayer(playerNum) {
    const boardElement = document.getElementById(`board-player${playerNum}`);
    boardElement.innerHTML = "";
    
    // Создаем матрицу для игрока
    if (playerNum === 1) {
        boardPlayer1 = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
    } else {
        boardPlayer2 = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
    }
    
    // Создаем плитки
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = `tile-${playerNum}-${r}-${c}`;
            tile.className = "tile";
            boardElement.appendChild(tile);
        }
    }
}

// Обновление плитки для игрока
function updateTileForPlayer(playerNum, r, c, num) {
    const tile = document.getElementById(`tile-${playerNum}-${r}-${c}`);
    tile.innerText = "";
    tile.classList.value = "tile";
    
    if (num > 0) {
        tile.innerText = num.toString();
        
        if (num <= 8192) {
            tile.classList.add(`x${num}`);
        } else {
            tile.classList.add("x8192");
        }
    }
}

// Добавление двойки для игрока
function setTwoForPlayer(playerNum) {
    const board = playerNum === 1 ? boardPlayer1 : boardPlayer2;
    
    if (!hasEmptyTileForPlayer(playerNum)) return;
    
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        
        if (board[r][c] === 0) {
            board[r][c] = 2;
            const tile = document.getElementById(`tile-${playerNum}-${r}-${c}`);
            
            // Плавное появление новой плитки
            tile.innerText = "2";
            tile.classList.add("tile", "x2", "new-tile");
            
            // Удаляем класс анимации после завершения
            setTimeout(() => {
                tile.classList.remove("new-tile");
            }, SMOOTH_ANIMATION_DURATION);
            
            found = true;
        }
    }
}

// Проверка на пустые плитки для игрока
function hasEmptyTileForPlayer(playerNum) {
    const board = playerNum === 1 ? boardPlayer1 : boardPlayer2;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === 0) {
                return true;
            }
        }
    }
    return false;
}

// Проверка возможных ходов для игрока
function canMoveForPlayer(playerNum) {
    const board = playerNum === 1 ? boardPlayer1 : boardPlayer2;
    
    // Горизонтальные перемещения
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 1; c++) {
            if (board[r][c] === board[r][c + 1]) {
                return true;
            }
        }
    }
    
    // Вертикальные перемещения
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 1; r++) {
            if (board[r][c] === board[r + 1][c]) {
                return true;
            }
        }
    }
    
    return false;
}

// Инициализация свайпов
function initSwipe() {
    const boardElement = document.getElementById('board');
    let touchStartX, touchStartY;
    
    boardElement.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });
    
    boardElement.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    boardElement.addEventListener('touchend', function(e) {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // Определяем направление свайпа
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                slideDirection('right');
            } else {
                slideDirection('left');
            }
        } else {
            if (diffY > 0) {
                slideDirection('down');
            } else {
                slideDirection('up');
            }
        }
        
        touchStartX = null;
        touchStartY = null;
        e.preventDefault();
    }, { passive: false });
}

// Переключение режима управления
function toggleControlMode() {
    isMobileControl = !isMobileControl;
    const switchBtn = document.getElementById("switch-control-btn");
    const mobileControls = document.querySelector('.mobile-controls');
    
    if (isMobileControl) {
        switchBtn.textContent = "ПК управление";
        mobileControls.classList.add('active');
    } else {
        switchBtn.textContent = "Моб. управление";
        mobileControls.classList.remove('active');
    }
    
    // Обновляем инструкции
    updateInstructions();
}

// Обновление инструкций
function updateInstructions() {
    const instructions = document.querySelector('.instructions');
    
    if (isMobileControl) {
        instructions.innerHTML = `
            <p>Используйте кнопки управления или свайпы для перемещения плиток</p>
            <p>Плитки с одинаковыми числами объединяются при столкновении</p>
        `;
    } else if (gameMode === 'single') {
        instructions.innerHTML = `
            <p>Используйте <span class="key">←</span> <span class="key">→</span> <span class="key">↑</span> <span class="key">↓</span> для перемещения плиток</p>
            <p>Плитки с одинаковыми числами объединяются при столкновении</p>
        `;
    } else {
        instructions.innerHTML = `
            <p>Используйте <span class="key">←</span> <span class="key">→</span> <span class="key">↑</span> <span class="key">↓</span> для перемещения плиток (${player1Name})</p>
            <p>Используйте <span class="key">A</span> <span class="key">D</span> <span class="key">W</span> <span class="key">S</span> для перемещения плиток (${player2Name})</p>
            <p>Плитки с одинаковыми числами объединяются при столкновении</p>
        `;
    }
}

// Управление паузой
function togglePause() {
    if (gameOver || !gameStarted) return;
    
    isPaused = !isPaused;
    const pauseBtn = document.getElementById("pause-btn");
    
    if (isPaused) {
        stopTimer();
        pauseBtn.textContent = "Продолжить";
        pauseBtn.style.background = "linear-gradient(45deg, #a1c4fd, #c2e9fb)";
    } else {
        startTimer();
        pauseBtn.textContent = "Пауза";
        pauseBtn.style.background = "linear-gradient(45deg, #ff9a9e, #fad0c4)";
    }
}

// Выход из игры
function exitGame() {
    if (gameStarted && !gameOver) {
        stopTimer();
        gameOver = true;
        
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        setTimeout(() => {
            if (gameMode === 'single') {
                const message = `Игра завершена!\nВаш счет: ${score}\nВремя игры: ${timeString}`;
                
                // Проверяем, установлен ли новый рекорд
                if (checkNewRecord()) {
                    alert(message + "\n🎉 Поздравляем! Вы установили новый рекорд!");
                } else {
                    alert(message);
                }
            } else {
                const message = `Игра завершена!\n\n${player1Name}: ${scorePlayer1}\n${player2Name}: ${scorePlayer2}\nВремя игры: ${timeString}`;
                alert(message);
                
                // Сохраняем рекорды для обоих игроков
                checkNewRecordForPlayer(player1Name, scorePlayer1);
                checkNewRecordForPlayer(player2Name, scorePlayer2);
            }
            
            newGame();
        }, SMOOTH_ANIMATION_DURATION);
    } else {
        newGame();
    }
}

// Таймер игры
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    document.getElementById("timer").textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    document.getElementById("timer").textContent = "00:00";
}

// Сохранение игры
function saveGame() {
    const gameState = {
        board: board,
        score: score,
        elapsedTime: elapsedTime,
        gameStarted: gameStarted,
        isPaused: isPaused,
        isMobileControl: isMobileControl,
        gameMode: gameMode,
        player1Name: player1Name,
        player2Name: player2Name,
        boardPlayer1: boardPlayer1,
        boardPlayer2: boardPlayer2,
        scorePlayer1: scorePlayer1,
        scorePlayer2: scorePlayer2
    };
    localStorage.setItem("2048-game", JSON.stringify(gameState));
}

// Загрузка игры
function loadGame() {
    const savedGame = localStorage.getItem("2048-game");
    if (savedGame) {
        const gameState = JSON.parse(savedGame);
        
        if (confirm("Найдено сохранение. Загрузить игру?")) {
            board = gameState.board;
            score = gameState.score;
            elapsedTime = gameState.elapsedTime;
            gameStarted = gameState.gameStarted;
            isPaused = gameState.isPaused;
            isMobileControl = gameState.isMobileControl;
            gameMode = gameState.gameMode || 'single';
            player1Name = gameState.player1Name || "Игрок 1";
            player2Name = gameState.player2Name || "Игрок 2";
            
            if (gameMode === 'twoPlayers') {
                boardPlayer1 = gameState.boardPlayer1;
                boardPlayer2 = gameState.boardPlayer2;
                scorePlayer1 = gameState.scorePlayer1 || 0;
                scorePlayer2 = gameState.scorePlayer2 || 0;
            }
            
            document.getElementById("score").innerText = score;
            
            if (gameStarted && !isPaused) {
                startTimer();
            }
            
            // Обновляем UI в зависимости от режима
            if (gameMode === 'twoPlayers') {
                document.getElementById("toggle-players-btn").textContent = "1 игрок";
                document.getElementById("single-player-container").classList.add("hidden");
                document.getElementById("two-players-container").classList.remove("hidden");
                document.getElementById("player1-name").textContent = player1Name;
                document.getElementById("player2-name").textContent = player2Name;
                document.getElementById("score-player1").textContent = scorePlayer1;
                document.getElementById("score-player2").textContent = scorePlayer2;
                
                // Создаем доски
                createBoardForPlayer(1);
                createBoardForPlayer(2);
                
                // Обновляем плитки
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < columns; c++) {
                        updateTileForPlayer(1, r, c, boardPlayer1[r][c]);
                        updateTileForPlayer(2, r, c, boardPlayer2[r][c]);
                    }
                }
            } else {
                document.getElementById("toggle-players-btn").textContent = "2 игрока";
                document.getElementById("single-player-container").classList.remove("hidden");
                document.getElementById("two-players-container").classList.add("hidden");
                
                // Обновляем доску
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < columns; c++) {
                        updateTile(r, c, board[r][c]);
                    }
                }
            }
            
            // Обновляем состояние кнопки паузы
            if (isPaused) {
                document.getElementById("pause-btn").textContent = "Продолжить";
                document.getElementById("pause-btn").style.background = "linear-gradient(45deg, #a1c4fd, #c2e9fb)";
            }
            
            // Обновляем состояние переключателя управления
            const switchBtn = document.getElementById("switch-control-btn");
            const mobileControls = document.querySelector('.mobile-controls');
            
            if (isMobileControl) {
                switchBtn.textContent = "ПК управление";
                mobileControls.classList.add('active');
            } else {
                switchBtn.textContent = "Моб. управление";
                mobileControls.classList.remove('active');
            }
            
            updateInstructions();
        }
    }
}

// Загрузка рекордов из localStorage
function loadRecords() {
    const savedRecords = localStorage.getItem("2048-records");
    if (savedRecords) {
        records = JSON.parse(savedRecords);
    }
}

// Сохранение рекордов в localStorage
function saveRecords() {
    localStorage.setItem("2048-records", JSON.stringify(records));
}

// Проверка и добавление нового рекорда
function checkNewRecord() {
    if (score <= 0) return false;
    
    const newRecord = {
        player: "Игрок",
        score: score,
        time: document.getElementById("timer").textContent,
        date: new Date().toLocaleDateString('ru-RU')
    };
    
    return addRecord(newRecord);
}

// Проверка и добавление рекорда для игрока
function checkNewRecordForPlayer(playerName, playerScore) {
    if (playerScore <= 0) return false;
    
    const newRecord = {
        player: playerName,
        score: playerScore,
        time: document.getElementById("timer").textContent,
        date: new Date().toLocaleDateString('ru-RU')
    };
    
    return addRecord(newRecord);
}

// Добавление записи в рекорды
function addRecord(newRecord) {
    // Если рекордов меньше MAX_RECORDS или счет достаточно высокий
    if (records.length < MAX_RECORDS || newRecord.score > records[records.length - 1].score) {
        // Добавляем новый рекорд
        records.push(newRecord);
        
        // Сортируем по убыванию счета
        records.sort((a, b) => b.score - a.score);
        
        // Обрезаем до MAX_RECORDS
        if (records.length > MAX_RECORDS) {
            records = records.slice(0, MAX_RECORDS);
        }
        
        saveRecords();
        return true;
    }
    
    return false;
}

// Показать модальное окно с рекордами
function showRecords() {
    const modal = document.getElementById("records-modal");
    const recordsList = document.getElementById("records-list");
    
    // Очищаем список
    recordsList.innerHTML = "";
    
    if (records.length === 0) {
        recordsList.innerHTML = '<p class="no-records">Пока нет рекордов! Сыграйте игру, чтобы установить новый рекорд.</p>';
        modal.style.display = "block";
        return;
    }
    
    // Добавляем рекорды в список
    records.forEach((record, index) => {
        const recordItem = document.createElement('div');
        recordItem.className = `record-item ${index === 0 ? 'top-1' : ''}`;
        
        const crown = index === 0 ? '<i class="fas fa-crown record-crown"></i>' : '';
        
        recordItem.innerHTML = `
            <div class="record-position">${index + 1}</div>
            <div class="record-details">
                <div class="record-player">${record.player}</div>
                <div class="record-score">${crown}${record.score}</div>
                <div class="record-time">Время: ${record.time}</div>
            </div>
            <div class="record-date">${record.date}</div>
        `;
        
        recordsList.appendChild(recordItem);
    });
    
    modal.style.display = "block";
}

// Закрыть модальное окно
function closeRecords() {
    document.getElementById("records-modal").style.display = "none";
}

// Сохраняем состояние для отмены
function saveStateForUndo() {
    const state = {
        board: JSON.parse(JSON.stringify(board)),
        score: score,
        elapsedTime: elapsedTime
    };
    
    moveHistory.push(state);
    
    // Ограничиваем историю
    if (moveHistory.length > MAX_UNDO_STEPS) {
        moveHistory.shift();
    }
    
    // Активируем кнопку отмены
    document.getElementById("undo-btn").disabled = false;
}

// Отмена хода
function undoMove() {
    if (moveHistory.length === 0) return;
    
    const state = moveHistory.pop();
    board = state.board;
    score = state.score;
    elapsedTime = state.elapsedTime;
    
    // Обновляем UI
    updateBoard();
    document.getElementById("score").innerText = score;
    updateTimerDisplay();
    
    // Если история пуста, деактивируем кнопку
    if (moveHistory.length === 0) {
        document.getElementById("undo-btn").disabled = true;
    }
    
    saveGame();
}

// Обновление всей доски
function updateBoard() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            updateTile(r, c, board[r][c]);
        }
    }
}

// Обновление отображения таймера
function updateTimerDisplay() {
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    document.getElementById("timer").textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Новая игра
function newGame() {
    if (gameMode === 'twoPlayers') {
        document.getElementById("two-players-container").classList.add("hidden");
    }
    
    document.getElementById("single-player-container").classList.remove("hidden");
    document.getElementById("board").innerHTML = "";
    score = 0;
    document.getElementById("score").innerText = score;
    gameOver = false;
    isPaused = false;
    resetTimer();
    gameStarted = false;
    moveHistory = [];
    gameMode = 'single';
    document.getElementById("toggle-players-btn").textContent = "2 игрока";
    document.getElementById("undo-btn").disabled = true;
    localStorage.removeItem("2048-game");
    
    // Сброс стиля кнопки паузы
    document.getElementById("pause-btn").textContent = "Пауза";
    document.getElementById("pause-btn").style.background = "linear-gradient(45deg, #ff9a9e, #fad0c4)";
    
    // Сброс управления
    isMobileControl = false;
    document.getElementById("switch-control-btn").textContent = "Моб. управление";
    document.querySelector('.mobile-controls').classList.remove('active');
    updateInstructions();
    
    setGame();
}

// Настройка игры для одного игрока
function setGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = `tile-${r}-${c}`;
            tile.className = "tile";
            document.getElementById("board").append(tile);
        }
    }
    
    setTwo();
    setTwo();
}

// Обновление плитки для одного игрока
function updateTile(r, c, num) {
    const tile = document.getElementById(`tile-${r}-${c}`);
    tile.innerText = "";
    tile.classList.value = "tile";
    
    if (num > 0) {
        tile.innerText = num.toString();
        
        if (num <= 8192) {
            tile.classList.add(`x${num}`);
        } else {
            tile.classList.add("x8192");
        }
    }
}

// Обработка клавиатуры
document.addEventListener('keyup', (e) => {
    // Блокируем клавиатуру, если включено мобильное управление
    if (isMobileControl) return;

    if (gameOver || isPaused) return;
    
    if (gameMode === 'single') {
        if (!gameStarted) {
            gameStarted = true;
            startTimer();
        }
        
        moved = false;
        
        if (e.code === "ArrowLeft") {
            slideDirection('left');
        }
        else if (e.code === "ArrowRight") {
            slideDirection('right');
        }
        else if (e.code === "ArrowUp") {
            slideDirection('up');
        }
        else if (e.code === "ArrowDown") {
            slideDirection('down');
        }
    } else if (gameMode === 'twoPlayers') {
        if (!gameStarted) {
            gameStarted = true;
            startTimer();
        }
        
        // Игрок 1
        if (e.code === "ArrowLeft") slideForPlayer(1, 'left');
        else if (e.code === "ArrowRight") slideForPlayer(1, 'right');
        else if (e.code === "ArrowUp") slideForPlayer(1, 'up');
        else if (e.code === "ArrowDown") slideForPlayer(1, 'down');
        
        // Игрок 2
        else if (e.code === "KeyA") slideForPlayer(2, 'left');
        else if (e.code === "KeyD") slideForPlayer(2, 'right');
        else if (e.code === "KeyW") slideForPlayer(2, 'up');
        else if (e.code === "KeyS") slideForPlayer(2, 'down');
    }
});


// Управление направлением для одного игрока
function slideDirection(direction) {
    if (gameOver || isPaused) return;
    
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }
    
    moved = false;
    
    switch(direction) {
        case 'left': moved = slideLeft(); break;
        case 'right': moved = slideRight(); break;
        case 'up': moved = slideUp(); break;
        case 'down': moved = slideDown(); break;
    }
    
    if (moved) {
        setTimeout(() => {
            // Сохраняем состояние для возможной отмены
            saveStateForUndo();
            
            setTwo();
            document.getElementById("score").innerText = score;
            saveGame();
            
            // Проверка на проигрыш
            if (!hasEmptyTile() && !canMove()) {
                gameOver = true;
                stopTimer();
                saveGame();
                
                setTimeout(() => {
                    const message = `Игра окончена! Ваш счет: ${score}\nВремя игры: ${document.getElementById("timer").textContent}`;
                    
                    // Проверяем, установлен ли новый рекорд
                    if (checkNewRecord()) {
                        alert(message + "\n🎉 Поздравляем! Вы установили новый рекорд!");
                    } else {
                        alert(message);
                    }
                }, SMOOTH_ANIMATION_DURATION);
            }
        }, SMOOTH_ANIMATION_DURATION);
    }
}

// Управление для конкретного игрока
function slideForPlayer(playerNum, direction) {
    if ((playerNum === 1 && gameOverPlayer1) || 
        (playerNum === 2 && gameOverPlayer2) || 
        isPaused) return;
    
    let moved = false;
    let board = playerNum === 1 ? boardPlayer1 : boardPlayer2;
    
    switch(direction) {
        case 'left': moved = slideLeftForPlayer(playerNum, board); break;
        case 'right': moved = slideRightForPlayer(playerNum, board); break;
        case 'up': moved = slideUpForPlayer(playerNum, board); break;
        case 'down': moved = slideDownForPlayer(playerNum, board); break;
    }
    
    if (moved) {
        setTimeout(() => {
            setTwoForPlayer(playerNum);
            
            // Обновляем счет
            if (playerNum === 1) {
                document.getElementById("score-player1").textContent = scorePlayer1;
            } else {
                document.getElementById("score-player2").textContent = scorePlayer2;
            }
            
            saveGame();
            
            // Проверка на проигрыш
            if (!hasEmptyTileForPlayer(playerNum) && !canMoveForPlayer(playerNum)) {
                if (playerNum === 1) gameOverPlayer1 = true;
                else gameOverPlayer2 = true;
                
                // Если оба игрока проиграли
                if (gameOverPlayer1 && gameOverPlayer2) {
                    stopTimer();
                    saveGame();
                    
                    setTimeout(() => {
                        const winner = scorePlayer1 > scorePlayer2 ? player1Name : 
                                      scorePlayer2 > scorePlayer1 ? player2Name : "Ничья!";
                        const message = `Игра окончена!\n\nПобедитель: ${winner}\n\n${player1Name}: ${scorePlayer1}\n${player2Name}: ${scorePlayer2}\nВремя игры: ${document.getElementById("timer").textContent}`;
                        alert(message);
                    }, SMOOTH_ANIMATION_DURATION);
                }
            }
        }, SMOOTH_ANIMATION_DURATION);
    }
}

// Фильтрация нулей
function filterZero(row) {
    return row.filter(num => num != 0);
}

// Сдвиг плиток в ряду
function slide(row) {
    let points = 0;
    row = filterZero(row);
    
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] == row[i + 1]) {
            row[i] *= 2;
            row[i + 1] = 0;
            points += row[i];
        }
    }
    
    row = filterZero(row);
    
    while (row.length < columns) {
        row.push(0);
    }
    
    return { newRow: row, points };
}

// Сдвиг влево для игрока
function slideLeftForPlayer(playerNum, board) {
    let moved = false;
    let totalPoints = 0;
    
    for (let r = 0; r < rows; r++) {
        const originalRow = [...board[r]];
        let row = board[r];
        const result = slide(row);
        row = result.newRow;
        totalPoints += result.points;
        board[r] = row;
        
        // Проверка на изменение
        if (originalRow.toString() !== row.toString()) {
            moved = true;
            
            // Обновление плиток
            for (let c = 0; c < columns; c++) {
                setTimeout(() => {
                    updateTileForPlayer(playerNum, r, c, board[r][c]);
                    
                    // Анимация слияния
                    if (originalRow[c] !== board[r][c] && board[r][c] > 0) {
                        const tile = document.getElementById(`tile-${playerNum}-${r}-${c}`);
                        tile.classList.add("merged");
                        
                        setTimeout(() => {
                            tile.classList.remove("merged");
                        }, SMOOTH_ANIMATION_DURATION);
                    }
                }, c * 30);
            }
        }
    }
    
    if (playerNum === 1) {
        scorePlayer1 += totalPoints;
    } else {
        scorePlayer2 += totalPoints;
    }
    
    return moved;
}

// Сдвиг вправо для игрока
function slideRightForPlayer(playerNum, board) {
    let moved = false;
    let totalPoints = 0;
    
    for (let r = 0; r < rows; r++) {
        const originalRow = [...board[r]];
        let row = board[r];
        row.reverse();
        const result = slide(row);
        row = result.newRow;
        row.reverse();
        totalPoints += result.points;
        board[r] = row;
        
        if (originalRow.toString() !== row.toString()) {
            moved = true;
            
            for (let c = 0; c < columns; c++) {
                setTimeout(() => {
                    updateTileForPlayer(playerNum, r, c, board[r][c]);
                    
                    if (originalRow[c] !== board[r][c] && board[r][c] > 0) {
                        const tile = document.getElementById(`tile-${playerNum}-${r}-${c}`);
                        tile.classList.add("merged");
                        
                        setTimeout(() => {
                            tile.classList.remove("merged");
                        }, SMOOTH_ANIMATION_DURATION);
                    }
                }, (columns - c - 1) * 30);
            }
        }
    }
    
    if (playerNum === 1) {
        scorePlayer1 += totalPoints;
    } else {
        scorePlayer2 += totalPoints;
    }
    
    return moved;
}

// Сдвиг вверх для игрока
function slideUpForPlayer(playerNum, board) {
    let moved = false;
    let totalPoints = 0;
    
    for (let c = 0; c < columns; c++) {
        const originalCol = [board[0][c], board[1][c], board[2][c], board[3][c]];
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        const result = slide(row);
        row = result.newRow;
        totalPoints += result.points;
        
        for (let r = 0; r < rows; r++) {
            board[r][c] = row[r];
        }
        
        if (originalCol.toString() !== row.toString()) {
            moved = true;
            
            for (let r = 0; r < rows; r++) {
                setTimeout(() => {
                    updateTileForPlayer(playerNum, r, c, board[r][c]);
                    
                    if (originalCol[r] !== board[r][c] && board[r][c] > 0) {
                        const tile = document.getElementById(`tile-${playerNum}-${r}-${c}`);
                        tile.classList.add("merged");
                        
                        setTimeout(() => {
                            tile.classList.remove("merged");
                        }, SMOOTH_ANIMATION_DURATION);
                    }
                }, r * 30);
            }
        }
    }
    
    if (playerNum === 1) {
        scorePlayer1 += totalPoints;
    } else {
        scorePlayer2 += totalPoints;
    }
    
    return moved;
}

// Сдвиг вниз для игрока
function slideDownForPlayer(playerNum, board) {
    let moved = false;
    let totalPoints = 0;
    
    for (let c = 0; c < columns; c++) {
        const originalCol = [board[0][c], board[1][c], board[2][c], board[3][c]];
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row.reverse();
        const result = slide(row);
        row = result.newRow;
        row.reverse();
        totalPoints += result.points;
        
        for (let r = 0; r < rows; r++) {
            board[r][c] = row[r];
        }
        
        if (originalCol.toString() !== row.toString()) {
            moved = true;
            
            for (let r = 0; r < rows; r++) {
                setTimeout(() => {
                    updateTileForPlayer(playerNum, r, c, board[r][c]);
                    
                    if (originalCol[r] !== board[r][c] && board[r][c] > 0) {
                        const tile = document.getElementById(`tile-${playerNum}-${r}-${c}`);
                        tile.classList.add("merged");
                        
                        setTimeout(() => {
                            tile.classList.remove("merged");
                        }, SMOOTH_ANIMATION_DURATION);
                    }
                }, (rows - r - 1) * 30);
            }
        }
    }
    
    if (playerNum === 1) {
        scorePlayer1 += totalPoints;
    } else {
        scorePlayer2 += totalPoints;
    }
    
    return moved;
}

// Сдвиг влево
function slideLeft() {
    moved = false;
    let totalPoints = 0;
    
    for (let r = 0; r < rows; r++) {
        const originalRow = [...board[r]];
        let row = board[r];
        const result = slide(row);
        row = result.newRow;
        totalPoints += result.points;
        board[r] = row;
        
        // Проверка на изменение
        if (originalRow.toString() !== row.toString()) {
            moved = true;
            
            // Обновление плиток
            for (let c = 0; c < columns; c++) {
                setTimeout(() => {
                    updateTile(r, c, board[r][c]);
                    
                    // Анимация слияния
                    if (originalRow[c] !== board[r][c] && board[r][c] > 0) {
                        const tile = document.getElementById(`tile-${r}-${c}`);
                        tile.classList.add("merged");
                        
                        setTimeout(() => {
                            tile.classList.remove("merged");
                        }, SMOOTH_ANIMATION_DURATION);
                    }
                }, c * 30);
            }
        }
    }
    
    score += totalPoints;
    return moved;
}

// Сдвиг вправо
function slideRight() {
    moved = false;
    let totalPoints = 0;
    
    for (let r = 0; r < rows; r++) {
        const originalRow = [...board[r]];
        let row = board[r];
        row.reverse();
        const result = slide(row);
        row = result.newRow;
        row.reverse();
        totalPoints += result.points;
        board[r] = row;
        
        if (originalRow.toString() !== row.toString()) {
            moved = true;
            
            for (let c = 0; c < columns; c++) {
                setTimeout(() => {
                    updateTile(r, c, board[r][c]);
                    
                    if (originalRow[c] !== board[r][c] && board[r][c] > 0) {
                        const tile = document.getElementById(`tile-${r}-${c}`);
                        tile.classList.add("merged");
                        
                        setTimeout(() => {
                            tile.classList.remove("merged");
                        }, SMOOTH_ANIMATION_DURATION);
                    }
                }, (columns - c - 1) * 30);
            }
        }
    }
    
    score += totalPoints;
    return moved;
}

// Сдвиг вверх
function slideUp() {
    moved = false;
    let totalPoints = 0;
    
    for (let c = 0; c < columns; c++) {
        const originalCol = [board[0][c], board[1][c], board[2][c], board[3][c]];
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        const result = slide(row);
        row = result.newRow;
        totalPoints += result.points;
        
        for (let r = 0; r < rows; r++) {
            board[r][c] = row[r];
        }
        
        if (originalCol.toString() !== row.toString()) {
            moved = true;
            
            for (let r = 0; r < rows; r++) {
                setTimeout(() => {
                    updateTile(r, c, board[r][c]);
                    
                    if (originalCol[r] !== board[r][c] && board[r][c] > 0) {
                        const tile = document.getElementById(`tile-${r}-${c}`);
                        tile.classList.add("merged");
                        
                        setTimeout(() => {
                            tile.classList.remove("merged");
                        }, SMOOTH_ANIMATION_DURATION);
                    }
                }, r * 30);
            }
        }
    }
    
    score += totalPoints;
    return moved;
}

// Сдвиг вниз
function slideDown() {
    moved = false;
    let totalPoints = 0;
    
    for (let c = 0; c < columns; c++) {
        const originalCol = [board[0][c], board[1][c], board[2][c], board[3][c]];
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row.reverse();
        const result = slide(row);
        row = result.newRow;
        row.reverse();
        totalPoints += result.points;
        
        for (let r = 0; r < rows; r++) {
            board[r][c] = row[r];
        }
        
        if (originalCol.toString() !== row.toString()) {
            moved = true;
            
            for (let r = 0; r < rows; r++) {
                setTimeout(() => {
                    updateTile(r, c, board[r][c]);
                    
                    if (originalCol[r] !== board[r][c] && board[r][c] > 0) {
                        const tile = document.getElementById(`tile-${r}-${c}`);
                        tile.classList.add("merged");
                        
                        setTimeout(() => {
                            tile.classList.remove("merged");
                        }, SMOOTH_ANIMATION_DURATION);
                    }
                }, (rows - r - 1) * 30);
            }
        }
    }
    
    score += totalPoints;
    return moved;
}

// Добавление двойки
function setTwo() {
    if (!hasEmptyTile()) {
        return;
    }
    
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        
        if (board[r][c] == 0) {
            board[r][c] = 2;
            const tile = document.getElementById(`tile-${r}-${c}`);
            
            // Плавное появление новой плитки
            tile.innerText = "2";
            tile.classList.add("tile", "x2", "new-tile");
            
            // Удаляем класс анимации после завершения
            setTimeout(() => {
                tile.classList.remove("new-tile");
            }, SMOOTH_ANIMATION_DURATION);
            
            found = true;
        }
    }
}

// Проверка на пустые плитки
function hasEmptyTile() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) {
                return true;
            }
        }
    }
    return false;
}

// Проверка возможных ходов
function canMove() {
    // Горизонтальные перемещения
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 1; c++) {
            if (board[r][c] === board[r][c + 1]) {
                return true;
            }
        }
    }
    
    // Вертикальные перемещения
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 1; r++) {
            if (board[r][c] === board[r + 1][c]) {
                return true;
            }
        }
    }
    
    return false;
}
// Показать модальное окно с рекордами
function showRecords() {
    const modal = document.getElementById("records-modal");
    const recordsList = document.getElementById("records-list");

    // Очищаем список
    recordsList.innerHTML = "";

    if (records.length === 0) {
        recordsList.innerHTML = '<p class="no-records">Пока нет рекордов!</p>';
        modal.style.display = "block";
        return;
    }

    // Добавляем рекорды в список
    records.forEach((record, index) => {
        const recordItem = document.createElement('div');
        recordItem.className = `record-item ${index === 0 ? 'top-1' : ''}`;

        const crown = index === 0 ? '<i class="fas fa-crown record-crown"></i>' : '';

        recordItem.innerHTML = `
            <div class="record-position">${index + 1}</div>
            <div class="record-details">
                <div class="record-player">${record.player}</div>
                <div class="record-score">${crown}${record.score}</div>
                <div class="record-time">Время: ${record.time}</div>
            </div>
            <div class="record-date">${record.date}</div>
            <button class="btn delete-btn" data-index="${index}">Удалить</button>
        `;

        recordsList.appendChild(recordItem);
    });

    // Вешаем обработчики на кнопки "Удалить"
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = e.target.getAttribute("data-index");
            deleteRecord(idx);
        });
    });

    // Обработчик для кнопки "Очистить все"
    document.getElementById("clear-all-records").onclick = clearAllRecords;

    modal.style.display = "block";
}
// Удалить конкретный рекорд с анимацией
function deleteRecord(index) {
    const recordItems = document.querySelectorAll(".record-item");
    const recordToDelete = recordItems[index];

    if (recordToDelete) {
        recordToDelete.classList.add("fade-out"); // запускаем анимацию

        // Ждем завершения анимации
        recordToDelete.addEventListener("animationend", () => {
            records.splice(index, 1);
            saveRecords();
            showRecords(); // обновляем список
        }, { once: true });
    }
}
function clearAllRecords() {
    if (confirm("Вы уверены, что хотите удалить все рекорды?")) {
        const recordItems = document.querySelectorAll(".record-item");

        recordItems.forEach((item, i) => {
            item.classList.add("fade-out");
            item.addEventListener("animationend", () => {
                if (i === recordItems.length - 1) { 
                    records = [];
                    saveRecords();
                    showRecords();
                }
            }, { once: true });
        });

        if (recordItems.length === 0) {
            records = [];
            saveRecords();
            showRecords();
        }
    }
}

