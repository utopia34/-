CREATE TABLE statuses (
id INT PRIMARY KEY,
code VARCHAR(50),
name VARCHAR(100)
);

CREATE TABLE clients (
id INT PRIMARY KEY,
full_name VARCHAR(255),
phone VARCHAR(20)
);

CREATE TABLE employees (
id INT PRIMARY KEY,
full_name VARCHAR(255),
position VARCHAR(100)
);

CREATE TABLE orders (
id INT PRIMARY KEY,
client_id INT,
employee_id INT,
device_name VARCHAR(255),
status_id INT,
price INT,
master_comment TEXT,
FOREIGN KEY (client_id) REFERENCES clients(id),
FOREIGN KEY (employee_id) REFERENCES employees(id),
FOREIGN KEY (status_id) REFERENCES statuses(id)
);

CREATE TABLE order_services (
id INT PRIMARY KEY,
order_id INT,
service_name VARCHAR(255),
service_price INT,
FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE feedback_requests (
id INT PRIMARY KEY,
client_name VARCHAR(255),
client_phone VARCHAR(20),
problem_description TEXT
);

CREATE TABLE reviews (
id INT PRIMARY KEY,
author_name VARCHAR(100),
rating INT,
text TEXT
);

INSERT INTO statuses VALUES (1, 'ready', '🟢 ГОТОВ К ВЫДАЧЕ');
INSERT INTO clients VALUES (1, 'Алексей Петров', '79991234567');
INSERT INTO employees VALUES (1, 'Иванов А.Д.', 'Старший инженер');
INSERT INTO orders VALUES (1254, 1, 1, 'Ноутбук ASUS VivoBook 15', 1, 2500, 'Ремонт успешно завершен, заменена система охлаждения.');