<!--
  HotspotMarker — pulsante HTML sopra il canvas.

  Three.js non tocca il DOM: aggiorna solo lo store. Il componente si limita a dichiarare
  lo stile come funzione dello stato reattivo (`:style` + computed): niente watch,
  niente accesso imperativo a `el.style`.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { hotspots } from '@/store/hotspots'

const props = defineProps<{
  id: string
  route: string
}>()

const router = useRouter()

const hotspot = computed(() => hotspots[props.id])

const markerStyle = computed(() => {
  const h = hotspot.value
  if (!h?.visible) return { display: 'none' }
  // translate(-50%,-50%) centra il marker sul punto proiettato.
  return {
    transform: `translate(${h.x}px, ${h.y}px) translate(-50%, -50%)`,
  }
})

const starsLayout = computed(() => {
  if (props.id === 'fontana') {
    return ['★★', '★']
  }

  const map: Record<string, number> = {
    car: 1,
    casa: 2,
    fontana: 3
  }

  return ['★'.repeat(map[props.id] || 1)]
})

function onClick () {
  router.push(props.route)
}

</script>

<template>
  <button
    :style="markerStyle"
    class="group fixed left-0 top-0 z-10 cursor-pointer flex
           border-none bg-transparent p-0 items-center justify-center"
    :title="hotspot?.label ?? ''"
    @click="onClick"
  >
    <span
      class="absolute w-5 h-5 rounded-full
            bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600
            shadow-[0_0_12px_rgba(251,146,60,0.9),0_0_24px_rgba(251,146,60,0.6)]
            transition-transform duration-200
            group-hover:scale-125"
    />

    <span
      class="absolute text-[10px] font-bold text-red-700
            pointer-events-none select-none flex flex-col items-center leading-none"
    >
      <span v-for="(stars, i) in starsLayout" :key="i">
        {{ stars }}
      </span>
    </span>
    <span
      class="absolute w-6 h-6 rounded-full border border-orange-300/40 animate-ping"
    />
  </button>
</template>
