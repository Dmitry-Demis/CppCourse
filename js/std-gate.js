
/**
 * std-gate.js — управление платным контентом (gated slots)
 *
 * Ищет <div data-slot="N" data-std="NN"> на странице,
 * запрашивает статус покупки с бэкенда и либо показывает
 * заглушку с кнопкой покупки, либо загружает контент.
 */

(function () {
    'use strict';

    const API = '/api';

    /** Определяем page из URL: /theory/chapter-2/fundamental-types/signed-unsigned.html → chapter-2/fundamental-types/signed-unsigned */
    function getPageId() {
        const path = window.location.pathname.replace(/\.html$/, '');
        const match = path.match(/\/theory\/(.+)$/);
        return match ? match[1] : null;
    }

    function getIsu() {
        // Читаем только для передачи в X-Isu-Number заголовок.
        // Вся проверка доступа — на бэкенде через таблицу UserPurchases.
        try {
            const user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
            return user?.isuNumber || null;
        } catch { return null; }
    }

    /** Рендерит заглушку для незакупленного слота в строке таблицы */
    function renderTableRowGate(tr, slotInfo) {
        var std = slotInfo.std;
        var el  = getElement(std);
        var cols = tr.querySelectorAll('td').length || 5;
        var isu  = getIsu();
        var locked = isu && !slotInfo.stdUnlocked;

        tr.innerHTML = '<td colspan="' + cols + '" style="text-align:center;padding:0.6rem 1rem;">' +
            '<span style="display:inline-flex;align-items:center;gap:0.5rem;' +
                'background:color-mix(in srgb,' + el.color + ' 8%,transparent);' +
                'border:1px dashed color-mix(in srgb,' + el.color + ' 30%,transparent);' +
                'border-radius:8px;padding:0.4rem 1rem;font-size:0.8rem;color:' + el.color + ';">' +
                '🔒 <span style="opacity:0.7">long long</span>' +
                '<span style="background:color-mix(in srgb,' + el.color + ' 15%,transparent);' +
                    'border:1px solid color-mix(in srgb,' + el.color + ' 30%,transparent);' +
                    'border-radius:4px;padding:1px 6px;font-size:0.65rem;font-weight:700;">C++' + std + '</span>' +
                (locked
                    ? '<span style="opacity:0.5;font-size:0.75rem;">Требуется C++' + std + '</span>'
                    : '<button onclick="stdGatePurchase(this)" ' +
                        'data-slot="' + slotInfo.slot + '" data-std="' + std + '" ' +
                        'style="background:color-mix(in srgb,' + el.color + ' 15%,transparent);' +
                            'border:1px solid color-mix(in srgb,' + el.color + ' 40%,transparent);' +
                            'color:' + el.color + ';border-radius:6px;padding:2px 10px;' +
                            'cursor:pointer;font-size:0.75rem;font-weight:600;">' +
                        'Разблокировать</button>') +
            '</span>' +
        '</td>';
        tr.dataset.gated = '1';
    }

    /** Показывает разблокированную строку таблицы */
    function revealTableRow(tr, html) {
        var std = tr.dataset.std;
        var el  = getElement(std);
        // Парсим HTML секции и берём первый <tr> из неё
        var tmp = document.createElement('table');
        tmp.innerHTML = '<tbody>' + html + '</tbody>';
        var newTr = tmp.querySelector('tr');
        if (newTr) {
            // Анимация: подсветка строки цветом стихии
            newTr.style.background = 'color-mix(in srgb,' + el.color + ' 12%,transparent)';
            newTr.style.transition = 'background 1s ease';
            tr.replaceWith(newTr);
            setTimeout(function() { newTr.style.background = ''; }, 1000);
            if (window.Prism) Prism.highlightAllUnder(newTr);
        }
    }
        const { slot, std, costCoins, costKeys, stdUnlocked, itemId } = slotInfo;

        const costParts = [];
        if (costCoins > 0) costParts.push('🪙 ' + costCoins.toLocaleString('ru'));
        if (costKeys  > 0) costParts.push('🗝️ ' + costKeys);
        const costText = costParts.length ? costParts.join(' + ') : 'S O O N';

        // Блокируем кнопку только если точно знаем что стандарт не куплен И пользователь авторизован
        const isu = getIsu();
        const locked = isu && !stdUnlocked;
        const btnDisabled = locked ? 'disabled' : '';
        const btnTitle = locked
            ? 'Сначала разблокируйте стандарт C++' + std + ' в магазине'
            : 'Купить за ' + costText;

        el.innerHTML =
            '<div class="std-gate" data-item-id="' + itemId + '" data-slot="' + slot + '" data-std="' + std + '">' +
                '<div class="std-gate__glass"></div>' +
                '<div class="std-gate__inner">' +
                    '<span class="std-gate__badge">C++' + std + '</span>' +
                    '<span class="std-gate__lock">🔒</span>' +
                    '<p class="std-gate__desc">Этот раздел доступен после покупки</p>' +
                    '<span class="std-gate__cost">' + costText + '</span>' +
                    '<button class="std-gate__btn" ' + btnDisabled + ' title="' + btnTitle + '" onclick="stdGatePurchase(this)">' +
                        (locked ? '🔒 Требуется C++' + std : 'Разблокировать') +
                    '</button>' +
                '</div>' +
            '</div>';
    }

    // ── Конфиг стихий ────────────────────────────────────────────────────────
    var ELEMENTS = {
        '11': { name: 'lightning', color: '#facc15', colorDim: '#713f12', flash: 'rgba(250,204,21,0.4)',  shake: true  },
        '14': { name: 'water',     color: '#38bdf8', colorDim: '#0c4a6e', flash: 'rgba(56,189,248,0.35)', shake: false },
        '17': { name: 'air',       color: '#e2e8f0', colorDim: '#334155', flash: 'rgba(226,232,240,0.25)',shake: false },
        '20': { name: 'fire',      color: '#f97316', colorDim: '#7c2d12', flash: 'rgba(249,115,22,0.45)', shake: true  },
        '23': { name: 'earth',     color: '#84cc16', colorDim: '#1a2e05', flash: 'rgba(132,204,22,0.35)', shake: true  },
    };

    function getElement(std) {
        return ELEMENTS[std] || ELEMENTS['20'];
    }

    // ── Дверь + ключ + стихия ─────────────────────────────────────────────────
    function revealContent(gateEl, html) {
        var wrapper = gateEl.closest('[data-slot][data-std]') || gateEl;
        var std = gateEl.dataset.std || '20';
        var el  = getElement(std);

        // CSS-переменные для цвета стихии
        document.documentElement.style.setProperty('--el-color',     el.color);
        document.documentElement.style.setProperty('--el-color-dim', el.colorDim);

        // 1. Заряд блока
        gateEl.classList.add('std-gate--charging');

        setTimeout(function () {
            // 2. Дверь
            var door = document.createElement('div');
            door.className = 'sg-door-overlay';
            door.innerHTML = '<div class="sg-door-left"></div><div class="sg-door-right"></div>';
            document.body.appendChild(door);

            // 3. Замочная скважина
            var keyhole = document.createElement('div');
            keyhole.className = 'sg-keyhole';
            keyhole.innerHTML = buildKeyholesvg(el.color);
            document.body.appendChild(keyhole);

            // 4. Ключ
            var keyWrap = document.createElement('div');
            keyWrap.className = 'sg-key-wrap';
            keyWrap.innerHTML = buildKeySvg(el.color, el.colorDim);
            document.body.appendChild(keyWrap);

            // 5. Canvas для стихии
            var canvas = document.createElement('canvas');
            canvas.id = 'sg-element-canvas';
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            document.body.appendChild(canvas);

            // 6. Вспышка стихии
            var flash = document.createElement('div');
            flash.className = 'sg-element-flash';
            flash.style.background = 'radial-gradient(ellipse at center, ' + el.flash + ' 0%, transparent 70%)';
            flash.style.setProperty('--flash-delay', '1.5s');
            document.body.appendChild(flash);

            // Запускаем анимацию стихии на canvas
            setTimeout(function () {
                canvas.classList.add('sg-canvas--active');
                runElementAnimation(canvas, el.name, el.color);
            }, 900);

            // Свечение скважины при вставке ключа
            setTimeout(function () {
                keyhole.classList.add('sg-keyhole--glowing');
            }, 950);

            // Shake
            if (el.shake) {
                setTimeout(function () {
                    document.body.classList.add('sg-shake');
                    document.body.addEventListener('animationend', function onEnd(e) {
                        if (e.animationName === 'pageShake') {
                            document.body.classList.remove('sg-shake');
                            document.body.removeEventListener('animationend', onEnd);
                        }
                    });
                }, 1400);
            }

            // Открываем дверь
            setTimeout(function () {
                door.classList.add('sg-door--open');
            }, 1600);

            // Показываем контент, убираем всё
            setTimeout(function () {
                [door, keyhole, keyWrap, canvas, flash].forEach(function(n) {
                    if (n.parentNode) n.parentNode.removeChild(n);
                });
                gateEl.classList.add('std-gate--dissolve');
                setTimeout(function () {
                    var reveal = document.createElement('div');
                    reveal.className = 'std-gate__reveal';
                    reveal.innerHTML = html;
                    wrapper.replaceWith(reveal);
                    reveal.getBoundingClientRect();
                    reveal.classList.add('std-gate__reveal--visible');
                    if (window.Prism) Prism.highlightAllUnder(reveal);
                    reveal.querySelectorAll('.code-block[data-example]').forEach(function(b) {
                        new CppCompiler(b).init();
                    });
                }, 380);
            }, 2350);

        }, 300);
    }

    // ── SVG замочной скважины ─────────────────────────────────────────────────
    function buildKeyholesvg(color) {
        return '<svg width="80" height="110" viewBox="0 0 80 110">' +
            '<circle cx="40" cy="32" r="28" fill="none" stroke="' + color + '" stroke-width="4"/>' +
            '<circle cx="40" cy="32" r="14" fill="' + color + '" opacity="0.25"/>' +
            '<polygon points="28,58 52,58 46,100 34,100" fill="none" stroke="' + color + '" stroke-width="4" stroke-linejoin="round"/>' +
            '<line x1="40" y1="18" x2="40" y2="46" stroke="' + color + '" stroke-width="3" opacity="0.6"/>' +
        '</svg>';
    }

    // ── HTML ключа ────────────────────────────────────────────────────────────
    function buildKeySvg(color, colorDim) {
        return '<div class="sg-key" style="--el-color:' + color + ';--el-color-dim:' + colorDim + '">' +
            '<div class="sg-key__bow"></div>' +
            '<div class="sg-key__shaft"></div>' +
            '<div class="sg-key__teeth">' +
                '<div class="sg-key__tooth"></div>' +
                '<div class="sg-key__tooth"></div>' +
                '<div class="sg-key__tooth"></div>' +
            '</div>' +
        '</div>';
    }

    // ── Canvas анимации стихий ────────────────────────────────────────────────
    function runElementAnimation(canvas, element, color) {
        var ctx = canvas.getContext('2d');
        var W = canvas.width, H = canvas.height;
        var frame = 0, raf;

        function stop() { cancelAnimationFrame(raf); }

        if (element === 'lightning') {
            // Молния: разряды из центра
            var bolts = [];
            function newBolt() {
                var angle = Math.random() * Math.PI * 2;
                var pts = [[W/2, H/2]];
                var x = W/2, y = H/2;
                for (var s = 0; s < 10; s++) {
                    angle += (Math.random() - 0.5) * 1.4;
                    x += Math.cos(angle) * (40 + Math.random() * 60);
                    y += Math.sin(angle) * (40 + Math.random() * 60);
                    pts.push([x, y]);
                }
                return { pts: pts, life: 0, maxLife: 8 + Math.random() * 12 };
            }
            for (var b = 0; b < 6; b++) bolts.push(newBolt());

            (function loop() {
                ctx.clearRect(0, 0, W, H);
                bolts.forEach(function(bolt) {
                    var alpha = 1 - bolt.life / bolt.maxLife;
                    ctx.beginPath();
                    ctx.moveTo(bolt.pts[0][0], bolt.pts[0][1]);
                    for (var p = 1; p < bolt.pts.length; p++) ctx.lineTo(bolt.pts[p][0], bolt.pts[p][1]);
                    ctx.strokeStyle = 'rgba(250,204,21,' + alpha + ')';
                    ctx.lineWidth = 2 + (1 - alpha) * 2;
                    ctx.shadowColor = '#facc15';
                    ctx.shadowBlur = 20;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    bolt.life++;
                    if (bolt.life >= bolt.maxLife) Object.assign(bolt, newBolt());
                });
                frame++;
                if (frame < 90) raf = requestAnimationFrame(loop);
                else stop();
            })();

        } else if (element === 'fire') {
            // Огонь: частицы снизу вверх
            var particles = [];
            for (var i = 0; i < 120; i++) particles.push(newFireParticle(W, H));

            function newFireParticle(W, H) {
                return {
                    x: Math.random() * W,
                    y: H + Math.random() * 100,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -(2 + Math.random() * 5),
                    r: 4 + Math.random() * 18,
                    life: 0, maxLife: 40 + Math.random() * 60,
                    hue: 10 + Math.random() * 40
                };
            }
            (function loop() {
                ctx.clearRect(0, 0, W, H);
                particles.forEach(function(p) {
                    p.x += p.vx + Math.sin(frame * 0.05 + p.y * 0.01) * 0.8;
                    p.y += p.vy;
                    p.vy -= 0.05;
                    p.life++;
                    var t = p.life / p.maxLife;
                    var alpha = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
                    ctx.beginPath();
                    var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (1 - t * 0.5));
                    grad.addColorStop(0, 'hsla(' + p.hue + ',100%,90%,' + alpha + ')');
                    grad.addColorStop(0.4, 'hsla(' + p.hue + ',100%,55%,' + (alpha * 0.8) + ')');
                    grad.addColorStop(1, 'hsla(' + (p.hue + 20) + ',80%,30%,0)');
                    ctx.fillStyle = grad;
                    ctx.arc(p.x, p.y, p.r * (1 - t * 0.4), 0, Math.PI * 2);
                    ctx.fill();
                    if (p.life >= p.maxLife) Object.assign(p, newFireParticle(W, H));
                });
                frame++;
                if (frame < 90) raf = requestAnimationFrame(loop);
                else stop();
            })();

        } else if (element === 'water') {
            // Вода: волны
            var waves = [
                { amp: 60, freq: 0.012, speed: 0.04, y: H * 0.5, color: 'rgba(56,189,248,0.35)' },
                { amp: 40, freq: 0.018, speed: 0.06, y: H * 0.55, color: 'rgba(14,165,233,0.3)' },
                { amp: 30, freq: 0.025, speed: 0.08, y: H * 0.6,  color: 'rgba(2,132,199,0.25)' },
            ];
            (function loop() {
                ctx.clearRect(0, 0, W, H);
                waves.forEach(function(w) {
                    ctx.beginPath();
                    ctx.moveTo(0, H);
                    for (var x = 0; x <= W; x += 4) {
                        var y = w.y + Math.sin(x * w.freq + frame * w.speed) * w.amp
                                    + Math.sin(x * w.freq * 1.7 + frame * w.speed * 0.7) * (w.amp * 0.4);
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(W, H); ctx.lineTo(0, H);
                    ctx.closePath();
                    ctx.fillStyle = w.color;
                    ctx.fill();
                });
                // Брызги
                if (frame % 4 === 0) {
                    for (var s = 0; s < 3; s++) {
                        var sx = Math.random() * W;
                        var sy = waves[0].y + Math.sin(sx * waves[0].freq + frame * waves[0].speed) * waves[0].amp;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 2 + Math.random() * 4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(186,230,253,0.7)';
                        ctx.fill();
                    }
                }
                frame++;
                if (frame < 90) raf = requestAnimationFrame(loop);
                else stop();
            })();

        } else if (element === 'air') {
            // Воздух: вихри и частицы
            var airParts = [];
            for (var a = 0; a < 80; a++) {
                airParts.push({ angle: Math.random() * Math.PI * 2, r: 50 + Math.random() * 300,
                    speed: (0.02 + Math.random() * 0.05) * (Math.random() > 0.5 ? 1 : -1),
                    cx: W / 2, cy: H / 2, size: 1 + Math.random() * 3, alpha: 0.3 + Math.random() * 0.5 });
            }
            (function loop() {
                ctx.clearRect(0, 0, W, H);
                airParts.forEach(function(p) {
                    p.angle += p.speed;
                    p.r += Math.sin(frame * 0.03 + p.angle) * 0.5;
                    var x = p.cx + Math.cos(p.angle) * p.r;
                    var y = p.cy + Math.sin(p.angle) * p.r * 0.4;
                    ctx.beginPath();
                    ctx.arc(x, y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(226,232,240,' + (p.alpha * (1 - frame / 90)) + ')';
                    ctx.fill();
                });
                // Линии вихря
                ctx.save();
                ctx.translate(W / 2, H / 2);
                ctx.rotate(frame * 0.015);
                for (var l = 0; l < 6; l++) {
                    ctx.rotate(Math.PI / 3);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(100, -80, 200, 80, 350, 0);
                    ctx.strokeStyle = 'rgba(226,232,240,' + (0.15 * (1 - frame / 90)) + ')';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                ctx.restore();
                frame++;
                if (frame < 90) raf = requestAnimationFrame(loop);
                else stop();
            })();

        } else if (element === 'earth') {
            // Земля: трещины + камни
            var cracks = [];
            for (var c = 0; c < 8; c++) {
                cracks.push(buildCrack(W / 2 + (Math.random() - 0.5) * 100,
                                       H / 2 + (Math.random() - 0.5) * 60, 12));
            }
            var rocks = [];
            (function loop() {
                ctx.clearRect(0, 0, W, H);
                var progress = frame / 60;

                // Трещины
                cracks.forEach(function(crack) {
                    var pts = Math.floor(crack.length * Math.min(progress * 2, 1));
                    if (pts < 2) return;
                    ctx.beginPath();
                    ctx.moveTo(crack.points[0][0], crack.points[0][1]);
                    for (var i = 1; i < pts; i++) ctx.lineTo(crack.points[i][0], crack.points[i][1]);
                    ctx.strokeStyle = 'rgba(132,204,22,0.8)';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#84cc16';
                    ctx.shadowBlur = 10;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                });

                // Камни вылетают
                if (frame === 20) {
                    for (var r = 0; r < 20; r++) {
                        rocks.push({ x: W/2 + (Math.random()-0.5)*200, y: H/2 + (Math.random()-0.5)*100,
                            vx: (Math.random()-0.5)*12, vy: -(4+Math.random()*10),
                            size: 4+Math.random()*14, rot: Math.random()*Math.PI*2, vrot: (Math.random()-0.5)*0.3 });
                    }
                }
                rocks.forEach(function(r) {
                    r.x += r.vx; r.y += r.vy; r.vy += 0.4; r.rot += r.vrot;
                    ctx.save();
                    ctx.translate(r.x, r.y);
                    ctx.rotate(r.rot);
                    ctx.fillStyle = 'rgba(101,163,13,0.7)';
                    ctx.strokeStyle = '#84cc16';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.rect(-r.size/2, -r.size/2, r.size, r.size * 0.7);
                    ctx.fill(); ctx.stroke();
                    ctx.restore();
                });

                frame++;
                if (frame < 90) raf = requestAnimationFrame(loop);
                else stop();
            })();
        }
    }

    function buildCrack(x, y, depth) {
        var pts = [[x, y]];
        var angle = Math.random() * Math.PI * 2;
        for (var i = 0; i < depth; i++) {
            angle += (Math.random() - 0.5) * 1.2;
            var len = 30 + Math.random() * 60;
            x += Math.cos(angle) * len;
            y += Math.sin(angle) * len * 0.5;
            pts.push([x, y]);
        }
        return { points: pts, length: pts.length };
    }

    /** Загружает купленный контент в строку таблицы */
    async function loadContentIntoRow(tr, page, slot, std) {
        var isu = getIsu();
        if (!isu) return;
        try {
            var res = await fetch(
                API + '/gated/content?page=' + encodeURIComponent(page) +
                      '&slot=' + encodeURIComponent(slot) +
                      '&std='  + encodeURIComponent(std),
                { headers: { 'X-Isu-Number': isu } }
            );
            if (!res.ok) return;
            var html = await res.text();
            var tmp = document.createElement('table');
            tmp.innerHTML = '<tbody>' + html + '</tbody>';
            var newTr = tmp.querySelector('tr');
            if (newTr) { tr.replaceWith(newTr); if (window.Prism) Prism.highlightAllUnder(newTr); }
        } catch (e) { console.error('std-gate: ошибка загрузки строки', e); }
    }

    /** Загружает и показывает уже купленный контент */
    async function loadContent(el, page, slot, std) {
        var isu = getIsu();
        if (!isu) return;
        try {
            var res = await fetch(
                API + '/gated/content?page=' + encodeURIComponent(page) +
                      '&slot=' + encodeURIComponent(slot) +
                      '&std='  + encodeURIComponent(std),
                { headers: { 'X-Isu-Number': isu } }
            );
            if (!res.ok) return;
            var html = await res.text();
            var reveal = document.createElement('div');
            reveal.className = 'std-gate__reveal std-gate__reveal--visible';
            reveal.innerHTML = html;
            el.replaceWith(reveal);
            if (window.Prism) Prism.highlightAllUnder(reveal);
            reveal.querySelectorAll('.code-block[data-example]').forEach(function(b) {
                new CppCompiler(b).init();
            });
        } catch (e) {
            console.error('std-gate: ошибка загрузки контента', e);
        }
    }

    /** Глобальная функция — вызывается из onclick кнопки */
    window.stdGatePurchase = async function (btn) {
        // Кнопка может быть внутри .std-gate (блок) или прямо в <tr> (строка таблицы)
        var gate = btn.closest('.std-gate');
        var tr   = !gate ? btn.closest('tr[data-slot]') : null;

        var slot = gate ? gate.dataset.slot : (tr ? tr.dataset.slot : btn.dataset.slot);
        var std  = gate ? gate.dataset.std  : (tr ? tr.dataset.std  : btn.dataset.std);
        var page = getPageId();
        var isu  = getIsu();

        if (!isu) {
            alert('Войдите в аккаунт, чтобы покупать контент');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Покупка...';

        try {
            var res = await fetch(API + '/gated/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Isu-Number': isu
                },
                body: JSON.stringify({ page: page, slot: slot, std: std })
            });

            var data = await res.json();

            if (!res.ok) {
                btn.disabled = false;
                btn.textContent = 'Разблокировать';
                alert(data.message || 'Ошибка покупки');
                return;
            }

            document.dispatchEvent(new CustomEvent('coinsUpdated', { detail: { coins: data.coins, keys: data.keys } }));

            var contentRes = await fetch(
                API + '/gated/content?page=' + encodeURIComponent(page) +
                      '&slot=' + encodeURIComponent(slot) +
                      '&std='  + encodeURIComponent(std),
                { headers: { 'X-Isu-Number': isu } }
            );
            if (contentRes.ok) {
                var html = await contentRes.text();
                if (tr) {
                    revealTableRow(tr, html);
                } else {
                    revealContent(gate, html);
                }
            }
        } catch (e) {
            console.error('std-gate: ошибка покупки', e);
            btn.disabled = false;
            btn.textContent = 'Разблокировать';
        }
    };

    async function init() {
        var slots = document.querySelectorAll('[data-slot][data-std]');
        console.log('std-gate: найдено элементов с data-slot:', slots.length, Array.from(slots).map(function(e){ return e.tagName + '[' + e.dataset.slot + ':' + e.dataset.std + ']'; }));
        if (!slots.length) return;

        var page = getPageId();
        if (!page) { console.warn('std-gate: не удалось определить page из URL', window.location.pathname); return; }

        var isu = getIsu();
        var slotMap = {};

        try {
            var headers = isu ? { 'X-Isu-Number': isu } : {};
            var res = await fetch(API + '/gated/slots?page=' + encodeURIComponent(page), { headers: headers });
            if (res.ok) {
                var items = await res.json();
                console.log('std-gate: слоты для страницы "' + page + '"', items);
                for (var i = 0; i < items.length; i++) {
                    slotMap[items[i].slot + ':' + items[i].std] = items[i];
                }
            } else {
                console.warn('std-gate: /api/gated/slots вернул', res.status);
            }
        } catch (e) {
            console.error('std-gate: ошибка загрузки слотов', e);
        }

        for (var j = 0; j < slots.length; j++) {
            var el   = slots[j];
            var slot = el.getAttribute('data-slot');
            var std  = el.getAttribute('data-std');
            var info = slotMap[slot + ':' + std];
            var isTr = el.tagName === 'TR';

            if (!info) {
                var fallback = { slot: slot, std: std, costCoins: 0, costKeys: 0, stdUnlocked: false,
                    itemId: 'content:' + page + ':' + slot + ':' + std };
                if (isTr) renderTableRowGate(el, fallback);
                else renderGate(el, fallback);
                continue;
            }

            if (info.purchased) {
                if (isTr) {
                    await loadContentIntoRow(el, page, slot, std);
                } else {
                    await loadContent(el, page, slot, std);
                }
            } else {
                if (isTr) renderTableRowGate(el, info);
                else renderGate(el, info);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
