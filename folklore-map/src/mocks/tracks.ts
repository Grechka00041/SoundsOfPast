export interface Track {
    id: string | number;
    title: string;
    artist?: string;
    duration: number;
    region: string;
    isInstrument: boolean;
}

export const mockTracks: Track[] = [

    {
        id: 1,
        title: "Поле русское",
        artist: "Иван Петров",
        duration: 310,
        region: "Московская область",
        isInstrument: false,
    }


];