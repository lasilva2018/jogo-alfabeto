import { useChildProfile } from './stores/useChildProfile'
import { Onboarding } from './components/onboarding/Onboarding'
import { TouchLetterGame } from './components/games/TouchLetterGame'

function App() {
  const { profile, hasCompletedOnboarding } = useChildProfile()

  // Show onboarding if no profile yet
  if (!hasCompletedOnboarding || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
        <Onboarding />
      </div>
    )
  }

  // Main game (for now we go straight to the game)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      <TouchLetterGame />
    </div>
  )
}

export default App
