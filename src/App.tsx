import { MobileShell } from "./components/layout/MobileShell";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
      <MobileShell>
        <AppRoutes />
      </MobileShell>
  );
}
