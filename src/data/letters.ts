export type Letter = string

export interface WordExample {
  word: string
  emoji: string
}

// Banco de palavras inicial (baseado no original + melhorias pedagógicas)
// Foco em: concretas, fáceis de pronunciar, do cotidiano brasileiro, fáceis de ilustrar

export const WORD_BANK: Record<Letter, WordExample[]> = {
  // Vogais
  A: [
    { word: 'Abelha', emoji: '🐝' },
    { word: 'Avião', emoji: '✈️' },
    { word: 'Abacaxi', emoji: '🍍' },
    { word: 'Árvore', emoji: '🌳' },
    { word: 'Amigo', emoji: '👦' },
    { word: 'Abóbora', emoji: '🎃' },
    { word: 'Açúcar', emoji: '🧂' },
  ],
  E: [
    { word: 'Elefante', emoji: '🐘' },
    { word: 'Estrela', emoji: '⭐' },
    { word: 'Escova', emoji: '🪥' },
    { word: 'Espelho', emoji: '🪞' },
    { word: 'Escada', emoji: '🪜' },
    { word: 'Escola', emoji: '🏫' },
    { word: 'Esquilo', emoji: '🐿️' },
  ],
  I: [
    { word: 'Ioiô', emoji: '🪀' },
    { word: 'Inseto', emoji: '🐛' },
    { word: 'Ilha', emoji: '🏝️' },
    { word: 'Igreja', emoji: '⛪' },
  ],
  O: [
    { word: 'Ovo', emoji: '🥚' },
    { word: 'Olho', emoji: '👁️' },
    { word: 'Ônibus', emoji: '🚌' },
    { word: 'Ovelha', emoji: '🐑' },
    { word: 'Onça', emoji: '🐆' },
  ],
  U: [
    { word: 'Urso', emoji: '🐻' },
    { word: 'Uva', emoji: '🍇' },
    { word: 'Unicórnio', emoji: '🦄' },
    { word: 'Umbigo', emoji: '👶' },
  ],

  // Consoantes fáceis (Fase 2)
  B: [
    { word: 'Bola', emoji: '⚽' },
    { word: 'Bolo', emoji: '🎂' },
    { word: 'Banana', emoji: '🍌' },
    { word: 'Borboleta', emoji: '🦋' },
    { word: 'Boneca', emoji: '🪆' },
    { word: 'Bicicleta', emoji: '🚲' },
    { word: 'Balde', emoji: '🪣' },
  ],
  P: [
    { word: 'Pato', emoji: '🦆' },
    { word: 'Peixe', emoji: '🐟' },
    { word: 'Pipoca', emoji: '🍿' },
    { word: 'Pão', emoji: '🍞' },
    { word: 'Papai', emoji: '👨' },
    { word: 'Pular', emoji: '🦘' },
    { word: 'Pincel', emoji: '🖌️' },
  ],
  M: [
    { word: 'Macaco', emoji: '🐵' },
    { word: 'Mamãe', emoji: '👩' },
    { word: 'Morango', emoji: '🍓' },
    { word: 'Melancia', emoji: '🍉' },
    { word: 'Mão', emoji: '✋' },
    { word: 'Mala', emoji: '🧳' },
    { word: 'Marmita', emoji: '🍱' },
  ],
  T: [
    { word: 'Tigre', emoji: '🐯' },
    { word: 'Tartaruga', emoji: '🐢' },
    { word: 'Trem', emoji: '🚂' },
    { word: 'Torta', emoji: '🥧' },
    { word: 'Telefone', emoji: '📱' },
    { word: 'Tênis', emoji: '👟' },
    { word: 'Tambor', emoji: '🥁' },
  ],
  D: [
    { word: 'Dado', emoji: '🎲' },
    { word: 'Dinossauro', emoji: '🦖' },
    { word: 'Dedo', emoji: '👆' },
    { word: 'Doce', emoji: '🍬' },
    { word: 'Dragão', emoji: '🐉' },
  ],

  // Mais consoantes
  F: [
    { word: 'Flor', emoji: '🌸' },
    { word: 'Foca', emoji: '🦭' },
    { word: 'Foguete', emoji: '🚀' },
    { word: 'Formiga', emoji: '🐜' },
  ],
  V: [
    { word: 'Vaca', emoji: '🐄' },
    { word: 'Vela', emoji: '🕯️' },
    { word: 'Violão', emoji: '🎸' },
    { word: 'Vovó', emoji: '👵' },
  ],
  G: [
    { word: 'Gato', emoji: '🐱' },
    { word: 'Galinha', emoji: '🐔' },
    { word: 'Girafa', emoji: '🦒' },
    { word: 'Goiaba', emoji: '🥝' },
  ],
  C: [
    { word: 'Cachorro', emoji: '🐶' },
    { word: 'Casa', emoji: '🏠' },
    { word: 'Cavalo', emoji: '🐴' },
    { word: 'Cama', emoji: '🛏️' },
    { word: 'Coração', emoji: '❤️' },
    { word: 'Cadeira', emoji: '🪑' },
  ],
  L: [
    { word: 'Leão', emoji: '🦁' },
    { word: 'Lua', emoji: '🌙' },
    { word: 'Livro', emoji: '📖' },
    { word: 'Lápis', emoji: '✏️' },
    { word: 'Leite', emoji: '🥛' },
    { word: 'Laranja', emoji: '🍊' },
    { word: 'Lobo', emoji: '🐺' },
  ],
  S: [
    { word: 'Sol', emoji: '☀️' },
    { word: 'Sapo', emoji: '🐸' },
    { word: 'Sorvete', emoji: '🍦' },
    { word: 'Suco', emoji: '🧃' },
    { word: 'Sapato', emoji: '👟' },
    { word: 'Salgadinho', emoji: '🍿' },
    { word: 'Sino', emoji: '🔔' },
  ],

  // Fase 3 - mais consoantes (expandidas para dar mais variedade nos jogos de caça, memória, escuta e montagem)
  N: [
    { word: 'Nuvem', emoji: '☁️' },
    { word: 'Ninho', emoji: '🪺' },
    { word: 'Navio', emoji: '🚢' },
    { word: 'Nenê', emoji: '👶' },
    { word: 'Noite', emoji: '🌙' },
  ],
  R: [
    { word: 'Rato', emoji: '🐭' },
    { word: 'Rosa', emoji: '🌹' },
    { word: 'Rã', emoji: '🐸' },
    { word: 'Relógio', emoji: '🕰️' },
    { word: 'Rolo', emoji: '🧻' },
  ],
  J: [
    { word: 'Jacaré', emoji: '🐊' },
    { word: 'Janela', emoji: '🪟' },
    { word: 'Jardim', emoji: '🌷' },
    { word: 'João', emoji: '👦' },
    { word: 'Jogo', emoji: '🎮' },
  ],
  Z: [
    { word: 'Zebra', emoji: '🦓' },
    { word: 'Zoológico', emoji: '🦒' },
    { word: 'Zangão', emoji: '🐝' },
    { word: 'Zíper', emoji: '🔒' },
    { word: 'Zum-zum', emoji: '🐝' },
  ],
  X: [
    { word: 'Xícara', emoji: '☕' },
    { word: 'Xadrez', emoji: '♟️' },
    { word: 'Xuxu', emoji: '🥒' },
    { word: 'Xale', emoji: '🧣' },
    { word: 'Xuxa', emoji: '👩‍🦰' },
  ],
  Q: [
    { word: 'Queijo', emoji: '🧀' },
    { word: 'Quarto', emoji: '🛏️' },
    { word: 'Quadro', emoji: '🖼️' },
    { word: 'Quinta', emoji: '🏡' },
    { word: 'Queimada', emoji: '🔥' },
    { word: 'Quindim', emoji: '🍮' },
  ],
  H: [
    { word: 'Hipopótamo', emoji: '🦛' },
    { word: 'Helicóptero', emoji: '🚁' },
    { word: 'Hambúrguer', emoji: '🍔' },
    { word: 'Havaianas', emoji: '👡' },
    { word: 'Hiena', emoji: '🦁' },
    { word: 'Horta', emoji: '🥬' },
  ],
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

export interface OddOneOutRound {
  options: Array<{ letter: Letter; example: WordExample }>
  oddOneOutIndex: number
  mainLetter: Letter
}

// Gera uma rodada de "Qual Não Pertence?"
// 2 palavras da mesma letra + 1 intruso de letra diferente
export function getOddOneOutRound(): OddOneOutRound {
  const letters = AVAILABLE_LETTERS.filter(l => WORD_BANK[l] && WORD_BANK[l].length >= 2)
  
  // Escolhe a letra principal (a que terá 2 exemplos)
  const mainLetter = letters[Math.floor(Math.random() * letters.length)]
  const mainExamples = WORD_BANK[mainLetter]
  
  // Pega 2 exemplos diferentes da letra principal
  const shuffledMain = [...mainExamples].sort(() => Math.random() - 0.5)
  const example1 = shuffledMain[0]
  const example2 = shuffledMain[1]
  
  // Escolhe letra intrusa diferente
  const intruderLetters = letters.filter(l => l !== mainLetter)
  const intruderLetter = intruderLetters[Math.floor(Math.random() * intruderLetters.length)]
  const intruderExamples = WORD_BANK[intruderLetter]
  const intruderExample = intruderExamples[Math.floor(Math.random() * intruderExamples.length)]
  
  // Monta as 3 opções e embaralha
  const rawOptions = [
    { letter: mainLetter, example: example1 },
    { letter: mainLetter, example: example2 },
    { letter: intruderLetter, example: intruderExample },
  ]
  
  // Embaralha mantendo o índice do intruso
  const indices = [0, 1, 2].sort(() => Math.random() - 0.5)
  const options = indices.map(i => rawOptions[i])
  const oddOneOutIndex = indices.indexOf(2) // onde foi parar o intruso (sempre o de índice 2 no raw)
  
  return {
    options,
    oddOneOutIndex,
    mainLetter,
  }
}