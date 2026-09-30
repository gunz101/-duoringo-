# ヅオリンゴー · 日本語コース

**Curso de japonês completo para quem fala português**, do kana ao N3.

O curso avança por **marcos de domínio**, sem datas nem prazos. É um app offline de **um único arquivo HTML**: abre com duplo clique, no celular ou pelo site.

**▶ Abrir o curso:** https://gunz101.github.io/-duoringo-/

| Trilha | Aula (10 blocos) | Rotina |
|---|---|---|
| ![Trilha](docs/img/trilha.png) | ![Aula](docs/img/aula.png) | ![Rotina](docs/img/rotina.png) |

## O que tem

- **102 aulas, em 5 blocos:**
  - Unidade 0 (kana e sons);
  - Genki I (N5), com os Marcos 1–3;
  - Genki II (N4), com os Marcos 4–5;
  - Ponte N3, com o Marco 6;
  - Trilha Viagem, com situações reais no Japão.
- **Toda aula tem os mesmos 10 blocos:**
  1. Objetivos ("consigo…")
  2. Duração e plano da aula
  3. Pré-requisitos e vocabulário
  4. Gramática, com explicação, estrutura, exemplos e armadilhas
  5. Como estudar cada ponto
  6. Vídeos e leitura em ordem
  7. Lição de casa no caderno, **com gabarito**
  8. Prática em casa: Wagotabi, app e shadowing
  9. Cultura: um hábito por aula
  10. Checklist de domínio
- **Os exemplos trazem japonês + kana + romaji + português.** Cada um tem:
  - 🔊 para ouvir;
  - 🔬 **Anatomia da frase**: cada bloco colorido com a sua função (tópico, objeto, lugar, predicado…), feita para quem se perde na montagem das frases.
- **Vídeos verificados** e ligados a cada aula: ToKini Andy (uma aula por lição do Genki) e Game Gengo (um vídeo por ponto de gramática).
- **Recursos:** 90 materiais gratuitos ou pagos por habilidade e nível, com 13 em português.
- **Rotina diária de 1–1,5 h** com tracker semanal sem calendário, **guia** de como seguir o curso e progresso por domínio.
- Funciona sozinho ou **dentro do app ヅオリンゴー**, na aba 🏫 Curso.

## Status

| Parte | Aulas | Situação |
|---|---|---|
| Unidade 0 · kana | 3 | ✅ pronta |
| Genki I (L1–L12) + Marco 1 | 38 + 1 | ✅ pronta · 🔍 em revisão linguística |
| Marcos 2–3 | 2 | ✍️ em produção |
| Genki II (L13–L23) | 30 | ✍️ em produção (7 prontas) |
| Ponte N3 | 23 | ✍️ em produção |
| Trilha Viagem | 8 | ✍️ em produção |

Cada aula passa por verificação automática (`tools/check.js`) e por revisão independente antes de entrar.

## Como usar

- **Online:** o link acima.
- **Offline:** baixe o `index.html` e abra no navegador.

O progresso (✍️ estudado, 📱 praticado, notas, checklists, rotina) fica salvo no seu navegador. Use **Progresso → Exportar** para fazer backup.

## Para quem quer mexer

| Caminho | O que é |
|---|---|
| `index.html` | O app pronto, **gerado** pelo build. |
| `src/template.html` | Interface (CSS + JS, sem dependências). |
| `content/curso.json` | Mapa das unidades e aulas, rotina e guia. |
| `content/aulas/<id>.json` | Uma aula por arquivo, com os 10 blocos. |
| `content/recursos.json`, `content/videos.json` | Recursos e vídeos verificados. |
| `content/AUTORIA.md` | Regras para escrever aulas. |
| `tools/check.js` | Critérios de aceitação: estrutura, romaji × kana, gabarito, sem datas, kanji por lição. |
| `tools/build.js` | Check + anatomia das frases → `index.html`. |

```bash
npm install
node tools/check.js --readings
node tools/build.js
```

## Conteúdo

As frases, explicações, exercícios e gabaritos são **originais**. O curso segue a ordem do *Genki* (3ª ed., The Japan Times) e o cita só por lição e nome do ponto de gramática. O *Workbook* é citado só por página e título do exercício. Nenhum texto dos livros é reproduzido, e é preciso ter os livros para as leituras e os exercícios deles.
