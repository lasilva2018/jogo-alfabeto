import { useChildProfile } from '../stores/useChildProfile'
import { useState } from 'react'
import { PrivacyPolicy } from './PrivacyPolicy'
import { TermsOfUse } from './TermsOfUse'
import { isSupabaseEnabled, signInParent } from '../lib/supabase'

export function Settings({ onBack, onOpenPremium }: { onBack: () => void; onOpenPremium?: () => void }) {
  const {
    profiles,
    currentProfileId,
    parentSettings,
    switchProfile,
    deleteProfile,
    clearAllData,
    acceptPrivacy,
  } = useChildProfile()

  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const handleDeleteCurrent = () => {
    if (!currentProfileId) return
    if (confirm('Tem certeza que quer apagar este perfil? O progresso será perdido.')) {
      deleteProfile(currentProfileId)
    }
  }

  const handleClearAll = () => {
    if (confirm('Isso vai apagar TODOS os perfis e progresso. Tem certeza?')) {
      clearAllData()
      onBack()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      <div className="px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60 flex items-center justify-between">
        <button onClick={onBack} className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70">
          ← Voltar
        </button>
        <div className="text-sm text-gray-500">Configurações</div>
        <div className="w-8" />
      </div>

      <div className="flex-1 px-6 pt-6 pb-8 overflow-auto">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">Configurações</h1>

        {/* Perfis */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 mb-6">
          <h2 className="font-semibold text-xl mb-4">Perfis das Crianças</h2>
          
          <div className="space-y-3 mb-4">
            {profiles.length === 0 && (
              <p className="text-gray-500">Nenhum perfil criado ainda.</p>
            )}
            {profiles.map((p) => (
              <div 
                key={p.id} 
                onClick={() => switchProfile(p.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  p.id === currentProfileId 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="text-4xl">{p.avatar}</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.stars} estrelinhas</div>
                </div>
                {p.id === currentProfileId && (
                  <div className="text-purple-600 font-medium text-sm">Ativo</div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleDeleteCurrent}
              disabled={!currentProfileId}
              className="flex-1 py-3 rounded-2xl border-2 border-red-200 text-red-600 font-medium active:bg-red-50 disabled:opacity-50"
            >
              Apagar perfil atual
            </button>
            <button 
              onClick={handleClearAll}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-600 font-medium active:bg-gray-100"
            >
              Apagar tudo
            </button>
          </div>
        </div>

        {/* Premium / Monetização */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 mb-6">
          <h2 className="font-semibold text-xl mb-4">Acesso Completo</h2>
          
          <div className={`px-4 py-3 rounded-2xl mb-4 ${parentSettings.isPremium ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {parentSettings.isPremium ? (
              <>✓ Você tem acesso completo (Premium)</>
            ) : (
              <>Acesso limitado a 7 jogos. Desbloqueie os 3 jogos avançados + voz de qualidade + novidades.</>
            )}
          </div>

          {!parentSettings.isPremium && (
            <button 
              onClick={() => {
                if (onOpenPremium) {
                  onOpenPremium()
                }
              }}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-bold rounded-3xl active:opacity-90 mb-2"
            >
              Conhecer o Premium →
            </button>
          )}

          <p className="text-xs text-gray-500 text-center">
            Pagamento único • Sem assinatura
          </p>
        </div>

        {/* Nuvem / Sync (preparação Supabase - Fase 2) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 mb-6">
          <h2 className="font-semibold text-xl mb-4">Backup e Sincronização</h2>
          
          <div className="text-sm text-gray-600 mb-4">
            Em breve: salve o progresso de todas as crianças na nuvem com segurança. 
            Troque de celular sem perder nada e acesse relatórios de onde estiver.
          </div>

          <button
            onClick={() => {
              if (isSupabaseEnabled) {
                const email = prompt('Digite o e-mail do responsável para receber o link mágico:')
                if (email) signInParent(email)
              } else {
                alert('A sincronização na nuvem será liberada na próxima atualização. Fique ligado!')
              }
            }}
            className="w-full py-3 rounded-2xl border-2 border-purple-200 text-purple-700 font-medium active:bg-purple-50"
          >
            {isSupabaseEnabled ? 'Criar conta / Entrar (responsável)' : 'Em breve: Salvar progresso na nuvem →'}
          </button>

          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Seus dados continuam 100% locais até você conectar uma conta.
          </p>
        </div>

        {/* Privacidade - Muito importante para comercialização */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 mb-6">
          <h2 className="font-semibold text-xl mb-4">Privacidade e Dados</h2>
          
          <div className="space-y-4 text-sm">
            <div className={`p-4 rounded-2xl ${parentSettings.privacyAccepted ? 'bg-green-50' : 'bg-orange-50'}`}>
              <p className="font-medium mb-2">
                {parentSettings.privacyAccepted 
                  ? '✓ Política de privacidade aceita pelos responsáveis' 
                  : 'Importante: Este é um app para crianças pequenas. Consentimento é obrigatório.'}
              </p>
              <button 
                onClick={() => setShowPrivacy(true)}
                className="text-purple-600 underline text-sm"
              >
                {parentSettings.privacyAccepted ? 'Ver novamente a Política de Privacidade' : 'Ler e aceitar a Política de Privacidade'}
              </button>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={parentSettings.allowNameCollection}
                  onChange={(e) => {
                    useChildProfile.setState(s => ({
                      parentSettings: { ...s.parentSettings, allowNameCollection: e.target.checked }
                    }))
                  }}
                  className="mt-1"
                />
                <span className="text-gray-700">
                  Permitir que as crianças usem o próprio nome ou apelido nos perfis (recomendamos nomes ou apelidos curtos).
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Seguimos boas práticas de privacidade para apps infantis (LGPD). Você pode mudar a qualquer momento.
              </p>
            </div>

            <div className="pt-1">
              <button 
                onClick={() => setShowTerms(true)}
                className="text-purple-600 underline text-sm"
              >
                Ler os Termos de Uso completos
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="w-full py-4 text-lg font-medium text-purple-600"
        >
          Voltar para os jogos
        </button>
      </div>

      {/* Privacy Modal - usa o componente compartilhado bonito */}
      {showPrivacy && (
        <PrivacyPolicy
          onAccept={() => {
            acceptPrivacy(parentSettings.allowNameCollection)
            setShowPrivacy(false)
          }}
          onClose={() => setShowPrivacy(false)}
          showAcceptButton={true}
        />
      )}

      {/* Terms Modal */}
      {showTerms && (
        <TermsOfUse onClose={() => setShowTerms(false)} />
      )}
    </div>
  )
}
