// src/context/ComponenteContext.tsx
import React, { createContext, useState, useContext } from 'react';

interface ComponenteContextProps {
  componenteActivo: string;
  setComponenteActivo: (componente: string) => void;
}

const ComponenteContext = createContext<ComponenteContextProps | undefined>(undefined);

export const ComponenteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [componenteActivo, setComponenteActivo] = useState('agenda-turnos');

  return (
    <ComponenteContext.Provider value={{ componenteActivo, setComponenteActivo }}>
      {children}
    </ComponenteContext.Provider>
  );
};

export const useComponente = (): ComponenteContextProps => {
  const context = useContext(ComponenteContext);
  if (!context) throw new Error('useComponente debe usarse dentro de ComponenteProvider');
  return context;
};
