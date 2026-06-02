import { useState } from 'react'
import { motion } from 'framer-motion'
import { useChildProfile } from '../../stores/useChildProfile'
import { PrivacyPolicy } from '../PrivacyPolicy'

const AVATAR_OPTIONS = [
  '🐘', // Alfafa (elephant)
  '🦁', // Lion
  '🐻', // Bear
  '🐰', // Rabbit
  '🐼', // Panda
  '🦒', // Giraffe
  '🐢', // Turtle
  '🦊', // Fox
]

export function Onboarding() {
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('🐘')
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [selectedGender, setSelectedGender] = useState<'masculino' | 'feminino' | null>(null)
  const [step, setStep] = useState<'welcome' | 'consent' | 'nameChoice' | 'name' | 'age' | 'gender' | 'avatar'>('welcome')
  const [allowNameCollection, setAllowNameCollection] = useState(true)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const { createProfile, acceptPrivacy } = useChildProfile()

  const handleStart = () => {
    setStep('consent')
  }

  // Called when user clicks "Li e aceito" inside the full PrivacyPolicy
  const handlePrivacyAccepted = () => {
    setShowPrivacy(false)
    setStep('nameChoice')
  }

  const handleChooseAllowName = (allow: boolean) => {
    setAllowNameCollection(allow)
    acceptPrivacy(allow) // marca consentimento explícito do responsável + flag de coleta de nome

    if (allow) {
      setStep('name')
    } else {
      // Modo anônimo: sem nome (usaremos amiguinho/amiguinha pelo gênero)
      setName('')
      setStep('age')
    }
  }

  const handleNameSubmit = () => {
    const trimmed = name.trim()
    if (trimmed.length < 2) return
    // Já aceitamos a política no passo anterior (nameChoice)
    setStep('age')
  }

  const handleCreateProfile = () => {
    const finalName = allowNameCollection && name.trim().length >= 2 ? name.trim() : ''
    createProfile(finalName, selectedAvatar, selectedAge ?? undefined, selectedGender ?? 'masculino')
    // hasCompletedOnboarding e privacyAccepted já foram setados
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'name') {
        handleNameSubmit()
      } else if (step === 'avatar') {
        handleCreateProfile()
      }
    }
  }

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age)
    setStep('gender')
  }

  const handleGenderSelect = (gender: 'masculino' | 'feminino') => {
    setSelectedGender(gender)
    setStep('avatar')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6 safe-area">
      <div className="w-full max-w-md">
        
        {/* Step: Welcome */}
        {step === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-[120px] mb-4">🐘</div>
            
            <h1 className="text-4xl font-bold text-purple-600 mb-4 tracking-tight">
              Olá! Eu sou o <span className="text-orange-500">Alfafa</span>
            </h1>
            
            <p className="text-2xl text-gray-700 mb-10 leading-tight">
              Vamos aprender o alfabeto juntos?
            </p>

            <button
              onClick={handleStart}
              className="button-large w-full bg-purple-600 text-white text-3xl font-bold active:bg-purple-700"
            >
              Vamos começar!
            </button>

            <p className="mt-6 text-xs text-gray-500">
              Para crianças de 4 a 6 anos • Feito com carinho e privacidade
            </p>
          </motion.div>
        )}

        {/* Step: Consent - Obrigatório para LGPD / apps infantis */}
        {step === 'consent' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🛡️</div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Antes de começar...
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-snug">
              Este é um aplicativo para crianças pequenas.<br />
              Os responsáveis precisam aceitar nossa <strong>Política de Privacidade</strong>.
            </p>

            <div className="bg-white rounded-3xl p-6 mb-6 text-left border border-purple-100">
              <p className="text-sm text-gray-700 mb-4">
                Coletamos apenas: nome/apelido (opcional), avatar e progresso nos jogos. 
                Tudo fica no aparelho da criança. Nunca vendemos dados. 
                Você pode apagar tudo a qualquer momento.
              </p>
              <button
                onClick={() => setShowPrivacy(true)}
                className="w-full py-4 rounded-3xl border-2 border-purple-200 text-purple-700 font-semibold active:bg-purple-50"
              >
                Ler a Política de Privacidade completa
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Ao continuar você confirma que é responsável pela criança e concorda com o tratamento de dados conforme a LGPD.
            </p>
          </motion.div>
        )}

        {/* Step: Name Choice (após aceitar a política) */}
        {step === 'nameChoice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">👋</div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Quer personalizar com nome?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              O Alfafa pode chamar a criança pelo nome ou apelido para deixar mais carinhoso.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => handleChooseAllowName(true)}
                className="w-full py-6 bg-purple-600 text-white text-2xl font-bold rounded-3xl active:bg-purple-700"
              >
                Sim, usar nome ou apelido
              </button>

              <button
                onClick={() => handleChooseAllowName(false)}
                className="w-full py-6 bg-white text-gray-700 text-xl font-semibold rounded-3xl border-2 border-gray-200 active:bg-gray-50"
              >
                Não, jogar de forma anônima
              </button>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              Você pode mudar esta preferência depois nas Configurações.
            </p>
          </motion.div>
        )}

        {/* Step: Name (só se permitiu coleta de nome) */}
        {step === 'name' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-7xl mb-6">✏️</div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Qual o nome ou apelido?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              O Alfafa vai usar isso para falar com carinho.
            </p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Bia, Léo, Sofia..."
              className="w-full text-4xl text-center py-6 px-8 rounded-3xl border-4 border-purple-200 focus:border-purple-500 outline-none mb-8 font-medium"
              autoFocus
            />

            <button
              onClick={handleNameSubmit}
              disabled={name.trim().length < 2}
              className="button-large w-full bg-purple-600 text-white text-3xl font-bold disabled:bg-gray-300 disabled:text-gray-500 active:bg-purple-700"
            >
              Continuar
            </button>

            <button
              onClick={() => {
                setAllowNameCollection(false)
                acceptPrivacy(false)
                setName('')
                setStep('age')
              }}
              className="mt-4 text-sm text-gray-500 underline"
            >
              Prefiro jogar sem nome
            </button>
          </motion.div>
        )}

        {/* Step: Age - para ajustar exigência no jogo Desenhe a Letra */}
        {step === 'age' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎂</div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Quantos aninhos você tem?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Isso ajuda o Alfafa a ajustar o nível dos jogos!
            </p>

            <div className="grid grid-cols-5 gap-3 mb-8">
              {[3,4,5,6,7].map((a) => (
                <button
                  key={a}
                  onClick={() => handleAgeSelect(a)}
                  className="text-4xl py-6 bg-white border-4 border-purple-200 rounded-3xl font-bold active:bg-purple-100 active:border-purple-500"
                >
                  {a}
                </button>
              ))}
              <button
                onClick={() => handleAgeSelect(8)}
                className="text-3xl py-6 bg-white border-4 border-purple-200 rounded-3xl font-bold active:bg-purple-100 active:border-purple-500 col-span-1"
              >
                8+
              </button>
            </div>
          </motion.div>
        )}

        {/* Step: Gender - para o Alfafa falar "amiguinho" ou "amiguinha" */}
        {step === 'gender' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">👦 👧</div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Você é menino ou menina?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Assim o Alfafa sabe se deve dizer "amiguinho" ou "amiguinha"!
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => handleGenderSelect('masculino')}
                className="py-8 bg-white border-4 border-blue-300 rounded-3xl text-2xl font-bold active:bg-blue-50 active:border-blue-500 flex flex-col items-center"
              >
                <span className="text-6xl mb-2">👦</span>
                Menino
              </button>
              <button
                onClick={() => handleGenderSelect('feminino')}
                className="py-8 bg-white border-4 border-pink-300 rounded-3xl text-2xl font-bold active:bg-pink-50 active:border-pink-500 flex flex-col items-center"
              >
                <span className="text-6xl mb-2">👧</span>
                Menina
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Se preferir, depois pode usar o nome real da criança.
            </p>
          </motion.div>
        )}

        {/* Step: Avatar */}
        {step === 'avatar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Escolha seu amiguinho!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Qual bichinho você mais gosta?
            </p>

            <div className="grid grid-cols-4 gap-4 mb-10">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`
                    text-6xl aspect-square flex items-center justify-center rounded-3xl border-4 transition-all
                    ${selectedAvatar === avatar 
                      ? 'border-purple-500 bg-purple-100 scale-105' 
                      : 'border-white bg-white active:scale-95'
                    }
                  `}
                >
                  {avatar}
                </button>
              ))}
            </div>

            <button
              onClick={handleCreateProfile}
              className="button-large w-full bg-purple-600 text-white text-3xl font-bold active:bg-purple-700"
            >
              Começar a brincar!
            </button>

            <p className="mt-4 text-sm text-gray-500">
              Olá, <span className="font-semibold">{allowNameCollection && name.trim() ? name : (selectedGender === 'feminino' ? 'amiguinha' : 'amiguinho')}</span>! Eu sou o Alfafa 🐘
            </p>
          </motion.div>
        )}
      </div>

      {/* Full Privacy Policy Modal (usado no passo de consent) */}
      {showPrivacy && (
        <PrivacyPolicy
          onAccept={handlePrivacyAccepted}
          onClose={() => setShowPrivacy(false)}
          showAcceptButton={true}
        />
      )}
    </div>
  )
}
