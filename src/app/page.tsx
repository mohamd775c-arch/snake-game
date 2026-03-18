'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// أنواع البيانات
type Position = { x: number; y: number }
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

// إعدادات اللعبة
const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

// أنواع الحلويات مع ألوانها
const CANDY_TYPES = [
  { emoji: '🍬', color: 'bg-pink-500' },
  { emoji: '🍭', color: 'bg-purple-500' },
  { emoji: '🍫', color: 'bg-amber-600' },
  { emoji: '🍩', color: 'bg-orange-400' },
  { emoji: '🧁', color: 'bg-rose-400' },
  { emoji: '🍪', color: 'bg-yellow-600' },
]

export default function SnakeGame() {
  // حالة اللعبة
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [candy, setCandy] = useState<Position & { type: number }>({ x: 15, y: 10, type: 0 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  
  const directionRef = useRef(direction)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  // توليد موقع عشوائي للحلوى
  const generateCandy = useCallback((snakeBody: Position[]): Position & { type: number } => {
    let newCandy: Position & { type: number }
    do {
      newCandy = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        type: Math.floor(Math.random() * CANDY_TYPES.length),
      }
    } while (snakeBody.some(segment => segment.x === newCandy.x && segment.y === newCandy.y))
    return newCandy
  }, [])

  // بدء اللعبة
  const startGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }]
    setSnake(initialSnake)
    setDirection('RIGHT')
    directionRef.current = 'RIGHT'
    setCandy(generateCandy(initialSnake))
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setGameOver(false)
    setIsPlaying(true)
  }, [generateCandy])

  // منطق حركة اللعبة
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] }
      const currentDirection = directionRef.current

      // تحريك الرأس حسب الاتجاه
      switch (currentDirection) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
      }

      // التحقق من الاصطدام بالجدران
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true)
        setIsPlaying(false)
        if (score > highScore) setHighScore(score)
        return prevSnake
      }

      // التحقق من الاصطدام بالجسم
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        setIsPlaying(false)
        if (score > highScore) setHighScore(score)
        return prevSnake
      }

      const newSnake = [head, ...prevSnake]

      // التحقق من أكل الحلوى
      if (head.x === candy.x && head.y === candy.y) {
        setScore(prev => prev + 10)
        setCandy(generateCandy(newSnake))
        // زيادة السرعة كلما زادت النقاط
        setSpeed(prev => Math.max(50, prev - 5))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [candy, generateCandy, score, highScore])

  // حلقة اللعبة
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed)
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      }
    }
  }, [isPlaying, gameOver, moveSnake, speed])

  // التحكم بلوحة المفاتيح
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return

      const key = e.key
      const currentDir = directionRef.current

      if ((key === 'ArrowUp' || key === 'w' || key === 'W') && currentDir !== 'DOWN') {
        setDirection('UP')
        directionRef.current = 'UP'
      } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && currentDir !== 'UP') {
        setDirection('DOWN')
        directionRef.current = 'DOWN'
      } else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && currentDir !== 'RIGHT') {
        setDirection('LEFT')
        directionRef.current = 'LEFT'
      } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && currentDir !== 'LEFT') {
        setDirection('RIGHT')
        directionRef.current = 'RIGHT'
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying])

  // أزرار التحكم للموبايل
  const handleMobileControl = (newDirection: Direction) => {
    if (!isPlaying) return
    const currentDir = directionRef.current

    if (newDirection === 'UP' && currentDir !== 'DOWN') {
      setDirection('UP')
      directionRef.current = 'UP'
    } else if (newDirection === 'DOWN' && currentDir !== 'UP') {
      setDirection('DOWN')
      directionRef.current = 'DOWN'
    } else if (newDirection === 'LEFT' && currentDir !== 'RIGHT') {
      setDirection('LEFT')
      directionRef.current = 'LEFT'
    } else if (newDirection === 'RIGHT' && currentDir !== 'LEFT') {
      setDirection('RIGHT')
      directionRef.current = 'RIGHT'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex flex-col items-center justify-center p-4">
      {/* العنوان */}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
        🐍 لعبة الأفعى
      </h1>

      {/* النقاط */}
      <div className="flex gap-6 mb-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-2 text-white">
          <span className="text-lg">النقاط: </span>
          <span className="text-2xl font-bold text-yellow-300">{score}</span>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-2 text-white">
          <span className="text-lg">الأعلى: </span>
          <span className="text-2xl font-bold text-green-300">{highScore}</span>
        </div>
      </div>

      {/* منطقة اللعبة */}
      <div 
        className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-2xl shadow-2xl border-4 border-green-600"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {/* شبكة خلفية */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: GRID_SIZE }).map((_, row) => (
            <div key={row} className="flex">
              {Array.from({ length: GRID_SIZE }).map((_, col) => (
                <div
                  key={col}
                  className="border border-green-500"
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* الأفعى */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded-sm transition-all duration-75 ${
              index === 0 
                ? 'bg-gradient-to-br from-lime-400 to-green-500 shadow-lg scale-110 z-10' 
                : 'bg-gradient-to-br from-green-400 to-emerald-500'
            }`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              margin: 1,
            }}
          >
            {index === 0 && (
              <div className="w-full h-full flex items-center justify-center text-xs">
                {direction === 'RIGHT' && '👀'}
                {direction === 'LEFT' && '👀'}
                {direction === 'UP' && '👀'}
                {direction === 'DOWN' && '👀'}
              </div>
            )}
          </div>
        ))}

        {/* الحلوى */}
        <div
          className="absolute flex items-center justify-center animate-bounce"
          style={{
            left: candy.x * CELL_SIZE,
            top: candy.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            fontSize: CELL_SIZE - 4,
          }}
        >
          {CANDY_TYPES[candy.type].emoji}
        </div>

        {/* شاشة البداية */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🐍</div>
            <p className="text-white text-xl mb-6">اضغط للبدء</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:from-lime-600 hover:to-green-600 transform hover:scale-105 transition-all"
            >
              🎮 ابدأ اللعب
            </button>
          </div>
        )}

        {/* شاشة الخسارة */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">💥</div>
            <p className="text-red-400 text-2xl font-bold mb-2">خسرت!</p>
            <p className="text-white text-xl mb-4">نقاطك: {score}</p>
            {score === highScore && score > 0 && (
              <p className="text-yellow-400 text-lg mb-4 animate-pulse">🏆 رقم قياسي جديد!</p>
            )}
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:from-lime-600 hover:to-green-600 transform hover:scale-105 transition-all"
            >
              🔄 العب مرة أخرى
            </button>
          </div>
        )}
      </div>

      {/* أزرار التحكم للموبايل */}
      <div className="mt-6 md:hidden">
        <div className="grid grid-cols-3 gap-2 w-40">
          <div></div>
          <button
            onClick={() => handleMobileControl('UP')}
            className="bg-white/30 backdrop-blur-sm text-white text-2xl rounded-xl p-3 active:bg-white/50"
          >
            ⬆️
          </button>
          <div></div>
          <button
            onClick={() => handleMobileControl('LEFT')}
            className="bg-white/30 backdrop-blur-sm text-white text-2xl rounded-xl p-3 active:bg-white/50"
          >
            ⬅️
          </button>
          <div></div>
          <button
            onClick={() => handleMobileControl('RIGHT')}
            className="bg-white/30 backdrop-blur-sm text-white text-2xl rounded-xl p-3 active:bg-white/50"
          >
            ➡️
          </button>
          <div></div>
          <button
            onClick={() => handleMobileControl('DOWN')}
            className="bg-white/30 backdrop-blur-sm text-white text-2xl rounded-xl p-3 active:bg-white/50"
          >
            ⬇️
          </button>
          <div></div>
        </div>
      </div>

      {/* تعليمات */}
      <div className="mt-6 text-white/70 text-center text-sm">
        <p className="hidden md:block">استخدم أسهم لوحة المفاتيح أو WASD للتحكم</p>
        <p className="text-white/50 mt-1">أكل الحلوى 🍬 لزيادة النقاط والحجم!</p>
      </div>
    </div>
  )
}
