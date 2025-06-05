<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import CaConfig from './components/CaConfig.vue'
import CaVisualizer from './components/CaVisualizer.vue'

// --- Reactive State for the CA ---
const caWidth = ref(8) // Default 8 bits/cells
const caRuleset = ref(30) // Default Rule 30
const caInitialInteger = ref(Math.pow(2, caWidth.value - 1)) // Default middle bit active
const caSequenceLength = ref(50) // Default sequence length

const currentCaCells = ref<number[]>([]) // Current binary state of the automaton (as plain array for Vue reactivity)
const currentCaInteger = ref(0) // Current integer value of the automaton
const generatedIntegers = ref<number[]>([]) // Array of all generated integers
const generatedStates = ref<number[][]>([]) // History of binary states for visualization

// --- Web Worker Setup ---
let caWorker: Worker | null = null

// Helper to convert plain number[] to Uint8Array for worker communication
function toUint8Array(arr: number[]): Uint8Array {
  return new Uint8Array(arr)
}

function convertIntegerToBinaryArray(integer: number, width: number): number[] {
  const arr = new Array(width).fill(0)
  // Populate from left to right. Leftmost cell (index 0) gets LSB.
  for (let i = 0; i < width; i++) {
    arr[i] = (integer >> i) & 1 // Check bit at position 'i'
  }
  return arr
}

onMounted(() => {
  const workerPath = import.meta.env.PROD
    ? '/ca.worker.js'
    : new URL('./worker/ca.worker.ts', import.meta.url).href

  caWorker = new Worker(workerPath, { type: 'module' })

  caWorker.onmessage = (event) => {
    switch (event.data.type) {
      case 'initialized':
        currentCaCells.value = event.data.currentCells
        currentCaInteger.value = event.data.currentInteger
        generatedIntegers.value = [event.data.currentInteger]
        generatedStates.value = [event.data.currentCells]
        break
      case 'stepped':
        currentCaCells.value = event.data.nextCells
        currentCaInteger.value = event.data.nextInteger
        generatedIntegers.value.push(event.data.nextInteger)
        generatedStates.value.push(event.data.nextCells)
        break
      case 'generated':
        generatedIntegers.value = event.data.generatedIntegers
        generatedStates.value = event.data.generatedStates
        if (event.data.generatedStates.length > 0) {
          currentCaCells.value = event.data.generatedStates[event.data.generatedStates.length - 1]
          currentCaInteger.value =
            event.data.generatedIntegers[event.data.generatedIntegers.length - 1]
        }
        break
      default:
        console.warn('Unknown message type from worker:', event.data.type)
    }
  }

  caWorker.onerror = (error) => {
    console.error('Web Worker error:', error)
  }

  initializeCaWorker()
})

onUnmounted(() => {
  if (caWorker) {
    caWorker.terminate()
    caWorker = null
  }
})

// --- CA Control Functions ---

function initializeCaWorker() {
  if (caWorker) {
    const initialCells = convertIntegerToBinaryArray(caInitialInteger.value, caWidth.value)
    caWorker.postMessage({
      type: 'init',
      width: caWidth.value,
      ruleset: caRuleset.value,
      initialState: toUint8Array(initialCells), // Send as Uint8Array
    })
  }
}

function randomizeInitialState() {
  const maxIntForWidth = Math.pow(2, caWidth.value) - 1
  const randomInt = Math.floor(Math.random() * (maxIntForWidth + 1))
  caInitialInteger.value = randomInt
  // watch on caInitialInteger will trigger resetCa()
}

function resetCa() {
  initializeCaWorker()
}

function stepCa() {
  if (caWorker) {
    if (generatedIntegers.value.length >= caSequenceLength.value) {
      alert(
        `Sequence has reached the specified length (${caSequenceLength.value}). Please clear or regenerate.`,
      )
      return
    }
    caWorker.postMessage({
      type: 'step',
      currentCells: toUint8Array(currentCaCells.value), // Send as Uint8Array
      width: caWidth.value,
      ruleset: caRuleset.value,
    })
  }
}

function generateSequence() {
  if (caWorker) {
    const initialCells = convertIntegerToBinaryArray(caInitialInteger.value, caWidth.value)
    caWorker.postMessage({
      type: 'generate',
      initialCells: toUint8Array(initialCells), // Send as Uint8Array
      width: caWidth.value,
      ruleset: caRuleset.value,
      sequenceLength: caSequenceLength.value,
    })
  }
}

function clearSequence() {
  generatedIntegers.value = []
  generatedStates.value = []
  initializeCaWorker()
}

watch([caWidth, caRuleset, caInitialInteger], () => {
  resetCa()
})
</script>

<template>
  <div id="app">
    <header>
      <h1>Cellular Automata Music Sequence Generator</h1>
      <p>
        Generate integer sequences for musical interpretation based on Wolfram's 1D Cellular
        Automata.
      </p>
    </header>

    <main>
      <CaConfig
        v-model:width="caWidth"
        v-model:ruleset="caRuleset"
        v-model:initialInteger="caInitialInteger"
        v-model:sequenceLength="caSequenceLength"
        @reset-ca="resetCa"
        @randomize-initial-state="randomizeInitialState"
      />

      <div class="controls">
        <button @click="stepCa">
          Step ({{ generatedIntegers.length }} / {{ caSequenceLength }})
        </button>
        <button @click="generateSequence">Generate Full Sequence</button>
        <button @click="clearSequence" class="clear-button">Clear</button>
      </div>

      <div class="current-state-display">
        <h3>Current Automaton State:</h3>
        <div class="binary-display">
          <span
            v-for="(bit, index) in currentCaCells"
            :key="index"
            :class="{ active: bit === 1 }"
            class="current-bit"
          >
            {{ bit }}
          </span>
        </div>
        <div class="integer-display">
          Decimal: <strong>{{ currentCaInteger }}</strong>
        </div>
      </div>

      <CaVisualizer
        :generatedStates="generatedStates"
        :generatedIntegers="generatedIntegers"
        :width="caWidth"
      />
    </main>

    <footer>
      <p>&copy; 2025 Cellular Automata Music Generator. All rights reserved.</p>
    </footer>
  </div>
</template>

<style>
/* Global Styles (App.vue or src/assets/main.css) */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #1a1a1a;
  color: #e0e0e0;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  text-align: center;
  padding: 2rem 0;
  border-bottom: 1px solid #333;
  margin-bottom: 2rem;
}

header h1 {
  color: #4caf50;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

header p {
  color: #aaa;
  font-size: 1.1rem;
}

main {
  flex-grow: 1;
}

.controls {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  margin-bottom: 2rem;
}

.controls button {
  flex-grow: 1;
  background-color: #2196f3;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.2s;
}

.controls button:hover {
  background-color: #1976d2;
}

.controls button.clear-button {
  background-color: #f44336;
}

.controls button.clear-button:hover {
  background-color: #d32f2f;
}

.current-state-display {
  background-color: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  text-align: center;
}

.current-state-display h3 {
  color: #4caf50;
  margin-top: 0;
  margin-bottom: 1rem;
}

.current-state-display .binary-display {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 1rem;
}

.current-state-display .current-bit {
  width: 30px;
  height: 30px;
  border: 1px solid #555;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background-color: #444;
  color: #e0e0e0;
  font-size: 1.1rem;
}

.current-state-display .current-bit.active {
  background-color: #4caf50;
  border-color: #4caf50;
  color: #2a2a2a;
}

.current-state-display .integer-display {
  font-size: 1.2rem;
  color: #e0e0e0;
}

footer {
  text-align: center;
  padding: 1.5rem 0;
  margin-top: 2rem;
  border-top: 1px solid #333;
  color: #aaa;
  font-size: 0.9rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  #app {
    padding: 1rem;
  }

  header h1 {
    font-size: 2rem;
  }

  header p {
    font-size: 1rem;
  }

  .controls {
    flex-direction: column;
  }

  .controls button {
    width: 100%;
  }

  .current-state-display .binary-display {
    flex-wrap: wrap; /* Allow bits to wrap if too many */
  }

  .current-state-display .current-bit {
    width: 25px;
    height: 25px;
    font-size: 1rem;
  }

  .visualizer-panel .grid-container {
    max-height: 300px; /* Adjust height for smaller screens */
  }
}
</style>
