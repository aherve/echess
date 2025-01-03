import { logger } from './logger'
import playSound from 'play-sound'

const player = playSound({})

export async function playNotifySound() {
  return genericPlay('./sounds/public_sound_standard_GenericNotify.mp3')
}
export async function playMoveSound() {
  return genericPlay('./sounds/public_sound_standard_Move.mp3')
}
export async function playCaptureSound() {
  return genericPlay('./sounds/public_sound_standard_Capture.mp3')
}

async function genericPlay(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    player.play(path, (err) => {
      if (err) {
        logger.error(`Could not play sound: ${err}`)
        reject(err)
      }
      resolve()
    })
  })
}
