<<<<<<< HEAD

=======
>>>>>>> 4f19aa781319933726786ec3b8aad9d56187edab
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Track {
    id: number;
    title: string;
    artist?: string;
    duration: number;
    region: string;
    globalRegion: string;
    isInstrument: boolean;
    link: string;
}

export const trackService = {
<<<<<<< HEAD
    getAllTracks: async (): Promise<Track[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tracks`);

            if (!response.ok) {
=======

    getTracksByRegion: async (regionName: string): Promise<Track[]> => {
        try {
            // encodeURIComponent нужен для безопасной передачи кириллицы в URL
            const encodedRegion = encodeURIComponent(regionName);
            const response = await fetch(`${API_BASE_URL}/api/tracks/${encodedRegion}`);

            if (!response.ok) {
                if (response.status === 404) return []; // Возвращаем пустой массив, если регион пуст
>>>>>>> 4f19aa781319933726786ec3b8aad9d56187edab
                throw new Error(`Ошибка загрузки треков: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
<<<<<<< HEAD
            console.error('Не удалось получить треки:', error);
=======
            console.error(`Не удалось получить треки для "${regionName}":`, error);
>>>>>>> 4f19aa781319933726786ec3b8aad9d56187edab
            return [];
        }
    }
};