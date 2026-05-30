export type Letter = string

export interface WordExample {
  word: string
  emoji: string
}

// Banco de palavras inicial (baseado no original + melhorias pedagógicas)
// Foco em: concretas, fáceis de pronunciar, do cotidiano brasileiro, fáceis de ilustrar

export const WORD_BANK: Record<Letter, WordExample[]> = {
  A: [
    { word: 'Abelha', emoji: '🐝' },
    { word: 'Avião', emoji: '✈️' },
    { word: 'Abacaxi', emoji: '🍍' },
    { word: 'Árvore', emoji: '🌳' },
  ],
  E: [
    { word: 'Elefante', emoji: '🐘' },
    { word: 'Estrela', emoji: '⭐' },
    { word: 'Escova', emoji: '🪥' },
    { word: 'Espelho', emoji: '🪞' },
  ],
  I: [
    { word: 'Ioiô', emoji: '🪀' },
    { word: 'Inseto', emoji: '🐛' },
    { word: 'Ilha', emoji: '🏝️' },
  ],
  O: [
    { word: 'Ovo', emoji: '🥚' },
    { word: 'Olho', emoji: '👁️' },
    { word: 'Ônibus', emoji: '🚌' },
    { word: 'Ovelha', emoji: '🐑' },
  ],
  U: [
    { word: 'Urso', emoji: '🐻' },
    { word: 'Uva', emoji: '🍇' },
    { word: 'Unicórnio', emoji: '🦄' },
  ],
  // Futuramente adicionaremos B, P, M, T, etc.
}

// Ordem pedagógica recomendada para crianças de 4 anos (vogais primeiro)
export const PEDAGOGICAL_ORDER: Letter[] = [
  'A', 'E', 'I', 'O', 'U',
  // Fase 2 (próxima)
  'B', 'P', 'M', 'T', 'D',
  'F', 'V', 'G', 'C', 'L',
  // Fase 3
  'S', 'N', 'R', 'J', 'Z',
  'X', 'Q', 'H',
]

export const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') as Letter[]

// Apenas as letras que já temos palavras cadastradas
export const AVAILABLE_LETTERS = Object.keys(WORD_BANK) as Letter[]

// Helper: pega um exemplo aleatório de uma letra
export function getRandomExample(letter: Letter): WordExample {
  const examples = WORD_BANK[letter] || []
  if (examples.length === 0) return { word: letter, emoji: '🔤' }
  return examples[Math.floor(Math.random() * examples.length)]
}

// Pega N letras aleatórias diferentes da atual (para distratores)
export function getRandomDistractors(current: Letter, count: number): Letter[] {
  const others = AVAILABLE_LETTERS.filter(l => l !== current)
  const shuffled = [...others].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Retorna uma palavra aleatória (com sua letra) de todo o banco
export function getRandomWord(): { letter: Letter; example: WordExample } {
  const letters = AVAILABLE_LETTERS
  const randomLetter = letters[Math.floor(Math.random() * letters.length)]
  const examples = WORD_BANK[randomLetter]
  const randomExample = examples[Math.floor(Math.random() * examples.length)]
  return {
    letter: randomLetter,
    example: randomExample,
  }
}