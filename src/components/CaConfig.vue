<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  width: number
  ruleset: number
  initialInteger: number // This will drive the initial state
  sequenceLength: number
}>()

const emit = defineEmits<{
  (e: 'update:width', value: number): void
  (e: 'update:ruleset', value: number): void
  (e: 'update:initialInteger', value: number): void
  (e: 'update:sequenceLength', value: number): void
  (e: 'reset-ca'): void
  (e: 'randomize-initial-state'): void
}>()

// Internal refs for form inputs
const internalWidth = ref(props.width)
const internalRuleset = ref(props.ruleset)
const internalInitialInteger = ref(props.initialInteger)
const internalSequenceLength = ref(props.sequenceLength)

// Watch for prop changes to update internal refs (useful if parent changes props)
watch(
  () => props.width,
  (newVal) => (internalWidth.value = newVal),
)
watch(
  () => props.ruleset,
  (newVal) => (internalRuleset.value = newVal),
)
watch(
  () => props.initialInteger,
  (newVal) => (internalInitialInteger.value = newVal),
)
watch(
  () => props.sequenceLength,
  (newVal) => (internalSequenceLength.value = newVal),
)

// Computed property to derive binary representation for toggles
const initialBinaryState = computed<boolean[]>(() => {
  const binaryArray = new Array(internalWidth.value).fill(false)
  for (let i = 0; i < internalWidth.value; i++) {
    // For little-endian, the leftmost bit (index 0) represents 2^0,
    // so we check the bit at position 'i' directly.
    if ((internalInitialInteger.value >> i) & 1) {
      binaryArray[i] = true
    }
  }
  return binaryArray
})

// Update initial integer when toggles change
const toggleBit = (index: number) => {
  let newInteger = internalInitialInteger.value
  // For little-endian, `index` directly corresponds to the bit position
  if (initialBinaryState.value[index]) {
    // Bit is currently 1, set to 0
    newInteger &= ~(1 << index)
  } else {
    // Bit is currently 0, set to 1
    newInteger |= 1 << index
  }
  internalInitialInteger.value = newInteger
  emit('update:initialInteger', newInteger)
}

// Emit updates to parent
const updateWidth = () => {
  // Ensure integer doesn't exceed new width's max value
  const maxIntForWidth = Math.pow(2, internalWidth.value) - 1
  if (internalInitialInteger.value > maxIntForWidth) {
    internalInitialInteger.value = maxIntForWidth
    emit('update:initialInteger', maxIntForWidth)
  }
  emit('update:width', internalWidth.value)
}
const updateRuleset = () => emit('update:ruleset', internalRuleset.value)
const updateInitialInteger = () => {
  // Clamp integer to max value for current width
  const maxIntForWidth = Math.pow(2, internalWidth.value) - 1
  internalInitialInteger.value = Math.min(Math.max(0, internalInitialInteger.value), maxIntForWidth)
  emit('update:initialInteger', internalInitialInteger.value)
}
const updateSequenceLength = () => emit('update:sequenceLength', internalSequenceLength.value)
</script>

<template>
  <div class="config-panel">
    <h3>Configuration</h3>

    <div class="input-group">
      <label for="width">Width (Cells/Bits): {{ internalWidth }}</label>
      <input
        type="range"
        id="width"
        v-model.number="internalWidth"
        min="4"
        max="16"
        step="1"
        @change="updateWidth"
      />
    </div>

    <div class="input-group">
      <label for="ruleset">Wolfram Ruleset (0-255):</label>
      <input
        type="number"
        id="ruleset"
        v-model.number="internalRuleset"
        min="0"
        max="255"
        @input="updateRuleset"
      />
      <div class="rule-hint">
        (e.g., 30, 90, 110. See
        <a href="https://en.wikipedia.org/wiki/Wolfram%27s_256_cellular_automata" target="_blank"
          >Wikipedia</a
        >
        for details.)
      </div>
    </div>

    <div class="input-group">
      <label>Initial State (Binary):</label>
      <div class="initial-binary-toggles">
        <div
          v-for="(bit, index) in initialBinaryState"
          :key="index"
          class="bit-toggle"
          :class="{ active: bit }"
          @click="toggleBit(index)"
        >
          {{ bit ? 1 : 0 }}
        </div>
      </div>
      <button @click="emit('randomize-initial-state')">Randomize</button>
    </div>

    <div class="input-group">
      <label for="initial-integer">Initial State (Decimal):</label>
      <input
        type="number"
        id="initial-integer"
        v-model.number="internalInitialInteger"
        :min="0"
        :max="Math.pow(2, internalWidth) - 1"
        @input="updateInitialInteger"
      />
    </div>

    <div class="input-group">
      <label for="sequence-length">Sequence Length:</label>
      <input
        type="number"
        id="sequence-length"
        v-model.number="internalSequenceLength"
        min="1"
        max="200"
        @input="updateSequenceLength"
      />
    </div>

    <button class="reset-button" @click="emit('reset-ca')">Reset Automaton</button>
  </div>
</template>

<style scoped>
.config-panel {
  background-color: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 1.5rem;
  color: #e0e0e0;
}

h3 {
  color: #4caf50; /* Green accent */
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.input-group input[type='range'] {
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  background: #555;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
  border-radius: 4px;
}

.input-group input[type='range']:hover {
  opacity: 1;
}

.input-group input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4caf50;
  cursor: grab;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.input-group input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4caf50;
  cursor: grab;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.input-group input[type='number'] {
  width: calc(100% - 16px);
  padding: 0.5rem 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #333;
  color: #e0e0e0;
}

.rule-hint {
  font-size: 0.85em;
  color: #aaa;
  margin-top: 0.5rem;
}

.rule-hint a {
  color: #4caf50;
  text-decoration: none;
}

.rule-hint a:hover {
  text-decoration: underline;
}

.initial-binary-toggles {
  display: flex;
  gap: 4px;
  margin-bottom: 0.75rem;
  overflow-x: auto; /* Allow scrolling for wide automata */
  padding-bottom: 5px; /* Space for scrollbar */
}

.bit-toggle {
  width: 28px;
  height: 28px;
  border: 1px solid #555;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  background-color: #444;
  transition:
    background-color 0.2s,
    border-color 0.2s;
  flex-shrink: 0; /* Prevent shrinking when many bits */
}

.bit-toggle.active {
  background-color: #4caf50; /* Green for active */
  border-color: #4caf50;
  color: #2a2a2a;
}

.bit-toggle:hover {
  border-color: #888;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  margin-top: 1rem;
  width: 100%;
}

button:hover {
  background-color: #45a049;
}

.reset-button {
  background-color: #f44336; /* Red for reset */
  margin-top: 2rem;
}

.reset-button:hover {
  background-color: #d32f2f;
}
</style>
