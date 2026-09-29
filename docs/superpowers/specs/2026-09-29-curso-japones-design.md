# Curso de Japonês Mirage · 日本語コース — design

**Status:** aprovado pelo briefing do aluno (Passo 1 do processo pedido: planejar tudo antes do conteúdo).
**Data:** 2026-09-29 · **Autor:** Claude, para o Luis ("Mirage").

---

## 1. Objetivo

Um curso completo de japonês no formato de **escola de idiomas paga**: aulas graduadas, cada uma com plano de aula, lição de casa **com gabarito**, prática em casa e um ponto de cultura. É feito para quem fala português do Brasil e avança **por marcos de domínio, sem datas e sem prazos**.

- **Espinha dorsal:** Genki I (L1–12) → Genki II (L13–23). Depois uma **Ponte N3** e uma **Trilha Viagem**.
- **Formato:** um app offline de **um único HTML**, no padrão visual dos apps que ele já tem (genki-companion, rotina-japones).
- **Ativos que o curso reaproveita e liga:**
  - Mirage (anatomia da frase, vocabulário, SRS)
  - genki-companion (77 pontos + notas)
  - rotina-japones
  - os 3 treinadores de kana
  - Wagotabi
  - Genki I Workbook (só como referência de páginas)

## 2. Decisões tomadas (padrões — o aluno pode trocar qualquer uma)

| # | Decisão | Por quê |
|---|---|---|
| D1 | Pasta `C:\Users\ramal\curso-japones\` | Fica ao lado dos outros apps, então os links relativos `../genki-companion/index.html` funcionam. |
| D2 | A saída é **um** `index.html` autocontido. A fonte fica em `content/*.json` + `src/template.html`, e `tools/build.js` junta tudo. | Cumpre o "single HTML", mas o conteúdo continua editável aula por aula. |
| D3 | O texto de ensino é em PT-BR. Todo exemplo traz **JP + kana + romaji + PT**. | É o perfil do aluno. O kana ajuda quem ainda está na fase de kana; o romaji nunca aparece sozinho. |
| D4 | O JP segue o estilo Genki: kanji só depois de apresentado nas "kanji lessons" (a partir da L3), com espaços entre os blocos da frase nas aulas iniciais. | É coerente com o livro que ele usa. |
| D5 | O conteúdo é **100% original**, sem transcrever diálogos, textos ou exercícios do Genki. A referência ao livro é feita por **lição + número da seção de gramática** (ex.: "Genki I L1 · Gramática 1"). O Workbook é citado por **página + título do exercício**, já verificados no PDF do aluno. | Regra de direitos autorais do assistente, que se aplica mesmo com a licença pessoal do aluno. As páginas do livro-texto não foram verificadas, então não são citadas. |
| D6 | Gabarito da lição de casa: **só dos exercícios originais do curso**. Para o Workbook, a orientação é conferir com o *Genki Answer Key* oficial. | As respostas do Workbook dependeriam de reproduzir os enunciados. |
| D7 | Progresso por **domínio**: uma aula conta como concluída quando todos os itens do checklist (bloco 10) estão marcados. Não há datas, streak obrigatório nem "atrasado". | É a filosofia de estudo do aluno. |
| D8 | O localStorage do curso usa a chave `curso_jp_v1`. Há **importação opcional** do progresso do genki-companion (`genki_companion_v1`), com o mapeamento de ids de ponto guardado no campo `gc`. | Aproveita os ✍️/📱/notas que ele já marcou. |
| D9 | A anatomia de cada exemplo é **pré-calculada no build** com o motor do Mirage (`anatomy.js` + kuromoji). Os papéis aparecem em PT. | Ataca a maior dificuldade dele (formação de frase) sem embutir o dicionário de 18 MB. |
| D10 | Vídeos e links vêm apenas de fontes verificadas pela pesquisa. Nenhum link é inventado. Quando não houver URL confirmada, a indicação é "canal + título a buscar". | Evita inventar. |
| D11 | Dúvida gramatical real vira um campo `flag` visível na aula (⚠️), em vez de uma regra chutada. | É a regra do briefing. |

## 3. Arquitetura

```
curso-japones/
  index.html              ← GERADO (abrir com duplo clique; offline)
  src/template.html       ← CSS + JS do app; recebe window.CURSO no build
  content/curso.json      ← unidades, ordem, marcos, rotina, guia
  content/aulas/<id>.json ← uma aula por arquivo (10 blocos)
  content/recursos.json   ← recursos externos por nível (pesquisa verificada)
  tools/build.js          ← valida → (anatomia opcional) → injeta → index.html
  tools/check.js          ← critérios de aceitação automatizados
  tools/romaji.js         ← kana→romaji tolerante, usado na checagem
  docs/superpowers/specs/ ← este documento
  README.md
```

- **Build:** `node tools/build.js` roda `check.js` e aborta se houver erro.
  - Se o motor do Mirage (`C:\Dev\japanese-study-app\renderer\lib\anatomy.js`) e o kuromoji estiverem disponíveis, anexa a anatomia a cada exemplo.
  - Se não estiverem, gera o app sem a anatomia e avisa.
- **App (vanilla JS, sem dependências):** navegação por hash (`#/`, `#/aula/01-1`, `#/rotina`, `#/guia`, `#/recursos`, `#/progresso`). A barra de progresso fica fixa no topo.

### 3.1 Modelo de dados de uma aula

```jsonc
{
  "id": "01-1", "unit": "G1-L01", "order": 4,
  "genki": { "book": "Genki I", "lesson": 1, "points": ["X は Y です", "Question sentences", "Noun₁ の Noun₂"] },
  "title": "Eu sou…", "titleJp": "わたしは がくせいです",
  // 1 · título + can-do
  "canDo": ["…"],
  // 2 · duração + divisão
  "duration": { "total": "60–75 min", "blocks": [{ "t": "…", "min": 10 }] },
  // 3 · pré-requisitos (+ vocabulário da aula)
  "prereqs": { "aulas": ["00-3"], "skills": ["…"], "vocab": [{ "jp": "", "kana": "", "romaji": "", "pt": "" }] },
  // 4 · gramática  +  5 · como estudar (por ponto)
  "grammar": [{
    "id": "01-1-a", "gc": "1-1", "title": "X は Y です", "gloss": "X é Y",
    "explanation": "…", "structure": "[X] は [Y] です",
    "examples": [{ "jp": "", "kana": "", "romaji": "", "pt": "" }],
    "pitfalls": ["…"], "howToStudy": ["…"], "flag": null
  }],
  // 6 · vídeos/leitura EM ORDEM
  "media": [{ "order": 1, "kind": "video|leitura|app", "title": "", "where": "", "url": "", "when": "" }],
  // 7 · lição de casa no caderno + gabarito
  "homework": {
    "intro": "…",
    "tasks": [{ "id": "h1", "type": "…", "prompt": "…",
                "items": [{ "q": "…", "a": { "jp": "", "romaji": "", "pt": "" }, "note": "" }] }],
    "workbook": [{ "p": 16, "t": "X は Y です", "tip": "…" }]
  },
  // 8 · prática em casa
  "practice": [{ "tool": "Wagotabi|Mirage|Shadowing|Kana|Fala", "what": "…", "min": 10 }],
  // 9 · cultura (1 hábito por aula)
  "culture": { "title": "…", "titleJp": "…", "body": "…", "try": "…" },
  // 10 · checklist de domínio
  "checklist": ["Consigo … sem olhar"]
}
```

- Um exemplo **nunca** tem romaji sem `jp` ao lado.
- No gabarito, uma resposta em japonês **sempre** traz `jp` + `romaji`.

### 3.2 Estado (localStorage `curso_jp_v1`)

```jsonc
{ "pts":   { "01-1-a": { "s": true, "w": true, "note": "…" } },   // ✍️ estudei · 📱 pratiquei · nota
  "chk":   { "01-1": [true, true, false] },                       // checklist do bloco 10
  "hw":    { "01-1": { "done": true } },                          // lição de casa feita
  "notes": { "01-1": "…" },                                       // caderno da aula
  "rot":   { "rev_0": true },                                     // rotina semanal (sem datas)
  "last":  "01-1", "imported": false }
```

- Exportar/importar backup em JSON.
- Botão "Importar do genki-companion": só aparece se `genki_companion_v1` existir na mesma origem `file://`.

### 3.3 Interface (padrão dark dos apps existentes)

- Mesmas variáveis `:root` do genki-companion (`--bg #0f1115`, `--accent #7c8cff`…), coluna central de 860 px, cards `details`, pills de checkbox. Funciona em celular (gutter de 16 px).
- **Início / Trilha:** unidades em acordeão → cards de aula (nº, título, can-do curto, mini-barra do checklist, selo ✓). O botão "Continuar" leva à próxima aula não concluída.
- **Aula:** os 10 blocos numerados, com índice de âncoras.
  - Exemplos com 🔊 (Web Speech ja-JP) e 🔬 (anatomia colorida em PT).
  - Gabarito escondido atrás de "Mostrar resposta" (item a item e "mostrar todos").
  - Caderno da aula (textarea com autosave).
  - Checklist que conclui a aula.
  - Navegação ← anterior / próxima →.
- **Rotina:** plano diário de 1–1,5 h (4 blocos + "dia mínimo"), tracker Seg–Dom sem datas e "ciclo de uma aula em 3 dias".
- **Guia:** como seguir o curso, mapa de marcos, papel de cada app, regras de ouro e o que estudar por fora.
- **Recursos:** lista por nível e tipo (vídeo, leitura, podcast, app, prática), vinda de `recursos.json`.
- **Progresso:** % geral, por unidade, pontos ✍️/📱 e marcos atingidos.

## 4. Mapa curricular (todas as aulas)

Uma aula ≈ **60–75 min** (uma sessão principal). Cada lição do Genki = 2–4 aulas. Os **Marcos** são aulas de revisão com autoteste e tarefa de fala.

### Unidade 0 — Antes de começar (Genki I: sistema de escrita, あいさつ, すうじ)

| id | Aula | Pontos |
|---|---|---|
| 00-1 | Os sons do japonês e o hiragana | mora, 5 vogais, linhas, dakuten, combinações, っ, vogais longas; pitch básico |
| 00-2 | Katakana e palavras estrangeiras | ー, ッ, ティ/ファ…, adaptação do português |
| 00-3 | Cumprimentos e números 0–100 | あいさつ do dia a dia, すみません/どうも, 0–100 |

### Genki I (N5)

| id | Aula | Genki | Pontos |
|---|---|---|---|
| 01-1 | Eu sou… | L1 | X は Y です · 〜か · N₁ の N₂ |
| 01-2 | Horas, telefone e idade | L1 | 〜じ/〜はん, telefone, 〜さい, 〜ねんせい, なん |
| 02-1 | Isto, esse, aquele | L2 | これ/それ/あれ/どれ · この/その/あの/どの · ここ/そこ/あそこ/どこ · だれの |
| 02-2 | Fazendo compras | L2 | 〜えん, いくら, 100–100.000, 〜を ください |
| 02-3 | Também, não é, né? | L2 | N も · N じゃないです · 〜ね/〜よ |
| 03-1 | Verbos: presente educado | L3 | 3 grupos · 〜ます/〜ません |
| 03-2 | Partículas de ação | L3 | を · で · に · へ · ordem da frase · は de contraste |
| 03-3 | Quando e com que frequência | L3 | に de tempo · advérbios de frequência · 〜ませんか |
| 04-1 | Existir e onde fica | L4 | あります/います · palavras de lugar |
| 04-2 | O passado educado | L4 | でした/じゃなかったです · 〜ました/〜ませんでした |
| 04-3 | E, com, também, muito | L4 | と · も (depois de partículas) · 〜じかん · たくさん |
| M-1 | **Marco 1** — metade do Genki I | L1–4 | revisão, autoteste, apresentação de 1 minuto |
| 05-1 | Adjetivos い e な | L5 | presente +/−, antes do substantivo |
| 05-2 | Adjetivos no passado · gostar | L5 | passado +/− · すき/きらい |
| 05-3 | Vamos! · contando coisas | L5 | 〜ましょう/〜ましょうか · ひとつ… e contadores · graus |
| 06-1 | A forma て | L6 | formação (る/う/irregulares) |
| 06-2 | Pedir e encadear ações | L6 | 〜てください · ação て ação |
| 06-3 | Pode / não pode | L6 | 〜てもいいです · 〜てはいけません |
| 06-4 | Porque · posso ajudar? | L6 | 〜から · 〜ましょうか (oferta) |
| 07-1 | 〜ている | L7 | ação em progresso · estado resultante |
| 07-2 | Descrevendo pessoas | L7 | N は X が Adj · く て / で (unir) |
| 07-3 | Ir fazer · contar pessoas | L7 | radical + に 行く/来る/帰る · 〜にん |
| 08-1 | Formas curtas (presente) | L8 | forma de dicionário/ない · fala casual |
| 08-2 | Citar e opinar | L8 | 〜と思います · 〜と言っていました |
| 08-3 | Não faça · gosto de fazer · algo/nada | L8 | 〜ないでください · 〜のが好き/上手 · が (mas) · 何か/何も |
| M-2 | **Marco 2** — 2/3 do Genki I | L5–8 | revisão, autoteste, relato de um dia |
| 09-1 | Formas curtas (passado) | L9 | た/なかった · casual no passado · と思う/言っていた no passado |
| 09-2 | Frases que descrevem substantivos | L9 | orações relativas |
| 09-3 | Já / ainda não · porque | L9 | もう〜ました · まだ〜ていません · 〜から (curto) |
| 10-1 | Comparar | L10 | より · のほうが · どちらが · いちばん |
| 10-2 | O que + intenção | L10 | Adj/N + の · 〜つもりだ |
| 10-3 | Mudar · algum lugar · meio | L10 | 〜くなる/〜になる · どこかに/どこにも · で (meio) · かかります |
| 11-1 | Querer e listar ações | L11 | 〜たい · 〜たり〜たりする |
| 11-2 | Experiência e listas | L11 | 〜ことがある · A や B |
| 12-1 | Explicar · demais | L12 | 〜んです · 〜すぎる |
| 12-2 | Conselho · porque | L12 | 〜ほうがいいです · 〜ので |
| 12-3 | Obrigação · provavelmente | L12 | 〜なければいけません/〜なきゃ · 〜でしょう |
| M-3 | **Marco 3 — N5** | L1–12 | revisão geral, simulado curto, conversa de 3 min |

### Genki II (N4)

A ordem segue a sequência de gramática do Genki II 3ª ed. ⚠️ Só a L13–L23 do Genki II deve ser conferida pelo aluno no livro; o PDF dele é do Genki I.

| id | Aula | Pontos |
|---|---|---|
| 13-1 | Poder fazer | verbos potenciais |
| 13-2 | E além disso · parece | 〜し〜し · 〜そうです (aparência) |
| 13-3 | Experimentar · se for · frequência | 〜てみる · なら · 一週間に三回 |
| 14-1 | Querer coisas · talvez | ほしい · 〜かもしれません |
| 14-2 | Dar e receber | あげる · くれる · もらう |
| 14-3 | Sugerir · quantidade | 〜たらどうですか · número + も / しか〜ない |
| 15-1 | Vamos! (casual) e planos | volitivo · 〜と思っています |
| 15-2 | Deixar pronto · descrever mais | 〜ておく · orações relativas (II) |
| 16-1 | Favores | 〜てあげる · 〜てくれる · 〜てもらう |
| 16-2 | Pedir com educação · desejar | 〜ていただけませんか · 〜といいですね |
| 16-3 | Quando · desculpas | 〜とき · 〜てすみませんでした |
| M-4 | **Marco 4** | L13–16 |
| 17-1 | Ouvi dizer | 〜そうです (boato) · 〜って |
| 17-2 | Se/quando · não precisa | 〜たら · 〜なくてもいいです |
| 17-3 | Parece que · antes/depois | 〜みたいです · 〜前に · 〜てから |
| 18-1 | Transitivo × intransitivo | pares (開ける/開く…) |
| 18-2 | Acabar fazendo | 〜てしまう |
| 18-3 | Sempre que · enquanto · devia ter | 〜と · 〜ながら · 〜ばよかった |
| 19-1 | Linguagem honorífica | 尊敬語 (verbos especiais, お〜になる) |
| 19-2 | Gratidão e expectativa | 〜てくれてありがとう · 〜てよかった · 〜はずです |
| 20-1 | Linguagem humilde | 謙譲語 · expressões extra-modestas |
| 20-2 | Sem fazer · perguntas dentro da frase | 〜ないで · 〜か/〜かどうか |
| 20-3 | Chamado de · fácil/difícil de | 〜という N · 〜やすい/〜にくい |
| 21-1 | A voz passiva | passiva (incl. "passiva de incômodo") |
| 21-2 | Está feito · durante · quero que você | 〜てある · 〜間に · Adj + する · 〜てほしい |
| 22-1 | Causativo | させる · 〜させてあげる/くれる |
| 22-2 | Ordens · se · apesar de · como | 〜なさい · 〜ば · 〜のに · 〜のような/〜のように |
| 23-1 | Ser obrigado a · mesmo que | causativo-passivo · 〜ても |
| 23-2 | Decidir · até · jeito de | 〜ことにする/〜ことにしている · 〜まで · 〜方 |
| M-5 | **Marco 5 — N4** | L13–23 |

### Ponte N3 (depois do Genki II)

| id | Aula | Pontos |
|---|---|---|
| P-01 | Passar a conseguir · procurar fazer | 〜ようになる · 〜ようにする |
| P-02 | Ficou decidido | 〜ことになる × 〜ことにする |
| P-03 | Para (propósito) | 〜ために × 〜ように |
| P-04 | Os quatro "parece" | 〜そうだ · 〜ようだ · 〜みたいだ · 〜らしい |
| P-05 | Momento da ação | 〜ところ (る/ている/た) · 〜たばかり |
| P-06 | Enquanto ainda · durante | 〜うちに · 〜間/〜間に · 〜最中に |
| P-07 | Não é que… · não tem como | 〜わけだ/〜わけではない/〜わけがない · 〜はずがない |
| P-08 | Quanto mais… | 〜ば〜ほど · 〜ほど/〜くらい (grau) |
| P-09 | Partículas compostas | 〜について · 〜に対して · 〜によって · 〜として |
| P-10 | Graças a · por culpa de | 〜おかげで · 〜せいで |
| P-11 | Pedir permissão com causativo | 〜させてください · 〜させていただく |
| P-12 | Keigo no dia a dia | loja, telefone, e-mail curto |
| P-13 | Conectores de texto | しかし · それで · だから · つまり · ところで · それに |
| P-14 | Até mesmo · justamente | 〜さえ · 〜こそ · 〜でも |
| P-15 | Tendência | 〜っぽい · 〜がち · 〜気味 |
| P-16 | A fala real (contrações) | 〜ちゃう · 〜とく · 〜てる · 〜なきゃ · 〜じゃん |
| P-17 | Onomatopeias | 擬音語・擬態語 do dia a dia |
| P-18 | Estilo escrito e leitura | 〜である · estratégias para NHK Easy |
| P-19 | Não posso deixar de · não é que não | 〜わけにはいかない · 〜ないことはない |
| P-20 | Assim que · mal | 〜たとたん · 〜次第 |
| P-21 | Kanji para a vida toda | radicais, on/kun, método de estudo |
| P-22 | Pronúncia natural | pitch accent, entonação, shadowing avançado |
| M-6 | **Marco 6 — N3 (ponte)** | autoavaliação + como seguir (Tobira/Quartet, JLPT opcional) |

### Trilha Viagem (paralela, a partir da aula 06-4)

V-01 aeroporto e imigração · V-02 trem, metrô e IC card · V-03 hotel e ryokan · V-04 restaurante e izakaya · V-05 konbini e compras · V-06 pedir direções · V-07 farmácia, saúde e emergência · V-08 templos, santuários e onsen (etiqueta).

**Total:** 3 + 38 + 30 + 23 + 8 = **102 aulas**.

## 5. Anatomia comum (os 10 blocos)

Todas as aulas usam os mesmos 10 blocos, na mesma ordem, e nenhum é opcional:

1. Título + can-do
2. Duração + divisão
3. Pré-requisitos + vocabulário da aula
4. Gramática: explicação, estrutura, 2–3 exemplos originais e armadilhas, para cada ponto
5. Como estudar cada ponto
6. Vídeos/leitura em ordem
7. Lição de casa no caderno + gabarito
8. Prática em casa: Wagotabi, Mirage, kana, shadowing
9. Cultura: 1 hábito
10. Checklist de domínio

**Marcos** usam os mesmos 10 blocos, com uma diferença: no bloco 4 a "gramática" vira uma revisão dos pontos anteriores (cada um com exemplo novo) e no bloco 7 entra um autoteste com gabarito.

## 6. Critérios de aceitação (automatizados em `tools/check.js`)

1. Toda aula tem os 10 blocos não vazios.
2. Todo exemplo e todo vocabulário têm `jp`, `kana`, `romaji` e `pt`.
3. O romaji bate com o kana. A checagem é tolerante a macron, ou/ō e partículas は/へ/を.
4. O kana bate com a leitura do kuromoji para o `jp`. Aqui a checagem só **aponta** divergências para revisão humana.
5. Toda tarefa da lição de casa tem gabarito em todos os itens. Resposta em japonês traz `jp` + `romaji`.
6. Nenhuma data ou prazo aparece no conteúdo: sem `dd/mm`, "até dia", "prazo", "semana N de".
7. Os ids são únicos, os `prereqs` apontam para aulas existentes e a ordem é contínua.
8. O mapa cobre Genki I L1–12 inteiro, cada seção de gramática em pelo menos uma aula. A cobertura é extensível ao Genki II (já mapeado).
9. Build: o `index.html` abre offline, sem erros no console. Verificação feita no navegador: tracker, notas, checklist, gabarito, rotina e export/import funcionam e persistem após recarregar.
10. Nenhum trecho copiado do Genki. Os exemplos são originais, e o check compara com as frases do genki-companion e das lições do Mirage, que são nossas, só para evitar duplicatas.

## 7. Processo de construção

1. Montar a infraestrutura: template, build, check e romaji.
2. Escrever a **Aula 01-1 (padrão-ouro)** à mão, seguindo o exemplo do briefing (XはYです, 〜か, N₁のN₂; 60–75 min; ToKini Andy L1; Wagotabi; おじぎ).
3. Escrever as demais aulas em lotes, sempre a partir do padrão-ouro. A cada lote:
   - rodar o check automático;
   - fazer uma revisão linguística independente, com um agente revisor que não escreveu a aula;
   - corrigir.
4. Seguir a ordem: Unidade 0 + Genki I → Genki II → Ponte N3 → Viagem.
5. Por último: Rotina, Guia e Recursos, com as fontes verificadas pela pesquisa.
6. Verificar no navegador contra a seção 6 e só então dizer que está pronto.

## 8. Riscos e sinalizações

- **Páginas do livro-texto:** não verificadas, por isso não entram (D5).
- **Genki II:** a ordem da gramática vem do conhecimento geral da 3ª edição e **não foi conferida no livro**. A unidade exibe o aviso "confira a ordem no seu Genki II".
- **Leituras de kanji:** a checagem do kuromoji aponta divergências (何 なに/なん, 日 か/び…), que são revisadas à mão.
- **Vídeos:** só entram URLs confirmadas. O resto é indicado como "buscar por: …".
