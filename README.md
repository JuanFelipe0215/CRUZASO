# CRUDZASO
Este proyecto cumple los puntos del enunciado:
- Registro, login, sesión (LocalStorage)
- Roles (user / admin)
- JSON Server como API falsa
- CRUD de tareas
- User solo ve sus tareas
- Admin ve todas y tiene métricas
- Rutas protegidas por rol

## 1) Requisitos
- Tener Node.js instalado (para usar JSON Server)

## 2) Levantar la API (JSON Server)
En la carpeta del proyecto:

### COMO HACERLO
```bash
npx json-server --watch db.json --port 3000
```

Si te pregunta algo de instalar, acepta.

La API queda en:
- http://localhost:3000/users
- http://localhost:3000/tasks

## 3) Usuarios de prueba
- Admin: juan131@gmail.com / juan123
- User:  j@gmail.com / juan123
- De igual manera tu puedes crear tu propio perfil o los que quieras pero estos ingresaran como usuario.
