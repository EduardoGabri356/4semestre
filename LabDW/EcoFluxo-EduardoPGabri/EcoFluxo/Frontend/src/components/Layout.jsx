import { Navigate, Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import { DataProvider } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return (
    <DataProvider>
      <div className="app">
        <Header />
        <main className="app__main">
          <Outlet />
        </main>
      </div>
    </DataProvider>
  );
}
