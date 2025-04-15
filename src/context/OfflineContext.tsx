import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface OfflineContextType {
  isOnline: boolean;
  isInitiallyLoaded: boolean;
  syncData: () => Promise<void>;
  lastSynced: Date | null;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isInitiallyLoaded: false,
  syncData: async () => {},
  lastSynced: null,
});

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitiallyLoaded, setIsInitiallyLoaded] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial loaded state
    setIsInitiallyLoaded(true);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync data when coming back online
  useEffect(() => {
    if (isOnline && isInitiallyLoaded) {
      syncData();
    }
  }, [isOnline, isInitiallyLoaded]);

  const syncData = async () => {
    if (!isOnline) return;

    try {
      // In a real app, this would sync with a backend
      console.log("Syncing data with server...");

      // Mock sync delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update last synced timestamp
      const now = new Date();
      setLastSynced(now);
      localStorage.setItem("lastSynced", now.toISOString());

      console.log("Data synced successfully");
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isInitiallyLoaded,
        syncData,
        lastSynced,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};
