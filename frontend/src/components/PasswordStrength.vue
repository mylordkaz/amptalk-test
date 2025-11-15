<script setup lang="ts">
import { computed } from 'vue'
import { calculatePasswordStrength } from '@/utils/validation'

const props = defineProps<{
  password: string
}>()

const strength = computed(() => calculatePasswordStrength(props.password))

const strengthColor = computed(() => {
  const colors = ['gray', 'red', 'orange', 'yellow', 'green']
  return colors[Math.min(strength.value.score, 4)]
})

const strengthLabel = computed(() => {
  const labels = ['None', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[Math.min(strength.value.score, 4)]
})

// Static class names required for Tailwind JIT
const barColorClass = computed(() => ({
  gray: 'bg-gray-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500'
}[strengthColor.value]))

const textColorClass = computed(() => ({
  gray: 'text-gray-600',
  red: 'text-red-600',
  orange: 'text-orange-600',
  yellow: 'text-yellow-600',
  green: 'text-green-600'
}[strengthColor.value]))
</script>

<template>
  <div v-if="password" class="mt-2">
    <div class="flex gap-1 mb-2">
      <div
        v-for="i in 5"
        :key="i"
        class="h-1 flex-1 rounded transition-colors"
        :class="
          i <= strength.score
            ? barColorClass
            : 'bg-gray-200'
        "
      />
    </div>
    <p class="text-sm" :class="textColorClass">
      {{ strengthLabel }}
    </p>
    <ul class="mt-2 space-y-1 text-xs">
      <li :class="strength.requirements.length ? 'text-green-600' : 'text-gray-500'">
        {{ strength.requirements.length ? '✓' : '○' }} At least 8 characters
      </li>
      <li :class="strength.requirements.uppercase ? 'text-green-600' : 'text-gray-500'">
        {{ strength.requirements.uppercase ? '✓' : '○' }} One uppercase letter
      </li>
      <li :class="strength.requirements.lowercase ? 'text-green-600' : 'text-gray-500'">
        {{ strength.requirements.lowercase ? '✓' : '○' }} One lowercase letter
      </li>
      <li :class="strength.requirements.number ? 'text-green-600' : 'text-gray-500'">
        {{ strength.requirements.number ? '✓' : '○' }} One number
      </li>
      <li :class="strength.requirements.special ? 'text-green-600' : 'text-gray-500'">
        {{ strength.requirements.special ? '✓' : '○' }} One special character
      </li>
    </ul>
  </div>
</template>
