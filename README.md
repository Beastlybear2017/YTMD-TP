# YouTube Music Desktop v2 Touch Portal Plugin

This is an update to [KillerBOSS2019](https://github.com/KillerBOSS2019)'s [TP-YTDM-Plugin](https://github.com/KillerBOSS2019/TP-YTDM-Plugin) for YouTube Music Desktop v1. It has most of the basic functionality, however is currently limited by the updated API.

- [TouchPortal YTMD Plugin](#youtube-music-desktop-v2-touch-portal-plugin)
  - [Description](#description)
  - [Action/States/Events](#actionstatesevents)
    - [Action](#action)
    - [States](#states)
    - [Events](#events)
  - [Installation Guide](#installation)
  - [Info](#info)

## Description
This is an integration for [TouchPortal](https://www.touch-portal.com/) that Allow you to control [Youtube Music Desktop app v2](https://ytmdesktop.app)

## Action/States/Events
### action
  - [Action] YT Music Playback Play/Pause (Allows you to Pause/Play current Song)
  - [Action] YT Music Playback Next/Previous (let you play previous song or next song)
  - [Action] YT Music Control Like/Dislike (Allows you to Like or Dislike current playing Song)
  - [Action] YT Music Control Volume (Allows you Increase/Decrease volume Note: Values is unchangable)
  - [Action] YT Music Playback seek (Allows you to Forward/Rewind by 10 Seconds)
  - [Action] YT Music Playback Repeat (Allows you to change Repeat States to OFF/ONE/ALL)
  - [Action] YT Music Set seek (Allows you to set position of the Song)
  - [Action] YT Music Set Volume (Allows you to set volume from 0 to 100%)
  - [Action] YT Music Playback Play/Pause (Allows you to Pause/Play current Song)
  - [Action] YT Music Playback Shuffle (Shuffles current Song queue)
### Events
  - [Events] YT Music is Paused (Trigger True/False if Song is paused)
  - [Events] YT Music Song like States (Trigger if Like states is INDIFFERENT/LIKE/DISLIKE)
  - [Events] YT Music is Advertisement (Trigger if current is Playing Ads True/False)
  - [Events] YT Music Song Repeat States (Trigger if Repeat states changes to OFF/ONE/ALL)
### States
  - [States] YT Music Song Title (Show current Song title)
  - [States] YT Music Cover Art (Show current playing Song cover)
  - [States] YT Music Song Author (Show current Song Author)
  - [States] YT Music Current Album (Show current Song Album)
  - [States] YT Music Play/Pause States (Show if current song is Paused True/False)
  - [States] YT Music Current Volume (Show current Volume 0-100 in percent)
  - [States] YT Music Song Length (Show how long is the Song format 00:00)
  - etc... you get the point


## installation
- For smoother integration, I recommend using my [fork of YTMD](https://github.com/Beastlybear2017/ytmdesktop/releases/tag/v2.0.5) until the official v2.1 is released, however you can use the [official YTMD build](https://github.com/ytmdesktop/ytmdesktop) if you prefer.
- Download latest version of YTMD-TP Plugin from [releases](https://github.com/Beastlybear2017/YTMD-TP/releases)

- Open YTMD, enable the companion server and allow authorization requests
![Code_2LdaDpvW0Z](https://github.com/user-attachments/assets/d18f5d83-af37-4aea-9aed-479e9b7ecf2a)

- Open TouchPortal and click Import Plugin and Select the Downloaded .tpp file. Make sure to trust the plugin (Allows it to start with Touch Portal)
![Code_SNp6r6wvfC](https://github.com/user-attachments/assets/27263f18-31ca-455c-abf1-9c1e61fec885)

After enabling the plugin, you will be presented with a pop-up from YTMD with an authorization request. Make sure to allow the connection.
- ![TouchPortal_DxEbtiVsVY](https://github.com/user-attachments/assets/bf1a8638-bd3a-45e9-8153-03508be54ff8)

In the event that you missed the popup or denied access, simply restart the plugin from within Touch Portal's settings before re-enabling authorization requests in YTMD:
- ![TouchPortal_ZXwrfXUSbU](https://github.com/user-attachments/assets/467369a3-f26b-41cf-8825-6275907b034a)

- If this is your first Plugin you may need to restart TouchPortal



## Info
If there is any Issues/Suggestions or anything feel free make new Issue In this Github.
