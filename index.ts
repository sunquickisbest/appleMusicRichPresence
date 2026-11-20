import { ApplicationAssetUtils, FluxDispatcher } from "@webpack/common";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "AppleMusicRichPresence",
    description: "Displays current Apple Music track as Discord status",
    authors: [{ name: "neils", id: 0n }],
    timer: null as any,
    lastTrack: "",
    lastArtwork: "",
    assetId: undefined as string | undefined,

    start() {
        const Native = VencordNative.pluginHelpers.AppleMusicRichPresence;

        const update = async () => {
            const result = await Native.getTrackInfo();

            if (result) {
                const track = `${result.trackName}|${result.artist}|${result.artworkURL}`;
                if (track !== this.lastTrack) {
                    this.lastTrack = track;

                    if (result.artworkURL !== this.lastArtwork) {
                        [this.assetId] = await ApplicationAssetUtils.fetchAssetIds("908014683359936512", [result.artworkURL]);
                        this.lastArtwork = result.artworkURL;
                    }

                    FluxDispatcher.dispatch({
                        type: "LOCAL_ACTIVITY_UPDATE",
                        activity: {
                            name: result.trackName,
                            type: 2,
                            application_id: "908014683359936512",
                            details: result.trackName,
                            state: result.artist,
                            assets: { large_image: this.assetId }
                        },
                        socketId: "AppleMusic"
                    });
                }
            } else if (this.lastTrack) {
                this.lastTrack = "";
                FluxDispatcher.dispatch({ type: "LOCAL_ACTIVITY_UPDATE", activity: null, socketId: "AppleMusic" });
            }

            this.timer = setTimeout(update, 6000);
        };

        update();
    },

    stop() {
        clearTimeout(this.timer);
        this.lastTrack = "";
        FluxDispatcher.dispatch({ type: "LOCAL_ACTIVITY_UPDATE", activity: null, socketId: "AppleMusic" });
    }
});
