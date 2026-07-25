import type { MathProblem, MathOperation, KidName } from '../types'

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateMathProblem(kid: KidName, difficulty: number): MathProblem {
  if (kid === 'Alex') {
    return generateAlexProblem(difficulty)
  }
  return generateMayaProblem(difficulty)
}

function generateAlexProblem(difficulty: number): MathProblem {
  const ops: MathOperation[] = difficulty <= 1 ? ['addition'] : difficulty <= 2 ? ['addition', 'subtraction'] : ['addition', 'subtraction']
  const op = ops[rand(0, ops.length - 1)]
  const id = `math-${Date.now()}-${rand(1000, 9999)}`

  if (op === 'addition') {
    const max = difficulty <= 1 ? 10 : 20
    const a = rand(1, max - 1)
    const b = rand(1, max - a)
    const ans = a + b
    return {
      id,
      question: `${a} + ${b} = ?`,
      answer: ans,
      operation: 'addition',
      choices: shuffle([ans, ans + rand(1, 3), ans - rand(1, 3), ans + rand(3, 5)]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
    }
  } else {
    const a = rand(2, 20)
    const b = rand(1, a - 1)
    const ans = a - b
    return {
      id,
      question: `${a} - ${b} = ?`,
      answer: ans,
      operation: 'subtraction',
      choices: shuffle([ans, ans + rand(1, 3), ans - rand(1, 3), ans + rand(3, 5)]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
    }
  }
}

function generateMayaProblem(difficulty: number): MathProblem {
  const ops: MathOperation[] =
    difficulty <= 1
      ? ['multiplication']
      : difficulty <= 2
      ? ['multiplication', 'division']
      : difficulty <= 3
      ? ['multiplication', 'division', 'fractions']
      : ['multiplication', 'division', 'fractions', 'decimals']
  const op = ops[rand(0, ops.length - 1)]
  const id = `math-${Date.now()}-${rand(1000, 9999)}`

  if (op === 'multiplication') {
    const a = rand(2, 12)
    const b = rand(2, 12)
    const ans = a * b
    return {
      id,
      question: `${a} × ${b} = ?`,
      answer: ans,
      operation: 'multiplication',
      choices: shuffle([ans, ans + rand(1, 5), ans - rand(1, 5), ans + rand(6, 10)]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
    }
  }

  if (op === 'division') {
    const b = rand(2, 12)
    const ans = rand(2, 12)
    const a = b * ans
    return {
      id,
      question: `${a} ÷ ${b} = ?`,
      answer: ans,
      operation: 'division',
      choices: shuffle([ans, ans + rand(1, 3), ans - rand(1, 3), ans + rand(3, 5)]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
    }
  }

  if (op === 'fractions') {
    const a = rand(1, 5)
    const b = rand(2, 5)
    const c = rand(1, 5)
    const d = rand(2, 5)
    const num = a * d + c * b
    const den = b * d
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y))
    const g = gcd(num, den)
    const simplified = `${num / g}/${den / g}`
    return {
      id,
      question: `${a}/${b} + ${c}/${d} = ?`,
      answer: simplified,
      operation: 'fractions',
      choices: shuffle([simplified, `${num}/${den}`, `${a + c}/${b + d}`, `${(a + c) / 2}/${(b + d) / 2}`]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
    }
  }

  // decimals
  const a = rand(10, 99) / 10
  const b = rand(10, 99) / 10
  const ans = +(a + b).toFixed(1)
  return {
    id,
    question: `${a} + ${b} = ?`,
    answer: ans,
    operation: 'decimals',
    choices: shuffle([ans, +(ans + 0.5).toFixed(1), +(ans - 0.5).toFixed(1), +(ans + 1).toFixed(1)]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
  }
}
