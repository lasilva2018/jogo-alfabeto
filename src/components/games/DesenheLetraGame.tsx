import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { LONG_CELEBRATION_AUTO_ADVANCE_MS } from '../../lib/gameConstants'
import { AVAILABLE_LETTERS } from '../../data/letters'
import { useChildProfile } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'

export function DesenheLetraGame() {
  const { profile } = useChildProfile()
  const childName = profile?.name || 'amiguinho'
  const age = profile?.age ?? 4

  const [currentLetter, setCurrentLetter] = useState(() => 
    AVAILABLE_LETTERS[Math.floor(Math.random() * AVAILABLE_LETTERS.length)]
  )
  const [correctCount, setCorrectCount] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [drawnPoints, setDrawnPoints] = useState<{x: number; y: number}[]>([])
  const [lastWasGood, setLastWasGood] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  // Initialize / resize canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const size = Math.min(340, window.innerWidth - 80)
    canvas.width = size
    canvas.height = size

    ctx.lineWidth = 26 // traço mais grosso para mãozinhas de 4 anos
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#7c3aed'

    ctxRef.current = ctx

    drawLetterGuide(ctx, currentLetter, size)
  }

  useEffect(() => {
    setupCanvas()

    const handleResize = () => {
      setupCanvas()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentLetter])

  function drawLetterGuide(ctx: CanvasRenderingContext2D, letter: string, size: number) {
    ctx.save()
    ctx.font = `bold ${size * 0.72}px system-ui, sans-serif`
    ctx.fillStyle = '#e0d4ff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(letter, size / 2, size / 2 + 10)
    ctx.restore()
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawLetterGuide(ctx, currentLetter, canvas.width)
    setHasDrawn(false)
    setShowFeedback(false)
    setDrawnPoints([])
    setLastWasGood(true)
  }

  function isDrawingGood(
    points: {x: number; y: number}[], 
    size: number, 
    ctx: CanvasRenderingContext2D | null, 
    canvas: HTMLCanvasElement | null,
    letter: string,
    childAge: number = 4
  ): boolean {
    if (!ctx || !canvas || points.length < (childAge <= 3 ? 3 : 8)) return false

    // Quick bbox reject
    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const drawnWidth = maxX - minX
    const drawnHeight = maxY - minY
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const canvasCx = size / 2
    const canvasCy = size / 2
    const centerDist = Math.hypot(cx - canvasCx, cy - canvasCy)

    // Compute dynamic thresholds based on age (younger = much more lenient)
    let minSpan = 0.22
    let maxCenterOffset = 0.30
    let tolerance = 28
    let minInk = 300
    let mainOverlap = 0.15
    let safetySpan = 0.30
    let safetyCenter = 0.25
    let safetyInk = 450
    let safetyOverlap = 0.08

    if (childAge <= 3) {
      minSpan = 0.12
      maxCenterOffset = 0.42
      tolerance = 40
      minInk = 120
      mainOverlap = 0.05
      safetySpan = 0.18
      safetyCenter = 0.38
      safetyInk = 180
      safetyOverlap = 0.03
    } else if (childAge === 4) {
      minSpan = 0.18
      maxCenterOffset = 0.35
      tolerance = 32
      minInk = 220
      mainOverlap = 0.10
      safetySpan = 0.25
      safetyCenter = 0.30
      safetyInk = 320
      safetyOverlap = 0.05
    } else if (childAge === 5) {
      minSpan = 0.24
      maxCenterOffset = 0.28
      tolerance = 26
      minInk = 350
      mainOverlap = 0.16
      safetySpan = 0.30
      safetyCenter = 0.24
      safetyInk = 480
      safetyOverlap = 0.09
    } else {
      // 6+ more precision expected
      minSpan = 0.30
      maxCenterOffset = 0.20
      tolerance = 18
      minInk = 520
      mainOverlap = 0.22
      safetySpan = 0.38
      safetyCenter = 0.18
      safetyInk = 680
      safetyOverlap = 0.14
    }

    if (drawnWidth < size * minSpan || drawnHeight < size * minSpan || centerDist > size * maxCenterOffset) {
      return false
    }

    // Build tolerance mask (thick stroke + fill + generous offsets)
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = size
    maskCanvas.height = size
    const maskCtx = maskCanvas.getContext('2d', { alpha: true })
    if (!maskCtx) return false

    maskCtx.fillStyle = 'black'
    maskCtx.strokeStyle = 'black'
    maskCtx.font = `bold ${size * 0.72}px system-ui, sans-serif`
    maskCtx.textAlign = 'center'
    maskCtx.textBaseline = 'middle'
    maskCtx.lineWidth = 28

    maskCtx.strokeText(letter, size / 2, size / 2 + 10)
    maskCtx.fillText(letter, size / 2, size / 2 + 10)

    for (let dx = -tolerance; dx <= tolerance; dx += 4) {
      for (let dy = -tolerance; dy <= tolerance; dy += 4) {
        maskCtx.fillText(letter, size / 2 + dx, size / 2 + 10 + dy)
        maskCtx.strokeText(letter, size / 2 + dx, size / 2 + 10 + dy)
      }
    }

    const maskData = maskCtx.getImageData(0, 0, size, size).data
    const userData = ctx.getImageData(0, 0, size, size).data

    let userInk = 0
    let overlapInk = 0

    for (let i = 0; i < userData.length; i += 4) {
      const r = userData[i]
      const g = userData[i + 1]
      const b = userData[i + 2]
      const a = userData[i + 3]

      // More tolerant purple detection to catch thick brush strokes and anti-aliased edges
      if (a > 80 && b > 130 && r > 20 && g < 200) {
        userInk++
        const ma = maskData[i + 3]
        if (ma > 50) {
          overlapInk++
        }
      }
    }

    const overlapRatio = overlapInk / Math.max(userInk, 1)

    // For 3 years old and under: THE EASIEST POSSIBLE.
    // Accept almost ANY drawing that puts some purple on the canvas.
    // For 3yo, letters will be very rough and simple. The goal is to encourage trying and build confidence.
    if (childAge <= 3) {
      if (userInk > 5) return true;  // if they drew anything visible at all, it's a win
    }

    // Safety net based on age-adjusted params
    const isLargeAndCentered = (drawnWidth > size * safetySpan) && (drawnHeight > size * safetySpan) && (centerDist < size * safetyCenter)
    const hasSubstantialInk = userInk > safetyInk

    if (isLargeAndCentered && hasSubstantialInk && overlapRatio > safetyOverlap) {
      return true
    }

    if (userInk < minInk) return false

    return overlapRatio > mainOverlap
  }

  function startDrawing(e: React.PointerEvent) {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    setIsDrawing(true)
    setHasDrawn(true)
    setShowFeedback(false)

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)

    setDrawnPoints([{x, y}])
  }

  function draw(e: React.PointerEvent) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()

    setDrawnPoints(prev => [...prev, {x, y}])
  }

  function endDrawing() {
    setIsDrawing(false)
  }

  async function handleFinish() {
    if (!hasDrawn) return

    const canvasEl = canvasRef.current
    const ctx = ctxRef.current
    const size = canvasEl?.width || 300
    const isGood = isDrawingGood(drawnPoints, size, ctx, canvasEl, currentLetter, age)

    setShowFeedback(true)
    setLastWasGood(isGood)

    if (isGood) {
      setCorrectCount(c => c + 1)
      useChildProfile.getState().addStars(1)
      useChildProfile.getState().recordLetterPractice(currentLetter, true)
    } else {
      useChildProfile.getState().recordLetterPractice(currentLetter, false)
      // No star / no count for insufficient effort
    }

    await getAudioManager().playSuccess()

    const audio = getAudioManager() as any
    const message = isGood
      ? `Muito bem, ${childName}! Você desenhou a letra ${currentLetter} lindamente!`
      : `Quase, ${childName}! Tente desenhar mais parecido com a letra ${currentLetter}.`

    if (audio.speakAsAlfafa) {
      audio.speakAsAlfafa(message)
    } else {
      getAudioManager().speakPhrase(message)
    }

    setTimeout(() => {
      nextLetter()
    }, LONG_CELEBRATION_AUTO_ADVANCE_MS)
  }

  function nextLetter() {
    let newLetter
    do {
      newLetter = AVAILABLE_LETTERS[Math.floor(Math.random() * AVAILABLE_LETTERS.length)]
    } while (newLetter === currentLetter && AVAILABLE_LETTERS.length > 1)

    setCurrentLetter(newLetter)
    setHasDrawn(false)
    setShowFeedback(false)
    setDrawnPoints([])
    setLastWasGood(true)
  }

  const handleSpeakHint = () => {
    const audio = getAudioManager() as any
    const message = `Desenhe a letra ${currentLetter} com o dedo!`
    
    if (audio.speakAsAlfafa) {
      audio.speakAsAlfafa(message)
    } else {
      getAudioManager().speakPhrase(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{profile?.avatar || '🐘'}</div>
          <div>
            <div className="text-sm font-medium text-purple-700">{profile?.name || 'Alfafa'}</div>
            <div className="text-[10px] text-gray-500 -mt-0.5">Desenhe a Letra</div>
          </div>
        </div>

        <div className="flex gap-4 text-sm font-semibold">
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-2xl">
            ✅ <span>{correctCount}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Quer começar com outro nome?')) {
              useChildProfile.getState().clearProfile()
            }
          }}
          className="text-xl opacity-50 active:opacity-100 px-2"
          title="Trocar perfil"
        >
          ⚙️
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-8">
        
        {/* Instruction */}
        <div className="flex items-center gap-4 mb-5">
          <AlfafaMini mood="happy" />
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-700">
              Desenhe a letra <span className="text-orange-500">{currentLetter}</span>!
            </p>
            <button 
              onClick={handleSpeakHint}
              className="mt-1 text-sm text-purple-600 active:opacity-70"
            >
              🔊 Ouvir o pedido
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative mb-6">
          <div className="bg-white rounded-3xl p-4 shadow-lg border-4 border-purple-200">
            <canvas
              ref={canvasRef}
              className="touch-none rounded-2xl cursor-crosshair bg-white"
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={endDrawing}
              onPointerLeave={endDrawing}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full max-w-[340px]">
          <button
            onClick={clearCanvas}
            className="flex-1 bg-white border-2 border-purple-300 text-purple-700 font-bold py-4 rounded-3xl text-xl active:bg-purple-50"
          >
            Limpar
          </button>
          
          <button
            onClick={handleFinish}
            disabled={!hasDrawn}
            className="flex-1 bg-teal-500 text-white font-bold py-4 rounded-3xl text-xl disabled:bg-gray-300 disabled:text-gray-500 active:bg-teal-600 transition-colors"
          >
            Terminei!
          </button>
        </div>

        {/* Feedback */}
        <div className="h-10 mt-6 text-center">
          {showFeedback && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={lastWasGood 
                ? "text-green-600 font-bold text-2xl" 
                : "text-amber-600 font-semibold text-xl"}
            >
              {lastWasGood ? `Que lindo, ${childName}! ⭐` : `Quase! Vamos tentar a próxima.`}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
