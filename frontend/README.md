
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

---# DGATE CRM

A role-based Internal CRM (Customer Relationship Management) system built using **React, Vite, Node.js, Express.js, and MySQL**.

This CRM helps managers and employees manage customer leads, employee workflow, follow-ups, lead ownership, and internal workflow.

---

# Features

## Authentication
- JWT-based Login Authentication
- Role-Based Access Control
- Manager Login
- Employee Login
- Protected Routes
- Local Storage Session Handling

---

## Manager Features
- Dashboard
- Add Leads
- View Total Leads
- Delete Leads
- Create Employee Accounts
- Create Manager Accounts
- Employee Management
- Employee Details Page
- Follow-ups
- Reports
- Settings
- Excel / CSV Lead Upload
- Duplicate Lead Detection
- Important Lead Tracking

---

## Employee Features
- Employee Dashboard
- Add Personal Leads
- View Only Own Leads
- Employee Lead Tracking
- Employee Follow-up Management
- Profile Section
- Excel Upload Support
- Personal Lead Ownership

---

## Lead Management
- Add Lead Manually
- Bulk Lead Upload using Excel / CSV
- Lead Status Management
- Lead Source Tracking
- Lead Mode Tracking
- Important Lead Tracking
- Duplicate Lead Restriction
- Dynamic Lead Ownership

---

## Duplicate Protection
CRM automatically prevents duplicate leads using:

- Phone Number
- Email Address
- Company Name + Contact Person

If duplicate lead exists:

```txt
Duplicate Lead Found
Excel Upload Features
Upload .xlsx
Upload .csv
Automatic Data Reading
Duplicate Skip
Instant Lead Insertion
Employee/Manager Lead Ownership

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
npm install nodemon
npm install multer
npm install xlsx


#Database Setup:


db:
CREATE DATABASE new_crm;


#table(1):users


#Manager

CREATE TABLE managers (

  manager_id INT
  PRIMARY KEY AUTO_INCREMENT,

  full_name VARCHAR(255),

  email VARCHAR(255)
  UNIQUE,

  password VARCHAR(255),

  created_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP

);

#Employee Roles

CREATE TABLE employee_roles (

  role_id INT
  PRIMARY KEY AUTO_INCREMENT,

  role_name VARCHAR(255)

);

#Employee Roles

CREATE TABLE employees (

  employee_id INT
  PRIMARY KEY AUTO_INCREMENT,

  manager_id INT,

  role_id INT,

  employee_code
  VARCHAR(50),

  full_name
  VARCHAR(255),

  email
  VARCHAR(255),

  phone
  VARCHAR(20),

  password
  VARCHAR(255),

  department
  VARCHAR(255),

  designation
  VARCHAR(255),

  status
  VARCHAR(50),

  created_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (
    manager_id
  )

  REFERENCES managers(
    manager_id
  ),

  FOREIGN KEY (
    role_id
  )

  REFERENCES employee_roles(
    role_id
  )

);


#Leads
CREATE TABLE leads (

  id INT
  PRIMARY KEY AUTO_INCREMENT,

  company_name
  VARCHAR(255),

  contact_person_name
  VARCHAR(255),

  phone
  VARCHAR(20)
  UNIQUE,

  email
  VARCHAR(255),

  address TEXT,

  website
  VARCHAR(255),

  city
  VARCHAR(255),

  source
  VARCHAR(255),

  lead_mode
  VARCHAR(255),

  lead_status
  VARCHAR(255),

  remarks TEXT,

  important_lead
  BOOLEAN
  DEFAULT FALSE,

  created_by_id
  INT,

  created_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP

);


#FollowUp
CREATE TABLE follow_ups (

    followup_id INT
    PRIMARY KEY AUTO_INCREMENT,

    lead_id INT
    NOT NULL,

    employee_id INT
    NULL,

    contact_date DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    followup_mode ENUM(

        'call',
        'whatsapp',
        'email',
        'meeting',
        'other'

    )
    DEFAULT 'call',

    remarks TEXT,

    next_followup_date
    DATETIME,

    status ENUM(

        'pending',
        'completed',
        'missed'

    )
    DEFAULT 'pending',

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (
      lead_id
    )

    REFERENCES leads(id)

    ON DELETE CASCADE,

    FOREIGN KEY (
      employee_id
    )

    REFERENCES employees(
      employee_id
    )

    ON DELETE SET NULL

);



#Duplicate Restrictions
ALTER TABLE leads
ADD UNIQUE(phone);



.env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=new_crm

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


#Create Manager
POST /api/managers/create


#Leads
#Add Lead
POST /api/leads/add
#Get All Leads
GET /api/leads/all