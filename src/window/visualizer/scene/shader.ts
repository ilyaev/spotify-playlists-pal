import { ThreeScene } from './base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { getRandomColor } from 'utils/index'

export class StarsScene extends ThreeScene {
    track: TrackSync

    build() {}

    onEnter() {}

    onBeat(beat: any) {}

    update(now: number, track: TrackSync) {}
}
