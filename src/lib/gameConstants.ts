// Delays padrão para transições entre rodadas
// Usados para dar fluidez consistente em todos os jogos

/** 
 * Tempo padrão para auto-avançar após acerto em jogos de múltipla escolha / simples.
 * Permite que a criança ouça o feedback de voz + veja a animação.
 * Usado na maioria dos jogos para consistência.
 */
export const SUCCESS_AUTO_ADVANCE_MS = 1600

/**
 * Tempo maior para celebrações em jogos de construção, desenho ou rodadas completas (ex: memória cheia, desenhar letra, montar palavra).
 * Dá mais tempo para o sentimento de conquista.
 */
export const LONG_CELEBRATION_AUTO_ADVANCE_MS = 2000

// Dica de manutenção: sempre use essas constantes para transições de rodada
// para manter a experiência fluida e previsível para crianças de 4 anos.
