const path = require("path");
const fs = require("fs");
const { CompanionConnector } = require("ytmdesktop-ts-companion");
const TouchPortalAPI = require("touchportal-api");

const packageJson = require("../package.json");

(async () => {
    
    let playerData;
    const TPClient = await new TouchPortalAPI.Client();
    const pluginId = 'YoutubeMusicv2';
    TPClient.connect({ pluginId });

    const version = packageJson.version;

    const tokenPath = path.join(process.env.APPDATA, 'TouchPortal', 'plugins', 'TouchPortalYTMusicV2', '.token');

    if (!fs.existsSync(tokenPath)) {
        fs.writeFileSync(tokenPath, "");
    }

    let token = fs.readFileSync(tokenPath, "utf-8");

    const settings = {
        host: "127.0.0.1",
        port: 9863,
        appId: "ytmd-v2-tp",
        appName: "YTMD v2 Touch Portal",
        appVersion: version
    }

    if (token) {
        settings.token = token;
    }

    let connector;
    try {
        connector = new CompanionConnector(settings);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }

    const restClient = connector.restClient;
    const socketClient = connector.socketClient;

    TPClient.on("Action", async (data, hold) => {
        const value = data.data[0]?.value
        switch (data.actionId) {
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.Play/Pause":
                value == "Play" ? await restClient.play().catch(e => {}) : await restClient.pause().catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.Next/Previous":
                value == "Next" ? await restClient.next().catch(e => {}) : await restClient.previous().catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.Like/Dislike":
                value == "Like" ? await restClient.toggleLike().catch(e => {}) : await restClient.toggleDislike().catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.VUp/VDown":
                value == "Up" ? await restClient.volumeUp().catch(e => {}) : await restClient.volumeDown().catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.mute/unmute":
                value == "Mute" ? await restClient.mute().catch(e => {}) : await restClient.unmute().catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.forward/rewind":
                if (!playerData) return
                value == "Forward" ? await restClient.seekTo(JSON.parse(playerData).videoProgress + 10).catch(e => {}) : await restClient.seekTo(JSON.parse(playerData).videoProgress - 10).catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.RepeatPic":
                value == "NONE" ? await restClient.repeatMode(0).catch(e => {}) : value == "ALL" ? await restClient.repeatMode(1).catch(e => {}) : await restClient.repeatMode(2).catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.SetSeekBar":
                await restClient.seekTo(value).catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.SetVolume":
                await restClient.setVolume(value).catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.PlayTrackNumber":
                await restClient.playQueueIndex(value - 1).catch(e => {})
                break;
            case "Beastlybear.TouchPortal.Plugin.YTMD.Action.Shuffle":
                await restClient.shuffle().catch(e => {})
                break;

            default:
                break;
        }
    })

    TPClient.on("ConnectorChange",async (data) => {
        switch (data.connectorId) {
            case "Beastlybear.TP.Plugins.YTMD.connectors.APPcontrol":
                await restClient.setVolume(data.value).catch(e => {})
                break;
        
            default:
                break;
        }
    })

    socketClient.addStateListener(state => {
        state.player.videoProgress = Number(state.player.videoProgress.toFixed(0))
        const statePlayer = JSON.stringify(state.player)

        if (playerData !== statePlayer) {
            playerData = statePlayer;
            const video = state.video
            const player = state.player
            function states() {
                try {
                    let playerStates = [
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.Trackcurrentdurationhuman", value: formatTime(player.videoProgress)},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.Trackdurationhuman", value: formatTime(Number((video.durationSeconds || 0).toFixed(0)))},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.PlayerTitle", value: video.title},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.Playercover", value: video.thumbnails?.pop().url},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.Trackauthor", value: video.author},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.Trackalbum", value: video.album || "None"},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.PlayerisPaused", value: state.player.trackState !== 1 ? "True" : "False"},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.PlayerVPercent", value: state.player.volume},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.PlayerCurrentSonglikeState", value: video.likeStatus == 1 ? "INDIFFERENT" : video.likeStatus == 2 ? "Like" : "Dislike"},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.isAdvertisement", value: player.adPlaying == true ? "True" : "False"},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.repeatType", value: player.queue.repeatMode == 0 ? "NONE" : player.queue.repeatMode == 1 ? "ALL" : "ONE"},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.PreviousSong.title", value: player.queue.items[player.queue.selectedItemIndex - 1]?.title || "None"},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.PreviousSong.author", value: player.queue.items[player.queue.selectedItemIndex - 1]?.author || "None"},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.Next.title", value: player.queue.items[player.queue.selectedItemIndex + 1]?.title || "None"},
                        {id: "Beastlybear.TouchPortal.Plugin.YTMD.States.Next.author", value: player.queue.items[player.queue.selectedItemIndex + 1]?.author || "None"},
                    ]
                    TPClient.stateUpdateMany(playerStates)                        
                } catch (error) {
                    setTimeout(() => {
                        states()
                    }, 2000);
                }
            
            }
            states()
        }
    });

    socketClient.addErrorListener(error => {
        switch (error.message) {
            case "Authentication not provided or invalid":
                auth()
                break;
            case "websocket error":
                break;
            default:
                break;
        }        
    });

    async function auth() {
        try {
            const codeResponse = await restClient.getAuthCode();

            const tokenResponse = await restClient.getAuthToken(codeResponse.code);
            token = tokenResponse.token;

            connector.setAuthToken(token);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }

        fs.writeFileSync(tokenPath, token);        
    }

    if (!token) {
        await auth()
    }

    socketClient.connect();

    await new Promise(() => {
    });

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutesRemaining = seconds % 3600;
        const minutes = Math.floor(minutesRemaining / 60);
        const secondsRemaining = minutesRemaining % 60;
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
        }
    }

    process.on("unhandledRejection", err => {
        console.error(err);
    })
})();