# DGATE CRM

A role-based Internal CRM (Customer Relationship Management) system built using **React, Vite, Node.js, Express.js, and MySQL**.

This CRM helps managers and employees manage customer leads, follow-ups, employee assignments, and internal workflow.

---

# Features

## Authentication
- JWT-based Login Authentication
- Role-Based Access Control
- Manager Login
- Employee Login
- Protected Routes

## Manager Features
- Dashboard
- Add Leads
- View Total Leads
- Assign Leads to Employees
- Create Employee Accounts
- Employee Management
- Follow-ups
- Reports
- Settings

## Employee Features
- Employee Dashboard
- Add Personal Leads
- View Assigned Leads
- Follow-up Management
- Profile Section

## Lead Management
- Add lead manually
- Assign employee dynamically
- Lead status management
- Special event tracking
- Follow-up tracking
- Dynamic employee dropdown from database

---

# Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React Icons

## Backend
- Node.js
- Express.js
- JWT Authentication
- MySQL2
- dotenv
- cors
- nodemon

## Database
- MySQL (XAMPP/phpMyAdmin)

---

# Installed Packages

## Frontend Packages

Install dependencies/packages

```bash
npm install


npm install axios
npm install react-router-dom
npm install lucide-react
npm install tailwindcss


npm install express
npm install cors
npm install mysql2
npm install jsonwebtoken
npm install dotenv
npm install nodemon


#Database Setup:


db:
CREATE DATABASE crm;


#table(1):users


CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  role VARCHAR(50)
);

#table(2):Leads

CREATE TABLE leads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  website VARCHAR(255),
  special_event VARCHAR(255),
  event_date DATE,
  lead_status VARCHAR(255),
  assigned_employee INT,
  remarks TEXT
);


.env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=crm

JWT_SECRET=crmSecretKey


#Frontend running:-

cd frontend
npm install
npm run dev

#runs on:-
http://localhost:5173




#Backend running:-
cd backend
npm install
npx nodemon server.js


#runs on:-
http://localhost:5000




#API Endpoints

#Login
POST /api/auth/login

#Create Employee
POST /api/employee/create-employee
#Get Employee
GET /api/employee/employees



#Leads
#Add Lead
POST /api/leads/add
#Get All Leads
GET /api/leads/all