// --- 0. ESECUZIONE SINCRONA STRUTTURALE (PRE-RENDER) ---
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-keystore');
}

if (isPWA() && !sessionStorage.getItem('repanza_intro_shown')) {
    document.write('<style id="rp-structural-hide">body { opacity: 0 !important; visibility: hidden !important; background: #000 !important; pointer-events: none !important; }</style>');
}

// --- 1. CONFIGURAZIONE GLOBALE ---
const ASSETS_CONFIG = {
    introImg: '/re%20panza%20intro.png',
    paypalUrl: 'https://paypal.me/Longo11',
    introDuration: 4000,    
    socialBarCooldown: 120000 // 2 MINUTI IN MILLISECONDI
};

// --- 2. UTILITY GLOBALI ---
window.escapeHTML = function(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

function showToast(msg) {
    const ex = document.querySelector('.toast'); 
    if (ex) ex.remove();
    let t = document.createElement("div"); 
    t.className = "toast"; 
    t.textContent = msg; 
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

function pad(n) { return n < 10 ? '0' + n : n; }

window.parseLK = function(link) {
    if (!link) return null;
    let cMatch = link.match(/coordinates\?(\d+),(\d+)&(\d+)/);
    if (cMatch) return { x: parseInt(cMatch[1]), y: parseInt(cMatch[2]), w: cMatch[3] };
    let pMatch = link.match(/player\?([^&]+)&(\d+)/);
    if (pMatch) return { p: pMatch[1], w: pMatch[2] };
    let aMatch = link.match(/alliance\?([^&]+)&(\d+)/);
    if (aMatch) return { a: aMatch[1], w: aMatch[2] };
    return null;
};

window.getDist = function(x1, y1, x2, y2) {
    let q1 = x1 - Math.floor(y1 / 2), r1 = y1;
    let q2 = x2 - Math.floor(y2 / 2), r2 = y2;
    return Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs((q1 + r1) - (q2 + r2)));
};

window.getHabitatInfo = function(t) {
    const s = String(t).trim();
    if (s === "0") return { type: 'castello', label: 'Castello', icon: '🏰' };
    if (s === "2") return { type: 'fortezza', label: 'Fortezza', icon: '🛡️' };
    if (s === "4") return { type: 'citta', label: 'Città', icon: '🏙️' };
    if (s === "6") return { type: 'metropoli', label: 'Metropoli', icon: '👑' }; 
    const map = { 'castello': { type: 'castello', label: 'Castello', icon: '🏰' }, 'fortezza': { type: 'fortezza', label: 'Fortezza', icon: '🛡️' }, 'citta': { type: 'citta', label: 'Città', icon: '🏙️' }, 'metropoli': { type: 'metropoli', label: 'Metropoli', icon: '👑' }, 'metro': { type: 'metropoli', label: 'Metropoli', icon: '👑' }, 'libero': { type: 'libero', label: 'Libero', icon: '⚪' } };
    return map[s.toLowerCase()] || map['castello'];
};

// --- 3. INIEZIONE GLOBALE UI ---
function injectGlobalUI() {
    const targetDiv = document.querySelector('.container, .wrap, .wrapper') || document.body;
    const footer = document.createElement('footer');
    footer.className = 'repanza-global-footer';
    const year = new Date().getFullYear();
    
    footer.innerHTML = `
        <p data-lang="footer_like" class="footer-like-text">Ti piace questo strumento?</p>
        <a href="${ASSETS_CONFIG.paypalUrl}" target="_blank" class="repanza-paypal-link" data-lang="footer_coffee">☕ Offrimi un caffè su PayPal</a>
        <div class="repanza-copyright">
            <strong>&copy; ${year} L&K Tools</strong><br>
            <div class="footer-dev-scroll">
                <span data-lang="footer_dev">Sviluppato da Re Panza (Server Regioni Ita VI & Ita 15)</span>
            </div>
            <span data-lang="footer_rights">Tutti i diritti riservati.</span>
        </div>
    `;
    targetDiv.appendChild(footer);

    const lastSocialBarTime = parseInt(localStorage.getItem('repanza_last_social_bar_time') || 0);
    const now = Date.now();
    const timeDiff = now - lastSocialBarTime;

    if (timeDiff >= ASSETS_CONFIG.socialBarCooldown) {
        const socialBarScript = document.createElement('script');
        socialBarScript.src = "https://pl28876001.effectivegatecpm.com/ea/91/f7/ea91f7d139a04d3efb4b29952e7d57c6.js";
        socialBarScript.async = true;
        document.body.appendChild(socialBarScript);
        localStorage.setItem('repanza_last_social_bar_time', now.toString());
        console.log("🟢 [Adsterra] Social Bar caricata!");
    } else {
        const secondiMancanti = Math.round((ASSETS_CONFIG.socialBarCooldown - timeDiff) / 1000);
        console.log(`🟡 [Adsterra] Social Bar in pausa. Mancano ${secondiMancanti} secondi prima di rivederla.`);
    }

    requestAnimationFrame(() => { setTimeout(() => { footer.classList.add('show-footer'); }, 150); });
    setTimeout(() => { if (typeof cambiaLinguaSito === 'function') cambiaLinguaSito(localStorage.getItem('lingua_scelta') || 'it'); }, 50);
}

// --- 4. LOGICA INTRO, TOUR E FAQ ---
function runIntro() {
    const hideStyle = document.getElementById('rp-structural-hide');
    if (!isPWA() || sessionStorage.getItem('repanza_intro_shown')) {
        if (hideStyle) hideStyle.remove();
        document.body.style.opacity = '1'; document.body.style.visibility = 'visible'; document.body.style.pointerEvents = 'auto';
        return;
    }
    
    const intro = document.createElement('div');
    intro.id = 'repanza-intro-overlay';
    
    intro.innerHTML = `
        <div class="intro-container">
            <img src="${ASSETS_CONFIG.introImg}" class="intro-bg">
            <div class="intro-content">
                <div data-lang="intro_loading" class="intro-text">CARICAMENTO...</div>
                <div class="intro-bar-bg">
                    <div id="intro-bar" style="transition: width ${ASSETS_CONFIG.introDuration/1000}s linear;"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(intro);
    if (hideStyle) hideStyle.remove();
    document.body.style.opacity = '1'; document.body.style.visibility = 'visible'; document.body.style.pointerEvents = 'auto';
    setTimeout(() => { if (typeof cambiaLinguaSito === 'function') cambiaLinguaSito(localStorage.getItem('lingua_scelta') || 'it'); }, 50);
    requestAnimationFrame(() => { setTimeout(() => { const b = document.getElementById('intro-bar'); if (b) b.style.width = '100%'; }, 100); });
    setTimeout(() => { intro.style.opacity = '0'; setTimeout(() => { intro.remove(); sessionStorage.setItem('repanza_intro_shown', 'true'); }, 500); }, ASSETS_CONFIG.introDuration);
}

window.RePanzaTour = { 
    steps: [], currentIndex: 0, toolId: '', activeElement: null, 
    start: function(toolId, steps, force = false) { 
        if (!force && localStorage.getItem('tour_seen_' + toolId)) return; 
        this.toolId = toolId; this.steps = steps; this.currentIndex = 0; 
        this.createUI(); document.body.classList.add('rp-tour-active'); 
        this.showStep(0); 
    }, 
    createUI: function() { 
        if (document.getElementById('rp-tour-overlay')) return; 
        const overlay = document.createElement('div'); 
        overlay.id = 'rp-tour-overlay'; document.body.appendChild(overlay); 
        const panel = document.createElement('div'); 
        panel.id = 'rp-tour-panel'; 
        
        panel.innerHTML = `<img src="/re-panza-ai.png" id="rp-tour-mascot"><div class="rp-tour-content"><div id="rp-tour-text">...</div><div class="rp-tour-btns"><button class="rp-btn-skip" onclick="RePanzaTour.close()" data-lang="tour_skip">Salta</button><button class="rp-btn-next" onclick="RePanzaTour.next()" data-lang="tour_next">Avanti</button></div></div>`; 
        document.body.appendChild(panel); 
        setTimeout(() => { if (typeof cambiaLinguaSito === 'function') cambiaLinguaSito(localStorage.getItem('lingua_scelta') || 'it'); }, 50);
    }, 
    showStep: function(index) { 
        if (this.activeElement) this.activeElement.classList.remove('rp-tour-highlight'); 
        if (index >= this.steps.length) { this.close(); return; } 
        const step = this.steps[index]; 
        const el = document.querySelector(step.selector); 
        if (el) { 
            el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
            setTimeout(() => { el.classList.add('rp-tour-highlight'); this.activeElement = el; }, 300); 
        } 
        document.getElementById('rp-tour-overlay').style.display = 'block'; 
        document.getElementById('rp-tour-panel').style.display = 'flex'; 
        const l = localStorage.getItem('lingua_scelta') || 'it'; 
        document.getElementById('rp-tour-text').innerHTML = (typeof step.text === 'object') ? step.text[l] : step.text; 
    }, 
    next: function() { this.currentIndex++; this.showStep(this.currentIndex); }, 
    close: function() { 
        if (this.activeElement) this.activeElement.classList.remove('rp-tour-highlight'); 
        document.getElementById('rp-tour-overlay').style.display = 'none'; 
        document.getElementById('rp-tour-panel').style.display = 'none'; 
        localStorage.setItem('tour_seen_' + this.toolId, 'true'); 
    } 
};

window.createFaqMenu = function() { 
    if (document.getElementById('global-faq-dropdown')) return; 
    
    window.toggleFaqMenu = function(e) { 
        e.stopPropagation(); 
        let menu = e.currentTarget.parentElement.querySelector('#global-faq-dropdown'); 
        if (!menu) { 
            menu = document.createElement('div'); 
            menu.id = 'global-faq-dropdown'; 
            menu.className = 'faq-dropdown'; 
            menu.innerHTML = `<button onclick="window.startToolTutorial(true);" data-lang="nav_tutorial">🎬 Tutorial</button><a href="/faq.html" data-lang="nav_faq_link">📖 F.A.Q.</a>`; 
            e.currentTarget.parentElement.appendChild(menu); 
            setTimeout(() => { if (typeof cambiaLinguaSito === 'function') cambiaLinguaSito(localStorage.getItem('lingua_scelta') || 'it'); }, 50);
        } 
        menu.classList.toggle('show'); 
    }; 
    
    document.addEventListener('click', () => { 
        const m = document.getElementById('global-faq-dropdown'); 
        if (m) m.classList.remove('show'); 
    }); 
};

function processPendingUrl() { 
    const p = sessionStorage.getItem('repanza_pending_url'); 
    if (!p) return; 
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') { 
        sessionStorage.removeItem('repanza_pending_url'); 
        window.location.replace(p); 
    } 
}

document.addEventListener('DOMContentLoaded', () => { 
    processPendingUrl(); 
    runIntro(); 
    injectGlobalUI(); 
    createFaqMenu(); 
    if (isPWA()) initUpdateEngine(); 
});

if ('serviceWorker' in navigator) { 
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); }); 
}

function initUpdateEngine() { /* ... Logica Updater ... */ }