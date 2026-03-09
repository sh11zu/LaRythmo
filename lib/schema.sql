-- lib/schema.sql
-- Schéma de base de données pour La Rythmo

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('USER', 'ADMIN', 'SYS_ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. MEMBERS
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    is_account_owner BOOLEAN DEFAULT FALSE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT,
    guardian2_first_name VARCHAR(100),
    guardian2_last_name VARCHAR(100),
    guardian2_gender ENUM('MALE', 'FEMALE', 'OTHER'),
    guardian2_email VARCHAR(255),
    guardian2_phone VARCHAR(20),
    guardian2_address TEXT,
    emergency_contact_first_name VARCHAR(100) NOT NULL,
    emergency_contact_last_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    emergency_link_to_member VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. COURSES
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    teachers VARCHAR(255),
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    single_price DECIMAL(10, 2) NOT NULL,
    max_capacity INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. PACKAGES
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. INSCRIPTIONS
CREATE TABLE IF NOT EXISTS inscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    package_id INT,
    season VARCHAR(9) NOT NULL,
    payment_status ENUM('PENDING', 'PARTIAL', 'PAID') DEFAULT 'PENDING',
    registration_status ENUM('DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'CANCELED') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    UNIQUE KEY unique_season_member (member_id, season),
    INDEX (season)
);

-- 6. INSCRIPTION_COURSES (liaison)
CREATE TABLE IF NOT EXISTS inscription_courses (
    inscription_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (inscription_id, course_id),
    FOREIGN KEY (inscription_id) REFERENCES inscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 7. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    season VARCHAR(9) NOT NULL,
    type ENUM('PHOTO', 'CONTRACT', 'PARENTAL_AUTH', 'MEDICAL_CERTIFICATE', 'SANTE_ATTESTATION', 'OTHER') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'VALIDATED', 'REJECTED') DEFAULT 'PENDING',
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX (season)
);

-- 8. LOGS
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD') NOT NULL,
    table_name VARCHAR(50),
    target_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- ||| ------------ INSÉRER DES DONNÉES DE TEST ------------ ||| --

-- 1. COURS
INSERT INTO courses (name, teachers, day_of_week, start_time, end_time, single_price) VALUES
('Loisir GR TC 7 ans et +', 'Emma DUFOUR', 'MONDAY', '17:30:00', '18:45:00', 150.00),
('Modern''Jazz Enfant', 'Emma DUFOUR', 'TUESDAY', '17:30:00', '18:45:00', 150.00),
('Modern''Jazz Ado', 'Emma DUFOUR', 'TUESDAY', '18:45:00', '20:00:00', 150.00),
('Initiation GR1 6-7-8 ans', 'Emma DUFOUR', 'WEDNESDAY', '09:45:00', '11:00:00', 150.00),
('Initiation GR2 7-8-9 ans', 'Emma DUFOUR', 'WEDNESDAY', '11:00:00', '12:15:00', 150.00),
('Coupe de Provence Mercredi', 'Emma DUFOUR , Marie-Laure DUFOUR', 'WEDNESDAY', '13:15:00', '15:15:00', 150.00),
('Pré-Fédérale 6-10 ans', 'Emma DUFOUR , Marie-Laure DUFOUR', 'WEDNESDAY', '13:15:00', '15:15:00', 150.00),
('Fédérale Mercredi', 'Emma DUFOUR , Marie-Laure DUFOUR', 'WEDNESDAY', '15:15:00', '18:30:00', 150.00),
('Gym Esthétique 1', 'Emma DUFOUR', 'THURSDAY', '17:45:00', '19:00:00', 150.00),
('Gym Esthétique 2 ou Danse', 'Emma DUFOUR', 'THURSDAY', '19:00:00', '20:15:00', 150.00),
('Eveil Parents-Enfants 2/4 ans Grp 1', 'Emma DUFOUR', 'SATURDAY', '10:15:00', '11:00:00', 150.00),
('Baby Gym 3/4/5 ans', 'Emma DUFOUR', 'SATURDAY', '11:00:00', '12:00:00', 150.00),
('Coupe de Provence Samedi', 'Emma DUFOUR , Marie-Laure DUFOUR', 'SATURDAY', '13:30:00', '15:30:00', 150.00),
('Fédérale Samedi', 'Emma DUFOUR , Marie-Laure DUFOUR', 'SATURDAY', '13:30:00', '18:00:00', 150.00);

-- 2. PACKAGES
INSERT INTO packages (name, price, description) VALUES
('Formule Découverte', 200.00, 'Accès à 1 cours au choix pour la saison'),
('Formule Passion', 350.00, 'Accès à 2 cours au choix pour la saison'),
('Formule Intensif', 500.00, 'Accès à tous les cours pour la saison');

-- 3. UTILISATEURS (TEST)
INSERT INTO users (email, password_hash, first_name, last_name, gender, address, phone, role) VALUES

-- Comptes administrateurs
('lando.morritz@isoverflow.xyz', 'Formation13@', 'Lando', 'MORRITZ', 'MALE', '1 Place de l''Hôtel de Ville, 13200 Arles', '0600000001', 'SYS_ADMIN'),
('chantal.masneuf@email.com', 'Formation13@', 'Chantal', 'MASNEUF', 'FEMALE', '3 Résidence les Ferrades, 13310 Saint-Martin-de-Crau', '0603090637', 'ADMIN'),

-- Comptes d'utilisateurs avec enfants inscrits
('martin.dupont@email.com', 'Formation13@', 'Martin', 'DUPONT', 'MALE', '10 Rue de la République, 13200 Arles', '0601020304', 'USER'),
('sophie.martin@email.com', 'Formation13@', 'Sophie', 'MARTIN', 'FEMALE', '25 Avenue des Alyscamps, 13200 Arles', '0611223344', 'USER'),
('lucas.bernard@email.com', 'Formation13@', 'Lucas', 'BERNARD', 'MALE', '5 Place du Forum, 13200 Arles', '0622334455', 'USER'),
('emma.thomas@email.com', 'Formation13@', 'Emma', 'THOMAS', 'FEMALE', '12 Rue Jouvène, 13200 Arles', '0633445566', 'USER'),
('alice.petit@email.com', 'Formation13@', 'Alice', 'PETIT', 'FEMALE', '8 Chemin de Séverin, 13200 Arles', '0644556677', 'ADMIN'),

-- Comptes d'utilisateurs sans enfant inscrit (inscrits pour eux-mêmes)
('hugo.robert@email.com', 'Formation13@', 'Hugo', 'ROBERT', 'MALE', '3 Impasse du Muguet, 13200 Arles', '0655667788', 'USER'),
('chloe.richard@email.com', 'Formation13@', 'Chloé', 'RICHARD', 'FEMALE', '14 Boulevard des Lices, 13200 Arles', '0666778899', 'USER'),
('leo.durand@email.com', 'Formation13@', 'Léo', 'DURAND', 'MALE', '7 Rue Portagnel, 13200 Arles', '0677889900', 'USER'),
('lea.moreau@email.com', 'Formation13@', 'Léa', 'MOREAU', 'FEMALE', '9 Avenue Victor Hugo, 13200 Arles', '0688990011', 'USER'),
('jules.laurent@email.com', 'Formation13@', 'Jules', 'LAURENT', 'MALE', '22 Place de la Roquette, 13200 Arles', '0699001122', 'USER');

-- 4. MEMBRES (TEST)
INSERT INTO members (user_id, is_account_owner, first_name, last_name, gender, birth_date, address, guardian2_first_name, guardian2_last_name, guardian2_gender, 
    guardian2_email, guardian2_phone, guardian2_address, emergency_contact_first_name, emergency_contact_last_name, emergency_contact_phone, emergency_link_to_member) VALUES

-- Adultes inscrits / Enfants inscrits
(2, TRUE, 'Sophie', 'MARTIN', 'FEMALE', '1988-09-22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pierre', 'MARTIN', '0623456789', 'EPOUX'),
(4, TRUE, 'Emma', 'THOMAS', 'FEMALE', '1990-01-14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Paul', 'THOMAS', '0645678901', 'EPOUX'),
(5, TRUE, 'Alice', 'PETIT', 'FEMALE', '1987-04-30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jacques', 'PETIT', '0656789012', 'PERE'),

-- Adultes inscrits / Aucun enfant inscrit
(6, TRUE, 'Hugo', 'ROBERT', 'MALE', '1995-07-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Sarah', 'ROBERT', '0667890123', 'SOEUR'),
(7, TRUE, 'Chloé', 'RICHARD', 'FEMALE', '1998-12-18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Luc', 'RICHARD', '0678901234', 'FRERE'),
(8, TRUE, 'Léo', 'DURAND', 'MALE', '1993-02-25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Claire', 'DURAND', '0689012345', 'MERE'),
(9, TRUE, 'Léa', 'MOREAU', 'FEMALE', '2000-05-10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Marc', 'MOREAU', '0690123456', 'PERE'),
(10, TRUE, 'Jules', 'LAURENT', 'MALE', '1997-08-05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Julie', 'LAURENT', '0601234567', 'EPOUSE'),

-- Enfants inscrits
(1, FALSE, 'Léo', 'DUPONT', 'MALE', '2015-03-12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jeanne', 'DUPONT', '0612345678', 'MERE'),
(1, FALSE, 'Mia', 'DUPONT', 'FEMALE', '2017-08-24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jeanne', 'DUPONT', '0612345678', 'MERE'),
(2, FALSE, 'Tom', 'MARTIN-LEROY', 'MALE', '2014-11-05', '18 Rue du Pont, 13200 Arles', 'Julien', 'LEROY', 'MALE', 'julien.leroy@email.com', '0698765432', '18 Rue du Pont, 13200 Arles', 'Pierre', 'MARTIN', '0623456789', 'GRAND-PERE'),
(2, FALSE, 'Lina', 'MARTIN-LEROY', 'FEMALE', '2016-01-30', '18 Rue du Pont, 13200 Arles', 'Julien', 'LEROY', 'MALE', 'julien.leroy@email.com', '0698765432', '18 Rue du Pont, 13200 Arles', 'Pierre', 'MARTIN', '0623456789', 'GRAND-PERE'),
(3, FALSE, 'Arthur', 'BERNARD', 'MALE', '2013-05-16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Marie', 'BERNARD', '0634567890', 'MERE'),
(3, FALSE, 'Zoé', 'BERNARD', 'FEMALE', '2018-09-11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Marie', 'BERNARD', '0634567890', 'MERE'),
(4, FALSE, 'Louis', 'THOMAS', 'MALE', '2012-12-20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Paul', 'THOMAS', '0645678901', 'PERE'),
(4, FALSE, 'Jade', 'THOMAS', 'FEMALE', '2015-07-07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Paul', 'THOMAS', '0645678901', 'PERE'),
(5, FALSE, 'Gabriel', 'PETIT', 'MALE', '2014-04-04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jacques', 'PETIT', '0656789012', 'GRAND-PERE'),
(5, FALSE, 'Manon', 'PETIT', 'FEMALE', '2016-10-15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jacques', 'PETIT', '0656789012', 'GRAND-PERE');