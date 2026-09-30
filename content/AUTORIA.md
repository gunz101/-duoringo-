# Guia de autoria: como escrever uma aula do Curso de Japonês ヅオリンゴー

Leia este guia inteiro antes de escrever. **O padrão-ouro é `content/aulas/01-1.json`.** Leia esse arquivo todo e copie a estrutura, o tom, a profundidade e o formato. Suas aulas precisam ter a mesma qualidade e o mesmo cuidado.

## Quem é o aluno
- Brasileiro, fala PT-BR e estuda 1–1,5 h por dia. Não tem datas nem prazos: avança por marcos de domínio.
- Tem o livro **Genki I 3ª ed.** e o workbook, e joga **Wagotabi**, um RPG em japonês ordenado por JLPT.
- Usa o app **ヅオリンゴー**, que faz o SRS e tem as ferramentas listadas abaixo.
- A maior dificuldade dele é **montar frases**: ele se perde nos elementos e não sabe qual parte faz o quê. Por isso toda explicação deve deixar claro **qual bloco da frase tem qual função** (tópico, objeto, lugar, predicado…) e insistir em **ler pelo predicado, no fim da frase**.

## Regras que não se negociam
1. **Conteúdo 100% original.**
   - Não transcreva diálogos, textos, exemplos nem exercícios do Genki ou de qualquer outro livro ou site.
   - Crie frases novas.
   - Não copie os exemplos do genki-companion (`C:\Users\ramal\genki-companion\index.html`). Use-o só para saber **quais pontos** cobrir.
2. **Sem páginas do livro-texto.** Cite o Genki por lição e nome do ponto de gramática (campo `genki.points`, em inglês, como o Genki nomeia).
   - O Workbook tem páginas verificadas em `C:\Dev\japanese-study-app\renderer\genki_workbook.json`: use **só** essas páginas e títulos, exatamente como estão lá.
   - `cg` = exercícios de gramática/conversa; `rw` = leitura e escrita/kanji.
3. **Nunca inventar regra.** Se tiver dúvida real sobre um uso, escreva o que é seguro e explique a dúvida no campo `flag` do ponto. O `flag` fica visível para o aluno. Não chute.
4. **Nada de datas, prazos, "semana N", "atrasado".** O progresso é por domínio.
5. **Todo exemplo e todo item de vocabulário trazem `jp` + `kana` + `romaji` + `pt`.** O romaji nunca aparece sem o japonês ao lado.
   - No gabarito, toda resposta em japonês traz `jp` + `romaji`, e também `kana` se `jp` tiver kanji.
6. **Tudo em PT-BR**, exceto o japonês, é claro. Use tom de professor paciente, frases curtas e **negrito** só no essencial.

## Convenções

### Japonês (`jp`)
- Siga o estilo Genki: nas Lições 1–2, só kana.
- A partir da L3, use kanji **apenas** entre os já apresentados no Genki até a lição da aula. A lista está em `tools/check.js` (`GENKI_KANJI`), e o check avisa quando você usa um kanji ainda não apresentado.
- Na dúvida, escreva em kana.

### Espaços e pontuação
- Nas Lições 1–6, separe os blocos da frase com espaço, no estilo Genki: `わたしは がくせいです。`. A partir da L7 pode tirar os espaços.
- Diálogo curto numa linha só: `A。— B。`

### Kana (`kana`)
- A leitura inteira em hiragana, com o katakana mantido nas palavras em katakana e os mesmos espaços do `jp`.
- Sem kanji.

### Romaji (`romaji`)
- Hepburn, com macron nas vogais longas o/u (`Tōkyō`, `kūkō`, `senkō`); `ei` fica `ei` (`sensei`); `ii` fica `ii`.
- Partículas: は = `wa`, へ = `e`, を = `o`.
- ー do katakana = macron: `kōhī`, `pātī`.
- Nomes próprios e início de frase com maiúscula; sufixo com hífen: `Tanaka-san`.
- O check compara o romaji com o kana automaticamente. Se acusar erro, é porque não bate: corrija.

### Nomes nos exemplos
Misture nomes japoneses e brasileiros (ペドロ, マリア, ルーカス, アナ, たなか, すずき, やまだ…). Use contexto brasileiro quando for natural (サンパウロ, リオ, ブラジルりょうり).

### ids
- A aula tem o mesmo nome do arquivo, sem `.json`.
- Os pontos de gramática são `<id>-a`, `<id>-b`, `<id>-c`…
- `gc` = id do ponto no genki-companion (`"<lição>-<nº do ponto>"`), conforme o mapa em `content/curso.json` (campo `gc` de cada aula).

## Os 10 blocos (todos obrigatórios)

1. **`canDo`**: 3–5 frases de "consigo…", concretas e testáveis.

2. **`duration`**: `total` `"60–75 min"`, com 5–7 blocos cuja soma caia nesse intervalo.
   - Siga a lógica: aquecimento → vocabulário → gramática → vídeo → lição de casa → checklist.
   - Aula muito densa pode ter `"70–90 min"` e deve sugerir dividir em 2 sessões.

3. **`prereqs`**:
   - `aulas`: ids anteriores.
   - `skills`: o que ele precisa saber.
   - `vocab`: 12–25 palavras que aparecem nos exemplos e na lição de casa, coerentes com o vocabulário da lição do Genki. O vocabulário de cada lição está em `C:\Dev\japanese-study-app\renderer\vocab_n5.json` (campo `lesson`): use-o como fonte das palavras, **não** das frases.

4. **`grammar`**: um objeto por ponto do mapa (às vezes dois pontos pequenos juntos). Cada um tem:
   - `explanation`: o porquê e o como, com a função de cada bloco. Pode usar `**negrito**`, quebras `\n` e linhas `• ` para listas.
   - `structure`: fórmula curta, por exemplo `[lugar] で [objeto] を [verbo]`.
   - `examples`: **2–3** exemplos originais que mostrem o ponto em contextos diferentes.
   - `pitfalls`: 2–4 erros típicos de brasileiros, sempre com o certo × o errado.
   - `howToStudy`: é o bloco 5; 3 passos práticos, e pelo menos um usando 🔬 (anatomia) ou fala.

5. **Como estudar**: fica dentro de cada ponto (`howToStudy`).

6. **`media`**: 2–4 itens em ordem (`order` 1, 2, 3…).
   - Sempre: (1) a leitura da lição no Genki, citando o ponto; (2) um vídeo; (3) o genki-companion daquela lição, só nas Lições 1–12.
   - Vídeo: use `kind:"video"`, `where:"YouTube · canal X"`, `url:""` e um campo `search` com o termo exato de busca (ex.: `"ToKini Andy Genki Lesson 3"`). **Não invente URLs.** As URLs verificadas entram depois, num passe central.
   - Canais bons e alinhados ao Genki: ToKini Andy (acompanha o Genki lição a lição), Game Gengo (gramática N5/N4 por ponto), Japanese Ammo with Misa (explicações detalhadas).

7. **`homework`**: é a lição de casa **no caderno, à mão**.
   - `intro` + 3–4 `tasks` de tipos variados, com 3–6 itens cada: traduzir PT→JP, completar partícula ou forma, transformar (afirmativa→negativa, presente→passado…), ordenar blocos, produzir (escrever sobre si).
   - **Todo item tem gabarito `a`**; `note` explica o porquê quando ajuda.
   - Na tarefa de produção, o gabarito é um **modelo** e o `note` diz o que conferir.
   - `workbook`: as páginas **dessa lição** em `genki_workbook.json` (`cg`, e as de kanji `rw` quando a aula for de kanji ou a última da lição), com `tip` de quando fazer.
   - Divida as páginas entre as aulas da lição, de acordo com os pontos.

8. **`practice`**: 4–5 itens; **sempre um com Wagotabi** nas Lições 1–12.
   - Não invente detalhes do jogo. Instrua o aluno a caçar nos diálogos do jogo o ponto da aula.
   - Use também: ヅオリンゴー (recursos reais abaixo), shadowing com os 🔊 da aula, e fala (gravar-se).

9. **`culture`**: 1 hábito ou costume por aula, com `title`, `titleJp`, `body` (3–6 frases, factual e sem exagero) e `try` (algo que ele pode fazer ou treinar).
   - Use o tema atribuído a você na tabela abaixo.
   - Na dúvida factual, seja conservador ("costuma", "em geral").

10. **`checklist`**: 5–8 itens de **domínio** ("Consigo… sem olhar").
    - Inclua sempre: fiz a lição de casa e conferi o gabarito; fiz as páginas X–Y do Workbook (se houver).

### Aulas-marco (M-1, M-2, M-3)
- `grammar` = um ponto de revisão por tema da unidade, com um exemplo NOVO que combine 2+ pontos.
- A lição de casa inclui um **autoteste** com gabarito, com 15–25 itens mistos, e uma tarefa de fala.

## Recursos reais do ヅオリンゴー (use só estes nomes)
- **Vocabulário/SRS**: revisar as palavras da lição no SRS. O baralho "🌊 Tudo" junta todas as revisões do dia.
- **Praticar L#**: prática por lição do Genki, com conjugação, escuta, compreensão e formatos no estilo do workbook.
- **Treinos**: Conjugação, Números, Partículas e **🔬 Anatomia**. A Anatomia tem três modos:
  - 🏷 Etiquetar: dizer a função de um bloco.
  - 🧱 Montar de trás pra frente: montar a frase começando pelo predicado.
  - 🔬 Analisar: colar qualquer frase.
- **Kana**: Trilha de Kana (hiragana e katakana, fileira por fileira), Treino livre, Escrever (ordem dos traços).
- **Kanji**: ✍️ Escrever, com a ordem dos traços.
- **Diário** (escrever frases próprias, com "Anatomia do que escrevi"), **Mineração** de frases, **Imersão → Jogos**: registrar uma sessão de Wagotabi e colar uma frase do jogo na Anatomia.
- Apps de kana à parte: kana-flow (treino adaptativo) e kana-speed-trainer (velocidade).

## Temas de cultura atribuídos (não repita temas)

| aula | tema |
|---|---|
| 00-1 | Por que o japonês tem três escritas (kanji, hiragana, katakana) |
| 00-2 | Palavras que o japonês pegou do português (パン, カステラ, タバコ, ボタン…) |
| 00-3 | ただいま／おかえり e いってきます／いってらっしゃい |
| 01-1 | おじぎ (feito) |
| 01-2 | O ano letivo japonês começa em abril (〜ねんせい) |
| 02-1 | Troca de cartões de visita (めいし) |
| 02-2 | Dinheiro: a bandejinha no caixa, sem gorjeta |
| 02-3 | あいづち: sinais de que você está ouvindo |
| 03-1 | Pontualidade (trens, chegar antes) |
| 03-2 | Tirar os sapatos: げんかん e chinelos |
| 03-3 | Recusar sem dizer "não" (ちょっと…) |
| 04-1 | A konbini (コンビニ) |
| 04-2 | Feriados longos: Golden Week e お盆 |
| 04-3 | Dividir a conta: わりかん |
| M-1 | おみやげ: trazer lembrancinhas |
| 05-1 | O senso de estação: はなみ e comidas da época |
| 05-2 | いただきます／ごちそうさま |
| 05-3 | Contar nos dedos à moda japonesa |
| 06-1 | Filas e ordem (ならぶ) |
| 06-2 | Etiqueta no trem (celular, assento prioritário) |
| 06-3 | Separação do lixo |
| 06-4 | えんりょ: oferecer e aceitar ajuda |
| 07-1 | うち e そと: família "minha" × "sua" |
| 07-2 | Responder a elogios com modéstia |
| 07-3 | Visitar a casa de alguém (おじゃまします, levar algo) |
| 08-1 | せんぱい／こうはい: com quem falar casual |
| 08-2 | たてまえ／ほんね |
| 08-3 | かんぱい e servir o copo do outro |
| M-2 | まつり: festivais de verão |
| 09-1 | Teatro tradicional: kabuki |
| 09-2 | Presentes e embrulhos |
| 09-3 | LINE e stickers (スタンプ) |
| 10-1 | Shinkansen e えきべん |
| 10-2 | Ano-novo: おしょうがつ, はつもうで, ねんがじょう |
| 10-3 | Endereços japoneses (quarteirões numerados) |
| 11-1 | ぶかつ: clubes escolares |
| 11-2 | Karaokê |
| 12-1 | Máscara quando se está resfriado |
| 12-2 | おふろ: o banho de ofurô à noite |
| 12-3 | ほうれんそう no trabalho (報告・連絡・相談) |
| M-3 | Agradecer de novo depois (お礼 no dia seguinte) |

## Antes de terminar
1. Rode `node tools/check.js --only <seus ids separados por vírgula>` na pasta `C:\Users\ramal\curso-japones` e corrija **todos** os erros ✗.
   - Os avisos ⚠ de kanji também devem ser corrigidos.
   - Só um `flag` intencional pode ficar.
2. Releia cada exemplo em japonês perguntando: é natural? a partícula está certa? a tradução PT bate? o romaji bate?
3. Escreva **apenas** os seus arquivos em `content/aulas/`. Não mexa em `curso.json`, nos tools nem nas aulas de outros.

---

## Genki II (Lições 13–23) — regras extras
- O aluno **não tem o PDF do Genki II Workbook**. Deixe `homework.workbook` como `[]` e, no `intro` da lição de casa, diga: "Se você tiver o Genki II Workbook, faça também os exercícios desta lição."
- Referência do livro: `"genki": { "book": "Genki II", "lesson": N, "points": [...] }`. Os nomes dos pontos seguem o padrão do Genki em inglês, como "Potential Verbs". **A ordem e o recorte dos pontos do Genki II não foram conferidos no livro.** Na primeira aula de cada lição, inclua no `canDo`, ou num `flag` do primeiro ponto, a frase: "Confira no seu Genki II se a lição traz estes pontos nesta ordem."
- `jp`: japonês natural, com kanji de nível N5/N4 e sem espaços entre os blocos. `kana` continua obrigatório (leitura completa). Kanji raros, fora do N4, ficam em kana.
- Wagotabi continua na prática, de preferência nas regiões/níveis N4 do jogo, sem inventar detalhes.
- Vídeos: ToKini Andy segue o Genki II lição a lição (use `search`: "ToKini Andy Genki 2 Lesson 13"). Game Gengo e Japanese Ammo with Misa também servem.

## Ponte N3 (P-01…P-22) — regras extras
- Sem livro-base. Use `"genki": null`. No bloco 6, indique recursos por ponto (vídeo + leitura), sempre com `search` e sem URLs inventadas.
- Os exemplos devem soar como japonês do dia a dia, com kanji N4/N3. `kana` é obrigatório.
- Cada ponto precisa de **contraste** com o vizinho que confunde: ようになる × ようにする, ために × ように, e assim por diante. É isso que o aluno mais precisa.
- Prática: Wagotabi (fase N3), NHK Web Easy, podcasts e o Diário do ヅオリンゴー, onde ele escreve frases com o ponto.

## Trilha Viagem (V-01…V-08) — regras extras
- É uma aula situacional: `grammar` = 3–4 "situações", e cada uma traz frases-chave. Use `structure` como o modelo da frase. Os exemplos são diálogos curtos (A。— B。).
- Use `"genki": null`. As frases devem ser as que um turista usa de verdade, em registro educado (です/ます).
- `canDo` concretos, como: "Consigo pedir uma mesa para duas pessoas e perguntar se tem cardápio em inglês".
- Seja conservador com fatos práticos (regras, preços, procedimentos), porque mudam. Prefira "em geral" e "confira no local".

## Temas de cultura — Genki II

| aula | tema |
|---|---|
| 13-1 | アルバイト: trabalho de meio período |
| 13-2 | ゆるキャラ: os mascotes |
| 13-3 | やたい e comida de rua em festivais |
| 14-1 | Dia dos Namorados e White Day no Japão |
| 14-2 | おかえし: retribuir presentes |
| 14-3 | Números de azar: 4 e 9 |
| 15-1 | しゅうがくりょこう: viagens escolares |
| 15-2 | とざん: subir montanhas (e o Monte Fuji) |
| 16-1 | Achados e perdidos: o que se perde costuma voltar |
| 16-2 | くうきを よむ: "ler o ar" |
| 16-3 | すみません para tudo: desculpar e agradecer |
| M-4 | Casamentos: ごしゅうぎ |
| 17-1 | Programas de variedades na TV |
| 17-2 | Terremotos e ぼうさい (preparação) |
| 17-3 | りゅうこうご: palavras da moda |
| 18-1 | Máquinas de venda automática |
| 18-2 | しゅうでん: o último trem |
| 18-3 | Uniformes: escola e trabalho |
| 19-1 | めうえ／めした: hierarquia e keigo |
| 19-2 | おつかれさまです |
| 20-1 | おもてなし e いらっしゃいませ |
| 20-2 | デパちか: o subsolo das lojas de departamento |
| 20-3 | Lojas de 100 ienes |
| 21-1 | Bicicletas: estacionamento e regras |
| 21-2 | Casa japonesa: たたみ e ふとん |
| 22-1 | じゅく e o vestibular (じゅけん) |
| 22-2 | Os alunos limpam a escola |
| 23-1 | そうべつかい: festas de despedida |
| 23-2 | よせがき: mensagens coletivas de despedida |
| M-5 | ことわざ: provérbios |

## Temas de cultura — Ponte N3 e Viagem

| aula | tema |
|---|---|
| P-01 | ラジオたいそう |
| P-02 | Emprego e てんしょく (mudar de emprego) |
| P-03 | おまもり: amuletos |
| P-04 | つゆ: a estação das chuvas e a previsão do tempo |
| P-05 | Lámen e suas regras (fazer barulho é normal) |
| P-06 | はなびたいかい: festivais de fogos |
| P-07 | はんこ: carimbos pessoais |
| P-08 | かいぜん: melhorar sempre |
| P-09 | NHK e os jornais |
| P-10 | おはかまいり: visitar os túmulos da família |
| P-11 | ゆうきゅう: pedir folga no trabalho |
| P-12 | E-mail de trabalho: おせわに なって おります |
| P-13 | たてがき: escrita vertical |
| P-14 | ぶどう: artes marciais e れい |
| P-15 | ころもがえ: a troca de roupa por estação |
| P-16 | かんさいべん: o dialeto de Kansai |
| P-17 | Onomatopeias no mangá |
| P-18 | Como ler um jornal japonês |
| P-19 | ぎり: obrigações sociais |
| P-20 | えきビル: a estação como shopping |
| P-21 | しょどう: caligrafia |
| P-22 | らくご: a arte de contar histórias |
| M-6 | さどう: a cerimônia do chá |
| V-01 | Chegando: dinheiro vivo, IC card e Wi-Fi |
| V-02 | Vagões só para mulheres |
| V-03 | Vestir a yukata (esquerda sobre direita) |
| V-04 | おしぼり e pedir a conta (おかいけい) |
| V-05 | Sacolas pagas no caixa (レジぶくろ) |
| V-06 | こうばん: o posto policial do bairro |
| V-07 | ドラッグストア: farmácias japonesas |
| V-08 | Tatuagens e onsen |
