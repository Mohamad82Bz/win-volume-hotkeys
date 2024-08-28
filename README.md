# Knob Controller

A Node.js application that controls the volume of specific (groups of) applications with hotkeys.

## Why does this exist?

I created this application because I wanted to make use my Keyboard Knob to control the volume of my choosing application or focused application without changing system volume.
You can also use Keyboard hotkeys instead.

## What this does?
- Changes Spotify volume when it's playing music. (Desktop app only)
- Changes volume of application groups that are configured in the ``groups.json`` file when the secondary hotkey is pressed down
  - For example, in the default ``groups.json`` I have configured to change the volume of Discord AND TeamSpeak 3 when I'm using the volume hotkeys while pressing the secondary hotkey.
- Changes volume of the focused application if none of the above pass.

## Installation

1. Clone the repository
2. Run ``npm install`` in the repository folder
3. Run ``Start.bat`` or ``node index.js`` to start the application
4. (Optional) Configure the ``groups.json`` file to your liking
5. (Optional) Configure the ``volume_keys.json`` file to your liking
6. Configure the hotkeys on your Keyboard.
If your Keyboard supports [VIA](https://www.caniusevia.com/), you can use it to configure the hotkeys on your Knob or any other button.
[VIA Example](https://imgur.com/EcbQb0v)