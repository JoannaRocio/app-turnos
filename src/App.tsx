import './App.scss'; 
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Header from './components/Header/Header';

function App() {

  const location = useLocation();
  
  return (
    <>
      <header>
        {location.pathname !== '/' && <Header />}
      </header>
      
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
