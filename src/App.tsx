import './App.scss'; 
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Header from './components/HeaderComponent/HeaderComponent';
import PasswordRecovery from './pages/password-recovery/PasswordRecovery';
import AuthService from './services/AuthService';
import NotFound from './pages/not-found/NotFound';
import ResetPassword from './pages/password-recovery/reset-password/ResetPassword';

function App() {

  const location = useLocation();

  const isAuthenticated = AuthService.isAuthenticated();
  
  return (
    <>
      <header>
        {location.pathname !== '/login' && location.pathname !== '/password-recovery' &&
        location.pathname !== '/reset-password'
         && <Header />}
      </header>
      
      <div className="App">
        <Routes>
          <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
         
          <Route path="/login" element={<Login />} />
          <Route path="/cambiar-contraseña" element={<PasswordRecovery />} />
          
          {/* Ruta protegida */}
          <Route path="/home" element={
            isAuthenticated ? <Home /> : <Navigate to="/login" replace />
          } />

          <Route path="*" element={<NotFound />} />
          <Route path="/reset-password" element={<ResetPassword />} />

        </Routes>
      </div>
    </>
  );
}

export default App;
