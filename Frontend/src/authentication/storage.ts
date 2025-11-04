let asyncStorage: any;
try {
  // Dynamically require to avoid build break if dependency isn't installed yet
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  asyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  asyncStorage = null;
}

const memoryStore: Record<string, string | null> = {};

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (asyncStorage) return asyncStorage.getItem(key);
    return key in memoryStore ? (memoryStore[key] as string | null) : null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (asyncStorage) return asyncStorage.setItem(key, value);
    memoryStore[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    if (asyncStorage) return asyncStorage.removeItem(key);
    delete memoryStore[key];
  },
};

export const AUTH_TOKEN_KEY = 'authToken';
export const AUTH_PHONE_KEY = 'authPhone';

