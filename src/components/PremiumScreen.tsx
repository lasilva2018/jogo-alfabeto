import { motion } from 'framer-motion'
import { useChildProfile } from '../stores/useChildProfile'

interface PremiumScreenProps {
  onBack: () => void
  onUnlockSuccess?: () => void
}

export function PremiumScreen({ onBack, onUnlockSuccess }: PremiumScreenProps) {
  const { setPremium, parentSettings } = useChildProfile()
  const isPremium = parentSettings?.isPremium || false

  const handleUnlock = () => {
    setPremium(true)
    // Pequeno delay para feedback visual
    setTimeout(() => {
      if (onUnlockSuccess) {
        onUnlockSuccess()
      } else {
        onBack()
      }
    }, 600)
  }

  const benefits = [
    { icon: '🔓', title: 'Todos os 10 joguinhos já liberados', desc: 'Monte a Palavra, Qual Não Pertence, Caça às Palavras + futuros jogos' },
    { icon: '🎙️', title: 'Voz ElevenLabs de qualidade para todos', desc: 'Alfafa (voz masculina) e Alice em todas as falas — já disponível no grátis' },
    { icon: '📊', title: 'Relatórios para os pais (em breve)', desc: 'Acompanhe o progresso real por letra e tempo de uso' },
    { icon: '✨', title: 'Novos jogos e atualizações primeiro', desc: 'Acesso antecipado a novos mini-jogos e melhorias' },
    { icon: '🚫', title: 'Sem anúncios, sem distrações', desc: 'Experiência 100% focada na criança' },
    { icon: '❤️', title: 'Suporte prioritário', desc: 'Dúvidas respondidas diretamente pelos criadores' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white flex flex-col safe-area">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="text-white/80 font-medium flex items-center gap-1 text-lg active:opacity-70"
        >
          ← Voltar
        </button>
        <div className="text-sm text-white/60">Acesso Completo</div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-auto px-6 pb-8">
        {/* Hero */}
        <div className="text-center pt-4 pb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-4">
            <span className="text-6xl">👑</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Alfafa Premium</h1>
          <p className="text-xl text-purple-200">Desbloqueie todo o potencial da alfabetização</p>
        </div>

        {/* Status atual */}
        {isPremium ? (
          <div className="mb-8 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 p-5 text-center">
            <div className="text-2xl mb-1">✓</div>
            <div className="text-xl font-semibold text-emerald-300">Você já tem Acesso Completo!</div>
            <p className="text-emerald-200/80 text-sm mt-1">Obrigado por apoiar o Alfafa ❤️</p>
          </div>
        ) : (
          <div className="mb-8 rounded-3xl bg-white/10 border border-white/20 p-5 text-center">
            <div className="text-sm uppercase tracking-[2px] text-purple-300 mb-1">PAGAMENTO ÚNICO • SEM ASSINATURA</div>
            <div className="text-5xl font-bold mb-1">R$ 29,90</div>
            <div className="text-purple-200">Acesso vitalício a tudo</div>
          </div>
        )}

        {/* Benefícios */}
        <div className="space-y-3 mb-8">
          {benefits.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * idx }}
              className="flex gap-4 bg-white/10 rounded-2xl p-4 border border-white/10"
            >
              <div className="text-3xl flex-shrink-0 mt-0.5">{b.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg leading-tight">{b.title}</div>
                <div className="text-purple-200 text-sm mt-0.5 leading-snug">{b.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparação simples */}
        <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="font-medium mb-2 text-purple-200">Grátis</div>
            <ul className="space-y-1 text-white/70 text-xs">
              <li>Todos os 10 jogos</li>
              <li>Voz ElevenLabs de qualidade</li>
              <li>Progresso local</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/30">
            <div className="font-medium mb-2 text-white">Premium</div>
            <ul className="space-y-1 text-white text-xs">
              <li>Todos os jogos + prioridade em novos</li>
              <li>Relatórios para pais (em breve)</li>
              <li>Suporte prioritário + atualizações primeiro</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        {!isPremium && (
          <button
            onClick={handleUnlock}
            className="w-full py-5 bg-white text-purple-800 text-2xl font-bold rounded-3xl active:bg-amber-100 transition-colors shadow-xl"
          >
            Desbloquear por R$ 29,90
          </button>
        )}

        {isPremium && (
          <button
            onClick={onBack}
            className="w-full py-5 bg-white/90 text-purple-800 text-xl font-bold rounded-3xl active:bg-white"
          >
            Voltar para os jogos
          </button>
        )}

        <p className="text-center text-[10px] text-white/50 mt-4">
          (Versão de demonstração — em produção integraremos Stripe / Apple / Google Pay)
        </p>

        <div className="text-center mt-6">
          <button onClick={onBack} className="text-xs text-white/60 underline">
            Talvez mais tarde
          </button>
        </div>
      </div>
    </div>
  )
}
