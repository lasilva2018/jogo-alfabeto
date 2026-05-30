import { useChildProfile } from './stores/useChildProfile'
import { Onboarding } from './components/onboarding/Onboarding'
import { Home } from './components/Home'

function App() {
  const { hasCompletedOnboarding, profile } = useChildProfile()

  if (!hasCompletedOnboarding || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
        <Onboarding />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      <Home />
    </div>
  )
}

export default App
