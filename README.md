1. in database

ALTER TABLE employees
ADD employee_code VARCHAR(20);

ALTER TABLE managers
ADD phone VARCHAR(15);

ALTER TABLE managers
ADD designation VARCHAR(100);

ALTER TABLE managers
ADD department VARCHAR(100);

ALTER TABLE managers
ADD status VARCHAR(20);

 ALTER TABLE managers
ADD manager_code VARCHAR(20);

ALTER TABLE managers
ADD UNIQUE(manager_code);

