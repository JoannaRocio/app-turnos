// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HeaderComponent from './components/HeaderComponent/HeaderComponent';
import Home from './pages/home/Home';
import { ComponenteProvider } from './context/ContextComponent';
import { AuthProvider, useAuth } from './context/ContextAuth';
import Login from './pages/login/Login';
import PasswordRecovery from './pages/password-recovery/PasswordRecovery';
import ResetPassword from './pages/password-recovery/reset-password/ResetPassword';
import ProtectedRoute from './routes/ProtectedRoute';
import './App.scss';
import BranchSelector from './pages/branch-selector/BranchSelector';
import AppointmentConfirmation from './pages/appointment-confirmation/AppointmentConfirmation';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // const isBranchSelectorRoute = location.pathname.toLowerCase().includes('/sucursales');
  const isHiddenHeaderRoute =
    location.pathname.toLowerCase().includes('/sucursales') ||
    location.pathname.toLowerCase().includes('/confirmar-turno');

  return (
    <>
      {isAuthenticated && !isHiddenHeaderRoute && <HeaderComponent />}

      <Routes>
        <Route
          path="/Inicio-sesion"
          element={isAuthenticated ? <Navigate to="/Home" /> : <Login />}
        />
        <Route
          path="/Recuperar-contraseña"
          element={isAuthenticated ? <Navigate to="/Home" /> : <PasswordRecovery />}
        />
        <Route
          path="/Cambiar-contrasena"
          element={isAuthenticated ? <Navigate to="/Home" /> : <ResetPassword />}
        />

        <Route path="/Sucursales" element={<BranchSelector />} />

        {/* Ruta protegida por roles */}
        <Route
          path="/Home"
          element={
            <ProtectedRoute allowedRoles={['USUARIO', 'MODERADOR', 'ADMIN']}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route path="/confirmar-turno/:id" element={<AppointmentConfirmation />} />

        <Route
          path="/no-autorizado"
          element={<div>No estás autorizado para ver esta página.</div>}
        />

        <Route path="/" element={<Navigate to={isAuthenticated ? '/Home' : '/Inicio-sesion'} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ComponenteProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </AuthProvider>
    </ComponenteProvider>
  );
}

export default App;
