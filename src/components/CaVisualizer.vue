<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  generatedStates: number[][] // Array of binary arrays (rows of cells)
  generatedIntegers: number[] // Array of corresponding integers
  width: number
}>()

const copySequence = () => {
  const sequenceText = props.generatedIntegers.join(' ')
  navigator.clipboard
    .writeText(sequenceText)
    .then(() => alert('Sequence copied to clipboard!'))
    .catch((err) => console.error('Failed to copy: ', err))
}

const hasGeneratedContent = computed(() => props.generatedStates.length > 0)
</script>

<template>
  <div class="visualizer-panel">
    <h3>Generated Sequence</h3>

    <div v-if="!hasGeneratedContent" class="no-content-message">
      Generate a sequence to see the visualization here.
    </div>

    <div v-else class="content-wrapper">
      <div class="grid-container">
        <div
          v-for="(row, rowIndex) in generatedStates"
          :key="rowIndex"
          class="ca-row"
          :style="{ gridTemplateColumns: `repeat(${width}, 1fr)` }"
        >
          <div
            v-for="(cell, cellIndex) in row"
            :key="`${rowIndex}-${cellIndex}`"
            class="ca-cell"
            :class="{ active: cell === 1 }"
          ></div>
        </div>
      </div>

      <div class="sequence-output">
        <h4>Integer Sequence:</h4>
        <div class="integer-list">
          {{ generatedIntegers.join(' ') }}
        </div>
        <button @click="copySequence" :disabled="!hasGeneratedContent">Copy Sequence</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visualizer-panel {
  background-color: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
}

h3 {
  color: #4caf50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

h4 {
  color: #e0e0e0;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
}

.no-content-message {
  text-align: center;
  color: #aaa;
  font-style: italic;
  padding: 2rem 0;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
}

.grid-container {
  max-height: 400px; /* Limit height for scrollability */
  overflow-y: auto; /* Enable vertical scrolling */
  border: 1px solid #444;
  background-color: #1a1a1a;
  border-radius: 4px;
}

.ca-row {
  display: grid;
  /* grid-template-columns set dynamically based on width prop */
  gap: 1px; /* Small gap between cells */
  border-bottom: 1px solid #333;
}

.ca-row:last-child {
  border-bottom: none; /* No border for the last row */
}

.ca-cell {
  aspect-ratio: 1 / 1; /* Make cells square */
  background-color: #444; /* Inactive color */
  transition: background-color 0.1s ease-in-out;
}

.ca-cell.active {
  background-color: #4caf50; /* Active color */
}

/* Ensure cells don't get too small or too large */
.ca-cell {
  min-width: 8px; /* Minimum size */
  max-width: 25px; /* Maximum size to prevent huge cells on small width */
}
/* Adjust cell size for different widths for better view */
@media (min-width: 768px) {
  .ca-cell {
    min-width: 12px;
  }
}
/* If width is very high, cells become smaller */
.ca-row[style*='repeat(16'] .ca-cell,
.ca-row[style*='repeat(15'] .ca-cell,
.ca-row[style*='repeat(14'] .ca-cell {
  min-width: 6px;
  max-width: 18px;
}

.sequence-output {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

.integer-list {
  background-color: #1a1a1a;
  border: 1px solid #444;
  padding: 0.75rem;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
  font-family: 'Cascadia Code', 'Fira Code', monospace; /* Monospace for numbers */
  font-size: 0.95rem;
  line-height: 1.4;
  white-space: pre-wrap; /* Preserve line breaks if any, though it will be a comma separated list */
  word-break: break-all; /* Break long numbers if needed */
}

.sequence-output button {
  background-color: #2196f3; /* Blue accent for copy button */
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

.sequence-output button:hover:not(:disabled) {
  background-color: #1976d2;
}

.sequence-output button:disabled {
  background-color: #555;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
