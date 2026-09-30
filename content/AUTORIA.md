# Authoring guide — how to write a lesson of the ヅオリンゴー Japanese Course

Read all of this before writing. **The gold standard is `content/aulas/01-1.json`**: copy its structure, tone, depth and format. Every lesson must be as good and as careful as that one.

## The learner and the language of the course
- The learner studies 1–1.5 hours a day. There are no dates and no deadlines: progress goes by mastery milestones.
- He studies with **Genki I 3rd ed.** and the workbook, plays **Wagotabi** (an RPG in Japanese ordered by JLPT level), and does his reviews in the **ヅオリンゴー** app.
- **The course is taught in ENGLISH, straight from English to Japanese.** Every explanation, translation, instruction, pitfall, answer key, culture note and checklist item is in clear, natural English.
- **No Portuguese anywhere.** The checker rejects any Portuguese. Translations go in the field `en`, never `pt`.
- His biggest difficulty is **building sentences**: he gets lost among the parts and does not know which piece does what. So every explanation must make clear **which block of the sentence has which job** (topic, object, place, predicate…) and must drill **reading from the predicate at the end**.

## Content sources — use all three
Every lesson is built from three sources, not from Genki alone:
1. **Genki (3rd ed.)** decides the order and the points of each lesson (cite by lesson and point name, never copy text).
2. **Sakubi** (https://sakubi.neocities.org/) — a grammar guide whose text is **public domain / CC0**. Its sections are split into files in the session scratchpad (sakubi/<sectionId>.txt; index in sakubi/INDEX.tsv); the verified sections for each lesson are listed in content/readings.json. **Use its content**: its clearer framings (e.g. particles as case markers, "の means の", verbs as conjugation classes), rules and nuances Genki leaves out, and its warnings about common misunderstandings. You may adapt its explanations closely (rewrite them in the course voice, for our level). **Never copy Sakubi's example sentences that quote anime/manga/media** (the author uses them under fair use — they are not free); always write original examples.
3. **DJT Guide to Japanese** (https://djtguide.neocities.org/guide, and its Resource Guide) — **no stated license: paraphrase, never copy its text**. Use its **method** in howToStudy and practice where it fits: one grammar guide read through, spaced repetition for vocabulary, kanji learned through vocabulary (or mnemonics/radicals if kanji are slow), sentence mining with a pop-up dictionary (Yomitan) into SRS, and reading real Japanese early (easy manga, graded readers). Never link its downloads of books.

Every lesson ends with a **`credits`** array, e.g. `["Explanations adapted in part from Sakubi (public domain, CC0) — sakubi.neocities.org", "Study method informed by the DJT Guide to Japanese — djtguide.neocities.org/guide"]` (list only the sources you actually used).

## Non-negotiable rules
1. **Original content.** Genki and the DJT guide are never copied; Sakubi (CC0) may be adapted, but never its media quotations.
   - Do not transcribe dialogues, texts, examples or exercises from Genki or any other book or site. Write new sentences.
   - Do not copy the examples of genki-companion (`C:\Users\ramal\genki-companion\index.html`). Use it only to see **which points** to cover.
2. **No textbook page numbers.** Cite Genki by lesson and grammar point name, using the `genki.points` field with the English names Genki uses.
   - Workbook pages come **only** from the verified `C:\Dev\japanese-study-app\renderer\genki_workbook.json`, with exactly its page numbers and titles.
   - In that file, `cg` = conversation/grammar exercises and `rw` = reading/writing/kanji.
3. **Never invent a rule.** If you have a real doubt about a usage, write what is safe and explain the doubt in the point's `flag` field, which is shown to the learner. Do not guess.
4. **No dates, deadlines, "week N", "behind schedule".** Progress is by mastery.
5. **Every example and vocabulary item has `jp` + `kana` + `romaji` + `en`.** Romaji never appears without the Japanese next to it. In the answer key, every Japanese answer has `jp` + `romaji`, plus `kana` if `jp` contains kanji.
6. **Tone:** a patient, precise teacher. Short sentences, **bold** only for the essentials. Explain grammar in plain English, not linguistics jargon; when a term helps (topic, particle, predicate), define it once.

## Conventions

### Japanese (`jp`)
Genki style.
- **Lessons 1–2:** kana only.
- **From L3 on:** use kanji **only** among those Genki has introduced up to that lesson. The list is in `tools/check.js` (`GENKI_KANJI`), and the checker warns about kanji not introduced yet. When in doubt, use kana.
- **Lessons 1–6:** put a space between sentence blocks, Genki style: `わたしは がくせいです。` Keep the spaces through Genki I.
- **Genki II and later:** natural Japanese without spaces, kanji at N5/N4 level (N3 in the Bridge). Keep rare kanji in kana.
- A short dialogue goes on one line: `A。— B。`

### Kana (`kana`)
- The full reading in hiragana. Katakana words stay in katakana. Use the same spaces as `jp`.
- No kanji.

### Romaji (`romaji`)
- Hepburn, with macrons for long o/u (`Tōkyō`, `kūkō`, `senkō`); `ei` stays `ei` (`sensei`) and `ii` stays `ii`.
- Particles: は = `wa`, へ = `e`, を = `o`. Katakana ー = macron (`kōhī`).
- Capitalize proper names and the first word of a sentence. Suffixes take a hyphen: `Tanaka-san`.
- The checker compares romaji with kana automatically; if it reports an error, they really don't match.

### English (`en`)
- Natural English that means **exactly** what the Japanese says: not more, not less.
- When a literal version helps the learner see the structure, add it in brackets, e.g. `"I'm a student." [lit. as for me, student is]`. Use this sparingly, for the key examples of a point.

### Names in examples
Mix Japanese and international names (たなか, すずき, やまだ, マリア, ペドロ, アナ, ルーカス, ジョン, エミリー…).

### ids
- The lesson id is the file name without `.json`. Grammar points are `<id>-a`, `<id>-b`, …
- `gc` = the genki-companion point id (`"<lesson>-<n>"`) listed in `content/curso.json` for that lesson (the `gc` field of each lesson). Each `gc` is used by one point only; points with no match get `"gc": null`.

## The 10 blocks (all required)

1. **`canDo`**: 3–5 concrete, testable "I can…" statements.

2. **`duration`**:
   - `total` is `"60–75 min"`, with 5–7 blocks whose minutes add up to that range: warm-up → vocabulary → grammar → video → homework → checklist.
   - A dense lesson may use `"70–90 min"` and suggest two sessions.

3. **`prereqs`**:
   - `aulas`: earlier lesson ids.
   - `skills`: what the learner must already know.
   - `vocab`: 12–25 words used in the examples and homework, consistent with that Genki lesson.

   Genki I vocabulary by lesson is in `C:\Dev\japanese-study-app\renderer\vocab_n5.json` (field `lesson`, glosses in `en`). Use it as a source of **words, not sentences**.

4. **`grammar`**: one object per point in the map (occasionally two small points together). Each has:
   - `title`
   - `gloss`: a short English gloss
   - `explanation`: the why and the how, including the job of each block. You can use `**bold**`, `\n` line breaks and lines starting with `• `.
   - `structure`: a short formula, e.g. `[place] で [object] を [verb]`
   - `examples`: **2–3** original examples in different contexts
   - `pitfalls`: 2–4 typical learner mistakes, always shown as wrong ✗ → right ✓
   - `howToStudy`: this is block 5. Give 3 practical steps, at least one using 🔬 (sentence anatomy) or speaking out loud.

5. **How to study**: lives inside each point (`howToStudy`).

6. **`media`**: 2–4 items in order (`order` 1, 2, 3…):
   1. the Genki reading for the lesson (cite the point);
   2. a video;
   3. for Lessons 1–12, the genki-companion for that lesson (`url` `"../genki-companion/index.html"`).

   For videos, use `kind:"video"`, `where:"YouTube · X channel"`, `url:""` and a `search` field with the exact search term. **Never invent URLs.** Verified ToKini Andy and Game Gengo videos are injected automatically by the build, so suggest another good channel, such as Japanese Ammo with Misa. The matching **Sakubi** grammar-guide section is also injected automatically (content/readings.json): do not add Sakubi links yourself.

7. **`homework`** — done **by hand in a notebook**:
   - `intro` plus 3–4 `tasks` of varied types, 3–6 items each: translate EN→JP, fill in a particle or form, transform (affirmative→negative, present→past…), order the blocks, produce (write about yourself).
   - **Every item has an answer `a`**. Add a `note` when the "why" helps. For production tasks the answer is a **model**, and the `note` says what to check.
   - `workbook`: the pages of **that lesson** from `genki_workbook.json`, split across the lesson's aulas by point, with a `tip` on when to do them. Genki II has no workbook data: use `[]` and add "If you have the Genki II Workbook, do this lesson's exercises too." to the `intro`.

8. **`practice`**: 4–5 items, **always one with Wagotabi** in Lessons 1–23. Do not invent details about the game: tell the learner to hunt for the lesson's point in the game's dialogues. Also use the ヅオリンゴー app (the real features are listed below), shadowing with the lesson's 🔊, and speaking (recording yourself).

9. **`culture`**: one habit or custom per lesson, with `title`, `titleJp`, `body` (3–6 factual, non-exaggerated sentences) and `try` (something the learner can do or practice). Use the topic assigned to you in the tables below. When unsure of a fact, be conservative ("usually", "in general").

10. **`checklist`**: 5–8 **mastery** items ("I can… without looking"). Always include "I did the homework and checked it against the answer key" and "I did Workbook pages X–Y" when there are pages.

### Milestone lessons (M-1…M-6)
- `grammar` is one review point per theme of the unit, each with NEW examples combining 2+ earlier points.
- The homework includes a **self-test** of 20–30 mixed items with answers, where each `note` says "Wrong? Review lesson X". It also includes a speaking task with a model answer.

## Real features of the ヅオリンゴー app (use only these names)
- **Review:** the SRS decks; the **🌊 All** deck gathers every review due today. **Vocabulary** for each Genki lesson is in the SRS.
- **Practice L#:** per-lesson practice for Genki: conjugation, listening, comprehension, workbook-style formats.
- **Drills:** Conjugation, Numbers, Particles and **🔬 Anatomy**. Anatomy has three modes:
  - **🏷 Tag**: name a block's job;
  - **🧱 Build from the end**: build the sentence starting from the predicate;
  - **🔬 Analyze**: paste any sentence.
- **Kana:** the Kana Trail (hiragana and katakana, row by row), Free practice, Write (stroke order). **Kanji:** ✍️ Write, with stroke order.
- **Journal:** write your own sentences, with "Anatomy of what I wrote". Also **Mining** (sentence mining) and **Immersion → Games**, where you log a Wagotabi session and paste a line from the game into Anatomy.
- The **🏫 Course** tab of the app is this course.
- Separate kana apps: kana-flow (adaptive typing) and kana-speed-trainer (speed).

## Rules for later parts

### Genki II (Lessons 13–23)
- `"genki": { "book": "Genki II", "lesson": N, "points": [...] }`.
- The order and split of Genki II points **has not been verified against the book**. In the first lesson of each Genki lesson, put this in the `flag` of the first point: "Check in your Genki II that this lesson has these points in this order."

### N3 Bridge (P-01…P-22)
- `"genki": null`.
- Block 6: a video with `search` and `url:""`, a reading (Tae Kim, JLPT Sensei) with `search`, and one input item (NHK Web Easy or a podcast).
- Every point needs a **contrast** with the neighbor it is confused with (ようになる × ようにする, ために × ように…).
- Practice: Wagotabi (N3 area), NHK Web Easy, the app's Journal (5 sentences of your own), shadowing, speaking.

### Travel Track (V-01…V-08)
- Situational lessons: `grammar` = 3–4 **situations**.
  - `explanation`: what happens and what you will hear.
  - `structure`: the sentence pattern.
  - Examples: short dialogues (A。— B。) with the phrases a traveler really uses and hears, in polite です/ます.
- `"genki": null`. Concrete `canDo`, e.g. "I can ask for a table for two and whether there is an English menu".
- Be conservative with practical facts (rules, prices and procedures change): "usually", "check on site". Do not give prices.

## Culture topics (do not repeat topics)

| lesson | topic |
|---|---|
| 00-1 | Why Japanese has three scripts (kanji, hiragana, katakana) |
| 00-2 | Japanese words borrowed from Portuguese (パン, カステラ, タバコ, ボタン…) |
| 00-3 | ただいま／おかえり and いってきます／いってらっしゃい |
| 01-1 | おじぎ — bowing |
| 01-2 | The Japanese school year starts in April (〜ねんせい) |
| 02-1 | Exchanging business cards (めいし) |
| 02-2 | Money: the little tray at the register, no tipping |
| 02-3 | あいづち — showing you are listening |
| 03-1 | Punctuality (trains, arriving early) |
| 03-2 | Taking off your shoes: げんかん and slippers |
| 03-3 | Saying no without saying "no" (ちょっと…) |
| 04-1 | The konbini (コンビニ) |
| 04-2 | Long holidays: Golden Week and お盆 |
| 04-3 | Splitting the bill: わりかん |
| M-1 | おみやげ — bringing back souvenirs |
| 05-1 | The sense of season: はなみ and seasonal food |
| 05-2 | いただきます／ごちそうさま |
| 05-3 | Counting on your fingers, the Japanese way |
| 06-1 | Lines and order (ならぶ) |
| 06-2 | Train etiquette (phones, priority seats) |
| 06-3 | Sorting the garbage |
| 06-4 | えんりょ — offering and accepting help |
| 07-1 | うち and そと — "my" family × "your" family |
| 07-2 | Answering compliments modestly |
| 07-3 | Visiting someone's home (おじゃまします, bringing something) |
| 08-1 | せんぱい／こうはい — who you can be casual with |
| 08-2 | たてまえ／ほんね |
| 08-3 | かんぱい and pouring for others |
| M-2 | まつり — summer festivals |
| 09-1 | Traditional theater: kabuki |
| 09-2 | Gifts and wrapping |
| 09-3 | LINE and stickers (スタンプ) |
| 10-1 | The Shinkansen and えきべん |
| 10-2 | New Year: おしょうがつ, はつもうで, ねんがじょう |
| 10-3 | Japanese addresses (numbered blocks) |
| 11-1 | ぶかつ — school clubs |
| 11-2 | Karaoke |
| 12-1 | Wearing a mask when you have a cold |
| 12-2 | おふろ — the evening bath |
| 12-3 | ほうれんそう at work (報告・連絡・相談) |
| M-3 | Thanking again afterwards (お礼 the next day) |
| 13-1 | アルバイト — part-time jobs |
| 13-2 | ゆるキャラ — mascots |
| 13-3 | やたい — festival food stalls |
| 14-1 | Valentine's Day and White Day in Japan |
| 14-2 | おかえし — returning gifts |
| 14-3 | Unlucky numbers: 4 and 9 |
| 15-1 | しゅうがくりょこう — school trips |
| 15-2 | とざん — mountain climbing (and Mt. Fuji) |
| 16-1 | Lost and found: lost things usually come back |
| 16-2 | くうきを よむ — "reading the air" |
| 16-3 | すみません for everything: sorry and thanks |
| M-4 | Weddings: ごしゅうぎ |
| 17-1 | TV variety shows |
| 17-2 | Earthquakes and ぼうさい (preparedness) |
| 17-3 | りゅうこうご — buzzwords |
| 18-1 | Vending machines |
| 18-2 | しゅうでん — the last train |
| 18-3 | Uniforms at school and work |
| 19-1 | めうえ／めした — hierarchy and keigo |
| 19-2 | おつかれさまです |
| 20-1 | おもてなし and いらっしゃいませ |
| 20-2 | デパちか — the department-store basement |
| 20-3 | 100-yen shops |
| 21-1 | Bicycles: parking and rules |
| 21-2 | The Japanese house: たたみ and ふとん |
| 22-1 | じゅく and entrance exams (じゅけん) |
| 22-2 | Students clean their school |
| 23-1 | そうべつかい — farewell parties |
| 23-2 | よせがき — group farewell messages |
| M-5 | ことわざ — proverbs |
| P-01 | ラジオたいそう |
| P-02 | Jobs and てんしょく (changing jobs) |
| P-03 | おまもり — amulets |
| P-04 | つゆ — the rainy season and the weather forecast |
| P-05 | Ramen and its rules (slurping is fine) |
| P-06 | はなびたいかい — fireworks festivals |
| P-07 | はんこ — personal seals |
| P-08 | かいぜん — continuous improvement |
| P-09 | NHK and the newspapers |
| P-10 | おはかまいり — visiting family graves |
| P-11 | ゆうきゅう — asking for time off |
| P-12 | Work e-mail: おせわに なって おります |
| P-13 | たてがき — vertical writing |
| P-14 | ぶどう — martial arts and れい |
| P-15 | ころもがえ — the seasonal wardrobe change |
| P-16 | かんさいべん — the Kansai dialect |
| P-17 | Onomatopoeia in manga |
| P-18 | How to read a Japanese newspaper |
| P-19 | ぎり — social obligations |
| P-20 | えきビル — the station as a shopping mall |
| P-21 | しょどう — calligraphy |
| P-22 | らくご — the art of storytelling |
| M-6 | さどう — the tea ceremony |
| V-01 | Arriving: cash, IC cards and Wi-Fi |
| V-02 | Women-only train cars |
| V-03 | Wearing a yukata (left over right) |
| V-04 | おしぼり and asking for the bill (おかいけい) |
| V-05 | Paid bags at the register (レジぶくろ) |
| V-06 | こうばん — the neighborhood police box |
| V-07 | ドラッグストア — Japanese drugstores |
| V-08 | Tattoos and onsen |

## Before you finish
1. Run `node tools/check.js --only <your ids, comma-separated>` in `C:\Users\ramal\curso-japones` and fix **every** error ✗, including any Portuguese it finds. Also fix kanji warnings ⚠. Only an intentional `flag` may remain.
2. Re-read every Japanese example and ask:
   - Is it natural?
   - Is the particle right?
   - Does the English match exactly?
   - Does the romaji match?
3. Write **only** your own files in `content/aulas/`. Do not touch `curso.json`, the tools or other people's lessons.
