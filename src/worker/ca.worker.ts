// src/worker/ca.worker.ts

// Define message types for communication
interface InitMessage {
  type: 'init'
  width: number
  ruleset: number
  initialState: Uint8Array // <--- Changed to Uint8Array
}

interface StepMessage {
  type: 'step'
  currentCells: Uint8Array // <--- Changed to Uint8Array
  width: number
  ruleset: number
}

interface GenerateMessage {
  type: 'generate'
  initialCells: Uint8Array // <--- Changed to Uint8Array
  width: number
  ruleset: number
  sequenceLength: number
}

// Helper functions for CA logic
function getNeighborhoodValue(cells: Uint8Array, index: number, width: number): number {
  const left = index === 0 ? 0 : cells[index - 1]
  const self = cells[index]
  const right = index === width - 1 ? 0 : cells[index + 1]

  return (left << 2) | (self << 1) | right
}

function calculateNextState(currentCells: Uint8Array, width: number, ruleset: number): Uint8Array {
  const nextCells = new Uint8Array(width)
  for (let i = 0; i < width; i++) {
    const neighborhoodValue = getNeighborhoodValue(currentCells, i, width)
    const nextCellState = (ruleset >> neighborhoodValue) & 1
    nextCells[i] = nextCellState
  }
  return nextCells
}

// --- MODIFIED: binaryArrayToInteger for Little-Endian ---
function binaryArrayToInteger(arr: Uint8Array): number {
  let integer = 0
  // Iterate from left to right. Leftmost bit (index 0) becomes LSB (2^0)
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 1) {
      integer |= 1 << i // Shift by current index 'i' for LSB first
    }
  }
  return integer
}

// --- MODIFIED: integerToBinaryArray for Little-Endian ---
function integerToBinaryArray(integer: number, width: number): Uint8Array {
  const arr = new Uint8Array(width)
  // Populate from left to right. Leftmost cell (index 0) gets LSB.
  for (let i = 0; i < width; i++) {
    arr[i] = (integer >> i) & 1 // Check bit at position 'i'
  }
  return arr
}

// (Worker message listener remains the same, as it calls these helpers)
self.onmessage = (event: MessageEvent<InitMessage | StepMessage | GenerateMessage>) => {
  const { type } = event.data

  if (type === 'init') {
    const { width, ruleset, initialState } = event.data
    const initialInteger = binaryArrayToInteger(initialState)
    self.postMessage({
      type: 'initialized',
      currentCells: Array.from(initialState),
      currentInteger: initialInteger,
    })
  } else if (type === 'step') {
    const { currentCells, width, ruleset } = event.data
    const nextCells = calculateNextState(currentCells, width, ruleset)
    const nextInteger = binaryArrayToInteger(nextCells)
    self.postMessage({
      type: 'stepped',
      nextCells: Array.from(nextCells),
      nextInteger: nextInteger,
    })
  } else if (type === 'generate') {
    const { initialCells, width, ruleset, sequenceLength } = event.data
    let currentCells = initialCells

    const generatedIntegers: number[] = []
    const generatedStates: number[][] = []

    generatedStates.push(Array.from(currentCells))
    generatedIntegers.push(binaryArrayToInteger(currentCells))

    for (let i = 0; i < sequenceLength - 1; i++) {
      currentCells = calculateNextState(currentCells, width, ruleset)
      generatedStates.push(Array.from(currentCells))
      generatedIntegers.push(binaryArrayToInteger(currentCells))
    }

    self.postMessage({
      type: 'generated',
      generatedIntegers: generatedIntegers,
      generatedStates: generatedStates,
    })
  }
}
