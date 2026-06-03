# Changelog — Jogo do Alfabeto

Este arquivo documenta as principais mudanças, correções e decisões de desenvolvimento para facilitar a continuidade do trabalho após testes com usuários reais.

## Status Atual (Abril 2026) — Rodada de Testes com Usuários Reais

O app foi colocado em teste com algumas pessoas (beta no Vercel).

**Jogos principais com atenção recente:**
- Remoção do "Desenhe a Letra" (ver abaixo).
- Ajustes de voz e contagem de pontuação em "Escute e Encontre" e "Qual o Começo?".

### O que foi feito nesta fase (resumo executivo)

#### 1. Desenhe a Letra (remoção)
- Múltiplas iterações pesadas de validação de desenho à mão livre (várias rodadas ao longo de dias).
- Melhorias aplicadas (baseadas em consultoria interna de CV + desenvolvimento infantil):
  - Thresholds progressivos por idade exata (3-4 muito leniente / 5-6 médio / 7-8+ rigoroso).
  - Métricas: `pathLength` (esforço contínuo), `coverageRatio`, `mainOverlap`, `maxRelativeSize` vs bbox real da máscara da letra.
  - Escala do guia visual e da máscara de validação sincronizadas (0.82).
  - Safety-net de "desenho grande e central" limitada apenas a crianças pequenas.
  - Line width, tolerance e stroke-only mask por idade.
  - UX: Botão explícito "Tente de novo" (sem perder progresso), guias tracejados (dashed), sem auto-advance após "Terminei", proteção do canvas após submissão.
  - Debug rico (`[DesenheLetra metrics 6+]` e REJECT logs) para análise com testes reais.
- Resultado dos testes reais com crianças (3 anos e 8+ anos, com imagens fornecidas):
  - Rabiscos claramente incorretos (ex: "V" gigante ou loop grande em torno do guia tracejado pequeno de J/D/H) ainda eram aceitos com estrela + feedback positivo.
  - Após várias tentativas de endurecimento, decidiu-se **remover o jogo por enquanto**.
- Ação final:
  - Card substituído por placeholder visual "EM BREVE" (mantém posição e emoji 🖍️ no grid da Home).
  - Removido import, tipo de Screen, wrapper de navegação e render do componente.
  - Arquivo `src/components/games/DesenheLetraGame.tsx` deletado (git rm).
  - Textos de idade atualizados para não mencionarem mais o jogo especificamente.
  - Histórico git preservado caso queiramos reviver com abordagem diferente (ex: traçado guiado passo-a-passo com números/setas, ou modo sem validação automática forte).

#### 2. Escute e Encontre (voz cortada)
- Problema: No erro, o desafio trocava imediatamente (nextRound), mas a voz de correção ("Não foi essa... a palavra que eu falei foi XXX") demorava e era cortada no meio pela fala da nova palavra do próximo round.
- Causa: Fala de correção era fire-and-forget + avanço por timer fixo (sem await). O useEffect de speak da nova rodada disparava independentemente.
- Fix:
  - Agora aguardamos (`await`) o `speakPhrase` da correção terminar antes de chamar `nextRound()` (mesmo padrão já usado no caminho de acerto).
  - `speakTarget` agora chama `getAudioManager().cancel()` no início (limpa qualquer fala residual de forma confiável, útil também para "Ouvir de novo").
- Commit: ca05fa3

#### 3. Qual o Começo? / Qual letra começa a palavra (dupla contagem de acerto+erro)
- Problema relatado: Ao errar → revela a letra correta + desbloqueia → criança clica na revelada (como o jogo sugere com "Olha a letra certa") → o sistema contava +1 erro + +1 acerto + estrela no **mesmo desafio**, além de chamar recordLetterPractice duas vezes (false + true).
- Causa raiz: O branch de "correto" sempre dava ponto/estrela, sem distinguir clique remedial (após reveal) de acerto de primeira tentativa.
- Fix:
  - Detecta clique remedial via flag `game.showCorrect` (estado antes do clique).
  - Em remedial: **não** incrementa contador de `correct`, **não** dá estrela. Apenas reforça com fala mais curta ("Isso! ... começa com X!") e avança.
  - Ainda registra `recordLetterPractice(letra, true)` para a mastery (equilibra o registro de erro anterior e ajuda nos relatórios de letras fracas).
  - UX: Após reveal de erro, botões errados ficam desabilitados (só a letra correta permanece clicável). Evita contagem extra de erros desnecessários.
- Commit: 22bdd41

### Outras melhorias recentes no ciclo (contexto para continuidade)
- Extração e integração de **GameTopBar** em todos os 10 jogos (removeu muita duplicação de headers com avatar + nome + score).
- Separação clara voz × UI:
  - `getChildVocative(profile)` → só para TTS (nome real da criança ou vazio).
  - `getChildDisplayName(profile)` → para textos na tela, feedbacks, saudações.
  - Helper `personalizeSpeech(templateCom{name}, fallback, speechName)` aplicado consistentemente (evitou ternários repetidos).
- Tela de **Relatórios para os Pais** (ReportsScreen) básica usando `letterMastery`.
- Expansão do banco de palavras (`src/data/letters.ts`) com exemplos infantis BR + emojis para vários jogos de vocabulário.
- Melhorias em perfil (idade/gênero sync confiável, lastSyncError com banner amigável).
- Remoção de botões de debug "Trocar perfil" de todos os jogos.
- Consistência de áudio (playSuccess/playMistake) e aguardar falas antes de auto-advance em vários jogos.

### Onde paramos / Pendências para a próxima sessão
- **Testes em andamento**: App liberado para algumas pessoas. Aguardar feedback real de crianças e responsáveis (erros de validação, voz cortada, contagem de pontos, fluidez geral, etc.).
- Quando voltar:
  1. Revisar feedback dos testers.
  2. Priorizar fixes reportados.
  3. Continuar itens do backlog histórico (ver lista abaixo).

**Backlog / Ideias pendentes (não exaustivo, da história do projeto):**
- Rastreamento de tempo de uso por sessão/jogo (enriquecer relatórios para pais).
- Voz masculina distinta para o Alfafa (ALFAFA_VOICE_ID separado da voz principal "Alice" no ElevenLabs).
- Expandir ainda mais o word bank (letras com menos opções ou equilíbrio pedagógico).
- Tratamento de erros mais amigável (toasts leves, retry visível, sem assustar a criança).
- Aprimorar ReportsScreen (tempo de uso, histórico, sugestões mais ricas baseadas em letterMastery, possível export).
- Unificar / limpar headers externos no Home (ainda há alguma redundância mínima após GameTopBar).
- Qualidade geral: resolver lints remanescentes, adicionar testes para helpers críticos (isDrawingGood, personalizeSpeech, letters utils), etc.
- Possível retorno futuro do Desenhe a Letra com abordagem diferente (traçado ordenado guiado, validação mais simples ou manual pelos pais).
- Outras melhorias de UX em jogos (ex.: mais feedback específico no "quase", variações de dificuldade por idade).

### Como retomar
- Leia este CHANGELOG.md + os commits recentes (git log).
- Rode `npm run dev` e teste os fluxos corrigidos (especialmente erro → voz de correção → próximo round no Escute; erro → reveal → clique na certa no Qual o Começo).
- Use o console (logs de áudio e métricas) durante testes.
- O todo interno do agente também pode ser consultado para tarefas granulares.

---

**Formato de commits seguido**: Conventional commits em português quando apropriado, com escopo do jogo/componente e explicação clara do "por quê" (especialmente útil para retomada).

Se precisar de mais detalhes de alguma implementação específica, os arquivos fonte + histórico git estão disponíveis.

Boa sorte nos testes! Quando tiver feedback, voltamos com foco. 🚀
