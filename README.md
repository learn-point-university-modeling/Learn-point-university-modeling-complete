# 📘 LearnPoint - Integrative Project

## 📌 General Description  
**LearnPoint** is an academic management platform designed to handle subjects, reservations, calendars, requests, and users.  
The project was developed as an **integrative academic work**, combining **frontend, backend, and database** into a functional web application.  

---

## 🌍 Deployment  

You can access the deployed project here:  
- 👉 [Backend](link) 

- 👉 [Frontend](Link) 
---

## ⚙️ How to Run the Project  

### 🔹 1. Clone the repository  
```bash
git clone https://github.com/learn-point-university-modeling/Learn-point-university-modeling-complete.git
cd LearnPoint-Integrative-Project
```

### 🔹 2. Backend Setup  
1. Navigate to the backend folder:  
   ```bash
   cd backend
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```
3. Create a `.env` file inside `/backend/` with the following variables:  
   ```env
   DB_HOST=bgw7vukz4hklncoei5kp-mysql.services.clever-cloud.com
   DB_USER=uoeh1youldpytjx5
   DB_PASS=DNs5OwYLvEu3txzApbGg
   DB_NAME=bgw7vukz4hklncoei5kp
   DB_PORT=3306
   PORT=3000
   ```
   ```
   backend/src/config/db.js
   ```
4. Import the SQL database from:  
   ```
   data/LearnPoint.sql
   ```
5. Start the backend server:  
   ```bash
   npm start
   ```

### 🔹 3. Frontend Setup  
1. Navigate to the frontend folder:  
   ```bash
   cd ../frontend
   ```
2. Open `index.html` directly in your browser.  

---

## 🛠️ Technologies Used  


- **Frontend:**  
  - HTML5, CSS3, JavaScript  
  - Lottie Animations (`.json`)  
  - FullCalendar (Core, DayGrid, TimeGrid, Interaction)  

- **Backend:**  
  - Node.js **^v22.17.0**
  - Express.js **^5.1.0**
  - CORS (Cross-Origin Resource Sharing) **^2.8.5**
  - Dotenv (environment variables management) **^17.2.1**
  - Nodemon (development auto-reload) **^3.1.10**

- **Database:**  
  - MySQL  **^8.0.43**
  - mysql2 (Node.js connector for MySQL) **^3.14.3**

- **Others:**  
  - Git & GitHub for version control **^2.43.0**

---

## 🌟 Features  

✅ User management (register, login, CRUD).  
✅ Subjects and course management.  
✅ Reservation and requests system.  
✅ Reviews and comments module.  
✅ Academic calendar integration.  
✅ Relational database model with MySQL.  

---

## 🌟 Users

**Student** 
- sofia.python@student.com | 12345
- anasofiapython@tutor.com | 5423

**Tutor** 
- david.js@tutor.com | 12345
- monica.py@tutor.com | 54235423
- santiago.py@tutor.com | 54235423

---
## Figma

https://www.figma.com/proto/9M29y307KGA6lFVnSLK88w/Prototype?node-id=1-126&t=WT6EucQzL57dxMKy-1

---

## 👥 Team Credits  
- Juan Diego Murillo Rivas.
- Santiago Restrepo Arismendy.
- Vanessa Gomez Lopez.
 
---

## 📌 Version  

- **Version 1.0.0** 