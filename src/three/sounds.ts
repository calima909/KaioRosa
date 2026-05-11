  let isMuted = false
  
  const trackSound = new Audio(`${import.meta.env.BASE_URL}sounds/track.mp3`)
  trackSound.volume = 0.3
  trackSound.loop = true

  const houseSound = new Audio(`${import.meta.env.BASE_URL}sounds/knock.mp3`)
  houseSound.volume = 1

  const fountainSound = new Audio(`${import.meta.env.BASE_URL}sounds/fountain.mp3`)
  fountainSound.volume = 0.5

  const carSound = new Audio(`${import.meta.env.BASE_URL}sounds/car.mp3`)
  carSound.volume = 0.3

  export function setupTrackSound() {
    const startMusic = () => {
      trackSound.play()
      window.removeEventListener('click', startMusic)
    }
    window.addEventListener('click', startMusic)
  }
  export function playHouseSound() {
    houseSound.currentTime = 0
    houseSound.play()
  }

  export function playFountainSound() {
    fountainSound.currentTime = 0
    fountainSound.play()
  }

  export function playCarSound() {
    carSound.currentTime = 0
    carSound.play()
  }

  export function disposeAudio() {
    trackSound.pause()
    trackSound.currentTime = 0
    
    houseSound.pause()
    houseSound.currentTime = 0

    fountainSound.pause()
    fountainSound.currentTime = 0

    carSound.pause()
    carSound.currentTime = 0
  }

  export function toggleMute() {
  isMuted = !isMuted
  trackSound.muted = isMuted 
  houseSound.muted = isMuted
  fountainSound.muted = isMuted
  carSound.muted = isMuted
  return isMuted
}

export function getMutedState() {
  return isMuted
}