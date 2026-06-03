import { useChildProfile, getChildDisplayName, type ChildProfile } from '../stores/useChildProfile'
import { useState } from 'react'
import { PrivacyPolicy } from './PrivacyPolicy'
import { TermsOfUse } from './TermsOfUse'
import { isSupabaseEnabled } from '../lib/supabase'

export function Settings({ onBack, onOpenPremium }: { onBack: () => void; onOpenPremium?: () => void }) {
  const {
    profiles,
    currentProfileId,
    parentSettings,
    switchProfile,
    deleteProfile,
    clearAllData,
    acceptPrivacy,
    updateProfile,
    // Supabase auth/sync
    supabaseUser,
    isSyncing,
    isAuthenticated,
    signInWithEmail,
    signOut,
    syncNow,
    createProfile,
    lastSyncError,
    clearLastSyncError,
  } = useChildProfile()

  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  // Add new child form
  const [showAddForm, setShowAddForm] = useState(false)
  const [addName, setAddName] = useState('')
  const [addAge, setAddAge] = useState<number | null>(null)
  const [addGender, setAddGender] = useState<'masculino' | 'feminino' | null>(null)
  const [addAvatar, setAddAvatar] = useState('🐘')

  // Edit current profile form
  const [showEditForm, setShowEditForm] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAge, setEditAge] = useState<number | null>(null)
  const [editGender, setEditGender] = useState<'masculino' | 'feminino' | null>(null)
  const [editAvatar, setEditAvatar] = useState('🐘')

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

  const handleAddProfile = () => {
    const trimmed = addName.trim()
    if (trimmed.length < 2 || !addAge) return
    createProfile(trimmed, addAvatar, addAge, addGender ?? undefined)
    setAddName('')
    setAddAge(null)
    setAddGender(null)
    setAddAvatar('🐘')
    setShowAddForm(false)
  }

  const handleStartEdit = () => {
    const current = profiles.find(p => p.id === currentProfileId)
    if (!current) return
    setEditName(current.name || '')
    setEditAge(current.age ?? null)
    setEditGender(current.gender ?? null)
    setEditAvatar(current.avatar || '🐘')
    setShowEditForm(true)
    setShowAddForm(false)
  }

  const handleSaveEdit = () => {
    if (!currentProfileId) return
    const updates: Partial<ChildProfile> = {}
    const trimmed = editName.trim()
    if (trimmed.length >= 2) updates.name = trimmed
    if (editAge != null) updates.age = editAge
    if (editGender) updates.gender = editGender
    if (editAvatar) updates.avatar = editAvatar
    if (Object.keys(updates).length > 0) {
      updateProfile(updates)
    }
    setShowEditForm(false)
  }

  const handleCancelEdit = () => {
    setShowEditForm(false)
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
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {getChildDisplayName(p)}
                    {p.gender && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.gender === 'feminino' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                        {p.gender === 'feminino' ? '👧' : '👦'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{p.age ? `${p.age} anos • ` : ''}{p.stars} estrelinhas</div>
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

          {currentProfileId && !showEditForm && !showAddForm && (
            <button 
              onClick={handleStartEdit}
              className="w-full mt-3 py-3 rounded-2xl border-2 border-purple-200 text-purple-700 font-medium active:bg-purple-50"
            >
              ✏️ Editar perfil atual (nome, idade, gênero)
            </button>
          )}

          {!showAddForm && !showEditForm && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full mt-3 py-3 rounded-2xl bg-purple-100 text-purple-700 font-medium active:bg-purple-200"
            >
              + Adicionar novo perfil
            </button>
          )}

          {showAddForm && (
            <div className="mt-4 p-4 border-2 border-purple-200 rounded-3xl bg-purple-50">
              <div className="font-semibold mb-3">Novo perfil</div>
              
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Nome ou apelido"
                className="w-full mb-3 px-4 py-2 rounded-2xl border-2 border-purple-200 text-lg"
              />

              <div className="mb-3">
                <div className="text-sm mb-1">Idade</div>
                <div className="flex gap-2 flex-wrap">
                  {[3,4,5,6,7,8].map(a => (
                    <button
                      key={a}
                      onClick={() => setAddAge(a)}
                      className={`px-4 py-1 rounded-2xl border ${addAge === a ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-purple-200'}`}
                    >
                      {a}{a===8 ? '+' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm mb-1">Gênero (para mostrar "amiguinho" ou "amiguinha" quando não usar nome)</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddGender('masculino')}
                    className={`flex-1 py-2 rounded-2xl border text-lg ${addGender === 'masculino' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200'}`}
                  >
                    👦 Menino
                  </button>
                  <button
                    onClick={() => setAddGender('feminino')}
                    className={`flex-1 py-2 rounded-2xl border text-lg ${addGender === 'feminino' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white border-pink-200'}`}
                  >
                    👧 Menina
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm mb-1">Avatar</div>
                <div className="grid grid-cols-4 gap-2">
                  {['🐘','🦁','🐻','🐰','🐼','🦒','🐢','🦊'].map(av => (
                    <button
                      key={av}
                      onClick={() => setAddAvatar(av)}
                      className={`text-3xl p-2 rounded-2xl border-2 ${addAvatar === av ? 'border-purple-500 bg-purple-100' : 'border-gray-200'}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { setShowAddForm(false); setAddName(''); setAddAge(null); setAddGender(null); setAddAvatar('🐘') }}
                  className="flex-1 py-2 rounded-2xl border border-gray-300"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddProfile}
                  disabled={addName.trim().length < 2 || !addAge || !addGender}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-2xl disabled:bg-gray-300"
                >
                  Criar perfil
                </button>
              </div>
            </div>
          )}

          {showEditForm && (
            <div className="mt-4 p-4 border-2 border-purple-200 rounded-3xl bg-purple-50">
              <div className="font-semibold mb-3">Editar perfil atual</div>
              
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome ou apelido"
                className="w-full mb-3 px-4 py-2 rounded-2xl border-2 border-purple-200 text-lg"
              />

              <div className="mb-3">
                <div className="text-sm mb-1">Idade</div>
                <div className="flex gap-2 flex-wrap">
                  {[3,4,5,6,7,8].map(a => (
                    <button
                      key={a}
                      onClick={() => setEditAge(a)}
                      className={`px-4 py-1 rounded-2xl border ${editAge === a ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-purple-200'}`}
                    >
                      {a}{a===8 ? '+' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm mb-1">Gênero (para mostrar "amiguinho" ou "amiguinha" quando não usar nome)</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditGender('masculino')}
                    className={`flex-1 py-2 rounded-2xl border text-lg ${editGender === 'masculino' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200'}`}
                  >
                    👦 Menino
                  </button>
                  <button
                    onClick={() => setEditGender('feminino')}
                    className={`flex-1 py-2 rounded-2xl border text-lg ${editGender === 'feminino' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white border-pink-200'}`}
                  >
                    👧 Menina
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm mb-1">Avatar</div>
                <div className="grid grid-cols-4 gap-2">
                  {['🐘','🦁','🐻','🐰','🐼','🦒','🐢','🦊'].map(av => (
                    <button
                      key={av}
                      onClick={() => setEditAvatar(av)}
                      className={`text-3xl p-2 rounded-2xl border-2 ${editAvatar === av ? 'border-purple-500 bg-purple-100' : 'border-gray-200'}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 rounded-2xl border border-gray-300"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-2xl active:bg-purple-700"
                >
                  Salvar alterações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Premium / Monetização */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 mb-6">
          <h2 className="font-semibold text-xl mb-4">Acesso Completo</h2>
          
          <div className={`px-4 py-3 rounded-2xl mb-4 ${parentSettings.isPremium ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {parentSettings.isPremium ? (
              <>✓ Você tem acesso completo (Premium)</>
            ) : (
              <>Todos os 10 joguinhos estão liberados. Relatórios para pais já disponíveis + novidades com Premium.</>
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

        {/* Nuvem / Sync (Supabase real) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 mb-6">
          <h2 className="font-semibold text-xl mb-4 flex items-center gap-2">
            Backup e Sincronização
            {isSyncing && <span className="text-xs text-purple-500">sincronizando...</span>}
          </h2>

          {isAuthenticated && supabaseUser ? (
            <div className="space-y-3">
              <div className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-2xl">
                ✓ Conectado como <span className="font-medium">{supabaseUser.email}</span>
              </div>

              {lastSyncError && (
                <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-2xl flex items-start justify-between gap-2">
                  <span>⚠️ {lastSyncError}</span>
                  <button onClick={clearLastSyncError} className="text-red-600 underline text-xs">ok</button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setAuthMessage('')
                    await syncNow()
                    // Só mostra sucesso se não houver erro de sync
                    const err = useChildProfile.getState().lastSyncError
                    if (!err) {
                      setAuthMessage('Sincronizado com sucesso!')
                      setTimeout(() => setAuthMessage(''), 2000)
                    }
                  }}
                  disabled={isSyncing}
                  className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-medium active:bg-purple-700 disabled:opacity-60"
                >
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Desconectar esta conta? Seus dados locais permanecem.')) {
                      await signOut()
                    }
                  }}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-600 font-medium active:bg-gray-50"
                >
                  Sair
                </button>
              </div>

              <p className="text-[10px] text-gray-500">
                O progresso é sincronizado automaticamente após cada jogada quando conectado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Conecte uma conta de responsável com link mágico (sem senha). Assim você tem backup e pode usar em vários aparelhos.
              </p>

              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 text-lg focus:border-purple-500 outline-none"
              />

              <button
                onClick={async () => {
                  if (!emailInput.trim()) return
                  setAuthMessage('')
                  const res = await signInWithEmail(emailInput)
                  setAuthMessage(res.message)
                  if (res.success) setEmailInput('')
                }}
                disabled={!emailInput.trim() || !isSupabaseEnabled}
                className="w-full py-3 rounded-2xl bg-purple-600 text-white font-semibold active:bg-purple-700 disabled:bg-gray-300"
              >
                Enviar link mágico
              </button>

              {!isSupabaseEnabled && (
                <p className="text-xs text-amber-600">Supabase ainda não configurado neste ambiente.</p>
              )}

              {authMessage && (
                <p className="text-xs text-center text-purple-600">{authMessage}</p>
              )}
            </div>
          )}

          <p className="text-[10px] text-gray-400 mt-3 text-center">
            Seus dados locais continuam funcionando offline. A nuvem é apenas backup + multi-dispositivo.
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

        <button 
          onClick={() => {
            // Para abrir relatórios, o usuário volta para home e clica no botão
            // (simples para não complicar navegação)
            onBack()
            // Nota: em uma versão futura podemos passar callback de navegação
          }}
          className="w-full mt-2 py-3 rounded-2xl border border-emerald-300 text-emerald-700 font-medium active:bg-emerald-50"
        >
          📊 Abrir Relatórios para Pais (na tela inicial)
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
