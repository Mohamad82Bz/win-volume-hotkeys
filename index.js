import {GlobalKeyboardListener} from "node-global-key-listener";
import {activeWindowSync, openWindowsSync} from 'get-windows';
import {NodeAudioVolumeMixer} from "node-audio-volume-mixer";
import fs from 'fs/promises';
import sound from 'sound-play';
import path from 'path';
import {fileURLToPath} from 'url';

const keyListener = new GlobalKeyboardListener();

const groups = JSON.parse(await fs.readFile('sound_groups.json', 'utf-8'));
const volumeKeys = JSON.parse(await fs.readFile('volume_keys.json', 'utf-8'));

const volumeAdjustment = 0.05

const volumeDown = volumeKeys.volumeDown
const volumeUp = volumeKeys.volumeUp

const maxVolumeSound = path.join(path.dirname(fileURLToPath(import.meta.url)), 'sound', 'volume_warning.mp3');
const soundCooldown = 1000
let lastPlayedTime = 0

let audioSessionProcesses = [];
let activeWindow = {};
let openWindows = [];

async function main() {
    let selectedGroup
    await keyListener.addListener((event) => {
        groups.find((value) => {
            if (value.hotkey === event.name) {
                if (event.state === "DOWN") {
                    selectedGroup = value
                } else {
                    selectedGroup = undefined
                }
            }
        });

        if (event.state === "DOWN" && (event.name === volumeDown || event.name === volumeUp)) {
            const isVolumeDown = event.name === volumeDown

            const appGroup = openWindows.filter((value) => {
                if (selectedGroup) {
                    return selectedGroup.apps.includes(value.owner.name)
                } else {
                    return value.owner.name === "Spotify" && !value.title.startsWith("Spotify")
                }
            });

            if (appGroup.length === 0) {
                if (!activeWindow) return
                appGroup.push(activeWindow)
            }

            audioSessionProcesses.forEach((value) => {
                let condition = false
                let name = value.name.split(".exe")[0]
                appGroup.forEach((app) => {
                    // Discord has multiple processes with different uid but this volume mixer library returns all with the same uid, so we need to check the name instead.
                    if (app.owner.name === "Discord") {
                        condition = app.owner.name === name
                    } else {
                        condition = app.owner.processId === value.pid
                    }

                    if (condition) {
                        const session = value.pid
                        const volume = getVolume(session) + (isVolumeDown ? -volumeAdjustment : volumeAdjustment)
                        setVolume(session, volume)
                        console.log(`Changing volume for ${value.name} with pid ${session} to ${volume}`)
                    }
                })
            })
        }
    })
}

async function setVolume(sessionPid, volume) {
    if (volume === getVolume(sessionPid)) return
    const vol = volume > 1 ? 1 : volume < 0 ? 0 : volume

    NodeAudioVolumeMixer.setAudioSessionVolumeLevelScalar(sessionPid, vol)

    if (vol === 1 || vol === 0) {
        const currentTime = Date.now()
        if (currentTime - lastPlayedTime < soundCooldown) return
        lastPlayedTime = currentTime
        await sound.play(maxVolumeSound, vol === 1 ? 0.2 : 0.1)
    }
}

function getVolume(sessionPid) {
    return NodeAudioVolumeMixer.getAudioSessionVolumeLevelScalar(sessionPid);
}

function updateAudioSessionProcesses() {
    audioSessionProcesses = NodeAudioVolumeMixer.getAudioSessionProcesses();
}

function updateActiveWindow() {
    activeWindow = activeWindowSync();
}

function updateOpenWindows() {
    openWindows = openWindowsSync();
}

setInterval(updateActiveWindow, 500)
setInterval(updateAudioSessionProcesses, 1000);
setInterval(updateOpenWindows, 1000);
await main()
console.log("Listening for hotkeys.")