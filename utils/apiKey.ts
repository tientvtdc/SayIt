
const API_KEY_STORAGE_KEY = 'gemini-api-key';

export function getApiKey(): string | null {
    try {
        // Check if localStorage is available
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem(API_KEY_STORAGE_KEY);
        }
        return null;
    } catch (e) {
        console.error("Could not access localStorage to get API key", e);
        return null;
    }
}

export function saveApiKey(key: string): void {
    try {
        // Check if localStorage is available
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
        }
    } catch (e) {
        console.error("Could not access localStorage to save API key", e);
    }
}
