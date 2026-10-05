export interface Track {
    id: string | number;
    title: string;
    artist?: string;
    duration: number; // в секундах
    region: string;   // ДОЛЖНО ТОЧНО СОВПАДАТЬ С properties.name В GEOJSON
    globalRegion: string;
    isInstrument: boolean;
    link: string;
}

export const mockTracks: Track[] = [
    {
        id: 1,
        title: "Поле русское",
        artist: "Иван Петров",
        duration: 310,
        region: "Московская область",
        globalRegion: "ЦФО",
        isInstrument: false,
        link: "/audio/pole-russkoe.mp3"
    },
    {
        id: 2,
        title: "Балалайка-прима",
        artist: undefined,
        duration: 60,
        region: "Московская область",
        globalRegion: "ЦФО",
        isInstrument: true,
        link: "/audio/balalaika-prima.mp3"
    },
    {
        id: 3,
        title: "Казачья песня",
        artist: "Кубанский Хор",
        duration: 420,
        region: "Краснодарский край",
        globalRegion: "ЮФО",
        isInstrument: false,
        link: "/audio/kazachya-pesnya.mp3"
    }
];