
/**
 * std-gate.js — управление платным контентом (gated slots)
 */
(function () {
    'use strict';

    var API = '/api';

    function getPageId() {
        var path = window.location.pathname.replace(/\.html$/, '');
        var match = path.match(/\/theory\/(.+)$/);
        return match ? match[1] : null;
    }

    function getIsu() {
        try {
            var user = JSON.parse(localStorage.getItem('cpp_user') || 'null');
            return user && user.isuNumber ? user.isuNumber : null;
        } catch (e) { return null; }
    }

    // ── Конфиг стихий ────────────────────────────────────────────────────────
    var ELEMENTS = {
        '11': { name: 'lightning', color: '#facc15', colorDim: '#713f12', flash: 'rgba(250,204,21,0.4)',  shake: true  },
        '14': { name: 'water',     color: '#38bdf8', colorDim: '#0c4a6e', flash: 'rgba(56,189,248,0.35)', shake: false },
        '17': { name: 'air',       color: '#e2e8f0', colorDim: '#334155', flash: 'rgba(226,232,240,0.25)',shake: false },
        '20': { name: 'fire',      color: '#f97316', colorDim: '#7c2d12', flash: 'rgba(249,115,22,0.45)', shake: true  },
        '23': { name: 'earth',     color: '#84cc16', colorDim: '#1a2e05', flash: 'rgba(132,204,22,0.35)', shake: true  },
    };

    function getElement(std) { return ELEMENTS[std] || ELEMENTS['20']; }

    // ── Заглушка для <div data-slot> ─────────────────────────────────────────
    function renderGate(el, slotInfo) {
        var slot = slotInfo.slot, std = slotInfo.std;
        var costCoins = slotInfo.costCoins, costKeys = slotInfo.costKeys;
        var stdUnlocked = slotInfo.stdUnlocked, itemId = slotInfo.itemId;
        // soon = атрибуты coins/keys не были указаны в HTML (API вернул 0 по умолчанию,
        // но мы проверяем оригинальный DOM-элемент)
        var soon = slotInfo.soon;
        var elem = getElement(std);

        var costParts = [];
        if (costCoins > 0) costParts.push('🪙 ' + costCoins.toLocaleString('ru'));
        if (costKeys  > 0) costParts.push('🗝️ ' + costKeys);

        var costText = soon
            ? 'S O O N'
            : (costParts.length ? costParts.join(' + ') : '');  // пусто = бесплатно

        var isu = getIsu();
        var locked = isu && !stdUnlocked;
        var btnDisabled = (locked || soon) ? 'disabled' : '';
        var btnLabel = soon
            ? '⏳ Скоро'
            : (locked ? '🔒 Требуется C++' + std : 'Разблокировать');

        el.innerHTML =
            '<div class="std-gate" data-item-id="' + itemId + '" data-slot="' + slot + '" data-std="' + std + '">' +
                '<div class="std-gate__glass"></div>' +
                '<div class="std-gate__inner">' +
                    '<span class="std-gate__badge">C++' + std + '</span>' +
                    '<span class="std-gate__lock">🔒</span>' +
                    '<p class="std-gate__desc">Этот раздел доступен после покупки</p>' +
                    (costText ? '<span class="std-gate__cost">' + costText + '</span>' : '') +
                    '<button class="std-gate__btn" ' + btnDisabled + ' onclick="stdGatePurchase(this)">' +
                        btnLabel +
                    '</button>' +
                '</div>' +
            '</div>';
    }

    // ── Заглушка для <tr data-slot> ──────────────────────────────────────────
    function renderTableRowGate(tr, slotInfo) {
        var std = slotInfo.std, slot = slotInfo.slot;
        var soon = slotInfo.soon;
        var elem = getElement(std);
        var cols = tr.querySelectorAll('td').length || 5;
        var isu = getIsu();
        var locked = isu && !slotInfo.stdUnlocked;

        var actionHtml = soon
            ? '<span style="opacity:0.5;font-size:0.75rem;">⏳ Скоро</span>'
            : (locked
                ? '<span style="opacity:0.5;font-size:0.75rem;">Требуется C++' + std + '</span>'
                : '<button onclick="stdGatePurchase(this)" data-slot="' + slot + '" data-std="' + std + '" ' +
                    'style="background:color-mix(in srgb,' + elem.color + ' 15%,transparent);' +
                        'border:1px solid color-mix(in srgb,' + elem.color + ' 40%,transparent);' +
                        'color:' + elem.color + ';border-radius:6px;padding:2px 10px;cursor:pointer;font-size:0.75rem;font-weight:600;">' +
                    'Разблокировать</button>');

        tr.innerHTML = '<td colspan="' + cols + '" style="text-align:center;padding:0.6rem 1rem;">' +
            '<span style="display:inline-flex;align-items:center;gap:0.5rem;' +
                'background:color-mix(in srgb,' + elem.color + ' 8%,transparent);' +
                'border:1px dashed color-mix(in srgb,' + elem.color + ' 30%,transparent);' +
                'border-radius:8px;padding:0.4rem 1rem;font-size:0.8rem;color:' + elem.color + ';">' +
                '🔒 <span style="opacity:0.7">long long</span>' +
                '<span style="background:color-mix(in srgb,' + elem.color + ' 15%,transparent);' +
                    'border:1px solid color-mix(in srgb,' + elem.color + ' 30%,transparent);' +
                    'border-radius:4px;padding:1px 6px;font-size:0.65rem;font-weight:700;">C++' + std + '</span>' +
                actionHtml +
            '</span></td>';
        tr.dataset.gated = '1';
    }

    function revealTableRow(tr, html) {
        var std = tr.dataset.std;
        var elem = getElement(std);
        var tmp = document.createElement('table');
        tmp.innerHTML = '<tbody>' + html + '</tbody>';
        var newTr = tmp.querySelector('tr');
        if (newTr) {
            newTr.style.background = 'color-mix(in srgb,' + elem.color + ' 12%,transparent)';
            newTr.style.transition = 'background 1s ease';
            tr.replaceWith(newTr);
            setTimeout(function() { newTr.style.background = ''; }, 1000);
            if (window.Prism) Prism.highlightAllUnder(newTr);
            if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([newTr]);
        }
    }

    // ── Анимация открытия (дверь + ключ + стихия) ────────────────────────────
    // ── 3D ключ через Three.js ───────────────────────────────────────────────
    function build3DKey(color, colorDim, onReady) {
        // Загружаем Three.js если ещё нет
        function withThree(cb) {
            if (window.THREE) { cb(); return; }
            var s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
            s.onload = cb;
            document.head.appendChild(s);
        }

        withThree(function () {
            var T = window.THREE;
            var W = 420, H = 420;

            var canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            canvas.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) translateY(60px);z-index:10001;pointer-events:none;opacity:0;transition:opacity 0.3s;';
            document.body.appendChild(canvas);

            var renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            renderer.setSize(W, H);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = T.PCFSoftShadowMap;

            var scene = new T.Scene();
            var camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
            camera.position.set(0, 0, 7);

            // Освещение
            var ambient = new T.AmbientLight(0xffffff, 0.3);
            scene.add(ambient);

            var col = new T.Color(color);
            var keyLight = new T.DirectionalLight(0xffffff, 2.5);
            keyLight.position.set(3, 5, 5);
            keyLight.castShadow = true;
            scene.add(keyLight);

            var rimLight = new T.PointLight(col, 3, 20);
            rimLight.position.set(-3, 2, 2);
            scene.add(rimLight);

            var fillLight = new T.PointLight(new T.Color(colorDim), 1.5, 15);
            fillLight.position.set(2, -3, 1);
            scene.add(fillLight);

            // Материал — металл с цветом стихии
            var mat = new T.MeshStandardMaterial({
                color: col,
                metalness: 0.9,
                roughness: 0.15,
                emissive: col,
                emissiveIntensity: 0.12,
            });
            var darkMat = new T.MeshStandardMaterial({
                color: new T.Color(colorDim),
                metalness: 0.95,
                roughness: 0.1,
            });

            var keyGroup = new T.Group();
            scene.add(keyGroup);

            // Головка ключа (кольцо)
            var bowOuter = new T.TorusGeometry(0.9, 0.22, 32, 64);
            var bowMesh  = new T.Mesh(bowOuter, mat);
            bowMesh.castShadow = true;
            keyGroup.add(bowMesh);

            // Внутренняя дырка в кольце (тёмный диск)
            var holeMesh = new T.Mesh(new T.CircleGeometry(0.68, 48), darkMat);
            holeMesh.position.z = 0.01;
            keyGroup.add(holeMesh);

            // Стержень
            var shaftGeo = new T.CylinderGeometry(0.13, 0.13, 2.6, 16);
            var shaft = new T.Mesh(shaftGeo, mat);
            shaft.rotation.z = Math.PI / 2;
            shaft.position.x = 1.95;
            shaft.castShadow = true;
            keyGroup.add(shaft);

            // Зубцы
            var teethData = [
                { x: 2.8,  y: -0.13, w: 0.18, h: 0.45 },
                { x: 3.15, y: -0.13, w: 0.18, h: 0.32 },
                { x: 3.5,  y: -0.13, w: 0.18, h: 0.55 },
            ];
            teethData.forEach(function(t) {
                var geo  = new T.BoxGeometry(t.w, t.h, 0.22);
                var mesh = new T.Mesh(geo, mat);
                mesh.position.set(t.x, t.y - t.h / 2, 0);
                mesh.castShadow = true;
                keyGroup.add(mesh);
            });

            // Фаски на стержне (декоративные кольца)
            [1.4, 2.1, 2.7].forEach(function(px) {
                var ring = new T.Mesh(new T.TorusGeometry(0.16, 0.04, 8, 24), darkMat);
                ring.rotation.y = Math.PI / 2;
                ring.position.x = px;
                keyGroup.add(ring);
            });

            // Частицы-искры вокруг ключа
            var sparkCount = 60;
            var sparkGeo = new T.BufferGeometry();
            var sparkPos = new Float32Array(sparkCount * 3);
            var sparkVel = [];
            for (var si = 0; si < sparkCount; si++) {
                var angle = Math.random() * Math.PI * 2;
                var r = 1.5 + Math.random() * 2;
                sparkPos[si*3]   = Math.cos(angle) * r;
                sparkPos[si*3+1] = Math.sin(angle) * r;
                sparkPos[si*3+2] = (Math.random() - 0.5) * 2;
                sparkVel.push({ vx: (Math.random()-0.5)*0.04, vy: (Math.random()-0.5)*0.04, vz: (Math.random()-0.5)*0.02, life: Math.random() });
            }
            sparkGeo.setAttribute('position', new T.BufferAttribute(sparkPos, 3));
            var sparkMat = new T.PointsMaterial({ color: col, size: 0.08, transparent: true, opacity: 0.8 });
            var sparks = new T.Points(sparkGeo, sparkMat);
            scene.add(sparks);

            // Начальная позиция — ключ снизу, повёрнут
            keyGroup.position.set(0, -3, 0);
            keyGroup.rotation.z = -0.4;

            // Анимация
            var startTime = performance.now();
            var phase = 'rise'; // rise → spin → insert → done
            var raf;

            function animate() {
                raf = requestAnimationFrame(animate);
                var t = (performance.now() - startTime) / 1000;

                // Фаза 1: подъём (0–0.8s)
                if (phase === 'rise') {
                    var p = Math.min(t / 0.8, 1);
                    var ease = 1 - Math.pow(1 - p, 3);
                    keyGroup.position.y = -3 + 3 * ease;
                    keyGroup.rotation.z = -0.4 + 0.4 * ease;
                    keyGroup.rotation.y = p * Math.PI * 0.5;
                    canvas.style.opacity = Math.min(p * 3, 1);
                    if (p >= 1) { phase = 'spin'; startTime = performance.now(); }
                }
                // Фаза 2: вращение и покачивание (0–1.2s)
                else if (phase === 'spin') {
                    var p2 = Math.min(t / 1.2, 1);
                    keyGroup.rotation.y = Math.PI * 0.5 + p2 * Math.PI * 2;
                    keyGroup.rotation.z = Math.sin(t * 4) * 0.08;
                    keyGroup.position.y = Math.sin(t * 3) * 0.15;
                    rimLight.intensity = 3 + Math.sin(t * 8) * 1.5;
                    if (p2 >= 1) { phase = 'insert'; startTime = performance.now(); }
                }
                // Фаза 3: вставка в замок (0–0.6s)
                else if (phase === 'insert') {
                    var p3 = Math.min(t / 0.6, 1);
                    var ease3 = p3 < 0.5 ? 2*p3*p3 : 1-Math.pow(-2*p3+2,2)/2;
                    keyGroup.position.z = ease3 * 2;
                    keyGroup.position.y = -ease3 * 0.5;
                    keyGroup.rotation.y = Math.PI * 2.5 + ease3 * Math.PI * 0.5;
                    keyGroup.scale.setScalar(1 - ease3 * 0.3);
                    rimLight.intensity = 3 + ease3 * 8;
                    canvas.style.opacity = 1 - ease3 * 0.8;
                    if (p3 >= 1) { phase = 'done'; }
                }
                else {
                    cancelAnimationFrame(raf);
                    onReady();
                    return;
                }

                // Искры
                var positions = sparkGeo.attributes.position.array;
                for (var si2 = 0; si2 < sparkCount; si2++) {
                    sparkVel[si2].life += 0.02;
                    if (sparkVel[si2].life > 1) {
                        sparkVel[si2].life = 0;
                        var a2 = Math.random() * Math.PI * 2;
                        var r2 = 1.5 + Math.random() * 2;
                        positions[si2*3]   = Math.cos(a2) * r2;
                        positions[si2*3+1] = Math.sin(a2) * r2;
                        positions[si2*3+2] = (Math.random()-0.5)*2;
                    } else {
                        positions[si2*3]   += sparkVel[si2].vx;
                        positions[si2*3+1] += sparkVel[si2].vy;
                        positions[si2*3+2] += sparkVel[si2].vz;
                    }
                }
                sparkGeo.attributes.position.needsUpdate = true;
                sparkMat.opacity = 0.5 + Math.sin(t * 6) * 0.3;

                renderer.render(scene, camera);
            }
            animate();

            // Возвращаем cleanup
            return function cleanup() {
                cancelAnimationFrame(raf);
                renderer.dispose();
                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            };
        });
    }

    function revealContent(gateEl, html) {
        var wrapper = gateEl.closest('[data-slot][data-std]') || gateEl;
        var std = gateEl.dataset.std || '20';
        var elem = getElement(std);

        document.documentElement.style.setProperty('--el-color',     elem.color);
        document.documentElement.style.setProperty('--el-color-dim', elem.colorDim);

        gateEl.classList.add('std-gate--charging');

        setTimeout(function () {
            // Дверь
            var door = document.createElement('div');
            door.className = 'sg-door-overlay';
            door.innerHTML = '<div class="sg-door-left"></div><div class="sg-door-right"></div>';
            document.body.appendChild(door);

            // Замочная скважина
            var keyhole = document.createElement('div');
            keyhole.className = 'sg-keyhole';
            keyhole.innerHTML = buildKeyholesvg(elem.color);
            document.body.appendChild(keyhole);

            // Canvas стихий
            var fxCanvas = document.createElement('canvas');
            fxCanvas.id = 'sg-element-canvas';
            fxCanvas.width = window.innerWidth;
            fxCanvas.height = window.innerHeight;
            document.body.appendChild(fxCanvas);

            // Вспышка
            var flash = document.createElement('div');
            flash.className = 'sg-element-flash';
            flash.style.background = 'radial-gradient(ellipse at center,' + elem.flash + ' 0%,transparent 70%)';
            flash.style.setProperty('--flash-delay', '1.8s');
            document.body.appendChild(flash);

            // 3D ключ — запускаем сразу, он сам вызовет onReady когда закончит
            var cleanupKey = build3DKey(elem.color, elem.colorDim, function onKeyDone() {
                // Ключ вставлен — запускаем стихию и открываем дверь
                setTimeout(function () { keyhole.classList.add('sg-keyhole--glowing'); }, 50);
                setTimeout(function () { fxCanvas.classList.add('sg-canvas--active'); runElementAnimation(fxCanvas, elem.name, elem.color); }, 100);

                if (elem.shake) {
                    setTimeout(function () {
                        document.body.classList.add('sg-shake');
                        document.body.addEventListener('animationend', function onEnd(e) {
                            if (e.animationName === 'pageShake') { document.body.classList.remove('sg-shake'); document.body.removeEventListener('animationend', onEnd); }
                        });
                    }, 400);
                }

                setTimeout(function () { door.classList.add('sg-door--open'); }, 600);

                setTimeout(function () {
                    [door, keyhole, fxCanvas, flash].forEach(function(n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
                    gateEl.classList.add('std-gate--dissolve');
                    setTimeout(function () {
                        var reveal = document.createElement('div');
                        reveal.className = 'std-gate__reveal';
                        reveal.innerHTML = html;
                        wrapper.replaceWith(reveal);
                        reveal.getBoundingClientRect();
                        reveal.classList.add('std-gate__reveal--visible');
                        if (window.Prism) Prism.highlightAllUnder(reveal);
                        reveal.querySelectorAll('.code-block[data-example]').forEach(function(b) { new CppCompiler(b).init(); });
                        if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([reveal]);
                        reveal.querySelectorAll('.callout').forEach(function(c) { c.classList.add('callout--visible'); });
                    }, 380);
                }, 1400);
            });
        }, 300);
    }

    function buildKeyholesvg(color) {
        return '<svg width="90" height="120" viewBox="0 0 90 120">' +
            '<defs>' +
                '<radialGradient id="khg" cx="50%" cy="40%" r="50%">' +
                    '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.4"/>' +
                    '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>' +
                '</radialGradient>' +
            '</defs>' +
            '<circle cx="45" cy="35" r="30" fill="url(#khg)" stroke="' + color + '" stroke-width="3"/>' +
            '<circle cx="45" cy="35" r="14" fill="' + color + '" opacity="0.2"/>' +
            '<circle cx="45" cy="35" r="8"  fill="' + color + '" opacity="0.5"/>' +
            '<polygon points="32,62 58,62 52,108 38,108" fill="' + color + '" opacity="0.15" stroke="' + color + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<line x1="45" y1="20" x2="45" y2="50" stroke="' + color + '" stroke-width="2.5" opacity="0.7"/>' +
        '</svg>';
    }

    // ── Canvas анимации стихий ────────────────────────────────────────────────
    function runElementAnimation(canvas, element, color) {
        var ctx = canvas.getContext('2d');
        var W = canvas.width, H = canvas.height, frame = 0, raf;
        function stop() { cancelAnimationFrame(raf); }

        if (element === 'lightning') {
            var bolts = [];
            function newBolt() {
                var angle = Math.random() * Math.PI * 2, pts = [[W/2, H/2]], x = W/2, y = H/2;
                for (var s = 0; s < 10; s++) { angle += (Math.random()-0.5)*1.4; x += Math.cos(angle)*(40+Math.random()*60); y += Math.sin(angle)*(40+Math.random()*60); pts.push([x,y]); }
                return { pts: pts, life: 0, maxLife: 8+Math.random()*12 };
            }
            for (var b = 0; b < 6; b++) bolts.push(newBolt());
            (function loop() {
                ctx.clearRect(0,0,W,H);
                bolts.forEach(function(bolt) {
                    var alpha = 1 - bolt.life/bolt.maxLife;
                    ctx.beginPath(); ctx.moveTo(bolt.pts[0][0],bolt.pts[0][1]);
                    for (var p=1;p<bolt.pts.length;p++) ctx.lineTo(bolt.pts[p][0],bolt.pts[p][1]);
                    ctx.strokeStyle='rgba(250,204,21,'+alpha+')'; ctx.lineWidth=2+(1-alpha)*2;
                    ctx.shadowColor='#facc15'; ctx.shadowBlur=20; ctx.stroke(); ctx.shadowBlur=0;
                    bolt.life++; if (bolt.life>=bolt.maxLife) Object.assign(bolt,newBolt());
                });
                frame++; if (frame<90) raf=requestAnimationFrame(loop); else stop();
            })();

        } else if (element === 'fire') {
            var particles = [];
            function newFire() { return { x:Math.random()*W, y:H+Math.random()*100, vx:(Math.random()-0.5)*3, vy:-(2+Math.random()*5), r:4+Math.random()*18, life:0, maxLife:40+Math.random()*60, hue:10+Math.random()*40 }; }
            for (var i=0;i<120;i++) particles.push(newFire());
            (function loop() {
                ctx.clearRect(0,0,W,H);
                particles.forEach(function(p) {
                    p.x+=p.vx+Math.sin(frame*0.05+p.y*0.01)*0.8; p.y+=p.vy; p.vy-=0.05; p.life++;
                    var t=p.life/p.maxLife, alpha=t<0.3?t/0.3:1-(t-0.3)/0.7;
                    ctx.beginPath();
                    var g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*(1-t*0.5));
                    g.addColorStop(0,'hsla('+p.hue+',100%,90%,'+alpha+')');
                    g.addColorStop(0.4,'hsla('+p.hue+',100%,55%,'+(alpha*0.8)+')');
                    g.addColorStop(1,'hsla('+(p.hue+20)+',80%,30%,0)');
                    ctx.fillStyle=g; ctx.arc(p.x,p.y,p.r*(1-t*0.4),0,Math.PI*2); ctx.fill();
                    if (p.life>=p.maxLife) Object.assign(p,newFire());
                });
                frame++; if (frame<90) raf=requestAnimationFrame(loop); else stop();
            })();

        } else if (element === 'water') {
            var waves = [
                {amp:60,freq:0.012,speed:0.04,y:H*0.5,col:'rgba(56,189,248,0.35)'},
                {amp:40,freq:0.018,speed:0.06,y:H*0.55,col:'rgba(14,165,233,0.3)'},
                {amp:30,freq:0.025,speed:0.08,y:H*0.6, col:'rgba(2,132,199,0.25)'},
            ];
            (function loop() {
                ctx.clearRect(0,0,W,H);
                waves.forEach(function(w) {
                    ctx.beginPath(); ctx.moveTo(0,H);
                    for (var x=0;x<=W;x+=4) { var y=w.y+Math.sin(x*w.freq+frame*w.speed)*w.amp+Math.sin(x*w.freq*1.7+frame*w.speed*0.7)*(w.amp*0.4); ctx.lineTo(x,y); }
                    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fillStyle=w.col; ctx.fill();
                });
                if (frame%4===0) { for (var s=0;s<3;s++) { var sx=Math.random()*W, sy=waves[0].y+Math.sin(sx*waves[0].freq+frame*waves[0].speed)*waves[0].amp; ctx.beginPath(); ctx.arc(sx,sy,2+Math.random()*4,0,Math.PI*2); ctx.fillStyle='rgba(186,230,253,0.7)'; ctx.fill(); } }
                frame++; if (frame<90) raf=requestAnimationFrame(loop); else stop();
            })();

        } else if (element === 'air') {
            var airParts = [];
            for (var a=0;a<80;a++) airParts.push({angle:Math.random()*Math.PI*2,r:50+Math.random()*300,speed:(0.02+Math.random()*0.05)*(Math.random()>0.5?1:-1),cx:W/2,cy:H/2,size:1+Math.random()*3,alpha:0.3+Math.random()*0.5});
            (function loop() {
                ctx.clearRect(0,0,W,H);
                airParts.forEach(function(p) {
                    p.angle+=p.speed; p.r+=Math.sin(frame*0.03+p.angle)*0.5;
                    var x=p.cx+Math.cos(p.angle)*p.r, y=p.cy+Math.sin(p.angle)*p.r*0.4;
                    ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2); ctx.fillStyle='rgba(226,232,240,'+(p.alpha*(1-frame/90))+')'; ctx.fill();
                });
                ctx.save(); ctx.translate(W/2,H/2); ctx.rotate(frame*0.015);
                for (var l=0;l<6;l++) { ctx.rotate(Math.PI/3); ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(100,-80,200,80,350,0); ctx.strokeStyle='rgba(226,232,240,'+(0.15*(1-frame/90))+')'; ctx.lineWidth=2; ctx.stroke(); }
                ctx.restore();
                frame++; if (frame<90) raf=requestAnimationFrame(loop); else stop();
            })();

        } else if (element === 'earth') {
            var cracks = [];
            for (var c=0;c<8;c++) cracks.push(buildCrack(W/2+(Math.random()-0.5)*100,H/2+(Math.random()-0.5)*60,12));
            var rocks = [];
            (function loop() {
                ctx.clearRect(0,0,W,H);
                var progress=frame/60;
                cracks.forEach(function(crack) {
                    var pts=Math.floor(crack.length*Math.min(progress*2,1)); if (pts<2) return;
                    ctx.beginPath(); ctx.moveTo(crack.points[0][0],crack.points[0][1]);
                    for (var i=1;i<pts;i++) ctx.lineTo(crack.points[i][0],crack.points[i][1]);
                    ctx.strokeStyle='rgba(132,204,22,0.8)'; ctx.lineWidth=3; ctx.shadowColor='#84cc16'; ctx.shadowBlur=10; ctx.stroke(); ctx.shadowBlur=0;
                });
                if (frame===20) { for (var r=0;r<20;r++) rocks.push({x:W/2+(Math.random()-0.5)*200,y:H/2+(Math.random()-0.5)*100,vx:(Math.random()-0.5)*12,vy:-(4+Math.random()*10),size:4+Math.random()*14,rot:Math.random()*Math.PI*2,vrot:(Math.random()-0.5)*0.3}); }
                rocks.forEach(function(r) {
                    r.x+=r.vx; r.y+=r.vy; r.vy+=0.4; r.rot+=r.vrot;
                    ctx.save(); ctx.translate(r.x,r.y); ctx.rotate(r.rot);
                    ctx.fillStyle='rgba(101,163,13,0.7)'; ctx.strokeStyle='#84cc16'; ctx.lineWidth=1;
                    ctx.beginPath(); ctx.rect(-r.size/2,-r.size/2,r.size,r.size*0.7); ctx.fill(); ctx.stroke(); ctx.restore();
                });
                frame++; if (frame<90) raf=requestAnimationFrame(loop); else stop();
            })();
        }
    }

    function buildCrack(x, y, depth) {
        var pts=[[x,y]], angle=Math.random()*Math.PI*2;
        for (var i=0;i<depth;i++) { angle+=(Math.random()-0.5)*1.2; var len=30+Math.random()*60; x+=Math.cos(angle)*len; y+=Math.sin(angle)*len*0.5; pts.push([x,y]); }
        return {points:pts,length:pts.length};
    }

    // ── Загрузка купленного контента ─────────────────────────────────────────
    async function loadContentIntoRow(tr, page, slot, std) {
        var isu = getIsu(); if (!isu) return;
        try {
            var res = await fetch(API+'/gated/content?page='+encodeURIComponent(page)+'&slot='+encodeURIComponent(slot)+'&std='+encodeURIComponent(std), {headers:{'X-Isu-Number':isu}});
            if (!res.ok) return;
            var html = await res.text();
            var tmp = document.createElement('table'); tmp.innerHTML='<tbody>'+html+'</tbody>';
            var newTr = tmp.querySelector('tr');
            if (newTr) { tr.replaceWith(newTr); if (window.Prism) Prism.highlightAllUnder(newTr); }
        } catch(e) { console.error('std-gate: ошибка загрузки строки',e); }
    }

    async function loadContent(el, page, slot, std) {
        var isu = getIsu(); if (!isu) return;
        try {
            var res = await fetch(API+'/gated/content?page='+encodeURIComponent(page)+'&slot='+encodeURIComponent(slot)+'&std='+encodeURIComponent(std), {headers:{'X-Isu-Number':isu}});
            if (!res.ok) return;
            var html = await res.text();
                var reveal = document.createElement('div');
            reveal.className = 'std-gate__reveal std-gate__reveal--visible';
            reveal.innerHTML = html;
            el.replaceWith(reveal);
            if (window.Prism) Prism.highlightAllUnder(reveal);
            reveal.querySelectorAll('.code-block[data-example]').forEach(function(b) { new CppCompiler(b).init(); });
            if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([reveal]);
            reveal.querySelectorAll('.callout').forEach(function(c) { c.classList.add('callout--visible'); });
        } catch(e) { console.error('std-gate: ошибка загрузки контента',e); }
    }

    // ── Покупка ───────────────────────────────────────────────────────────────
    window.stdGatePurchase = async function (btn) {
        var gate = btn.closest('.std-gate');
        var tr   = !gate ? btn.closest('tr[data-slot]') : null;
        var slot = gate ? gate.dataset.slot : (tr ? tr.dataset.slot : btn.dataset.slot);
        var std  = gate ? gate.dataset.std  : (tr ? tr.dataset.std  : btn.dataset.std);
        var page = getPageId(), isu = getIsu();

        if (!isu) { alert('Войдите в аккаунт, чтобы покупать контент'); return; }
        btn.disabled = true; btn.textContent = 'Покупка...';

        try {
            var res = await fetch(API+'/gated/purchase', {
                method:'POST', headers:{'Content-Type':'application/json','X-Isu-Number':isu},
                body: JSON.stringify({page:page, slot:slot, std:std})
            });
            var data = await res.json();
            if (!res.ok) { btn.disabled=false; btn.textContent='Разблокировать'; alert(data.message||'Ошибка покупки'); return; }

            document.dispatchEvent(new CustomEvent('coinsUpdated', {detail:{coins:data.coins,keys:data.keys}}));

            var contentRes = await fetch(API+'/gated/content?page='+encodeURIComponent(page)+'&slot='+encodeURIComponent(slot)+'&std='+encodeURIComponent(std), {headers:{'X-Isu-Number':isu}});
            if (contentRes.ok) {
                var html = await contentRes.text();
                console.log('std-gate: контент получен, длина:', html.length);
                if (tr) revealTableRow(tr, html);
                else    revealContent(gate, html);
            } else {
                console.error('std-gate: /gated/content вернул', contentRes.status);
            }
        } catch(e) { console.error('std-gate: ошибка покупки',e); btn.disabled=false; btn.textContent='Разблокировать'; }
    };

    // ── Инициализация ─────────────────────────────────────────────────────────
    async function init() {
        var slots = document.querySelectorAll('[data-slot][data-std]');
        console.log('std-gate: найдено слотов:', slots.length);
        if (!slots.length) return;

        var page = getPageId();
        if (!page) { console.warn('std-gate: не удалось определить page из URL', window.location.pathname); return; }

        var isu = getIsu(), slotMap = {};
        try {
            var headers = isu ? {'X-Isu-Number':isu} : {};
            var res = await fetch(API+'/gated/slots?page='+encodeURIComponent(page), {headers:headers});
            if (res.ok) {
                var items = await res.json();
                console.log('std-gate: слоты для "'+page+'"', items);
                for (var i=0;i<items.length;i++) slotMap[items[i].slot+':'+items[i].std] = items[i];
            } else {
                console.warn('std-gate: /api/gated/slots вернул', res.status);
            }
        } catch(e) { console.error('std-gate: ошибка загрузки слотов',e); }

        for (var j=0;j<slots.length;j++) {
            var el   = slots[j];
            var slot = el.getAttribute('data-slot');
            var std  = el.getAttribute('data-std');
            var info = slotMap[slot+':'+std];
            var isTr = el.tagName === 'TR';

            if (!info) {
                // Слот не найден в API — gated-файл отсутствует → SOON
                var fallback = {slot:slot, std:std, costCoins:0, costKeys:0, soon:true, stdUnlocked:false, itemId:'content:'+page+':'+slot+':'+std};
                if (isTr) renderTableRowGate(el, fallback); else renderGate(el, fallback);
                continue;
            }
            // soon = API вернул слот, но costCoins и costKeys оба null/undefined (не указаны в gated-файле)
            // Если costCoins === 0 и costKeys === 0 — может быть бесплатно или soon.
            // Различаем: сервер теперь передаёт costCoins как число всегда.
            // Считаем soon только если слот не найден (handled above).
            info.soon = false;
            if (info.purchased) {
                if (isTr) await loadContentIntoRow(el, page, slot, std);
                else      await loadContent(el, page, slot, std);
            } else {
                if (isTr) renderTableRowGate(el, info); else renderGate(el, info);
            }
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
