// Acceptance checks for the course content (spec §6). Usage:
//   node tools/check.js            → report; exit 1 on errors
//   node tools/check.js --final    → also requires every mapped aula + all 77 genki-companion points
//   node tools/check.js --readings → also compares kana with kuromoji readings (warnings)
'use strict';
const fs = require('fs');
const path = require('path');
const { romajiMatches, kataToHira } = require('./romaji');

const ROOT = path.join(__dirname, '..');
const KANJI = /[一-鿿㐀-䶿々〆]/;
// Kanji introduced in the Genki I kanji lessons (3rd ed.), cumulative by lesson. Warning only:
// the course writes Genki-style (kanji once introduced, kana otherwise) and ALWAYS gives the kana.
const GENKI_KANJI = {
  3: '一二三四五六七八九十百千万円時', 4: '日本人月火水木金土曜上下中半', 5: '山川元気天私今田女男見行食飲',
  6: '東西南北口出右左分先生大学外国', 7: '京子小会社父母高校毎語文帰入', 8: '員新聞作仕事電車休言読思次何',
  9: '午後前名白雨書友間家話少古知来', 10: '住正年売買町長道雪立自夜朝持', 11: '手紙好近明病院映画歌市所勉強有旅',
  12: '昔々神早起牛使働連別度赤青色'
};
function kanjiUpTo(lesson) { let s = ''; Object.keys(GENKI_KANJI).forEach(k => { if (+k <= lesson) s += GENKI_KANJI[k]; }); return s; }
const JP = /[぀-ヿ一-鿿]/;

function loadCourse() {
  const curso = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'curso.json'), 'utf8'));
  const dir = path.join(ROOT, 'content', 'aulas');
  const aulas = {};
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    try { aulas[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { aulas[f.replace(/\.json$/, '')] = { __parseError: e.message }; }
  }
  let recursos = null;
  const rp = path.join(ROOT, 'content', 'recursos.json');
  if (fs.existsSync(rp)) recursos = JSON.parse(fs.readFileSync(rp, 'utf8'));
  return { curso, aulas, recursos };
}

function check(opts = {}) {
  const { curso, aulas: all } = loadCourse();
  const only = opts.only ? new Set(opts.only) : null;
  const aulas = only ? Object.fromEntries(Object.entries(all).filter(([k]) => only.has(k))) : all;
  let curLesson = null;
  const errors = [], warnings = [], stats = { aulas: 0, examples: 0, vocab: 0, hwItems: 0, points: 0 };
  const err = (id, m) => errors.push(`[${id}] ${m}`), warn = (id, m) => warnings.push(`[${id}] ${m}`);
  const mapIds = [], mapById = {};
  curso.units.forEach(u => u.aulas.forEach(a => { mapIds.push(a.id); mapById[a.id] = Object.assign({ unit: u.id }, a); }));
  const dupMap = mapIds.filter((x, i) => mapIds.indexOf(x) !== i);
  if (dupMap.length) err('curso', 'ids duplicados no mapa: ' + dupMap.join(', '));

  const seenSentences = {}, gcSeen = {}, pointIds = {};
  const DATE_RE = [/\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/, /\bdeadline\b/i, /\bdue date\b/i, /\bbehind schedule\b/i, /\boverdue\b/i, /\bby (monday|tuesday|wednesday|thursday|friday|saturday|sunday|the end of the (week|month))\b/i, /\bweek \d+ of\b/i, /\bprazo\b/i, /\batrasad[oa]\b/i];
  // the course is taught in ENGLISH: Portuguese words in teaching text are an error (Japanese and names are fine)
  const PT_RE = /\b(você|não|também|então|porque|quando|aula|lição|frase|exemplo|palavra|português|obrigad[oa]|está|são|é o|é a|para o|para a|com o|com a|uma|das\s|nas\s|pelo|pela|isso|isto|aqui|muito|mais|mesmo|sempre|depois|antes|agora|hoje|ontem|amanhã)\b|[ãõçâêô]/i;

  function textFields(obj, acc = []) {
    if (typeof obj === 'string') acc.push(obj);
    else if (Array.isArray(obj)) obj.forEach(x => textFields(x, acc));
    else if (obj && typeof obj === 'object') Object.keys(obj).forEach(k => { if (k !== 'url' && k !== 'where') textFields(obj[k], acc); });
    return acc;
  }
  function checkSentence(id, where, ex, needEn = true) {
    if (!ex || typeof ex !== 'object') return err(id, where + ': exemplo ausente');
    ['jp', 'kana', 'romaji'].forEach(k => { if (!ex[k] || !String(ex[k]).trim()) err(id, `${where}: falta "${k}"`); });
    if (needEn && (!ex.en || !String(ex.en).trim())) err(id, `${where}: missing "en"`);
    if (ex.pt !== undefined) err(id, `${where}: Portuguese field "pt" must be removed (the course is in English)`);
    if (ex.kana && KANJI.test(ex.kana)) err(id, `${where}: o campo kana tem kanji: ${ex.kana}`);
    if (ex.jp && !JP.test(ex.jp)) err(id, `${where}: jp sem japonês: ${ex.jp}`);
    if (ex.kana && ex.romaji && !romajiMatches(ex.kana, ex.romaji)) err(id, `${where}: romaji não bate com o kana → ${ex.kana} | ${ex.romaji}`);
    if (ex.jp && ex.kana && !KANJI.test(ex.jp) && strip(ex.jp) !== strip(ex.kana)) err(id, `${where}: jp (sem kanji) difere do kana → ${ex.jp} | ${ex.kana}`);
    if (ex.romaji && JP.test(ex.romaji)) err(id, `${where}: romaji contém japonês: ${ex.romaji}`);
    if (curLesson && curLesson <= 12 && ex.jp) { const ok = kanjiUpTo(curLesson); const bad = [...new Set([...String(ex.jp)].filter(ch => KANJI.test(ch) && !ok.includes(ch)))]; if (bad.length) warn(id, `${where}: kanji ainda não apresentado no Genki até a L${curLesson}: ${bad.join('')} (${ex.jp})`); }
  }
  function strip(s) { return kataToHira(String(s)).replace(/[\s、。！？!?「」『』（）()・…—\-〜~]/g, ''); }

  for (const id of Object.keys(aulas)) {
    const a = aulas[id];
    if (a.__parseError) { err(id, 'JSON inválido: ' + a.__parseError); continue; }
    stats.aulas++;
    if (a.id !== id) err(id, `id interno "${a.id}" difere do nome do arquivo`);
    if (!mapById[id]) err(id, 'aula não está no mapa curso.json');
    else if (a.unit !== mapById[id].unit) err(id, `unit "${a.unit}" difere do mapa ("${mapById[id].unit}")`);
    const milestone = !!(mapById[id] && mapById[id].milestone);
    const um = mapById[id] ? curso.units.find(u => u.id === mapById[id].unit) : null;
    curLesson = /^00-/.test(id) ? 0 : (a.genki && a.genki.lesson) || (um && um.lesson) || null;
    if (/^M-[123]$/.test(id)) curLesson = { 'M-1': 4, 'M-2': 8, 'M-3': 12 }[id];
    // 1 · título + can-do
    if (!a.title) err(id, 'bloco 1: falta título');
    if (!a.titleJp || !JP.test(a.titleJp)) err(id, 'bloco 1: falta titleJp em japonês');
    if (!Array.isArray(a.canDo) || a.canDo.length < 2) err(id, 'bloco 1: can-do precisa de ≥2 itens');
    // 2 · duração + divisão
    if (!a.duration || !a.duration.total || !Array.isArray(a.duration.blocks) || a.duration.blocks.length < 3) err(id, 'bloco 2: duração/divisão incompleta');
    else {
      const m = String(a.duration.total).match(/(\d+)\s*[–-]\s*(\d+)/), sum = a.duration.blocks.reduce((s, b) => s + (+b.min || 0), 0);
      if (m && (sum < +m[1] - 5 || sum > +m[2] + 5)) warn(id, `bloco 2: soma dos blocos ${sum} min fora de ${a.duration.total}`);
      a.duration.blocks.forEach((b, i) => { if (!b.t || !(+b.min > 0)) err(id, `bloco 2: bloco ${i + 1} sem t/min`); });
    }
    // 3 · pré-requisitos (+ vocabulário)
    if (!a.prereqs || !Array.isArray(a.prereqs.skills) || !a.prereqs.skills.length) err(id, 'bloco 3: faltam pré-requisitos (skills)');
    else {
      (a.prereqs.aulas || []).forEach(p => { if (!mapById[p]) err(id, `bloco 3: pré-requisito "${p}" não existe no mapa`); else if (mapIds.indexOf(p) >= mapIds.indexOf(id) && !/^V-/.test(id)) warn(id, `bloco 3: pré-requisito "${p}" vem depois desta aula`); });
      (a.prereqs.vocab || []).forEach((v, i) => { checkSentence(id, `vocab ${i + 1} (${v.jp || '?'})`, v); stats.vocab++; });
      if (!milestone && !(a.prereqs.vocab || []).length) warn(id, 'bloco 3: nenhum vocabulário listado');
    }
    // 4 · gramática  +  5 · como estudar
    if (!Array.isArray(a.grammar) || !a.grammar.length) err(id, 'bloco 4: sem pontos de gramática');
    else a.grammar.forEach((g, gi) => {
      const gid = g.id || `#${gi + 1}`; stats.points++;
      if (!g.id || !new RegExp('^' + id.replace(/[-]/g, '\\-') + '-[a-z]$').test(g.id)) err(id, `bloco 4: id do ponto "${g.id}" deve ser ${id}-a, ${id}-b…`);
      if (pointIds[g.id]) err(id, `bloco 4: id de ponto duplicado ${g.id}`); pointIds[g.id] = true;
      ['title', 'explanation', 'structure'].forEach(k => { if (!g[k] || !String(g[k]).trim()) err(id, `bloco 4 (${gid}): falta ${k}`); });
      const nEx = (g.examples || []).length;
      if (nEx < 2 || nEx > 4) err(id, `bloco 4 (${gid}): precisa de 2–3 exemplos (tem ${nEx})`);
      (g.examples || []).forEach((ex, ei) => {
        checkSentence(id, `exemplo ${gid}.${ei + 1}`, ex); stats.examples++;
        const key = strip(ex.jp || '');
        if (key.length >= 8) { if (seenSentences[key] && seenSentences[key] !== id) warn(id, `exemplo repetido de ${seenSentences[key]}: ${ex.jp}`); seenSentences[key] = seenSentences[key] || id; }
      });
      if (!Array.isArray(g.pitfalls) || !g.pitfalls.length) err(id, `bloco 4 (${gid}): faltam armadilhas`);
      if (!Array.isArray(g.howToStudy) || !g.howToStudy.length) err(id, `bloco 5 (${gid}): falta "como estudar"`);
      if (g.gc) { if (gcSeen[g.gc]) warn(id, `gc ${g.gc} também em ${gcSeen[g.gc]}`); gcSeen[g.gc] = gcSeen[g.gc] || id; }
      if (g.flag) warn(id, `⚠️ sinalizado (${gid}): ${g.flag}`);
    });
    // 6 · vídeos/leitura em ordem
    if (!Array.isArray(a.media) || !a.media.length) err(id, 'bloco 6: sem vídeos/leitura');
    else a.media.forEach((m, i) => {
      if (m.order !== i + 1) err(id, `bloco 6: ordem quebrada no item ${i + 1}`);
      if (!m.title || !m.where || !m.kind) err(id, `bloco 6: item ${i + 1} sem title/where/kind`);
      if (m.url && !/^(https?:\/\/|\.\.\/|\.\/)/.test(m.url)) err(id, `bloco 6: url inválida ${m.url}`);
    });
    // 7 · lição de casa + gabarito
    const hw = a.homework || {};
    if (!Array.isArray(hw.tasks) || !hw.tasks.length) err(id, 'bloco 7: sem tarefas');
    else hw.tasks.forEach((t, ti) => {
      if (!t.prompt || !Array.isArray(t.items) || !t.items.length) err(id, `bloco 7: tarefa ${ti + 1} sem prompt/itens`);
      (t.items || []).forEach((it, ii) => {
        stats.hwItems++;
        const w = `bloco 7: ${t.id || ti + 1}.${ii + 1}`;
        if (!it.q) err(id, `${w} sem enunciado`);
        const ans = it.a;
        if (!ans || (typeof ans === 'object' && !ans.jp && !ans.en)) return err(id, `${w} NO ANSWER KEY`);
        if (ans && typeof ans === 'object' && ans.pt !== undefined) err(id, `${w} Portuguese field "pt" in the answer`);
        if (typeof ans === 'object' && ans.jp) {
          if (!ans.romaji) err(id, `${w} resposta em japonês sem romaji`);
          const kana = KANJI.test(ans.jp) ? ans.kana : ans.jp;
          if (KANJI.test(ans.jp) && !ans.kana) err(id, `${w} resposta com kanji precisa de "kana"`);
          if (kana && ans.romaji && !romajiMatches(kana, ans.romaji)) err(id, `${w} romaji não bate → ${kana} | ${ans.romaji}`);
        }
      });
    });
    if (!Array.isArray(hw.workbook)) err(id, 'bloco 7: campo workbook ausente (use [] se não houver)');
    // 8 · prática em casa
    if (!Array.isArray(a.practice) || a.practice.length < 3) err(id, 'bloco 8: prática precisa de ≥3 itens');
    else if (/^(0\d|1[0-2]|M-[123])/.test(id) && !a.practice.some(p => /wagotabi/i.test(p.tool))) warn(id, 'bloco 8: sem Wagotabi');
    // 9 · cultura
    if (!a.culture || !a.culture.title || !a.culture.body || !a.culture.try) err(id, 'bloco 9: cultura incompleta (title/body/try)');
    // 10 · checklist
    if (!Array.isArray(a.checklist) || a.checklist.length < 4) err(id, 'bloco 10: checklist precisa de ≥4 itens');
    // no dates / deadlines anywhere
    textFields(a).forEach(s => DATE_RE.forEach(re => { if (re.test(s)) err(id, `date/deadline in text: "${s.slice(0, 80)}"`); }));
    textFields(a).forEach(s => { const noJp = String(s).replace(/São Paulo|Pokémon|Paraná|Ceará|Maranhão|Belém|Goiânia/g, ' ').replace(/[\u3040-\u30ff\u4e00-\u9fff々〆ー〜～・「」『』（）]+/g, ' '); if (PT_RE.test(noJp)) err(id, `Portuguese in text: "${String(s).slice(0, 90)}"`); });
  }
  // coverage
  if (only) return { errors, warnings, stats, missing: [], gcMiss: [] };
  const missing = mapIds.filter(x => !aulas[x]);
  (opts.final ? err : warn)('curso', `${missing.length} aulas do mapa ainda sem arquivo${missing.length ? ': ' + missing.slice(0, 12).join(', ') + (missing.length > 12 ? '…' : '') : ''}`);
  const GC = [3, 7, 8, 8, 7, 7, 6, 8, 6, 7, 4, 6];
  const gcAll = []; GC.forEach((n, i) => { for (let k = 1; k <= n; k++) gcAll.push(`${i + 1}-${k}`); });
  const gcMiss = gcAll.filter(g => !gcSeen[g]);
  if (gcMiss.length) (opts.final ? err : warn)('curso', `pontos do genki-companion sem aula: ${gcMiss.join(', ')}`);
  return { errors, warnings, stats, missing, gcMiss };
}

async function readingCheck() {
  let kuromoji; try { kuromoji = require('kuromoji'); } catch (e) { return ['(kuromoji não instalado — checagem de leituras pulada)']; }
  const { aulas } = loadCourse();
  const dicPath = path.join(path.dirname(require.resolve('kuromoji')), '..', 'dict') + path.sep;
  const tk = await new Promise((res, rej) => kuromoji.builder({ dicPath }).build((e, t) => e ? rej(e) : res(t)));
  const out = [];
  const norm = s => kataToHira(String(s)).replace(/[\s、。！？!?「」『』（）()・…—\-〜~ー]/g, '');
  const visit = (id, where, ex) => {
    if (!ex || !ex.jp || !ex.kana || !KANJI.test(ex.jp)) return;
    const toks = tk.tokenize(ex.jp.replace(/[—]/g, '。'));
    const rd = toks.map(t => t.reading && t.reading !== '*' ? t.reading : t.surface_form).join('');
    // kuromoji picks one reading; these alternatives are just as correct (日本 にほん/にっぽん, 一人 ひとり/いちにん, 行った いった/おこなった…)
    const ALT = [['ニッポン', 'ニホン'], ['イチニン', 'ヒトリ'], ['ニニン', 'フタリ'], ['オコナッ', 'イッ'], ['オコナウ', 'イク'], ['オコナイ', 'イキ'], ['ナニ', 'ナン'], ['ナン', 'ナニ'], ['ジュウ', 'トオ'], ['ジッ', 'ジュッ'], ['ワタクシ', 'ワタシ'], ['ライ', 'キ'], ['コン', 'イマ'], ['ジン', 'ヒト'], ['ニチ', 'ヒ'], ['カ', 'ビ'], ['ホン', 'ボン'], ['ホン', 'ポン'], ['ジ', 'トキ']];
    const kanaN = norm(ex.kana);
    const FIX = [[/いちにん/g, 'ひとり'], [/ににん/g, 'ふたり'], [/よんにん/g, 'よにん'], [/ななじ/g, 'しちじ'], [/よんじ/g, 'よじ'], [/くじ/g, 'くじ'], [/おこなっ/g, 'いっ'], [/にっぽん/g, 'にほん'], [/よんえん/g, 'よえん']];
    let rdN = norm(rd); FIX.forEach(([re, to]) => { rdN = rdN.replace(re, to); });
    let ok = rdN === kanaN || /^〜/.test(ex.jp);
    if (!ok) { // try swapping readings token by token (bounded)
      const opts = toks.map(t => { const r = t.reading && t.reading !== '*' ? t.reading : t.surface_form; const alts = [r]; ALT.forEach(([a, b]) => { if (r.includes(a)) alts.push(r.replace(a, b)); }); return alts; });
      let combos = [''];
      for (const o of opts) { const next = []; combos.forEach(c => o.forEach(x => next.push(c + x))); combos = next.slice(0, 256); }
      ok = combos.some(c => norm(c) === kanaN);
    }
    if (!ok) out.push(`[${id}] ${where}: ${ex.jp} → kana "${ex.kana}" · kuromoji "${kataToHira(rd)}"`);
  };
  for (const id of Object.keys(aulas)) {
    const a = aulas[id]; if (a.__parseError) continue;
    ((a.prereqs || {}).vocab || []).forEach((v, i) => visit(id, 'vocab ' + (i + 1), v));
    (a.grammar || []).forEach(g => (g.examples || []).forEach((ex, i) => visit(id, `${g.id}.${i + 1}`, ex)));
    ((a.homework || {}).tasks || []).forEach(t => (t.items || []).forEach((it, i) => { if (it.a && it.a.jp && it.a.kana) visit(id, `${t.id}.${i + 1}`, { jp: it.a.jp, kana: it.a.kana }); }));
  }
  return out;
}

module.exports = { check, loadCourse, readingCheck };

if (require.main === module) {
  (async () => {
    const final = process.argv.includes('--final');
    const oi = process.argv.indexOf('--only');
    const r = check({ final, only: oi > 0 ? process.argv[oi + 1].split(',') : null });
    console.log(`aulas ${r.stats.aulas} · pontos ${r.stats.points} · exemplos ${r.stats.examples} · vocab ${r.stats.vocab} · itens de casa ${r.stats.hwItems}`);
    r.warnings.forEach(w => console.log('  ⚠ ' + w));
    r.errors.forEach(e => console.log('  ✗ ' + e));
    if (process.argv.includes('--readings')) { const rd = await readingCheck(); console.log(`leituras divergentes (revisar à mão): ${rd.length}`); rd.forEach(x => console.log('  ? ' + x)); }
    console.log(r.errors.length ? `FALHOU: ${r.errors.length} erro(s)` : 'OK: nenhum erro');
    process.exit(r.errors.length ? 1 : 0);
  })();
}
