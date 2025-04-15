import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent/HeaderComponent";
import Home from "./pages/home/Home";
import { ComponenteProvider } from "./context/ContextComponent";
import { AuthProvider, useAuth } from "./context/ContextAuth";
import Login from "./pages/login/Login";
import PasswordRecovery from "./pages/password-recovery/PasswordRecovery";
import ResetPassword from "./pages/password-recovery/reset-password/ResetPassword";
import './App.scss';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
    <div>
      {isAuthenticated && <HeaderComponent />}

      <Routes>
        <Route path="/Inicio-sesion" element={isAuthenticated ? <Navigate to="/Home"/> : <Login />} />
        <Route path="/Recuperar-contraseña" element={<PasswordRecovery />} />
        <Route path="/Cambiar-contrasena" element={<ResetPassword />} />
        <Route path="/Home" element={isAuthenticated ? <Home /> : <Navigate to="/Inicio-sesion" replace />} />

        <Route path="/" element={<Navigate to={isAuthenticated ? "/Home" : "/Inicio-sesion"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <ComponenteProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ComponenteProvider>
  );
}

export default App;
