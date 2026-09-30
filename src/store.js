/* ヅオリンゴー · Curso — progress storage (UMD: window.CursoStore in the browser, module.exports in node).
   Goals: never lose progress, and keep the same progress on every device/origin (site, local file, inside the app).
   • localStorage 'curso_jp_v1' (primary; the app's Today card reads it) + IndexedDB mirror (survives a lost localStorage)
   • rolling restore points in IndexedDB (last 30) — wipe/import/restore are reversible
   • optional progress FILE (File System Access API, Edge/Chrome desktop): written on every change, re-read when the tab
     comes back → put it in OneDrive/Google Drive and every PC/browser shares one progress
   • merge is MONOTONIC (union of marks), so syncing or importing never deletes progress
   • everything that comes from outside is sanitized field by field; backups carry a checksum
   No network, no tokens: the page's CSP forbids any connection. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CursoStore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var KEY = 'curso_jp_v1', SCHEMA = 2, APP = 'curso-japones';
  var ID = /^[A-Za-z0-9-]{1,24}$/;

  function blank() { return { pts: {}, chk: {}, hw: {}, notes: {}, rot: {} }; }
  function str(x, n) { return typeof x === 'string' ? x.slice(0, n || 20000) : ''; }

  // only known fields and shapes survive (a hostile or corrupted file cannot inject anything else)
  function sanitize(s) {
    var o = blank();
    if (!s || typeof s !== 'object') return o;
    if (s.pts && typeof s.pts === 'object') Object.keys(s.pts).forEach(function (k) {
      if (!ID.test(k) || !s.pts[k] || typeof s.pts[k] !== 'object') return;
      var p = s.pts[k], q = {}, note = str(p.note);
      if (p.s === true) q.s = true; if (p.w === true) q.w = true; if (note) q.note = note;
      if (q.s || q.w || q.note) o.pts[k] = q;
    });
    if (s.chk && typeof s.chk === 'object') Object.keys(s.chk).forEach(function (k) {
      if (!ID.test(k) || !Array.isArray(s.chk[k])) return;
      var arr = s.chk[k].slice(0, 60).map(function (x) { return x === true; });
      if (arr.some(Boolean)) o.chk[k] = arr;
    });
    if (s.hw && typeof s.hw === 'object') Object.keys(s.hw).forEach(function (k) { if (ID.test(k) && s.hw[k] && s.hw[k].done === true) o.hw[k] = { done: true }; });
    if (s.notes && typeof s.notes === 'object') Object.keys(s.notes).forEach(function (k) { var t = str(s.notes[k]); if (ID.test(k) && t.trim()) o.notes[k] = t; });
    if (s.rot && typeof s.rot === 'object') Object.keys(s.rot).forEach(function (k) { if (/^[a-z]{1,8}_[0-6]$/.test(k) && s.rot[k] === true) o.rot[k] = true; });
    if (typeof s.last === 'string' && ID.test(s.last)) o.last = s.last;
    if (s.imported === true) o.imported = true;
    if (typeof s._rev === 'number' && isFinite(s._rev)) o._rev = Math.max(0, Math.floor(s._rev));
    if (typeof s._ts === 'number' && isFinite(s._ts)) o._ts = s._ts;
    if (typeof s._dev === 'string') o._dev = str(s._dev, 16);
    if (s._t && typeof s._t === 'object') {
      var t = {};
      Object.keys(s._t).forEach(function (k) { var v = s._t[k]; if (FIELD.test(k) && typeof v === 'number' && isFinite(v) && v > 0) t[k] = v; });
      o._t = t;
    }
    o._v = SCHEMA;
    return o;
  }

  // every progress field as one flat key → the unit of "last change wins"
  var FIELD = /^(pts\.[A-Za-z0-9-]{1,24}\.(s|w|note)|chk\.[A-Za-z0-9-]{1,24}\.\d{1,2}|hw\.[A-Za-z0-9-]{1,24}|notes\.[A-Za-z0-9-]{1,24}|rot\.[a-z]{1,8}_[0-6]|last)$/;
  function flatten(st) {
    var f = {};
    Object.keys(st.pts).forEach(function (k) { var p = st.pts[k]; if (p.s) f['pts.' + k + '.s'] = true; if (p.w) f['pts.' + k + '.w'] = true; if (p.note) f['pts.' + k + '.note'] = p.note; });
    Object.keys(st.chk).forEach(function (k) { st.chk[k].forEach(function (v, i) { if (v) f['chk.' + k + '.' + i] = true; }); });
    Object.keys(st.hw).forEach(function (k) { f['hw.' + k] = true; });
    Object.keys(st.notes).forEach(function (k) { f['notes.' + k] = st.notes[k]; });
    Object.keys(st.rot).forEach(function (k) { f['rot.' + k] = true; });
    if (st.last) f.last = st.last;
    return f;
  }
  function unflatten(f) {
    var o = blank();
    Object.keys(f).forEach(function (key) {
      var v = f[key], m;
      if (v === undefined || v === false || v === '') return;
      if ((m = key.match(/^pts\.([^.]+)\.(s|w|note)$/))) { o.pts[m[1]] = o.pts[m[1]] || {}; o.pts[m[1]][m[2]] = v; }
      else if ((m = key.match(/^chk\.([^.]+)\.(\d+)$/))) { var arr = o.chk[m[1]] = o.chk[m[1]] || [], i = +m[2]; while (arr.length <= i) arr.push(false); arr[i] = true; }
      else if ((m = key.match(/^hw\.(.+)$/))) o.hw[m[1]] = { done: true };
      else if ((m = key.match(/^notes\.(.+)$/))) o.notes[m[1]] = v;
      else if ((m = key.match(/^rot\.(.+)$/))) o.rot[m[1]] = true;
      else if (key === 'last') o.last = v;
    });
    return o;
  }
  // record the time of every field that changed since the last save (set OR cleared = tombstone)
  function stamp(st, prevFlat, now) {
    var cur = flatten(st), t = st._t = st._t || {};
    Object.keys(Object.assign({}, prevFlat, cur)).forEach(function (k) { if (prevFlat[k] !== cur[k]) t[k] = now; });
    return cur;
  }

  function mergeText(newer, older) {
    if (!older || newer === older) return newer || older || '';
    if (!newer) return older;
    if (newer.indexOf(older) >= 0) return newer;
    if (older.indexOf(newer) >= 0) return older;
    return newer + '\n\n— (outra cópia) —\n' + older;   // both edited separately: keep both, lose nothing
  }
  // field-by-field "last change wins" (a newer un-check beats an older check); fields with no time on either
  // side (old backups) fall back to union; two different texts are both kept, so a concurrent edit is never lost
  function merge(a, b) {
    a = sanitize(a); b = sanitize(b);
    var fa = flatten(a), fb = flatten(b), ta = a._t || {}, tb = b._t || {}, f = {}, t = {};
    var keys = Object.keys(Object.assign({}, fa, fb, ta, tb)), aNewer = (a._ts || 0) >= (b._ts || 0);
    keys.forEach(function (k) {
      var x = ta[k] || 0, y = tb[k] || 0, va = fa[k], vb = fb[k];
      var aWins = (x || y) ? x >= y : aNewer;   // no field time on either side (old backup): the newer state decides order
      if (typeof va === 'string' && typeof vb === 'string' && va !== vb && k !== 'last') f[k] = aWins ? mergeText(va, vb) : mergeText(vb, va);
      else if (!x && !y) f[k] = aWins ? (va !== undefined ? va : vb) : (vb !== undefined ? vb : va);   // legacy: union
      else f[k] = aWins ? va : vb;
      if (x || y) t[k] = Math.max(x, y);
    });
    var o = unflatten(f);
    o._t = t;
    if (a.imported || b.imported) o.imported = true;
    o._rev = Math.max(a._rev || 0, b._rev || 0);
    o._ts = Math.max(a._ts || 0, b._ts || 0);
    o._v = SCHEMA;
    return o;
  }

  function hash(text) { // FNV-1a 32-bit: detects truncated / hand-edited / corrupted files
    var h = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul ? Math.imul(h, 0x01000193) : (h * 0x01000193) | 0; }
    return ('0000000' + (h >>> 0).toString(16)).slice(-8);
  }
  function pack(state, when) {
    var st = sanitize(state), body = JSON.stringify(st);
    return JSON.stringify({ app: APP, schema: SCHEMA, exported: when || 0, hash: hash(body), state: st }, null, 1);
  }
  function unpack(text) {
    var d;
    try { d = JSON.parse(text); } catch (e) { throw new Error('o arquivo não é JSON válido'); }
    if (!d || d.app !== APP || !d.state || typeof d.state !== 'object') throw new Error('não é um backup do curso');
    var st = sanitize(d.state);
    if (d.hash && hash(JSON.stringify(st)) !== d.hash) throw new Error('soma de verificação não confere: o arquivo foi alterado ou está corrompido');
    return st;
  }
  function stats(st, map) { // map: [{id, n}] to count mastered aulas
    st = sanitize(st);
    var pts = Object.keys(st.pts), done = 0;
    (map || []).forEach(function (a) { var c = st.chk[a.id] || []; if (a.n > 0 && c.length >= a.n && c.slice(0, a.n).every(Boolean)) done++; });
    return { studied: pts.filter(function (k) { return st.pts[k].s; }).length, practiced: pts.filter(function (k) { return st.pts[k].w; }).length, notes: Object.keys(st.notes).length + pts.filter(function (k) { return st.pts[k].note; }).length, mastered: done, touched: Object.keys(st.chk).length };
  }

  // ------------------------------------------------------------------ browser store
  function createStore(opts) {
    opts = opts || {};
    var onReplace = opts.onReplace || function () {}, onStatus = opts.onStatus || function () {};
    var S = load(), db = null, dbReady = null, saveT = null, fileT = null, fileHandle = null, prevFlat = flatten(S);
    var status = { saved: 0, idb: false, persisted: null, file: null, filePerm: null, fileSync: 0, fileError: '', lastSnap: 0 };
    var DEV = (function () { try { var d = localStorage.getItem('curso_jp_dev'); if (!d) { d = Math.random().toString(36).slice(2, 10); localStorage.setItem('curso_jp_dev', d); } return d; } catch (e) { return 'nodev'; } })();

    function load() { try { var raw = localStorage.getItem(KEY); return raw ? sanitize(JSON.parse(raw)) : blank(); } catch (e) { return blank(); } }
    function emit() { try { onStatus(status); } catch (e) {} }

    // ---- IndexedDB (mirror + restore points + file handle)
    function openDB() {
      if (dbReady) return dbReady;
      dbReady = new Promise(function (res) {
        try {
          var rq = indexedDB.open('curso_jp', 1);
          rq.onupgradeneeded = function () { var d = rq.result; if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv'); if (!d.objectStoreNames.contains('snaps')) d.createObjectStore('snaps', { keyPath: 'id', autoIncrement: true }); };
          rq.onsuccess = function () { db = rq.result; status.idb = true; res(db); };
          rq.onerror = function () { res(null); };
        } catch (e) { res(null); }
      });
      return dbReady;
    }
    function tx(store, mode, fn) {
      return openDB().then(function (d) {
        if (!d) return null;
        return new Promise(function (res) {
          try { var t = d.transaction(store, mode), s = t.objectStore(store), r = fn(s); t.oncomplete = function () { res(r && 'result' in r ? r.result : true); }; t.onerror = t.onabort = function () { res(null); }; }
          catch (e) { res(null); }
        });
      });
    }
    function idbGet(k) { return tx('kv', 'readonly', function (s) { return s.get(k); }); }
    function idbPut(k, v) { return tx('kv', 'readwrite', function (s) { return s.put(v, k); }); }
    function idbDel(k) { return tx('kv', 'readwrite', function (s) { return s.delete(k); }); }

    function snapshot(why, force) {
      var now = Date.now();
      if (!force && now - status.lastSnap < 20 * 60 * 1000) return Promise.resolve(false);
      status.lastSnap = now;
      var json = JSON.stringify(S);
      return tx('snaps', 'readwrite', function (s) { return s.add({ ts: now, why: why || 'automático', json: json }); }).then(function () {
        return tx('snaps', 'readwrite', function (s) {
          var rq = s.getAllKeys();
          rq.onsuccess = function () { var keys = rq.result || []; while (keys.length > 30) s.delete(keys.shift()); };
          return rq;
        });
      });
    }
    function listSnapshots() {
      return tx('snaps', 'readonly', function (s) { return s.getAll(); }).then(function (all) {
        return (all || []).map(function (x) { var st = null; try { st = sanitize(JSON.parse(x.json)); } catch (e) {} return { id: x.id, ts: x.ts, why: x.why, state: st }; }).filter(function (x) { return x.state; }).reverse();
      });
    }
    function restoreSnapshot(id) {
      return listSnapshots().then(function (list) {
        var hit = list.filter(function (x) { return x.id === id; })[0];
        if (!hit) throw new Error('ponto de restauração não encontrado');
        return snapshot('antes de restaurar', true).then(function () { replace(hit.state, 'restaurado'); });
      });
    }

    // ---- save pipeline
    function save() { clearTimeout(saveT); saveT = setTimeout(persist, 200); }
    function persist() {
      var now = Date.now();
      if (!S._t || typeof S._t !== 'object') S._t = {};   // S is the SAME object the UI mutates — never swap it here
      prevFlat = stamp(S, prevFlat, now);
      S._rev = (S._rev || 0) + 1; S._ts = now; S._v = SCHEMA; S._dev = DEV;
      var json = JSON.stringify(S), okLS = true;
      try { localStorage.setItem(KEY, json); } catch (e) { okLS = false; }
      idbPut('state', json);
      snapshot('automático', false);
      if (fileHandle) { clearTimeout(fileT); fileT = setTimeout(function () { pushFile(); }, 1200); }
      status.saved = S._ts; status.lsError = !okLS; emit();
      if (!status.persistAsked && navigator.storage && navigator.storage.persist) { status.persistAsked = true; navigator.storage.persist().then(function (p) { status.persisted = p; emit(); }).catch(function () {}); }
    }
    function replace(newState, why) {
      S = sanitize(newState); persist(); onReplace(S, why);
    }
    function mergeIn(other, why) {
      var mine = sanitize(S), m = merge(mine, other);
      if (JSON.stringify(flatten(m)) === JSON.stringify(flatten(mine))) return false;
      S = m; prevFlat = flatten(S);   // merged values keep their own times: nothing new to stamp
      persist(); onReplace(S, why); return true;
    }

    // ---- progress file
    var hasFS = typeof window !== 'undefined' && 'showSaveFilePicker' in window;
    function filePerm(h, ask) {
      if (!h || !h.queryPermission) return Promise.resolve('denied');
      return h.queryPermission({ mode: 'readwrite' }).then(function (p) { if (p === 'granted' || !ask) return p; return h.requestPermission({ mode: 'readwrite' }); });
    }
    function pullFile() {
      if (!fileHandle) return Promise.resolve(false);
      return filePerm(fileHandle, false).then(function (p) {
        status.filePerm = p; emit();
        if (p !== 'granted') return false;
        return fileHandle.getFile().then(function (f) { return f.text(); }).then(function (text) {
          if (!text.trim()) return false;
          var st = unpack(text); status.fileError = ''; return mergeIn(st, 'arquivo');
        });
      }).catch(function (e) { status.fileError = e.message || String(e); emit(); return false; });
    }
    function pushFile() {
      if (!fileHandle) return Promise.resolve(false);
      return filePerm(fileHandle, false).then(function (p) {
        status.filePerm = p;
        if (p !== 'granted') { emit(); return false; }
        return fileHandle.createWritable().then(function (w) { return w.write(pack(S, Date.now())).then(function () { return w.close(); }); })
          .then(function () { status.fileSync = Date.now(); status.fileError = ''; emit(); return true; });
      }).catch(function (e) { status.fileError = e.message || String(e); emit(); return false; });
    }
    function useHandle(h) {
      fileHandle = h; status.file = h.name; idbPut('fileHandle', h);
      return filePerm(h, true).then(function (p) { status.filePerm = p; emit(); return pullFile(); }).then(function () { return pushFile(); });
    }
    function connectNew() {
      if (!hasFS) return Promise.reject(new Error('este navegador não permite arquivo sincronizado — use Exportar/Importar'));
      return window.showSaveFilePicker({ suggestedName: 'progresso-duoringo.json', types: [{ description: 'Progresso do curso', accept: { 'application/json': ['.json'] } }] }).then(useHandle);
    }
    function connectExisting() {
      if (!hasFS) return Promise.reject(new Error('este navegador não permite arquivo sincronizado — use Exportar/Importar'));
      return window.showOpenFilePicker({ types: [{ description: 'Progresso do curso', accept: { 'application/json': ['.json'] } }] }).then(function (hs) { return useHandle(hs[0]); });
    }
    function reconnect() { return fileHandle ? filePerm(fileHandle, true).then(function (p) { status.filePerm = p; emit(); return pullFile(); }).then(pushFile) : Promise.resolve(false); }
    function disconnect() { fileHandle = null; status.file = null; status.filePerm = null; idbDel('fileHandle'); emit(); }

    // ---- export / import
    function exportText() { return pack(S, Date.now()); }
    function importText(text, mode) {
      var st = unpack(text);
      return snapshot('antes de importar', true).then(function () {
        if (mode === 'replace') replace(st, 'importado'); else if (!mergeIn(st, 'importado')) onReplace(S, 'nada novo');
      });
    }
    function wipe() { return snapshot('antes de zerar', true).then(function () { replace(blank(), 'zerado'); }); }

    // ---- start: reconcile localStorage with the IndexedDB mirror, then the progress file
    function init() {
      return idbGet('state').then(function (json) {
        if (json) {
          var mirror = null; try { mirror = sanitize(JSON.parse(json)); } catch (e) {}
          var lsEmpty = !Object.keys(S.pts).length && !Object.keys(S.chk).length && !Object.keys(S.notes).length;
          if (mirror && lsEmpty && (Object.keys(mirror.pts).length || Object.keys(mirror.chk).length || Object.keys(mirror.notes).length)) { S = mirror; prevFlat = flatten(S); persist(); onReplace(S, 'recuperado do espelho'); }
          else if (mirror && (mirror._ts || 0) > (S._ts || 0)) mergeIn(mirror, 'espelho');
        } else if (S._ts) idbPut('state', JSON.stringify(S));
        return idbGet('fileHandle');
      }).then(function (h) {
        if (h) { fileHandle = h; status.file = h.name; return pullFile().then(function (changed) { if (status.filePerm === 'granted' && changed !== null) pushFile(); }); }
      }).then(function () {
        if (navigator.storage && navigator.storage.persisted) navigator.storage.persisted().then(function (p) { status.persisted = p; emit(); });
        if (typeof document !== 'undefined') document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && fileHandle) pullFile(); });
        emit();
      });
    }

    return {
      get state() { return S; }, save: save, init: init, status: status, hasFileAPI: hasFS,
      connectNew: connectNew, connectExisting: connectExisting, reconnect: reconnect, disconnect: disconnect,
      exportText: exportText, importText: importText, wipe: wipe, snapshot: snapshot, listSnapshots: listSnapshots, restoreSnapshot: restoreSnapshot, mergeIn: mergeIn
    };
  }

  return { KEY: KEY, SCHEMA: SCHEMA, blank: blank, sanitize: sanitize, merge: merge, flatten: flatten, stamp: stamp, hash: hash, pack: pack, unpack: unpack, stats: stats, createStore: createStore };
});
