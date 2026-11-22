// ============================================================
//  MDT Overlay - Settings UI (disuntik ke halaman MDT di panel)
//
//  Nge-add tombol gear + panel settings di atas halaman MDT.
//  User bisa ganti binding (F7 / clock / on call), label tombol
//  situs, command on call, dan tampilan border.
//  Semua perubahan dikirim ke plugin lewat postMessage.
// ============================================================
(function () {
  try {
  if (window.__mdtOverlayUi) return 'sudah ada';
  window.__mdtOverlayUi = true;

  var post = function (obj) {
    try {
      if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage(obj);
      }
    } catch (e) { }
  };

  var KEY_NAMES = {
    F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
    F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12'
  };

  function keyName(e) {
    if (e.code && KEY_NAMES[e.code]) return KEY_NAMES[e.code];
    if (e.code && /^Key[A-Z]$/.test(e.code)) return e.code.slice(3);
    if (e.code && /^Digit[0-9]$/.test(e.code)) return e.code.slice(5);
    if (e.code === 'Space') return 'SPACE';
    return (e.key || '').toUpperCase();
  }

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---------- state ----------
  var S = {
    hotkey: 'F7',
    clockHotkey: 'F10',
    onCallHotkey: 'F9'
  };

  // ---------- style ----------
  var style = document.createElement('style');
  style.textContent = [
    '#mdt-ov-gear{position:fixed;right:16px;bottom:16px;z-index:2147483647;height:38px;',
    'padding:0 16px 0 12px;border-radius:19px;border:2px solid #fff;',
    'background:#2563eb;color:#fff;font-size:13.5px;font-weight:700;line-height:34px;',
    'text-align:center;cursor:pointer;letter-spacing:.04em;',
    'box-shadow:0 6px 22px rgba(0,0,0,.55);user-select:none;transition:background .15s}',
    '#mdt-ov-gear:hover{background:#1d4ed8}',
    '#mdt-ov-modal{position:fixed;inset:0;z-index:2147483647;display:none;',
    'align-items:center;justify-content:center;background:rgba(6,8,12,.62);backdrop-filter:blur(3px)}',
    '#mdt-ov-modal.open{display:flex}',
    '#mdt-ov-box{width:430px;max-width:92vw;max-height:88vh;overflow:auto;',
    'background:#14171d;color:#e8ecf3;border:1px solid #2b3140;border-radius:14px;',
    'padding:18px 18px 16px;box-shadow:0 24px 70px rgba(0,0,0,.6);font:13px/1.55 system-ui,Segoe UI,sans-serif}',
    '#mdt-ov-box h3{margin:0 0 4px;font-size:15px}',
    '#mdt-ov-box .sub{color:#8e97a6;font-size:12px;margin-bottom:14px}',
    '#mdt-ov-box .sec{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7d8797;',
    'margin:16px 0 7px;border-top:1px solid #242a36;padding-top:12px}',
    '#mdt-ov-box .row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:7px 0}',
    '#mdt-ov-box .row label{color:#c3cad6}',
    '#mdt-ov-box input[type=text]{width:220px;background:#0d1015;border:1px solid #2b3140;color:#e8ecf3;',
    'border-radius:7px;padding:6px 8px;font-size:12.5px}',
    '#mdt-ov-box input[type=range]{width:130px}',
    '#mdt-ov-box input[type=color]{width:44px;height:26px;background:#0d1015;border:1px solid #2b3140;border-radius:6px}',
    '#mdt-ov-key{min-width:96px;text-align:center;background:#1c222d;border:1px solid #39415a;color:#e8ecf3;',
    'border-radius:7px;padding:7px 10px;cursor:pointer;font-family:Consolas,monospace;font-size:12.5px}',
    '#mdt-ov-key.listen{border-color:#3d7bf5;color:#8fb6ff;background:#16233c}',
    '#mdt-ov-box .foot{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}',
    '#mdt-ov-box button.act{background:#2563eb;border:none;color:#fff;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:12.5px}',
    '#mdt-ov-box button.sec2{background:#1c222d;border:1px solid #2b3140;color:#c3cad6;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:12.5px}',
    '#mdt-ov-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:2147483647;',
    'background:#1d2a1f;color:#b7e4c1;border:1px solid #2f5c3a;border-radius:9px;padding:8px 14px;font-size:12.5px;display:none}',
    '#mdt-ov-hint{color:#6f7887;font-size:11.5px;margin-top:10px}'
  ].join('');
  document.head.appendChild(style);

  // ---------- UI ----------
  var gear = document.createElement('div');
  gear.id = 'mdt-ov-gear';
  gear.title = 'MDT Overlay - Setting';
  gear.innerHTML = '⚙&nbsp; SETTING';

  var modal = document.createElement('div');
  modal.id = 'mdt-ov-modal';
  modal.innerHTML =
    '<div id="mdt-ov-box">' +
    '  <h3>MDT Overlay - Setting</h3>' +
    '  <div class="sub">Klik binder, lalu tekan tombol baru. Langsung tersimpan.</div>' +
    '  <div class="sec">Binding tombol</div>' +
    '  <div id="mdt-ov-row-hotkey" class="row"></div>' +
    '  <div id="mdt-ov-row-clock" class="row"></div>' +
    '  <div id="mdt-ov-row-oncall" class="row"></div>' +
        '  <div id="mdt-ov-hint">Klik tombol binder lalu tekan tombol keyboard yang mau dipakai.</div>' +
    '  <div class="foot">' +
    '    <button class="sec2" id="mdt-ov-cancel">Batal</button>' +
    '    <button class="act" id="mdt-ov-save">Simpan</button>' +
    '  </div>' +
    '</div>';

  var toast = document.createElement('div');
  toast.id = 'mdt-ov-toast';

  var lastMountLog = 0;
  function mount() {
    var root = document.documentElement || document.body;
    if (!root) return false;
    // appendChild selalu memindahkan node ke paling atas -> tombol kita
    // nggak akan ketutup elemen lain (mis. modal/toast milik situs)
    root.appendChild(gear);
    root.appendChild(modal);
    root.appendChild(toast);
    var now = Date.now();
    if (now - lastMountLog > 5000) {
      lastMountLog = now;
      var r = gear.getBoundingClientRect();
      post({ type: 'ui', mounted: true, url: location.href,
             x: r.left, y: r.top, w: r.width, h: r.height });
    }
    return true;
  }

  function rowKeys(elId, label, keyNameProp) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.className = 'row';
    el.innerHTML = '<label>' + label + '</label>';
    var b = document.createElement('button');
    b.className = 'mdt-ov-key';
    b.textContent = S[keyNameProp];
    b.onclick = function () {
      // yang nangkep tombol = PLUGIN (bukan halaman), jadi tombol yang
      // juga dipakai game/console (mis. F8) tetap bisa di-bind
      b.classList.add('listen');
      b.textContent = 'tekan tombol... (ESC batal)';
      post({ type: 'capture', target: keyNameProp });
    };
    el.appendChild(b);
  }

  function rowText(elId, label, prop) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.className = 'row';
    el.innerHTML = '<label>' + label + '</label>';
    var i = document.createElement('input');
    i.type = 'text';
    i.value = S[prop];
    i.oninput = function () { S[prop] = i.value; };
    el.appendChild(i);
  }

  function rowRange(elId, label, prop, min, max, suffix) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.className = 'row';
    el.innerHTML = '<label>' + label + '</label>';
    var i = document.createElement('input');
    i.type = 'range';
    i.min = min; i.max = max; i.value = S[prop];
    var v = document.createElement('span');
    v.style.cssText = 'width:38px;text-align:right;color:#8e97a6;font-size:12px';
    v.textContent = S[prop] + (suffix || '');
    i.oninput = function () { S[prop] = +i.value; v.textContent = i.value + (suffix || ''); };
    el.appendChild(i);
    el.appendChild(v);
  }

  function rowColor(elId, label, prop) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.className = 'row';
    el.innerHTML = '<label>' + label + '</label>';
    var i = document.createElement('input');
    i.type = 'color';
    i.value = S[prop];
    i.oninput = function () { S[prop] = i.value; };
    el.appendChild(i);
  }

  function rowCheck(elId, label, prop) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.className = 'row';
    el.innerHTML = '<label>' + label + '</label>';
    var i = document.createElement('input');
    i.type = 'checkbox';
    i.checked = !!S[prop];
    i.onchange = function () { S[prop] = i.checked; };
    el.appendChild(i);
  }

  function buildForm() {
    rowKeys('mdt-ov-row-hotkey', 'Buka / tutup panel', 'hotkey');
    rowKeys('mdt-ov-row-clock', 'Clock in / clock out', 'clockHotkey');
    rowKeys('mdt-ov-row-oncall', 'On call (AFK)', 'onCallHotkey');
    
  }

  function applyValues(v) {
    for (var k in v) {
      if (Object.prototype.hasOwnProperty.call(v, k)) S[k] = v[k];
    }
    buildForm();
  }
  // tombol binder yang lagi "listen" dibersihin pas plugin balas
  window.__mdtOverlayApply = applyValues;

  // tombol gear
  function openModal() {
    buildForm();
    modal.classList.add('open');
    post({ type: 'modal', open: true });
  }
  function closeModal() {
    modal.classList.remove('open');
    post({ type: 'modal', open: false });
  }

  gear.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    openModal();
  };
  modal.onclick = function (e) {
    if (e.target === modal) closeModal();
  };
  modal.querySelector('#mdt-ov-cancel').onclick = function () { closeModal(); };
  modal.querySelector('#mdt-ov-save').onclick = function () {
    closeModal();
    post({ type: 'settings', values: S });
    toast.textContent = 'Setting tersimpan';
    toast.style.display = 'block';
    setTimeout(function () { toast.style.display = 'none'; }, 1600);
  };

  // pasang & minta nilai awal ke plugin
  function boot() {
    if (!mount()) { setTimeout(boot, 300); return; }
    buildForm();
    post({ type: 'request' });
    // situs React kadang nge-rewrite DOM -> pasang ulang kalau node kita ilang
    setInterval(function () { mount(); }, 1500);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  return 'ui-ok';
  } catch (e) {
    try { window.__mdtOverlayUi = false; } catch (e2) {}
    return 'ui-error: ' + (e && e.message ? e.message : String(e));
  }
})();
