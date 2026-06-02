import { useState } from 'react'
import { useChildProfile } from './stores/useChildProfile'
import { Onboarding } from './components/onboarding/Onboarding'
import { Home } from './components/Home'
import { PrivacyPolicy } from './components/PrivacyPolicy'

function App() {
  const { hasCompletedOnboarding, profile, parentSettings, acceptPrivacy, profiles } = useChildProfile()

  // Gate de consentimento para usuários existentes que ainda não aceitaram a política (cenário de atualização)
  const [consentGateOpen, setConsentGateOpen] = useState(true)

  if (!hasCompletedOnboarding || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
        <Onboarding />
      </div>
    )
  }

  const needsPrivacyConsent = profiles.length > 0 && !parentSettings.privacyAccepted

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      <Home />

      {/* Consentimento obrigatório para perfis existentes sem aceite prévio (LGPD) */}
      {needsPrivacyConsent && consentGateOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md">
            <PrivacyPolicy
              showAcceptButton
              onAccept={() => {
                acceptPrivacy(parentSettings.allowNameCollection ?? true)
                setConsentGateOpen(false)
              }}
              onClose={() => {
                // Não permitir fechar sem aceitar — reforça consentimento explícito
              }}
            />
            <p className="text-center text-white text-xs mt-4 opacity-80">
              É necessário aceitar a política para continuar usando os perfis salvos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
