import { Topic } from '../types';

const CUSTOM_TOPICS_KEY = 'customPronunciationTopics';

// Get all custom topics from localStorage
export function getCustomTopics(): Topic[] {
    try {
        const storedTopics = localStorage.getItem(CUSTOM_TOPICS_KEY);
        if (storedTopics) {
            return JSON.parse(storedTopics) as Topic[];
        }
    } catch (error) {
        console.error("Error reading custom topics from localStorage:", error);
        // If parsing fails, clear the corrupted data
        localStorage.removeItem(CUSTOM_TOPICS_KEY);
    }
    return [];
}

// Save all custom topics to localStorage
export function saveCustomTopics(topics: Topic[]): void {
    try {
        localStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify(topics));
    } catch (error) {
        console.error("Error saving custom topics to localStorage:", error);
    }
}
