import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import {CompanionConnector, Settings} from "ytmdesktop-ts-companion";
import TouchPortalAPI from 'touchportal-api'

(async () => {
    let playerData: any
    const TPClient = await new TouchPortalAPI.Client();
    const pluginId = 'Test YTMD';
    TPClient.connect({ pluginId });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const version = packageJson.version;

    const tokenPath = path.join(__dirname, "../.token");

    if (!fs.existsSync(tokenPath)) {
        fs.writeFileSync(tokenPath, "");
    }

    let token = fs.readFileSync(tokenPath, "utf-8");

    const settings: Settings = {
        host: "127.0.0.1",
        port: 9863,
        appId: "ytmd-v2-tp",
        appName: "YTMD v2 Touch Portal",
        appVersion: version
    }    

    if (token) {
        settings.token = token;
    }

    let connector: CompanionConnector;
    try {
        connector = new CompanionConnector(settings);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }

    const restClient = connector.restClient;
    const socketClient = connector.socketClient;

    TPClient.on("Action", async (data: any, hold: Boolean) => {
        const value = data.data[0]?.value
        switch (data.actionId) {
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.Play/Pause":
                value == "Play" ? await restClient.play().catch(e => {}) : await restClient.pause().catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.Next/Previous":
                value == "Next" ? await restClient.next().catch(e => {}) : await restClient.previous().catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.Like/Dislike":
                value == "Like" ? await restClient.toggleLike().catch(e => {}) : await restClient.toggleDislike().catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.VUp/VDown":
                value == "Up" ? await restClient.volumeUp().catch(e => {}) : await restClient.volumeDown().catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.mute/unmute":
                value == "Mute" ? await restClient.mute().catch(e => {}) : await restClient.unmute().catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.forward/rewind":
                if (!playerData) return
                value == "Forward" ? await restClient.seekTo(JSON.parse(playerData).videoProgress + 10).catch(e => {}) : await restClient.seekTo(JSON.parse(playerData).videoProgress - 10).catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.RepeatPic":
                value == "NONE" ? await restClient.repeatMode(0).catch(e => {}) : value == "ALL" ? await restClient.repeatMode(1).catch(e => {}) : await restClient.repeatMode(2).catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.SetSeekBar":
                await restClient.seekTo(value).catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.SetVolume":
                await restClient.setVolume(value).catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.PlayTrackNumber":
                await restClient.playQueueIndex(value - 1).catch(e => {})
                break;
            case "KillerBOSS.TouchPortal.Plugin.YTMD.Action.Shuffle":
                await restClient.shuffle().catch(e => {})
                break;

            default:
                break;
        }
    })

    TPClient.on("ConnectorChange",async (data: any) => {
        switch (data.connectorId) {
            case "KillerBOSS.TP.Plugins.YTMD.connectors.APPcontrol":
                await restClient.setVolume(data.value).catch(e => {})
                break;
        
            default:
                break;
        }
        // await res
    })

    socketClient.addStateListener(state => {
        state.player.videoProgress = Number(state.player.videoProgress.toFixed(0))
        const statePlayer = JSON.stringify(state.player)

        if (playerData !== statePlayer) {
            playerData = statePlayer;
            const video: any = state.video
            const player: any = state.player
            let playerStates = [
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.Trackcurrentdurationhuman", value: formatTime(player.videoProgress)},
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.Trackdurationhuman", value: formatTime(Number((video.durationSeconds || 0).toFixed(0)))},
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.PlayerTitle", value: video.title},
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.Playercover", value: video.thumbnails.pop().url},
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.Trackauthor", value: video.author},
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.Trackalbum", value: video.album || "None"},
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.PlayerisPaused", value: !state.player.trackState ? "True" : "False" },
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.PlayerVPercent", value: state.player.volume},
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.PlayerCurrentSonglikeState", value: video.likeStatus == 1 ? "INDIFFERENT" : video.likeStatus == 2 ? "Like" : "Dislike"},
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.isAdvertisement", value: player.adPlaying == true ? "True" : "False"},
                {id: "KillerBOSS.TouchPortal.Plugin.YTMD.States.repeatType", value: player.queue.repeatMode == 0 ? "NONE" : player.queue.repeatMode == 1 ? "ALL" : "ONE"}
            ]
            TPClient.stateUpdateMany(playerStates)
        }
    });

    socketClient.addErrorListener(error => {
        if (error.message == "Authentication not provided or invalid") {
            auth()
        } else {
            console.error("Got new error:", error)
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

    function formatTime(seconds: number): string {
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
})();