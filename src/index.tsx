import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom'; // Importar Router
import { DataProvider } from './context/DataContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error(
    "No se encontró el elemento con id 'root'. Asegúrate de que esté definido en el archivo HTML."
  );
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </React.StrictMode>
);
