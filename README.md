# Curso de Japonês Mirage · 日本語コース

Curso completo de japonês para quem fala português, organizado em marcos de domínio e sem datas.

- Unidade 0 (kana)
- Genki I (N5)
- Genki II (N4)
- Ponte N3
- Trilha Viagem

## Como abrir

Dê dois cliques em **`index.html`**. O curso funciona offline, num arquivo só.

O progresso fica salvo no navegador (localStorage, chave `curso_jp_v1`). Para fazer backup, use a aba **Progresso → Exportar**.

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | O app pronto. É **gerado**, não edite à mão. |
| `src/template.html` | Interface (CSS + JS). |
| `content/curso.json` | Mapa das unidades e aulas, rotina e guia. |
| `content/aulas/<id>.json` | Uma aula por arquivo, com os 10 blocos. |
| `content/recursos.json` | Recursos externos por nível. |
| `content/AUTORIA.md` | Regras para escrever aulas. |
| `tools/check.js` | Critérios de aceitação: estrutura, romaji × kana, gabarito, datas, kanji por lição. |
| `tools/build.js` | Check + anatomia das frases (motor do Mirage) → `index.html`. |
| `docs/superpowers/specs/` | Design do curso. |

## Gerar o app de novo

```bash
npm install            # só na primeira vez (kuromoji, para a anatomia e a checagem de leituras)
node tools/check.js --readings
node tools/build.js
```

A anatomia colorida dos exemplos (🔬) usa o motor do Mirage, que precisa estar em `C:\Dev\japanese-study-app\renderer\lib\anatomy.js`. Sem ele, o build funciona do mesmo jeito, só que sem o 🔬.

## Conteúdo

Todas as frases, explicações e exercícios são originais. O Genki é citado por lição e ponto de gramática. O Workbook é citado só por página e título do exercício, sem reproduzir o texto dos livros.
