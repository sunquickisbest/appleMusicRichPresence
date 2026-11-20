import { execSync } from 'node:child_process';

export async function getTrackInfo() {
    interface Track {
        trackName: string;
        artist: string;
        artworkURL?: string;

    }

    const script = `'tell application "Music"' -e 'if player state is playing then' -e 'return name of current track & "||||" & artist of current track' -e 'end if' -e 'end tell'`
    const output: string = execSync(`osascript -e ${script}`, { encoding: "utf-8" }).trim();

    if (!output) {
        return null;
    }

    const [songName = "", artistName = ""] = output.split("||||");

    const parameters: URLSearchParams = new URLSearchParams({
        q: `${songName.split(/\(\s*feat\./i)[0].trim()} ${artistName}`
    }
    )

    const response = await fetch(`https://api.deezer.com/search/track?${parameters.toString()}`);
    const result = await response.json();
    const coverBig = result.data?.[0]?.album?.cover_big ?? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJgIuxbiwCWEhzU0IL93Vk1vVZsmcTLj5aEAqXdLrPhfdz2YIwSjepNzcP&s=10";

    const song: Track = { trackName: songName.trim(), artist: artistName.trim(), artworkURL: coverBig.trim() };
    console.log(song.artist);
    return song;
}