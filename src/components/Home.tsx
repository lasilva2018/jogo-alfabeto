import { TouchLetterGame } from './games/TouchLetterGame'
import { QualComecoGame } from './games/QualComecoGame'
import { CacaLetraGame } from './games/CacaLetraGame'
import { CompletePalavraGame } from './games/CompletePalavraGame'
import { DesenheLetraGame } from './games/DesenheLetraGame'
import { QualNaoPertenceGame } from './games/QualNaoPertenceGame'
import { MemoriaGame } from './games/MemoriaGame'
import { MontePalavraGame } from './games/MontePalavraGame'
import { EscuteEEncontreGame } from './games/EscuteEEncontreGame'
import { CacaPalavrasGame } from './games/CacaPalavrasGame'
import { RewardsScreen } from './RewardsScreen'
import { MinhasLetras } from './MinhasLetras'
import { Settings } from './Settings'
import { PremiumScreen } from './PremiumScreen'
import { ReportsScreen } from './ReportsScreen'
import { Alfafa } from './mascot/Alfafa'
import { useChildProfile, useCurrentProfile, getChildVocative, getChildDisplayName, personalizeSpeech } from '../stores/useChildProfile'
import type { ChildProfile } from '../types'
import { getAudioManager } from '../lib/audio/AudioManager'
import { useState } from 'react'

type Screen = 'home' | 'touch-letter' | 'qual-comeco' | 'caca-letra' | 'complete-palavra' | 'desenhe-letra' | 'qual-nao-pertence' | 'memoria' | 'monte-palavra' | 'escute-e-encontre' | 'caca-palavras' | 'rewards' | 'minhas-letras' | 'reports' | 'settings' | 'premium'

export function Home() {
  const profile = useCurrentProfile()
  const isAuthenticated = useChildProfile((state) => state.isAuthenticated)
  const createProfileAction = useChildProfile((state) => state.createProfile)
  const acceptPrivacy = useChildProfile((state) => state.acceptPrivacy)
  const isSyncing = useChildProfile((state) => state.isSyncing)

  const [currentScreen, setCurrentScreen] = useState<Screen>('home')

  const speechName = getChildVocative(profile)
  const displayName = getChildDisplayName(profile)
  const stars = profile?.stars || 0

  // Form simples para criar o primeiro perfil de criança (usado quando o responsável já autenticou via Supabase
  // mas ainda não tem nenhum perfil de criança cadastrado)
  const [showFirstProfileForm, setShowFirstProfileForm] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [firstAge, setFirstAge] = useState<number | null>(null)
  const [firstGender, setFirstGender] = useState<'masculino' | 'feminino' | null>(null)
  const [firstAvatar, setFirstAvatar] = useState('🐘')

  const AVATAR_OPTIONS = ['🐘', '🦁', '🐻', '🐰', '🐼', '🦒', '🐢', '🦊']

  const handleCreateFirstProfile = () => {
    const trimmed = firstName.trim()
    if (trimmed.length < 2) return
    // Garante que a privacidade foi aceita (o responsável já viu a seção em Settings ao pedir o link)
    acceptPrivacy(true)
    createProfileAction(trimmed, firstAvatar, firstAge ?? undefined, firstGender ?? 'masculino')
    setShowFirstProfileForm(false)
    setFirstName('')
    setFirstAge(null)
    setFirstGender(null)
    // O createProfile já cuida de sincronizar com a nuvem se autenticado
  }

  // Recomendação inteligente baseada no mastery real da criança
  const getWeakLetters = (prof: ChildProfile | null) => {
    if (!prof?.letterMastery) return []
    const mastery = prof.letterMastery
    return Object.entries(mastery)
      .map(([letter, data]) => {
        const acc = data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0
        return { letter, attempts: data.attempts, accuracy: acc }
      })
      .filter(item => item.attempts < 3 || item.accuracy < 60)
      .sort((a, b) => a.attempts - b.attempts)
      .slice(0, 2)
      .map(item => item.letter)
  }

  const weakLetters = getWeakLetters(profile)
  const hasWeakLetters = weakLetters.length > 0

  if (currentScreen === 'touch-letter') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <TouchLetterGame />
      </div>
    )
  }

  if (currentScreen === 'desenhe-letra') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <DesenheLetraGame />
      </div>
    )
  }

  if (currentScreen === 'qual-comeco') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <QualComecoGame />
      </div>
    )
  }

  if (currentScreen === 'escute-e-encontre') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <EscuteEEncontreGame />
      </div>
    )
  }

  if (currentScreen === 'complete-palavra') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <CompletePalavraGame />
      </div>
    )
  }

  if (currentScreen === 'qual-nao-pertence') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <QualNaoPertenceGame />
      </div>
    )
  }

  if (currentScreen === 'monte-palavra') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <MontePalavraGame />
      </div>
    )
  }

  if (currentScreen === 'memoria') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <MemoriaGame />
      </div>
    )
  }

  if (currentScreen === 'caca-letra') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <CacaLetraGame />
      </div>
    )
  }

  if (currentScreen === 'caca-palavras') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
        </div>
        <CacaPalavrasGame />
      </div>
    )
  }

  if (currentScreen === 'settings') {
    return <Settings onBack={() => setCurrentScreen('home')} onOpenPremium={() => setCurrentScreen('premium')} />
  }

  if (currentScreen === 'premium') {
    return (
      <PremiumScreen 
        onBack={() => setCurrentScreen('home')} 
        onUnlockSuccess={() => setCurrentScreen('home')} 
      />
    )
  }

  if (currentScreen === 'rewards') {
    return <RewardsScreen onBack={() => setCurrentScreen('home')} />
  }

  if (currentScreen === 'minhas-letras') {
    return <MinhasLetras onBack={() => setCurrentScreen('home')} />
  }

  if (currentScreen === 'reports') {
    return <ReportsScreen onBack={() => setCurrentScreen('home')} />
  }

  // Home / Game Selector
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Header with Alfafa */}
      <div className="px-6 pt-6 pb-2 flex items-start gap-4">
        <div 
          onClick={() => {
            const base = hasWeakLetters 
              ? `Olá {name}! Hoje vamos treinar a letra ${weakLetters[0]}! Vamos brincar?`
              : `Olá {name}! Eu sou o Alfafa. Vamos brincar hoje?`
            const noNameBase = hasWeakLetters 
              ? `Olá! Hoje vamos treinar a letra ${weakLetters[0]}! Vamos brincar?`
              : `Olá! Eu sou o Alfafa. Vamos brincar hoje?`
            const greeting = personalizeSpeech(base, noNameBase, speechName)
            getAudioManager().speakAsAlfafa(greeting)
          }}
          className="cursor-pointer active:scale-95 transition-transform"
        >
          <Alfafa mood="happy" size="lg" />
        </div>
        <div className="pt-2 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-600 font-medium">Olá, {displayName}!</div>
              <div className="text-3xl font-bold text-gray-800 leading-tight">O que vamos<br />brincar hoje?</div>
            </div>
            <button 
              onClick={() => setCurrentScreen('settings')}
              className="text-3xl p-2 -mr-2 active:opacity-70"
              aria-label="Configurações e privacidade"
            >
              ⚙️
            </button>
          </div>
          <div className="text-xs text-purple-500 mt-0.5">
            {profile?.letterMastery ? Object.keys(profile.letterMastery).length : 0} letras praticadas • {stars} estrelinha{stars !== 1 ? 's' : ''}
          </div>
          {hasWeakLetters && (
            <div className="text-xs text-amber-600 mt-1 font-medium">
              Hoje o Alfafa recomenda praticar: {weakLetters.join(' e ')} ✨
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-12 flex flex-col gap-5">
        
        {/* Caso o responsável esteja autenticado mas ainda não tenha criado nenhum perfil de criança */}
        {!profile && isAuthenticated && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-300">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">👶</div>
              <h3 className="text-2xl font-bold text-purple-700">Vamos criar o primeiro perfil!</h3>
              <p className="text-gray-600 mt-1 text-sm">Crie o perfil da sua criança para começar a brincar e salvar o progresso na nuvem.</p>
            </div>

            {!showFirstProfileForm ? (
              <button
                onClick={() => setShowFirstProfileForm(true)}
                className="w-full py-4 bg-purple-600 text-white text-xl font-bold rounded-3xl active:bg-purple-700"
                disabled={isSyncing}
              >
                Criar perfil da criança
              </button>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nome ou apelido da criança"
                  className="w-full text-2xl text-center py-3 px-4 rounded-2xl border-2 border-purple-200 focus:border-purple-500 outline-none"
                  autoFocus
                />

                <div>
                  <div className="text-sm text-gray-600 mb-1 text-left">Gênero</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFirstGender('masculino')}
                      className={`flex-1 py-2 rounded-2xl border text-base ${firstGender === 'masculino' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200'}`}
                    >
                      👦 Menino
                    </button>
                    <button
                      onClick={() => setFirstGender('feminino')}
                      className={`flex-1 py-2 rounded-2xl border text-base ${firstGender === 'feminino' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white border-pink-200'}`}
                    >
                      👧 Menina
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1 text-left">Idade (opcional, ajuda no jogo Desenhe a Letra)</div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {[3,4,5,6,7,8].map(a => (
                      <button
                        key={a}
                        onClick={() => setFirstAge(a)}
                        className={`px-3 py-1 rounded-2xl border text-sm ${firstAge === a ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-purple-200'}`}
                      >
                        {a}{a===8 ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      onClick={() => setFirstAvatar(av)}
                      className={`text-5xl aspect-square flex items-center justify-center rounded-2xl border-4 transition-all ${firstAvatar === av ? 'border-purple-500 bg-purple-100 scale-105' : 'border-gray-200 bg-white'}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowFirstProfileForm(false); setFirstName(''); setFirstAge(null); setFirstGender(null) }}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-600 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateFirstProfile}
                    disabled={firstName.trim().length < 2 || !firstGender}
                    className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-2xl disabled:bg-gray-300 active:bg-purple-700"
                  >
                    Criar e começar
                  </button>
                </div>
              </div>
            )}

            {isSyncing && <p className="text-xs text-center text-purple-500 mt-2">Sincronizando com a nuvem...</p>}
          </div>
        )}

        {/* Game 1 - Toque a Letra (reconhecimento básico - vogais) */}
        <button
          onClick={() => setCurrentScreen('touch-letter')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-100 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">🔤</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-purple-700">Toque a Letra</div>
              <div className="text-lg text-gray-600 mt-1">Encontre a letra certa</div>
              {!hasWeakLetters && (
                <div className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">Recomendado para começar</div>
              )}
            </div>
          </div>
        </button>

        {/* Game 2 - Desenhe a Letra (formação motora) */}
        <button
          onClick={() => setCurrentScreen('desenhe-letra')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-indigo-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">🖍️</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-indigo-600">Desenhe a Letra</div>
              <div className="text-lg text-gray-600 mt-1">Desenhe com o dedo!</div>
            </div>
          </div>
        </button>

        {/* Game 3 - Qual o Começo? (consciência fonológica) */}
        <button
          onClick={() => setCurrentScreen('qual-comeco')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-orange-100 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">❓</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-orange-600">Qual o Começo?</div>
              <div className="text-lg text-gray-600 mt-1">Qual letra começa a palavra?</div>
            </div>
          </div>
        </button>

        {/* Game 4 - Escute e Encontre (audição + reconhecimento) */}
        <button
          onClick={() => setCurrentScreen('escute-e-encontre')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-emerald-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">🗣️</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-emerald-600">Escute e Encontre</div>
              <div className="text-lg text-gray-600 mt-1">Toque o que o Alfafa falou!</div>
              {hasWeakLetters && (
                <div className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium">Recomendado hoje</div>
              )}
            </div>
          </div>
        </button>

        {/* Game 5 - Complete a Palavra */}
        <button
          onClick={() => setCurrentScreen('complete-palavra')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-teal-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">✏️</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-teal-600">Complete a Palavra</div>
              <div className="text-lg text-gray-600 mt-1">Qual letra está faltando?</div>
            </div>
          </div>
        </button>

        {/* Game 6 - Qual Não Pertence? (discriminação) */}
        <button
          onClick={() => setCurrentScreen('qual-nao-pertence')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-rose-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">🧐</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-rose-600">Qual Não Pertence?</div>
              <div className="text-lg text-gray-600 mt-1">Ache o diferente!</div>
            </div>
          </div>
        </button>

        {/* Game 7 - Monte a Palavra (sequenciação) */}
        <button
          onClick={() => setCurrentScreen('monte-palavra')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-violet-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">🔡</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-violet-600">Monte a Palavra</div>
              <div className="text-lg text-gray-600 mt-1">Toque as letras na ordem!</div>
              {hasWeakLetters && (
                <div className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium">Recomendado hoje</div>
              )}
            </div>
          </div>
        </button>

        {/* Game 8 - Jogo da Memória (associação) */}
        <button
          onClick={() => setCurrentScreen('memoria')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-sky-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">🃏</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-sky-600">Jogo da Memória</div>
              <div className="text-lg text-gray-600 mt-1">Encontre os pares!</div>
            </div>
          </div>
        </button>

        {/* Game 9 - Caça à Letra */}
        <button
          onClick={() => setCurrentScreen('caca-letra')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-pink-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">🔍</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-pink-600">Caça à Letra</div>
              <div className="text-lg text-gray-600 mt-1">Encontre todas as letras!</div>
            </div>
          </div>
        </button>

        {/* Game 10 - Caça às Palavras */}
        <button
          onClick={() => setCurrentScreen('caca-palavras')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-amber-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">🔎</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-amber-600">Caça às Palavras</div>
              <div className="text-lg text-gray-600 mt-1">Encontre todas as palavras!</div>
              {hasWeakLetters && (
                <div className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium">Recomendado hoje</div>
              )}
            </div>
          </div>
        </button>

        {/* Rewards Button */}
        <button
          onClick={() => setCurrentScreen('rewards')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-yellow-200 active:scale-[0.985] transition-transform text-left mt-4"
        >
          <div className="flex items-center gap-5">
            <div className="text-6xl">⭐</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-yellow-600">Meu Tesouro</div>
              <div className="text-lg text-gray-600 mt-1">
                {stars} estrelinha{stars !== 1 ? 's' : ''} brilhando
              </div>
            </div>
          </div>
        </button>

        {/* Minhas Letras Button */}
        <button
          onClick={() => setCurrentScreen('minhas-letras')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-blue-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-6xl">📚</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-blue-600">Minhas Letras</div>
              <div className="text-lg text-gray-600 mt-1">Veja seu progresso!</div>
            </div>
          </div>
        </button>

        {/* Relatórios para Pais (visível para todos, útil para acompanhar desenvolvimento) */}
        <button
          onClick={() => setCurrentScreen('reports')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-emerald-200 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-6xl">📊</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-emerald-600">Relatórios para Pais</div>
              <div className="text-lg text-gray-600 mt-1">Progresso detalhado por letra</div>
            </div>
          </div>
        </button>

      </div>

      <div className="text-center pb-6 text-xs text-gray-400">
        10 joguinhos divertidos para aprender brincando!
      </div>
    </div>
  )
}