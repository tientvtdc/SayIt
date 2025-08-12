import { WordIpaPair } from '../types';

const DB_NAME = 'pronunciation-coach-db';
const DB_VERSION = 1;
const IPA_STORE_NAME = 'ipaCache';

interface IpaCacheEntry {
    sentence: string;
    ipa: WordIpaPair[];
    timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject('Error opening IndexedDB.');
            };

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(IPA_STORE_NAME)) {
                    db.createObjectStore(IPA_STORE_NAME, { keyPath: 'sentence' });
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });
    }
    return dbPromise;
}

export async function getIpaFromCache(sentence: string): Promise<WordIpaPair[] | null> {
    try {
        const db = await getDb();
        const transaction = db.transaction(IPA_STORE_NAME, 'readonly');
        const store = transaction.objectStore(IPA_STORE_NAME);
        const request = store.get(sentence);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const result: IpaCacheEntry | undefined = request.result;
                if (result) {
                    // Optional: could add TTL logic here based on result.timestamp
                    resolve(result.ipa);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => {
                console.error('Error getting from cache:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error("Failed to access IndexedDB for getting cache", error);
        return null; // Fail gracefully
    }
}

export async function setIpaInCache(sentence: string, ipa: WordIpaPair[]): Promise<void> {
     try {
        const db = await getDb();
        const transaction = db.transaction(IPA_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(IPA_STORE_NAME);
        const entry: IpaCacheEntry = {
            sentence,
            ipa,
            timestamp: Date.now()
        };
        const request = store.put(entry);
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = () => {
                 console.error('Error setting cache:', request.error);
                 reject(request.error);
            };
        });
    } catch (error) {
        console.error("Failed to access IndexedDB for setting cache", error);
        // Fail gracefully
    }
}
