// --- DIZIONARIO LOCALE ---
const TAV_LANG = {
    it: {
        title_cosciotto: "Acchiappa il Cosciotto", title_ratti: "Ratti & Gatti", title_freccette: "Freccette Ubriache",
        title_barili: "Torre di Barili", title_simon: "Memoria dell'Oste", title_boccale: "Lancio del Boccale",
        title_campanelle: "Tre Campanelle", title_bevuta: "Gara di Bevute", title_equilibrio: "Equilibrio del Cameriere",
        title_dadibulloni: "Dadi e Bulloni", title_mazepaint: "Maze Paint", title_colorblock: "Color Block",
        title_sudoku: "Sudoku", title_impiccato: "Impiccato", title_memory: "Memory",
        rules_cosciotto: "Trascina 🧺.<br>Prendi 🍗 (+10), evita 💣 (-1 vita)!", rules_ratti: "Tocca 🐭 (+10).<br>EVITA 🐱 (-1 vita)!",
        rules_freccette: "Tira quando il centro è verde.", rules_barili: "Impila con precisione.", rules_simon: "Ripeti la sequenza.",
        rules_boccale: "Scorri verso l'alto per lanciare il boccale. Fermalo nella zona verde!",
        rules_campanelle: "Non perdere di vista la moneta! Tocca il bicchiere giusto.",
        rules_bevuta: "Premi Destra e Sinistra alternativamente e più veloce che puoi!",
        rules_equilibrio: "Tieni premuto a Destra o Sinistra per bilanciare il vassoio!",
        rules_dadibulloni: "Sposta i dadi colorati da un bullone all'altro. Ordinali in modo che ogni bullone abbia dadi di un solo colore!",
        rules_mazepaint: "🛠️ In cantiere! Scorri per muovere la pallina e colorare tutto il labirinto.",
        rules_colorblock: "🛠️ In cantiere! Inserisci i blocchi stile Tetris per completare le righe.",
        rules_sudoku: "🛠️ In cantiere! Riempi la griglia con i numeri da 1 a 9.",
        rules_impiccato: "Indovina la parola segreta (tema Lords & Knights) prima che il povero costruttore venga impiccato!",
        rules_memory: "🛠️ In cantiere! Trova le coppie di carte uguali.",
        game_over: "☠️ PARTITA FINITA!", time_up: "⏳ TEMPO SCADUTO!", btn_start: "INIZIA (60s)"
    },
    en: {
        title_cosciotto: "Catch the Drumstick", title_ratti: "Rats & Cats", title_freccette: "Drunk Darts",
        title_barili: "Barrel Tower", title_simon: "Innkeeper's Memory", title_boccale: "Mug Toss",
        title_campanelle: "Three Cups", title_bevuta: "Drinking Contest", title_equilibrio: "Waiter's Balance",
        title_dadibulloni: "Nuts and Bolts", title_mazepaint: "Maze Paint", title_colorblock: "Color Block",
        title_sudoku: "Sudoku", title_impiccato: "Hangman", title_memory: "Memory",
        rules_cosciotto: "Drag 🧺.<br>Catch 🍗 (+10), avoid 💣 (-1 life)!", rules_ratti: "Tap 🐭 (+10).<br>AVOID 🐱 (-1 life)!",
        rules_freccette: "Throw when the center is green.", rules_barili: "Stack with precision.", rules_simon: "Repeat the sequence.",
        rules_boccale: "Swipe up to throw the mug. Stop it in the green zone!",
        rules_campanelle: "Keep your eyes on the coin! Tap the right cup.",
        rules_bevuta: "Tap Left and Right alternately as fast as you can!",
        rules_equilibrio: "Hold Right or Left to balance the tray!",
        rules_dadibulloni: "Move colored nuts between bolts. Sort them so each bolt has only one color!",
        rules_mazepaint: "🛠️ Under construction! Swipe to move the ball and paint the maze.",
        rules_colorblock: "🛠️ Under construction! Place Tetris-style blocks to complete rows.",
        rules_sudoku: "🛠️ Under construction! Fill the grid with numbers 1 to 9.",
        rules_impiccato: "Guess the secret L&K-themed word before the poor builder hangs!",
        rules_memory: "🛠️ Under construction! Find matching pairs of cards.",
        game_over: "☠️ GAME OVER!", time_up: "⏳ TIME'S UP!", btn_start: "START (60s)"
    }
};

function getTavLang() { return localStorage.getItem('lingua_scelta') || 'it'; }

let currentGame = null, score = 0, lives = 3, timeLeft = 60, gameActive = false;
let gameIntervals = [], gameTimeouts = [], gameAnimationFrames = [], lastDamageTime = 0;

window.onload = () => { 
    if(typeof window.initUI === 'function') window.initUI();
};

window.openGame = function(gameName) {
    currentGame = gameName; score = 0; lives = 3; timeLeft = 60; 
    const l = getTavLang();

    const stage = document.getElementById('game-stage');
    document.getElementById('gameModal').style.display = 'flex';
    stage.innerHTML = ''; stage.style.boxShadow = 'none'; stage.className = ''; 
    
    if (['cosciotto', 'simon', 'campanelle', 'boccale', 'bevuta', 'equilibrio', 'dadibulloni'].includes(gameName)) {
        stage.classList.add('theme-wood');
    } else if (gameName === 'freccette') {
        stage.classList.add('theme-wall');
    } else if (gameName === 'barili' || gameName === 'impiccato') {
        stage.classList.add('theme-stone');
    } else if (gameName === 'ratti') {
        stage.classList.add('theme-dirt');
    }

    document.getElementById('game-over-panel').classList.add('hidden');
    document.getElementById('game-instructions').classList.remove('hidden');
    document.getElementById('instruction-text').innerHTML = TAV_LANG[l]["rules_" + gameName];
    document.getElementById('modal-title').innerText = TAV_LANG[l]["title_" + gameName].toUpperCase();
    document.getElementById('end-reason').innerText = TAV_LANG[l].game_over;
    
    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) btnStart.innerText = TAV_LANG[l].btn_start;

    updateHUD();
}

window.startGameLogic = function() {
    const l = getTavLang();
    document.getElementById('game-instructions').classList.add('hidden');
    gameActive = true; lastDamageTime = Date.now();

    const timerSpan = document.getElementById('timer-container');
    // I nuovi giochi a livelli (Dadi e Bulloni, Impiccato, e i futuri) non hanno il timer di 60s
    const noTimerGames = ['ratti', 'simon', 'campanelle', 'dadibulloni', 'mazepaint', 'colorblock', 'sudoku', 'impiccato', 'memory'];
    
    if (!noTimerGames.includes(currentGame)) {
        timerSpan.style.display = 'inline'; 
        let timerInt = setInterval(() => {
            if (!gameActive) { clearInterval(timerInt); return; }
            timeLeft--; updateHUD();
            if (timeLeft <= 0) { document.getElementById('end-reason').innerText = TAV_LANG[l].time_up; gameOver(); }
        }, 1000);
        gameIntervals.push(timerInt);
    } else {
        timerSpan.style.display = 'none'; 
    }

    if (currentGame === 'cosciotto') initCosciotto();
    else if (currentGame === 'ratti') initRatti();
    else if (currentGame === 'freccette') initFreccette();
    else if (currentGame === 'barili') initBarili();
    else if (currentGame === 'simon') initSimon();
    else if (currentGame === 'boccale') initBoccale();
    else if (currentGame === 'campanelle') initCampanelle();
    else if (currentGame === 'bevuta') initBevuta();
    else if (currentGame === 'equilibrio') initEquilibrio();
    
    // NUOVI GIOCHI
    else if (currentGame === 'dadibulloni') initDadiBulloni();
    else if (currentGame === 'impiccato') initImpiccato();
    // Quelli in cantiere per ora mostrano solo un cartello e finiscono
    else {
        document.getElementById('game-stage').innerHTML = `<h2 style="color:var(--gold); text-align:center; padding: 20px;">🚧 Lavori in corso! 🚧<br><br><span style="font-size:16px; color:#fff;">Questo gioco aprirà i battenti nel prossimo aggiornamento.</span></h2>`;
        setTimeout(gameOver, 3000);
    }
}

function stopAllGames() {
    gameActive = false;
    gameIntervals.forEach(clearInterval); gameIntervals = [];
    gameTimeouts.forEach(clearTimeout); gameTimeouts = [];
    gameAnimationFrames.forEach(cancelAnimationFrame); gameAnimationFrames = [];
    
    sSeq = []; sStep = 0; sClick = false; lastSimonClick = 0;
    lastDamageTime = 0;

    const stage = document.getElementById('game-stage');
    if (stage) {
        stage.onpointerdown = null; stage.onpointerup = null; stage.onpointermove = null; stage.onpointercancel = null;
        stage.ontouchmove = null; stage.onmousemove = null; stage.style.boxShadow = 'none'; stage.className = ''; 
    }
}

window.closeGame = function () { stopAllGames(); document.getElementById('gameModal').style.display = 'none'; }

function updateHUD() {
    document.getElementById('global-score').innerText = score;
    document.getElementById('global-lives').innerText = "❤️".repeat(Math.max(0, lives));
    document.getElementById('game-timer').innerText = timeLeft;
}

function loseLife() {
    let now = Date.now();
    if (now - lastDamageTime < 300) return; 
    lastDamageTime = now; lives--;
    flashStage('#ef4444'); updateHUD();
    if (lives <= 0) gameOver();
}

function flashStage(color) {
    const stage = document.getElementById('game-stage');
    stage.style.boxShadow = `inset 0 0 50px ${color}`;
    gameTimeouts.push(setTimeout(() => stage.style.boxShadow = "none", 200));
}

function gameOver() {
    if (!gameActive) return;
    gameActive = false; stopAllGames();
    if (navigator.vibrate) navigator.vibrate(200);
    document.getElementById('game-over-panel').classList.remove('hidden');
    document.getElementById('final-score-display').innerText = score;
}

window.resetGame = function() {
    stopAllGames();
    document.getElementById('game-stage').innerHTML = '';
    document.getElementById('game-over-panel').classList.add('hidden');
    openGame(currentGame);
}

// ==========================================
// GIOCHI VECCHI (Riassunti e mantenuti intatti)
// ==========================================
function initCosciotto() { const stage = document.getElementById('game-stage'); stage.innerHTML = `<div id="basket">🧺</div>`; const basket = document.getElementById('basket'); function move(clientX) { if (!gameActive) return; const rect = stage.getBoundingClientRect(); let x = clientX - rect.left; if (x < 0) x = 0; if (x > rect.width) x = rect.width; basket.style.left = x + 'px'; } stage.onpointermove = (e) => move(e.clientX); stage.ontouchmove = (e) => { e.preventDefault(); move(e.touches[0].clientX); }; let spawner = setInterval(() => { if (!gameActive) return; const item = document.createElement('div'); item.className = 'falling-item'; const isBomb = Math.random() > 0.8; item.innerText = isBomb ? '💣' : '🍗'; item.style.left = Math.random() * (stage.offsetWidth - 40) + 'px'; item.style.top = '-50px'; stage.appendChild(item); let speed = 4 + (score * 0.05); function fall() { if (!gameActive) { item.remove(); return; } let top = parseFloat(item.style.top); let stageH = stage.offsetHeight; if (top > stageH - 80 && top < stageH - 10) { const iR = item.getBoundingClientRect(); const bR = basket.getBoundingClientRect(); if (iR.right > bR.left + 10 && iR.left < bR.right - 10) { if (isBomb) { loseLife(); } else { score += 10; updateHUD(); } item.remove(); return; } } if (top > stageH) { if (!isBomb) loseLife(); item.remove(); } else { item.style.top = (top + speed) + 'px'; gameAnimationFrames.push(requestAnimationFrame(fall)); } } gameAnimationFrames.push(requestAnimationFrame(fall)); }, 800); gameIntervals.push(spawner); }

function initRatti() { const stage = document.getElementById('game-stage'); let html = '<div class="grid-ratti">'; for (let i = 0; i < 9; i++) html += `<div class="hole" onpointerdown="missRat(event)"><div class="mole" id="mole-${i}" onpointerdown="whack(event, this)"></div></div>`; html += '</div>'; stage.innerHTML = html; function peep() { if (!gameActive) return; const moles = document.querySelectorAll('.mole'); const mole = moles[Math.floor(Math.random() * moles.length)]; if (mole.classList.contains('up')) { gameTimeouts.push(setTimeout(peep, 100)); return; } const isCat = Math.random() < 0.3; mole.className = 'mole'; if (isCat) { mole.innerText = "🐱"; mole.dataset.type = "cat"; } else { mole.innerText = "🐭"; mole.dataset.type = "rat"; } mole.classList.add('up'); let stayTime = Math.max(450, 1000 - (score * 5)); gameTimeouts.push(setTimeout(() => { if (!gameActive) return; mole.classList.remove('up'); gameTimeouts.push(setTimeout(peep, Math.random() * 400 + 200)); }, stayTime)); } gameTimeouts.push(setTimeout(peep, 500)); }
window.whack = function (e, mole) { if (e) { e.preventDefault(); e.stopPropagation(); } if (!mole.classList.contains('up') || !gameActive) return; if (mole.dataset.type === "cat") { loseLife(); mole.innerText = "😾"; } else { score += 10; mole.innerText = "💥"; updateHUD(); } mole.classList.remove('up'); }; window.missRat = function (e) { if (e) { e.preventDefault(); e.stopPropagation(); } if (gameActive) loseLife(); }

function initFreccette() { const stage = document.getElementById('game-stage'); stage.innerHTML = `<div class="center-mark"></div><div id="dart-target"></div><button onpointerdown="throwDart(event)" class="btn-action" style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); width:120px; z-index:200;">TIRA!</button>`; const target = document.getElementById('dart-target'); let angle = 0; function animateDart() { if (!gameActive) return; angle += 0.05 + (score * 0.0002); let r = 100, x = Math.sin(angle) * r, y = Math.cos(angle * 1.5) * r; target.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`; target.dataset.x = x; target.dataset.y = y; gameAnimationFrames.push(requestAnimationFrame(animateDart)); } gameAnimationFrames.push(requestAnimationFrame(animateDart)); }
window.throwDart = function (e) { if (e) { e.preventDefault(); e.stopPropagation(); } if (!gameActive) return; const t = document.getElementById('dart-target'); const d = Math.sqrt(parseFloat(t.dataset.x||0)**2 + parseFloat(t.dataset.y||0)**2); if (d < 15) { score += 50; flashStage('#34d399'); } else if (d < 40) { score += 20; flashStage('#fbbf24'); } else if (d < 70) { score += 5; flashStage('#60a5fa'); } else { loseLife(); } updateHUD(); };

function initBarili() { const stage = document.getElementById('game-stage'); stage.innerHTML = `<div id="tower-world"><div id="moving-block"></div></div>`; const world = document.getElementById('tower-world'), mover = document.getElementById('moving-block'); let level = 0, w = 150, pos = 0, dir = 1, speed = 3, h = 25, stageW = stage.offsetWidth; mover.style.width = w + 'px'; mover.style.bottom = '0px'; function animateBarrel() { if (!gameActive) return; pos += speed * dir; if (pos > stageW - w || pos < 0) dir *= -1; mover.style.left = pos + 'px'; gameAnimationFrames.push(requestAnimationFrame(animateBarrel)); } gameAnimationFrames.push(requestAnimationFrame(animateBarrel)); stage.onpointerdown = function (e) { if (e.target.tagName === 'BUTTON' || !gameActive) return; let prevLeft = (stageW - 150) / 2, prevWidth = 150; if (level > 0) { const pb = document.getElementById(`barile-${level - 1}`); if (pb) { prevLeft = parseFloat(pb.style.left); prevWidth = parseFloat(pb.style.width); } } let overlap = w, newLeft = pos; if (level > 0) { const oL = Math.max(pos, prevLeft), oR = Math.min(pos + w, prevLeft + prevWidth); overlap = oR - oL; newLeft = oL; } if (overlap <= 0) { lives = 0; updateHUD(); gameOver(); return; } const b = document.createElement('div'); b.className = 'barile'; b.id = `barile-${level}`; b.style.width = overlap + 'px'; b.style.left = newLeft + 'px'; b.style.bottom = (level * h) + 'px'; world.appendChild(b); score += 10; level++; w = overlap; speed += 0.2; mover.style.width = w + 'px'; mover.style.bottom = (level * h) + 'px'; if (level * h > stage.offsetHeight / 2) world.style.transform = `translateY(${(level * h) - (stage.offsetHeight / 2)}px)`; updateHUD(); }; }

function initSimon() { const stage = document.getElementById('game-stage'); stage.innerHTML = `<div class="simon-grid"> <div class="simon-btn" style="background:#ef4444" onclick="clkS(event, 0)"></div> <div class="simon-btn" style="background:#3b82f6" onclick="clkS(event, 1)"></div> <div class="simon-btn" style="background:#34d399" onclick="clkS(event, 2)"></div> <div class="simon-btn" style="background:#fbbf24" onclick="clkS(event, 3)"></div> </div><div id="simon-msg" style="position:absolute; top:50%; width:100%; text-align:center; color:#fff; font-size:24px; font-weight:bold; pointer-events:none; text-shadow:0 0 10px #000;"></div>`; sSeq = []; sStep = 0; sClick = false; lastSimonClick = 0; gameTimeouts.push(setTimeout(playS, 1000)); } function playS() { if (!gameActive) return; sStep = 0; sClick = false; document.getElementById('simon-msg').innerText = "Memorizza!"; sSeq.push(Math.floor(Math.random() * 4)); let i = 0, int = setInterval(() => { if (!gameActive) { clearInterval(int); return; } if (i >= sSeq.length) { clearInterval(int); document.getElementById('simon-msg').innerText = "Tocca!"; sClick = true; return; } flashS(sSeq[i]); i++; }, 600); gameIntervals.push(int); } function flashS(idx) { const b = document.querySelectorAll('.simon-btn'); if (b[idx]) { b[idx].classList.add('active-light'); gameTimeouts.push(setTimeout(() => b[idx].classList.remove('active-light'), 300)); } } window.clkS = function (e, idx) { if (e) { e.preventDefault(); e.stopPropagation(); } let now = Date.now(); if (now - lastSimonClick < 300) return; lastSimonClick = now; if (!sClick || !gameActive) return; flashS(idx); if (idx !== sSeq[sStep]) { lives = 0; updateHUD(); gameOver(); return; } sStep++; if (sStep >= sSeq.length) { score += sSeq.length * 10; updateHUD(); sClick = false; gameTimeouts.push(setTimeout(playS, 1000)); } };

function initBoccale() { const stage = document.getElementById('game-stage'); stage.innerHTML = `<div class="table-boccale"></div><div class="target-zone"></div><div id="sliding-mug" class="sliding-mug" style="bottom:10%;">🍺</div>`; const mug = document.getElementById('sliding-mug'); let startY = 0, isDragging = false, velocity = 0, posY = 10; const handleStart = (y) => { if(gameActive && velocity === 0) { isDragging = true; startY = y; } }; const handleEnd = (y) => { if(isDragging && gameActive) { isDragging = false; let dy = startY - y; if(dy > 0) { velocity = Math.min(dy * 0.04, 7); gameAnimationFrames.push(requestAnimationFrame(slideMug)); } } }; stage.onpointerdown = (e) => handleStart(e.clientY); stage.onpointerup = (e) => handleEnd(e.clientY); stage.onpointercancel = (e) => handleEnd(e.clientY); function slideMug() { if(!gameActive) return; posY += velocity; velocity *= 0.93; mug.style.bottom = posY + '%'; if(velocity < 0.1) { velocity = 0; if(posY >= 70 && posY <= 90) { score += 50; flashStage('#34d399'); updateHUD(); } else { loseLife(); } gameTimeouts.push(setTimeout(() => { if(gameActive) { posY = 10; mug.style.bottom = '10%'; } }, 1000)); return; } if(posY > 110) { velocity = 0; loseLife(); gameTimeouts.push(setTimeout(() => { if(gameActive) { posY = 10; mug.style.bottom = '10%'; } }, 1000)); return; } gameAnimationFrames.push(requestAnimationFrame(slideMug)); } }

function initCampanelle() { const stage = document.getElementById('game-stage'); stage.innerHTML = `<div id="campanelle-msg" style="position:absolute; top:20px; width:100%; text-align:center; color:var(--gold); font-weight:bold; z-index:10; font-size:18px;">Guarda bene...</div> <div style="position:relative; width:100%; height:100%;"> <div class="cup-wrap" id="cup-0" onclick="checkCup(0)"><div class="cup-icon">🍺</div><div class="coin-icon">🪙</div></div> <div class="cup-wrap" id="cup-1" onclick="checkCup(1)"><div class="cup-icon">🍺</div><div class="coin-icon">🪙</div></div> <div class="cup-wrap" id="cup-2" onclick="checkCup(2)"><div class="cup-icon">🍺</div><div class="coin-icon">🪙</div></div> </div>`; let coinPos = Math.floor(Math.random() * 3), canPick = false; const msg = document.getElementById('campanelle-msg'), posizioniX = [-90, 0, 90]; let statoCoppe = [0, 1, 2]; for(let i=0; i<3; i++) document.getElementById(`cup-${i}`).style.transform = `translateX(calc(-50% + ${posizioniX[statoCoppe[i]]}px))`; const coppaMoneta = document.getElementById(`cup-${coinPos}`); coppaMoneta.querySelector('.cup-icon').style.transform = 'translateY(-50px)'; coppaMoneta.querySelector('.coin-icon').style.opacity = '1'; gameTimeouts.push(setTimeout(() => { if(!gameActive) return; coppaMoneta.querySelector('.cup-icon').style.transform = 'translateY(0)'; coppaMoneta.querySelector('.coin-icon').style.opacity = '0'; msg.innerText = "Mescolamento..."; let scambi = 0, shuffleInterval = setInterval(() => { if(!gameActive) { clearInterval(shuffleInterval); return; } let a = Math.floor(Math.random() * 3), b = Math.floor(Math.random() * 3); while(a === b) { b = Math.floor(Math.random() * 3); } let temp = statoCoppe[a]; statoCoppe[a] = statoCoppe[b]; statoCoppe[b] = temp; document.getElementById(`cup-${a}`).style.transform = `translateX(calc(-50% + ${posizioniX[statoCoppe[a]]}px))`; document.getElementById(`cup-${b}`).style.transform = `translateX(calc(-50% + ${posizioniX[statoCoppe[b]]}px))`; scambi++; if(scambi > 8 + Math.floor(score/10)) { clearInterval(shuffleInterval); msg.innerText = "Dov'è la moneta?"; canPick = true; } }, 350 - Math.min(200, score * 2)); gameIntervals.push(shuffleInterval); }, 1500)); window.checkCup = function(idx) { if(!gameActive || !canPick) return; canPick = false; const targetCup = document.getElementById(`cup-${idx}`); targetCup.querySelector('.cup-icon').style.transform = 'translateY(-50px)'; if(idx === coinPos) { targetCup.querySelector('.coin-icon').style.opacity = '1'; score += 20; updateHUD(); flashStage('#34d399'); } else { loseLife(); document.getElementById(`cup-${coinPos}`).querySelector('.cup-icon').style.transform = 'translateY(-50px)'; document.getElementById(`cup-${coinPos}`).querySelector('.coin-icon').style.opacity = '1'; } gameTimeouts.push(setTimeout(() => { if(gameActive) initCampanelle(); }, 1500)); } }

function initBevuta() { const stage = document.getElementById('game-stage'); stage.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;"> <div class="glass-bevuta"><div id="liquid-level" class="liquid-level"></div></div> <div style="display:flex; gap:20px;"><button class="btn-action" onclick="drinkTap('L')" style="width:80px; padding:15px; font-size:24px;">👈</button><button class="btn-action" onclick="drinkTap('R')" style="width:80px; padding:15px; font-size:24px;">👉</button></div> </div>`; let lastTap = '', liquid = 100; window.drinkTap = function(side) { if(!gameActive) return; if(side === lastTap) { flashStage('#fbbf24'); liquid = Math.min(100, liquid + 5); document.getElementById('liquid-level').style.height = liquid + '%'; } else { lastTap = side; liquid -= 10; document.getElementById('liquid-level').style.height = liquid + '%'; if(liquid <= 0) { score += 50; updateHUD(); flashStage('#34d399'); liquid = 100; document.getElementById('liquid-level').style.height = liquid + '%'; lastTap = ''; } } }; }

function initEquilibrio() { const stage = document.getElementById('game-stage'); stage.innerHTML = `<div style="position:absolute; top:0; left:0; width:50%; height:100%; z-index:10;" onpointerdown="tilt(-1)" onpointerup="stopTilt()" onpointercancel="stopTilt()"></div> <div style="position:absolute; top:0; left:50%; width:50%; height:100%; z-index:10;" onpointerdown="tilt(1)" onpointerup="stopTilt()" onpointercancel="stopTilt()"></div> <div style="display:flex; justify-content:center; align-items:center; height:100%; width:100%; position:relative;"><div class="balance-bar"><div class="balance-safe"></div><div id="balance-cursor" class="balance-cursor" style="left:50%;"></div></div></div> <div style="position:absolute; bottom:20px; width:100%; text-align:center; color:var(--muted); font-size:12px;">Tieni premuto a Destra o Sinistra</div>`; let pos = 50, drift = 0, userTilt = 0, isStunned = false; const cursor = document.getElementById('balance-cursor'); window.tilt = function(dir) { if(!isStunned) userTilt = dir * 0.8; }; window.stopTilt = function() { userTilt = 0; }; let drifter = setInterval(() => { if(gameActive && !isStunned) drift = (Math.random() - 0.5) * (0.8 + (score * 0.005)); }, 1000); gameIntervals.push(drifter); let tickCount = 0; function balanceLoop() { if(!gameActive) return; if(!isStunned) { pos += drift + userTilt; if(pos >= 35 && pos <= 65) { cursor.style.backgroundColor = 'var(--success)'; tickCount++; if(tickCount % 15 === 0) { score += 2; updateHUD(); } } else { cursor.style.backgroundColor = 'var(--danger)'; } if(pos < 0 || pos > 100) { isStunned = true; cursor.innerText = "💥"; loseLife(); gameTimeouts.push(setTimeout(() => { if(!gameActive) return; pos = 50; drift = 0; userTilt = 0; cursor.innerText = ""; isStunned = false; }, 800)); } cursor.style.left = pos + '%'; } gameAnimationFrames.push(requestAnimationFrame(balanceLoop)); } gameAnimationFrames.push(requestAnimationFrame(balanceLoop)); }


// ==========================================
// NUOVO GIOCO: DADI E BULLONI (A LIVELLI!)
// ==========================================

// I livelli: Ogni array dentro il livello rappresenta un "tubo/bullone".
// I numeri (1,2,3,4) rappresentano il colore del dado.
let dbLevels = [
    // Livello 1: 3 bulloni, 2 colori (il terzo tubo è vuoto per appoggiarci i dadi)
    [[1, 1, 2, 2], [2, 2, 1, 1], []], 
    // Livello 2: 5 bulloni, 3 colori
    [[1, 2, 3, 1], [2, 3, 1, 2], [3, 1, 2, 3], [], []],
    // Livello 3: 6 bulloni, 4 colori
    [[1, 2, 3, 4], [4, 3, 2, 1], [1, 2, 3, 4], [4, 3, 2, 1], [], []],
    // Livello 4: Sfida estrema
    [[1, 2, 3, 4], [2, 3, 4, 1], [3, 4, 1, 2], [4, 1, 2, 3], [], []]
];
let dbCurrentLvlIndex = 0;
let dbTubesState = [];
let dbSelectedTube = -1;

function initDadiBulloni() {
    dbCurrentLvlIndex = 0;
    lives = 3; 
    score = 0;
    updateHUD();
    loadDbLevel();
}

function loadDbLevel() {
    if(dbCurrentLvlIndex >= dbLevels.length) {
        document.getElementById('game-stage').innerHTML = `<h2 style='color:var(--success); text-align:center; padding-top:40px;'>🏆 HAI VINTO TUTTO!</h2>`;
        setTimeout(() => { score += 500; updateHUD(); gameOver(); }, 3000);
        return;
    }
    // Copiamo il livello per non modificare l'originale
    dbTubesState = JSON.parse(JSON.stringify(dbLevels[dbCurrentLvlIndex]));
    dbSelectedTube = -1;
    renderDbTubes();
}

function renderDbTubes() {
    const stage = document.getElementById('game-stage');
    let html = `<div style="text-align:center; color:var(--gold); margin-top:10px; font-weight:bold;">Livello ${dbCurrentLvlIndex + 1}</div>`;
    html += `<div class="db-container">`;
    
    for (let t = 0; t < dbTubesState.length; t++) {
        let isSelected = (dbSelectedTube === t) ? 'db-selected' : '';
        html += `<div class="db-tube ${isSelected}" onclick="clickDbTube(${t})">`;
        
        // Disegniamo i dadi dal basso verso l'alto
        for (let d = 0; d < dbTubesState[t].length; d++) {
            let colorId = dbTubesState[t][d];
            html += `<div class="db-nut db-color-${colorId}"></div>`;
        }
        html += `</div>`;
    }
    html += `</div>`;
    stage.innerHTML = html;
}

window.clickDbTube = function(tIndex) {
    if (!gameActive) return;
    
    // Se non ho selezionato niente e clicco un tubo vuoto, non succede niente
    if (dbSelectedTube === -1 && dbTubesState[tIndex].length === 0) return;

    // Seleziono un tubo da cui prendere il dado
    if (dbSelectedTube === -1) {
        dbSelectedTube = tIndex;
        renderDbTubes();
        return;
    }

    // Se riclicco lo stesso, lo deseleziono
    if (dbSelectedTube === tIndex) {
        dbSelectedTube = -1;
        renderDbTubes();
        return;
    }

    // Provo a spostare il dado dal tubo selezionato al tubo cliccato
    let fromTube = dbTubesState[dbSelectedTube];
    let toTube = dbTubesState[tIndex];
    let nutToMove = fromTube[fromTube.length - 1]; // il dado in cima

    // Controllo se il tubo di destinazione è pieno (max 4)
    if (toTube.length >= 4) {
        flashStage('#ef4444'); // Errore: tubo pieno
        dbSelectedTube = -1;
        renderDbTubes();
        return;
    }

    // Controllo se il colore combacia (oppure se è vuoto)
    if (toTube.length === 0 || toTube[toTube.length - 1] === nutToMove) {
        fromTube.pop(); // Tolgo dal vecchio
        toTube.push(nutToMove); // Metto nel nuovo
        dbSelectedTube = -1;
        score += 5;
        updateHUD();
        renderDbTubes();
        checkDbWin();
    } else {
        flashStage('#ef4444'); // Errore: colore sbagliato
        dbSelectedTube = -1;
        renderDbTubes();
    }
}

function checkDbWin() {
    // Si vince se tutti i tubi sono o completamente vuoti o hanno 4 dadi dello stesso colore
    let win = true;
    for (let t = 0; t < dbTubesState.length; t++) {
        let tube = dbTubesState[t];
        if (tube.length > 0) {
            if (tube.length !== 4) { win = false; break; } // Tubo non pieno
            let firstColor = tube[0];
            for (let d = 1; d < tube.length; d++) {
                if (tube[d] !== firstColor) { win = false; break; } // Colori mischiati
            }
        }
    }

    if (win) {
        dbCurrentLvlIndex++;
        score += 100;
        updateHUD();
        document.getElementById('game-stage').innerHTML = `<h2 style='color:var(--success); text-align:center; padding-top:40px;'>✔️ Livello Superato!</h2>`;
        setTimeout(() => { if(gameActive) loadDbLevel(); }, 1500);
    }
}


// ==========================================
// NUOVO GIOCO: L'IMPICCATO
// ==========================================

let impSecretWord = "";
let impGuessedLetters = [];
let impMistakes = 0;
const IMP_MAX_MISTAKES = 6;

function initImpiccato() {
    const words = ["CASTELLO", "ARGENTO", "TRUPPE", "CAVALIERE", "LANCIA", "BALESTRA", "ALLEANZA", "TAVERNA", "ASSEDIO", "VILLAGGIO", "MERCATO", "FESTIVAL"];
    impSecretWord = words[Math.floor(Math.random() * words.length)];
    impGuessedLetters = [];
    impMistakes = 0;
    lives = 6; // L'impiccato usa la vita per contare gli errori
    updateHUD();
    renderImpiccato();
}

function renderImpiccato() {
    const stage = document.getElementById('game-stage');
    
    // Disegniamo la parola segreta coperta
    let wordHtml = "";
    let isWin = true;
    for (let i = 0; i < impSecretWord.length; i++) {
        let char = impSecretWord[i];
        if (impGuessedLetters.includes(char)) {
            wordHtml += `<span class="imp-letter">${char}</span>`;
        } else {
            wordHtml += `<span class="imp-letter">_</span>`;
            isWin = false;
        }
    }

    // Disegniamo la tastiera a schermo
    const alphabet = "ABCDEFGHILMNOPQRSTUVZ";
    let keysHtml = `<div class="imp-keyboard">`;
    for (let i = 0; i < alphabet.length; i++) {
        let letter = alphabet[i];
        let disabled = impGuessedLetters.includes(letter) ? "disabled" : "";
        keysHtml += `<button class="imp-key" onclick="guessImp('${letter}')" ${disabled}>${letter}</button>`;
    }
    keysHtml += `</div>`;

    // Visualizziamo quanti tentativi mancano
    let attemptsLeft = IMP_MAX_MISTAKES - impMistakes;
    let visualHtml = `<div style="text-align:center; margin-top:10px; font-size:40px;">`;
    if(impMistakes === 0) visualHtml += "😎";
    else if(impMistakes === 1) visualHtml += "😐";
    else if(impMistakes === 2) visualHtml += "😟";
    else if(impMistakes === 3) visualHtml += "😨";
    else if(impMistakes === 4) visualHtml += "😰";
    else if(impMistakes === 5) visualHtml += "😱";
    else visualHtml += "💀";
    visualHtml += `</div><div style="text-align:center; color:var(--danger); font-size:12px;">Errori concessi: ${attemptsLeft}</div>`;

    stage.innerHTML = visualHtml + `<div class="imp-word-container">${wordHtml}</div>` + keysHtml;

    if (isWin) {
        score += 100;
        updateHUD();
        document.getElementById('game-stage').innerHTML = `<h2 style='color:var(--success); text-align:center; padding-top:40px;'>✔️ PAROLA INDOVINATA!<br><br>${impSecretWord}</h2>`;
        setTimeout(() => { if(gameActive) initImpiccato(); }, 2000);
    }
}

window.guessImp = function(letter) {
    if (!gameActive) return;
    
    impGuessedLetters.push(letter);
    
    if (impSecretWord.includes(letter)) {
        // Lettera giusta
        score += 10;
        flashStage('#34d399');
    } else {
        // Lettera sbagliata
        impMistakes++;
        loseLife(); // scala un cuore dalla HUD in alto
        flashStage('#ef4444');
    }
    
    if (gameActive) { // se non è andato in Game Over perdendo l'ultima vita
        renderImpiccato();
    } else {
        // Se ha perso
        document.getElementById('game-stage').innerHTML = `<h2 style='color:var(--danger); text-align:center; padding-top:40px;'>💀 IMPICCATO!<br><br>La parola era: ${impSecretWord}</h2>`;
    }
    updateHUD();
}
