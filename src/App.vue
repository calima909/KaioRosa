<!--
  Layers: z-0 canvas WebGPU -> marker HTML (z-10) -> router-view modali (z-50).
  Lista hotspot derivata dalle chiavi dello store (un solo elenco, niente duplicati).
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import HotspotMarker from '@/components/HotspotMarker.vue'
import { hotspots } from '@/store/hotspots'
import { initScene } from '@/three/index'

import { getMutedState, toggleMute } from '@/three/sounds.ts'

const hotspotIds = Object.keys(hotspots) as (keyof typeof hotspots)[]

const canvasContainer = ref<HTMLElement | null>(null)
const cleanup = ref<(() => void) | null>(null)
const route = useRoute()

// Gli hotspot sono visibili solo sulla rotta home (nessun overlay aperto)
const showHotspots = computed(() => route.path === '/')

const isMuted = ref(getMutedState())

onMounted(async () => {
  if (!canvasContainer.value) return
  cleanup.value = await initScene(canvasContainer.value)
})

onUnmounted(() => {
  cleanup.value?.()
})

function handleToggleAudio() {
  isMuted.value = toggleMute()
}
</script>

<template>
  <!-- Contenitore del canvas WebGPU: occupa tutta la viewport -->
  <div
    ref="canvasContainer"
    class="fixed inset-0 z-0"
  />
  <!-- Bottone audio-mute -->
  <button
  class="audio-button"
  @click="handleToggleAudio"
>
  <div class="dragon-stars">
    <span />
    <span />
    <span />
    <span />
  </div>

  <div class="audio-icon">
    {{ isMuted ? '♩' : '♪' }}
  </div>
</button>

  <!-- In modalità dettaglio nascondiamo i marker: focus sul contenuto e meno rumore visivo. -->
  <TransitionGroup name="hotspot-group">
    <template v-if="showHotspots">
      <HotspotMarker
        v-for="(id, index) in hotspotIds"
        :id="id"
        :key="id"
        :route="`/hotspot/${id}`"
        :style="{ '--stagger': index + 1 }"
      />
    </template>
  </TransitionGroup>
  <!-- Overlay di dettaglio (montato dal router) -->
  <RouterView v-slot="{ Component }">
    <Transition name="fade">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
/* Global styles */
html, body, #app { height: 100%; }
body { overflow: hidden; background: #000; }
</style>

<style scoped>
/* Fade transition for the router view */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.45s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* transition for the hotspot group */
.hotspot-group-enter-active, .hotspot-group-leave-active {
  transition: opacity 0.45s ease;
}

/* stagger on enter */
.hotspot-group-enter-active {
  transition-delay: calc(var(--stagger, 0) * 500ms);
}
/* no stagger on leave */
.hotspot-group-leave-active {
  transition-delay: 0;
}
.hotspot-group-enter-from,
.hotspot-group-leave-to {
  opacity: 0;
}

.audio-button {
position: fixed;
top: 24px;
left: 24px;
z-index: 100;

width: 74px;
height: 74px;

border: none;
border-radius: 50%;

cursor: pointer;

background:
  radial-gradient(circle at 30% 30%,
    #ffe27a 0%,
    #ffb300 35%,
    #ff7a00 70%,
    #d94b00 100%
  );

box-shadow:
  inset -6px -10px 16px rgba(0,0,0,0.25),
  inset 6px 6px 10px rgba(255,255,255,0.35),
  0 0 20px rgba(255,140,0,0.8),
  0 0 40px rgba(255,100,0,0.45);

transition:
  transform 0.2s ease,
  box-shadow 0.2s ease;

overflow: hidden;

backdrop-filter: blur(4px);
}
/* icona audio */
.audio-icon {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 22px;

  z-index: 2;

  text-shadow:
    0 0 8px rgba(255,170,0,1);
}

/* riflesso vetro */
.audio-button::before {
  content: '';

  position: absolute;
  top: 10px;
  left: 12px;

  width: 38px;
  height: 18px;

  border-radius: 50%;

  background: rgba(255,255,255,0.45);

  transform: rotate(-20deg);

  filter: blur(1px);
}

/* hover */
.audio-button:hover {
  transform: scale(1.08);

  box-shadow:
    inset -6px -10px 16px rgba(0,0,0,0.25),
    inset 6px 6px 10px rgba(255,255,255,0.35),
    0 0 28px rgba(255,170,0,1),
    0 0 55px rgba(255,120,0,0.7);
}

.audio-button:active {
  transform: scale(0.95);
}

/* contenitore stelle */
.dragon-stars {
  position: absolute;
  inset: 0;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;

  gap: 12px;

  width: 42px;
  height: 42px;

  margin: auto;
}

/* stelle */
.dragon-stars span {
  width: 12px;
  height: 12px;

  background: #c40000;

  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );

  box-shadow:
    0 0 6px rgba(255,0,0,0.9);
}




</style>
