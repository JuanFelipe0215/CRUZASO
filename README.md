# CRUDZASO
## Juan Felipe Cardona Rios
## Clan: McCarthy

This project fulfills the requirements outlined in the statement:
- Registration, login, session (LocalStorage)
- Roles (user / admin)
- JSON Server as a mock API
- CRUD operations for tasks
- User only sees their own tasks
- Admin sees all tasks and has access to metrics
- Routes protected by role

## 1) Requirements
- Node.js must be installed (to use JSON Server)

## 2) Setting up the API (JSON Server)
In the project folder:

### HOW TO DO IT
```bash
npm i json-server
npx json-server db.json
```

If it asks you to install anything, accept.


The API is located at:
- http://localhost:3000/users
- http://localhost:3000/tasks

## 3) Test Users
- Admin: juan131@gmail.com / juan123
- User: j@gmail.com / juan123
- You can also create your own profile or as many as you want, but these will log in as users.