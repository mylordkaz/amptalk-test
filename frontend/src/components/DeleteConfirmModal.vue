<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  isOpen: boolean
  imageName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

/**
 * Handle ESC key to close modal
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) {
    emit('cancel')
  }
}

/**
 * Watch for modal open/close to manage body scroll and keyboard listeners
 */
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeydown)
    }
  }
)
</script>

<template>
  <!-- Modal backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      @click="emit('cancel')"
    >
      <!-- Modal dialog -->
      <Transition name="scale">
        <div
          v-if="isOpen"
          @click.stop
          class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        >
          <!-- Icon -->
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              class="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <!-- Title -->
          <h3 class="mt-4 text-lg font-semibold text-gray-900 text-center">
            Delete Image
          </h3>

          <!-- Message -->
          <div class="mt-3 text-center">
            <p class="text-sm text-gray-600">
              Are you sure you want to delete
              <span class="font-medium text-gray-900">{{ imageName }}</span>?
              This action cannot be undone.
            </p>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex space-x-3">
            <button
              @click="emit('cancel')"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              @click="emit('confirm')"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* Fade transition for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scale transition for modal */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
