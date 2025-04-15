import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import { AuthProvider } from "./context/AuthContext";
import { OfflineProvider } from "./context/OfflineContext";
import AppRoutes from "./routes";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthProvider>
        <OfflineProvider>
          <AppRoutes />
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <Toaster />
        </OfflineProvider>
      </AuthProvider>
    </Suspense>
  );
}

export default App;
