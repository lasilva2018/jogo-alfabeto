import { useChildProfile, getChildDisplayName } from '../../stores/useChildProfile'

interface GameTopBarProps {
  title: string
  score?: { correct: number; mistakes?: number }
  onBack?: () => void
  showProfile?: boolean
}

/**
 * Componente compartilhado para o cabeçalho dos jogos.
 * Reduz duplicação dos top bars em cada jogo.
 * (Em andamento - parte do backlog de extração de componentes)
 */
export function GameTopBar({ title, score, onBack, showProfile = true }: GameTopBarProps) {
  const { profile } = useChildProfile()
  const displayName = getChildDisplayName(profile)

  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60">
      <div className="flex items-center gap-3">
        {showProfile && (
          <>
            <div className="text-4xl">{profile?.avatar || '🐘'}</div>
            <div>
              <div className="text-sm font-medium text-purple-700">{displayName}</div>
              <div className="text-[10px] text-gray-500 -mt-0.5">{title}</div>
            </div>
          </>
        )}
        {!showProfile && (
          <div className="text-sm text-gray-500">{title}</div>
        )}
      </div>

      {score && (
        <div className="flex gap-4 text-sm font-semibold">
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-2xl">
            ✅ <span>{score.correct}</span>
          </div>
          {score.mistakes !== undefined && (
            <div className="flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-1 rounded-2xl">
              ❌ <span>{score.mistakes}</span>
            </div>
          )}
        </div>
      )}

      {onBack && (
        <button onClick={onBack} className="text-purple-600 text-sm active:opacity-70">
          Voltar
        </button>
      )}
    </div>
  )
}