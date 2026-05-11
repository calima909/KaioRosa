<!--
  HotspotDetailView — Overlay informativo per l'hotspot selezionato.

  Il parametro :id della rotta indica quale hotspot visualizzare.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { hotspots } from '@/store/hotspots'


const route = useRoute()
const router = useRouter()

// Stessi dati dei marker (label/description)
const content = computed(() => {
  const id = route.params.id
  if (typeof id !== 'string' || !(id in hotspots)) return undefined
  return hotspots[id]
})

function close () {
  router.push('/')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
             flex items-center justify-center p-4"
    @click.self="close"
  >
    <div
      class="relative bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950/95 border border-orange-500/20 border-t-orange-400/50
               rounded-[2rem] p-10 max-w-120 w-full text-slate-100 shadow-[0_25px_80px_-35px_rgba(251,146,60,0.8)] overflow-hidden"
    >
      <button
        class="absolute top-4 right-4 bg-orange-500/10 border border-orange-400/40
                 rounded-full w-10 h-10 text-orange-200 cursor-pointer
                 flex items-center justify-center text-lg font-semibold
                 transition-colors duration-200 hover:bg-orange-500/25"
        @click="close"
      >
        ✕
      </button>

      <div class="absolute inset-x-0 -top-12 h-28 bg-[radial-gradient(ellipse_at_center,_rgba(251,146,60,0.4)_0%,_transparent_70%)] pointer-events-none blur-sm" />

      <h2 class="dragon-title text-3xl mb-4 text-orange-300">
        {{ content?.label ?? 'Unknown hotspot' }}
      </h2>

      <p class="dragon-text text-base leading-relaxed text-slate-300 mb-6" v-html="content?.description ?? 'No description available'" />
    </div>
  </div>
</template>

<style>
  .dragon-title {
    font-family: 'Bangers', cursive;
    letter-spacing: 2px;
    color: #ffd54a;

    
    text-shadow:
      3px 3px 0 #000,
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,

      0 0 10px #ff9800,
      0 0 20px #ff5722,
      0 0 40px #ffeb3b;

    animation: aura 1.5s infinite alternate;
  }

  @keyframes aura {
    from {
      text-shadow:
        3px 3px 0 #000,
        0 0 10px #ff9800,
        0 0 20px #ff5722;
    }
    to {
      text-shadow:
        3px 3px 0 #000,
        0 0 20px #ff9800,
        0 0 40px #ff5722,
        0 0 60px #ffeb3b;
    }
  }

  .dragon-text {
    font-family: 'Nunito', sans-serif;
    letter-spacing: 0.5px;

    text-shadow:
      0 0 6px rgba(255, 140, 0, 0.4);

    line-height: 1.6;
  }
</style>

