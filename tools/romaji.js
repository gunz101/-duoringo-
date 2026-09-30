// kana → romaji (Hepburn) + tolerant comparison used by the acceptance check.
// The course writes romaji for humans (macrons, "wa" for the particle は, spaces);
// the check only asks: "does this romaji spell the same sounds as the kana?"
'use strict';

const BASE = {
  あ:'a',い:'i',う:'u',え:'e',お:'o', か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko', さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',
  た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to', な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no', は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',
  ま:'ma',み:'mi',む:'mu',め:'me',も:'mo', や:'ya',ゆ:'yu',よ:'yo', ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro', わ:'wa',ゐ:'i',ゑ:'e',を:'wo',ん:'n',
  が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go', ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo', だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',
  ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo', ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po', ゔ:'vu',
  ぁ:'a',ぃ:'i',ぅ:'u',ぇ:'e',ぉ:'o', ゃ:'ya',ゅ:'yu',ょ:'yo', ゎ:'wa'
};
const DIGRAPH = {
  きゃ:'kya',きゅ:'kyu',きょ:'kyo', しゃ:'sha',しゅ:'shu',しょ:'sho',しぇ:'she', ちゃ:'cha',ちゅ:'chu',ちょ:'cho',ちぇ:'che',
  にゃ:'nya',にゅ:'nyu',にょ:'nyo', ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo', みゃ:'mya',みゅ:'myu',みょ:'myo', りゃ:'rya',りゅ:'ryu',りょ:'ryo',
  ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo', じゃ:'ja',じゅ:'ju',じょ:'jo',じぇ:'je', ぢゃ:'ja',ぢゅ:'ju',ぢょ:'jo', びゃ:'bya',びゅ:'byu',びょ:'byo', ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo',
  // katakana-only combinations, written here in hiragana (input is folded to hiragana first)
  てぃ:'ti',でぃ:'di',とぅ:'tu',どぅ:'du',てゅ:'tyu',でゅ:'dyu', ふぁ:'fa',ふぃ:'fi',ふぇ:'fe',ふぉ:'fo',ふゅ:'fyu',
  うぃ:'wi',うぇ:'we',うぉ:'wo', ゔぁ:'va',ゔぃ:'vi',ゔぇ:'ve',ゔぉ:'vo', つぁ:'tsa',つぃ:'tsi',つぇ:'tse',つぉ:'tso', いぇ:'ye', くぁ:'kwa'
};

function kataToHira(s) { return String(s || '').replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)); }

function kanaToRomaji(input) {
  const s = kataToHira(input);
  let out = '', i = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2), c = s[i];
    if (c === 'っ' || c === 'ッ') {                       // double the next consonant (っち → tchi)
      const nx = DIGRAPH[s.slice(i + 1, i + 3)] || BASE[s[i + 1]] || '';
      out += nx.startsWith('ch') ? 't' : (nx[0] && !/[aeiou]/.test(nx[0]) ? nx[0] : '');
      i++; continue;
    }
    if (c === 'ー') { const v = out.match(/[aeiou](?=[^aeiou]*$)/); out += v ? v[0] : ''; i++; continue; }
    if (DIGRAPH[two]) { out += DIGRAPH[two]; i += 2; continue; }
    if (BASE[c] !== undefined) { out += BASE[c]; i++; continue; }
    out += c; i++;                                         // digits, latin, punctuation pass through
  }
  return out;
}

// canonical form: both sides are folded the same way, so the comparison forgives
// macrons (ō = ou = oo), ei/ē, the particles は(wa)/へ(e)/を(o), n'/m before b-m-p, spaces and punctuation.
function canon(r) {
  let s = String(r || '').toLowerCase()
    .normalize('NFC')
    .replace(/[āâ]/g, 'aa').replace(/[īî]/g, 'ii').replace(/[ūû]/g, 'uu').replace(/[ēê]/g, 'ee').replace(/[ōô]/g, 'oo')
    .replace(/[^a-z0-9]/g, '')
    .replace(/cch/g, 'tch')
    .replace(/m(?=[bmp])/g, 'n')
    .replace(/wo/g, 'o').replace(/wa/g, 'ha').replace(/he/g, 'e');
  // vowel length is forgiven (ō = ou = oo = o; ei = e), collapsed until stable so both sides agree
  // (きのう うち → kinouuchi and "Kinō uchi" → kinoouchi must end the same)
  for (let prev = ''; prev !== s;) { prev = s; s = s.replace(/ou/g, 'o').replace(/ei/g, 'e').replace(/([aeiou])\1+/g, '$1'); }
  return s.replace(/([^aeiou])\1+/g, '$1$1');
}

function romajiMatches(kana, romaji) {
  return canon(kanaToRomaji(kana)) === canon(romaji);
}

module.exports = { kanaToRomaji, kataToHira, canon, romajiMatches };

if (require.main === module) {
  const T = [
    ['わたしは がくせいです。', 'Watashi wa gakusei desu.'],
    ['とうきょうに いきます。', 'Tōkyō ni ikimasu.'],
    ['コーヒーを のみます。', 'Kōhī o nomimasu.'],
    ['まっちゃ', 'matcha'], ['しんぶん', 'shimbun'], ['きんえん', "kin'en"], ['せんせい', 'sensē'],
    ['がっこうへ いきます', 'gakkō e ikimasu'], ['パーティー', 'pātī'], ['ちょっと', 'chotto'], ['おおきい', 'ōkii']
  ];
  let ok = 0; T.forEach(([k, r]) => { const m = romajiMatches(k, r); if (m) ok++; else console.log('✗', k, '|', r, '|', kanaToRomaji(k), canon(kanaToRomaji(k)), canon(r)); });
  console.log('romaji self-test ' + ok + '/' + T.length);
  const bad = romajiMatches('わたしは がくせいです。', 'Watashi wa gakusei da.'); console.log('mismatch detected:', !bad);
}
