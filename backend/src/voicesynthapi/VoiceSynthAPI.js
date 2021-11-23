//General VoiceSynth API Wrapper
import {gitClip as getWellSaidClip} from './WellSaidLabs'


export function getClip(avatarId, text, abortController)  {
    return getWellSaidClip (avatarId, text, abortController);
}