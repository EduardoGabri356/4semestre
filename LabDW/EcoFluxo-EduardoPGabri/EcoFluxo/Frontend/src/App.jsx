import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Ecopontos from "./pages/Ecopontos.jsx";
import Lixeiras from "./pages/Lixeiras.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/ecopontos" element={<Ecopontos />} />
        <Route path="/lixeiras" element={<Lixeiras />} />
      </Route>
      <Route path="*" element={<Navigate to="/ecopontos" replace />} />
    </Routes>
  );
}
