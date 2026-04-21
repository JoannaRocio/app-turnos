## ▶️ Levantar el proyecto en local

### 1. Clonar el repositorio

```bash
git clone https://github.com/JoannaRocio/app-turnos
cd app-turnos
```

---

### 2. Instalar dependencias

```bash
npm install
```

---

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

---

### 4. Ejecutar la aplicación

```bash
npm start
```

Luego abrir en el navegador:

```
http://localhost:3000
```

---

## ⚠️ Requisitos previos

Para que el frontend funcione correctamente:

- El backend debe estar corriendo
- La base de datos debe estar levantada y configurada

La configuración del backend y la base de datos está documentada en otra sección o repositorio.

---

## 📁 Estructura básica

```
/src
  /components
  /pages
  /services
  /styles
  /assets
```

---

## 🧠 Notas

- Se utiliza TypeScript para tipado estático
- Formularios gestionados con React Hook Form
- Consumo de API mediante Axios
- Estilos con Sass
- Componentes UI con React Bootstrap
