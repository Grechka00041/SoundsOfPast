
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
    getAllTracks: async (): Promise<Track[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tracks`);

            if (!response.ok) {
                throw new Error(`Ошибка загрузки треков: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Не удалось получить треки:', error);
            return [];
        }
    }
};