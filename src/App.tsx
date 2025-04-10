import './App.scss'; 
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Header from './components/Header/Header';
import PasswordRecovery from './pages/password-recovery/PasswordRecovery';

function App() {

  const location = useLocation();

  // Simulación simple de login (usualmente revisás localStorage o un contexto)
  const isAuthenticated = !!localStorage.getItem('token');
  
  return (
    <>
      <header>
        {location.pathname !== '/login' && location.pathname !== '/password-recovery' && <Header />}
      </header>
      
      <div className="App">
        <Routes>
          {/* Si el usuario está logueado y entra a /, redirige a /home. Si no, al login */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
          } />
          
          <Route path="/login" element={<Login />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          
          {/* Ruta protegida */}
          <Route path="/home" element={
            isAuthenticated ? <Home /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </>
  );
}

export default App;
