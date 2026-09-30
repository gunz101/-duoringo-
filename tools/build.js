// Build: check → (optional) sentence anatomy from the ヅオリンゴー engine → one self-contained index.html
//   node tools/build.js            (aborts on check errors)
//   node tools/build.js --force    (builds anyway, for previews)
'use strict';
const fs = require('fs');
const path = require('path');
const { check, loadCourse } = require('./check');

const ROOT = path.join(__dirname, '..');
const MIRAGE = 'C:/Dev/japanese-study-app/renderer/';

async function anatomyEngine() {
  try {
    const A = require(MIRAGE + 'lib/anatomy.js');
    const kuromoji = require('kuromoji');
    const dict = JSON.parse(fs.readFileSync(MIRAGE + 'dict_jmdict.json', 'utf8')).entries;
    const vocab = JSON.parse(fs.readFileSync(MIRAGE + 'vocab_n5.json', 'utf8')).words;
    const lex = A.buildLexicon(dict, vocab);
    const dicPath = path.join(path.dirname(require.resolve('kuromoji')), '..', 'dict') + path.sep;
    const tk = await new Promise((res, rej) => kuromoji.builder({ dicPath }).build((e, t) => e ? rej(e) : res(t)));
    // ヅオリンゴー names a color class per role; this is the same palette brightened for the dark theme
    const DARK = { pred: '#e8ecf2', topic: '#56b6ff', subj: '#ff5e6c', obj: '#36c98d', place: '#ffb454', time: '#b58cff', dest: '#4fd1c5', with: '#ff7eb6', from: '#c9a27e', reason: '#ff8a3d', mod: '#9aa3b2', how: '#8c9bff', link: '#b8a392', quote: '#5ec8ff', conn: '#9aa3b2' };
    const colors = {}; Object.keys(A.ROLES).forEach(k => { colors[k] = DARK[A.ROLES[k].color] || '#9aa3b2'; });
    return {
      colors,
      analyze(jp) {
        const r = A.analyze(String(jp).replace(/\s*—\s*/g, '　'), tk, lex);
        if (!r || !r.sentences) return null;
        const out = r.sentences.map(s => s.chunks.map(c => {
          const o = { t: c.text, r: c.role };
          if (c.particle) o.p = c.particle;
          if (c.predKind) o.k = c.predKind;
          return o;
        })).filter(s => s.length);
        const low = r.quality === 'low';
        return out.length && !low ? out : null;
      }
    };
  } catch (e) {
    console.log('  (anatomia pulada: ' + e.message.split('\n')[0] + ')');
    return null;
  }
}

(async () => {
  const force = process.argv.includes('--force');
  const r = check({ final: process.argv.includes('--final') });
  r.warnings.filter(w => !/ainda sem arquivo|genki-companion sem aula/.test(w)).forEach(w => console.log('  ⚠ ' + w));
  r.errors.forEach(e => console.log('  ✗ ' + e));
  if (r.errors.length && !force) { console.log(`build abortado: ${r.errors.length} erro(s). Use --force para uma prévia.`); process.exit(1); }

  const { curso, aulas, recursos } = loadCourse();
  const ordered = {};
  curso.units.forEach(u => u.aulas.forEach(a => { if (aulas[a.id] && !aulas[a.id].__parseError) ordered[a.id] = aulas[a.id]; }));

  // verified videos (content/videos.json) replace the writers' "search" placeholders in block 6
  const vp = path.join(ROOT, 'content', 'videos.json');
  const videos = fs.existsSync(vp) ? JSON.parse(fs.readFileSync(vp, 'utf8')).aulas : {};
  let nVid = 0;
  Object.keys(ordered).forEach(id => {
    const v = videos[id]; if (!v || !v.length) return;
    const a = ordered[id], media = a.media || [];
    const firstRead = media.filter(m => m.kind === 'leitura').slice(0, 1);
    // the verified videos replace the writer's placeholders FROM THE SAME CHANNELS; other suggestions (Misa, NHK…) stay
    const has = re => v.some(x => re.test((x.where || '') + x.title));
    const sameChannel = m => (/ToKini/i.test((m.where || '') + m.title) && has(/ToKini/i)) || (/Game Gengo/i.test((m.where || '') + m.title) && has(/Game Gengo/i));
    const otherVideos = media.filter(m => m.kind === 'video' && !m.url && !sameChannel(m));
    const rest = media.filter(m => m.kind !== 'video' && firstRead.indexOf(m) < 0);
    a.media = firstRead.concat(v.map(x => Object.assign({}, x)), otherVideos, rest).map((m, i) => Object.assign({}, m, { order: i + 1 }));
    nVid++;
  });
  if (nVid) console.log(`  vídeos verificados aplicados em ${nVid} aulas`);

  const eng = await anatomyEngine();
  let nAnat = 0, nEx = 0;
  if (eng) {
    Object.values(ordered).forEach(a => (a.grammar || []).forEach(g => (g.examples || []).forEach(ex => {
      nEx++;
      if (ex.noAnat) return;
      const an = eng.analyze(ex.jp);
      if (an) { ex.anat = an; nAnat++; }
    })));
  }
  const appsBase = 'file:///' + path.dirname(ROOT).split(path.sep).join('/') + '/';   // sibling apps (genki-companion, kana-flow) when the course runs inside ヅオリンゴー
  const data = { curso, aulas: ordered, recursos: recursos || null, roleColors: eng ? eng.colors : {}, appsBase, built: 'build' };
  const json = JSON.stringify(data).replace(/<\/(script)/gi, '<\\/$1').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const tpl = fs.readFileSync(path.join(ROOT, 'src', 'template.html'), 'utf8');
  if (!tpl.includes('/*__CURSO_DATA__*/null')) throw new Error('placeholder ausente no template');
  const html = tpl.replace('/*__CURSO_DATA__*/null', () => json);
  fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
  const kb = Math.round(Buffer.byteLength(html) / 1024);
  console.log(`index.html gerado · ${Object.keys(ordered).length} aulas · ${nEx} exemplos (${nAnat} com anatomia) · ${kb} KB`);
})().catch(e => { console.error(e); process.exit(1); });
