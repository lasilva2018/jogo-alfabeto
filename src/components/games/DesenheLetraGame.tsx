import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { AVAILABLE_LETTERS } from '../../data/letters'
import { useChildProfile, getChildVocative, getChildDisplayName, personalizeSpeech } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'
import { GameTopBar } from '../layout/GameTopBar'

export function DesenheLetraGame() {
  const { profile } = useChildProfile()
  const speechName = getChildVocative(profile)
  const displayName = getChildDisplayName(profile)
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

    // Line width age-appropriate: thicker for young (poor motor control), thinner for older (more precision expected)
    // Matches the maskLineWidth in thresholds for consistent "feel" of the guide vs drawing.
    let lineW = 26
    if (age <= 4) lineW = 28
    else if (age === 5) lineW = 22
    else if (age === 6) lineW = 18
    else if (age === 7) lineW = 14
    else lineW = 11 // 8+

    ctx.lineWidth = lineW
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
  }, [currentLetter, age])  // re-setup if age changes (e.g. parent edits profile)

  function drawLetterGuide(ctx: CanvasRenderingContext2D, letter: string, size: number) {
    ctx.save()
    // Larger guide letter so kids have a bigger target to trace (reduces "huge scribble over tiny guide" problem)
    const letterScale = 0.82
    ctx.font = `bold ${size * letterScale}px system-ui, sans-serif`
    ctx.fillStyle = '#e0d4ff' // very faint fill for background guidance
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(letter, size / 2, size / 2 + 10)

    // Dashed tracejado guide for better tracing UX (age-appropriate visibility)
    // Younger kids: slightly more visible dashed; older: clearer trace lines to follow shape
    ctx.strokeStyle = age <= 5 ? '#a78bfa' : '#7c3aed'
    ctx.lineWidth = Math.max(2, age <= 4 ? 4 : 3)
    ctx.setLineDash([12, 8]) // dashed pattern for "trace me"
    ctx.strokeText(letter, size / 2, size / 2 + 10)
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
    // === Validação de desenho por idade (refatorada com consultoria de especialistas) ===
    // - Especialista CV: diagnosticou safety-net frouxa, overlap muito baixo (14-22%), minInk baixo,
    //   máscara com fill excessivo, granularidade ruim para 6-8, bbox só de pontos, sem esforço (path).
    // - Especialista desenvolvimento infantil/pedagogia: validou direção progressiva; <=4 deve ser
    //   muito leniente (qualquer rabisco intencional ok para encorajamento); 7-8+ em dedo+tablet
    //   deve exigir esforço + cobertura razoável da forma, mas muita imperfeição é normal.
    //   Recomendou pathLength + coverage + stroke-only mask + lineWidth dinâmico.
    //   Fortemente contra remover o jogo (alto valor motor).
    // Mantemos espírito de diversão + aprendizado. Thresholds calibrados de forma conservadora.
    // Para debug/tuning futuro: adicione logs temporários dos valores abaixo (userInk, ratios, pathLength).
    if (!ctx || !canvas) return false;

    // === AGE-BASED PROGRESSIVE VALIDATION (synthesized from child-dev + CV specialists) ===
    // Goal: encouragement for young (any intentional scribble), but require visible effort + resemblance for older kids.
    // Finger-on-tablet is inherently imprecise vs pencil/paper, so remain realistic and forgiving even at 8.

    // Minimal effort check for everyone (prevents "one tap and done")
    if (points.length < 6) return false;

    // For 3-4 years: THE EASIEST POSSIBLE - pure encouragement.
    // Any visible intentional drawing (enough points/ink) is success. No shape matching.
    // Per specialists: still require *some* visible effort so it feels like "I drew".
    if (childAge <= 4) {
      // Quick cheap ink estimate for young kids (re-use later logic if needed, but simple here)
      // Accept as long as they moved the finger a bit.
      return points.length >= 10; // minimal movement
    }

    // Compute path length (effort / continuous stroke) - key metric recommended by both specialists
    let pathLength = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      pathLength += Math.hypot(dx, dy);
    }

    // Quick bbox on points (for early reject)
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    let drawnWidth = maxX - minX;
    let drawnHeight = maxY - minY;
    let cx = (minX + maxX) / 2;
    let cy = (minY + maxY) / 2;
    const canvasCx = size / 2;
    const canvasCy = size / 2;

    // Get age-specific thresholds (progressive, calibrated conservatively per child dev input)
    function getDrawingThresholds(age: number) {
      if (age === 5) {
        return {
          minSpan: 0.24, maxCenterOffset: 0.27, tolerance: 22, minInk: 380,
          mainOverlap: 0.18, minCoverage: 0.10,
          safetySpan: 0.32, safetyCenter: 0.23, safetyInk: 480, safetyOverlap: 0.12, safetyCoverage: 0.08,
          useFillMask: true, maskLineWidth: 22,
          minPath: 220,
          maxRelativeSize: 3.0
        };
      } else if (age === 6) {
        return {
          minSpan: 0.28, maxCenterOffset: 0.18, tolerance: 14, minInk: 620,
          mainOverlap: 0.26, minCoverage: 0.16,
          safetySpan: 0.34, safetyCenter: 0.15, safetyInk: 780, safetyOverlap: 0.18, safetyCoverage: 0.11,
          useFillMask: true, maskLineWidth: 18,
          minPath: 380,
          maxRelativeSize: 2.5
        };
      } else if (age === 7) {
        return {
          minSpan: 0.33, maxCenterOffset: 0.13, tolerance: 6, minInk: 920,
          mainOverlap: 0.38, minCoverage: 0.27,
          safetySpan: 0.38, safetyCenter: 0.10, safetyInk: 1100, safetyOverlap: 0.24, safetyCoverage: 0.16,
          useFillMask: false, maskLineWidth: 12,
          minPath: 580,
          maxRelativeSize: 1.8
        };
      } else {
        // 8+ : expect more control (per child development advice). Finger on tablet is imprecise,
        // but a random huge V (or any wrong shape) must NOT pass as the target letter (J/D etc).
        // Key defenses: correct mask scale (0.82), relative size vs REAL mask bbox, center vs mask center,
        // NO safety net bypass, higher mainOverlap+coverage, narrower tolerance band, more path effort.
        return {
          minSpan: 0.40, maxCenterOffset: 0.09, tolerance: 3, minInk: 1300,
          mainOverlap: 0.52, minCoverage: 0.38,
          safetySpan: 0.45, safetyCenter: 0.07, safetyInk: 1600, safetyOverlap: 0.42, safetyCoverage: 0.30,
          useFillMask: false, maskLineWidth: 9,
          minPath: 880,
          maxRelativeSize: 1.35
        };
      }
    }

    const t = getDrawingThresholds(childAge);

    // Path effort check (prevents tiny random marks)
    if (pathLength < t.minPath) return false;

    // Build age-appropriate tolerance mask (stroke-only for older = teaches real formation)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = size;
    maskCanvas.height = size;
    const maskCtx = maskCanvas.getContext('2d', { alpha: true });
    if (!maskCtx) return false;

    maskCtx.fillStyle = 'black';
    maskCtx.strokeStyle = 'black';
    // MUST match EXACTLY the visual guide scale in drawLetterGuide (0.82) so that
    // maskW/H and relative size/center checks are accurate against what the child actually sees.
    // Mismatch was allowing giant scribbles (e.g. V enorme sobre guia pequeno de J/D) a passarem.
    const letterScale = 0.82;
    maskCtx.font = `bold ${size * letterScale}px system-ui, sans-serif`;
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';
    maskCtx.lineWidth = t.maskLineWidth;

    maskCtx.strokeText(letter, size / 2, size / 2 + 10);
    if (t.useFillMask) {
      maskCtx.fillText(letter, size / 2, size / 2 + 10);
    }

    for (let dx = -t.tolerance; dx <= t.tolerance; dx += 2) {
      for (let dy = -t.tolerance; dy <= t.tolerance; dy += 2) {
        maskCtx.strokeText(letter, size / 2 + dx, size / 2 + 10 + dy);
        if (t.useFillMask) {
          maskCtx.fillText(letter, size / 2 + dx, size / 2 + 10 + dy);
        }
      }
    }

    const maskData = maskCtx.getImageData(0, 0, size, size).data;
    const userData = ctx.getImageData(0, 0, size, size).data;

    let userInk = 0;
    let overlapInk = 0;
    let maskInk = 0;

    // Better ink bbox (pixels, not just path points) for more accurate span/center
    let inkMinX = size, inkMaxX = 0, inkMinY = size, inkMaxY = 0;

    for (let i = 0; i < maskData.length; i += 4) {
      if (maskData[i + 3] > 50) maskInk++;
    }

    // Tighter purple detection (better for the actual stroke color + anti-alias)
    for (let i = 0; i < userData.length; i += 4) {
      const r = userData[i];
      const g = userData[i + 1];
      const b = userData[i + 2];
      const a = userData[i + 3];

      const isUserPurple = a > 100 && b > 170 && r > 60 && r < 180 && g < 120;
      if (isUserPurple) {
        userInk++;
        const x = (i / 4) % size;
        const y = Math.floor((i / 4) / size);
        if (x < inkMinX) inkMinX = x;
        if (x > inkMaxX) inkMaxX = x;
        if (y < inkMinY) inkMinY = y;
        if (y > inkMaxY) inkMaxY = y;

        const ma = maskData[i + 3];
        if (ma > 50) overlapInk++;
      }
    }

    const overlapRatio = overlapInk / Math.max(userInk, 1);
    const coverageRatio = overlapInk / Math.max(maskInk, 1);

    // Use pixel ink bbox when we have real ink (more faithful to visual drawing)
    let effWidth = drawnWidth, effHeight = drawnHeight, effCx = cx, effCy = cy;
    if (inkMaxX > inkMinX && userInk > 20) {
      effWidth = inkMaxX - inkMinX;
      effHeight = inkMaxY - inkMinY;
      effCx = (inkMinX + inkMaxX) / 2;
      effCy = (inkMinY + inkMaxY) / 2;
    }
    const effCenterDist = Math.hypot(effCx - canvasCx, effCy - canvasCy);

    // === NEW: Compute actual mask (letter guide) bbox for size/position matching ===
    // This is critical to reject oversized scribbles (like a huge V over a small D guide)
    // that only "graze" the target with a thick stroke.
    let maskMinX = size, maskMaxX = 0, maskMinY = size, maskMaxY = 0;
    for (let i = 0; i < maskData.length; i += 4) {
      if (maskData[i + 3] > 50) {
        const x = (i / 4) % size;
        const y = Math.floor((i / 4) / size);
        if (x < maskMinX) maskMinX = x;
        if (x > maskMaxX) maskMaxX = x;
        if (y < maskMinY) maskMinY = y;
        if (y > maskMaxY) maskMaxY = y;
      }
    }
    const maskW = Math.max(1, maskMaxX - maskMinX);
    const maskH = Math.max(1, maskMaxY - maskMinY);
    const maskCx = (maskMinX + maskMaxX) / 2;
    const maskCy = (maskMinY + maskMaxY) / 2;

    // For 6+, require the user's drawing to be roughly the same *size* as the guide letter (not 3-5x larger)
    // and centered on it. This directly kills cases like huge V "covering" a tiny D.
    if (childAge >= 6) {
      const relW = effWidth / Math.max(1, maskW);
      const relH = effHeight / Math.max(1, maskH);
      const centerDiff = Math.hypot(effCx - maskCx, effCy - maskCy);
      const maxCenterDiff = Math.max(maskW, maskH) * 0.40;
      if (effWidth > maskW * t.maxRelativeSize || effHeight > maskH * t.maxRelativeSize) {
        if (childAge >= 6) {
          console.log('[DesenheLetra REJECT oversized]', { age: childAge, letter, relW: relW.toFixed(2), relH: relH.toFixed(2), maxRel: t.maxRelativeSize, effW: Math.round(effWidth), maskW: Math.round(maskW) });
        }
        return false; // oversized scribble over the small guide
      }
      if (effWidth < maskW * 0.35 || effHeight < maskH * 0.35) {
        return false;
      }
      if (centerDiff > maxCenterDiff) {
        if (childAge >= 6) {
          console.log('[DesenheLetra REJECT off-center]', { age: childAge, letter, centerDiff: Math.round(centerDiff), maxCenterDiff: Math.round(maxCenterDiff), effCx: Math.round(effCx), maskCx: Math.round(maskCx) });
        }
        return false; // drawing center too far from the actual letter guide center
      }
    }

    // BBox reject (canvas relative, use effective when available)
    if (effWidth < size * t.minSpan || effHeight < size * t.minSpan || effCenterDist > size * t.maxCenterOffset) {
      return false;
    }

    // Safety net ONLY for younger kids (easy large central attempt that shows intent).
    // For 7+ (and especially 8+) we do NOT want to reward a random large scribble even if centered.
    // This was one cause of "V gigante sobre J pequeno" sendo aceito.
    const isLargeAndCentered = (effWidth > size * t.safetySpan) && (effHeight > size * t.safetySpan) && (effCenterDist < size * t.safetyCenter);
    const hasSubstantialInk = userInk > t.safetyInk;

    if (childAge <= 6 && isLargeAndCentered && hasSubstantialInk && overlapRatio > t.safetyOverlap && coverageRatio > t.safetyCoverage) {
      return true;
    }

    if (userInk < t.minInk) return false;

    // Final: both precision (most of your ink is on the letter) AND coverage (you hit a good portion of the letter)
    const passesPrecision = overlapRatio > t.mainOverlap;
    const passesCoverage = coverageRatio > t.minCoverage;

    // Always log key metrics for 6+ during real kid tests (open console to see why accepted/rejected).
    // Critical for tuning against actual drawings (e.g. giant wrong-shape scribbles).
    // To force-disable: set window.__DISABLE_DRAW_DEBUG__ = true before drawing.
    if (childAge >= 6 && !(typeof window !== 'undefined' && (window as any).__DISABLE_DRAW_DEBUG__)) {
      const relW = (effWidth / Math.max(1, maskW)).toFixed(2);
      const relH = (effHeight / Math.max(1, maskH)).toFixed(2);
      const centerToMask = Math.hypot(effCx - maskCx, effCy - maskCy);
      const finalDecision = (childAge >= 7) ? (passesPrecision && passesCoverage) : (passesPrecision && passesCoverage);
      console.log('[DesenheLetra metrics 6+]', {
        age: childAge, letter,
        userInk, overlapRatio: overlapRatio.toFixed(2), coverageRatio: coverageRatio.toFixed(2),
        pathLength: Math.round(pathLength),
        effW: Math.round(effWidth), effH: Math.round(effHeight),
        maskW: Math.round(maskW), maskH: Math.round(maskH),
        relSize: `w${relW}/h${relH}`, centerToMask: Math.round(centerToMask),
        passesPrecision, passesCoverage,
        finalDecision, safetyWouldHave: (childAge <=6),
        t: { mainOverlap: t.mainOverlap, minCoverage: t.minCoverage, maxRel: t.maxRelativeSize, minPath: t.minPath, tol: t.tolerance, lw: t.maskLineWidth }
      });
    }

    if (childAge >= 7) {
      // Stricter for older: require both, minimal safety
      return passesPrecision && passesCoverage;
    }

    return passesPrecision && passesCoverage;
  }

  function startDrawing(e: React.PointerEvent) {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    if (showFeedback) return // prevent drawing over finished result; use "Tente de novo"

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
    if (!isDrawing || showFeedback) return
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

  // Explicit "Tente de novo" UX: reset drawing for the SAME letter (practice more without penalty)
  function retryLetter() {
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

    if (isGood) {
      await getAudioManager().playSuccess()
    } else {
      await getAudioManager().playMistake()
    }

    const message = isGood
      ? personalizeSpeech(
          `Muito bem, {name}! Você desenhou a letra ${currentLetter} lindamente!`,
          `Muito bem! Você desenhou a letra ${currentLetter} lindamente!`,
          speechName
        )
      : personalizeSpeech(
          `Quase, {name}! Tente desenhar mais parecido com a letra ${currentLetter}.`,
          `Quase! Tente desenhar mais parecido com a letra ${currentLetter}.`,
          speechName
        )

    // Voz principal feminina (Alice) para feedbacks de desenho
    getAudioManager().speakPhrase(message)

    // No more auto-advance: explicit buttons below for "Tente de novo" or "Próxima"
    // This gives control and allows practicing the same letter when not perfect.
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
    const message = `Desenhe a letra ${currentLetter} com o dedo!`
    // Voz principal feminina
    getAudioManager().speakPhrase(message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      <GameTopBar title="Desenhe a Letra" score={{ correct: correctCount }} />

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
              className={`touch-none rounded-2xl bg-white ${showFeedback ? 'cursor-not-allowed opacity-90' : 'cursor-crosshair'}`}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={endDrawing}
              onPointerLeave={endDrawing}
            />
          </div>
        </div>

        {/* Action Buttons - change based on whether finished or not */}
        {!showFeedback ? (
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
        ) : (
          <div className="flex gap-4 w-full max-w-[340px]">
            <button
              onClick={retryLetter}
              className="flex-1 bg-white border-2 border-purple-300 text-purple-700 font-bold py-4 rounded-3xl text-xl active:bg-purple-50"
            >
              Tente de novo
            </button>
            
            <button
              onClick={nextLetter}
              className="flex-1 bg-teal-500 text-white font-bold py-4 rounded-3xl text-xl active:bg-teal-600 transition-colors"
            >
              Próxima letra
            </button>
          </div>
        )}

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
              {lastWasGood ? `Que lindo, ${displayName}! ⭐` : `Quase! Tente de novo ou vá para a próxima.`}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
