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
    guardian1_link_to_member VARCHAR(50),
    guardian2_first_name VARCHAR(100),
    guardian2_last_name VARCHAR(100),
    guardian2_gender ENUM('MALE', 'FEMALE', 'OTHER'),
    guardian2_email VARCHAR(255),
    guardian2_phone VARCHAR(20),
    guardian2_address TEXT,
    guardian2_link_to_member VARCHAR(50),
    emergency_contact_first_name VARCHAR(100) NOT NULL,
    emergency_contact_last_name VARCHAR(100) NOT NULL,
    emergency_contact_email VARCHAR(255),
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
    wl TINYINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. PACKAGES


-- 7. INSCRIPTIONS
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

-- 8. INSCRIPTION_COURSES (liaison)
CREATE TABLE IF NOT EXISTS inscription_courses (
    inscription_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (inscription_id, course_id),
    FOREIGN KEY (inscription_id) REFERENCES inscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 9. DOCUMENTS
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

-- 10. LOGS
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
INSERT INTO courses (id, name, teachers, day_of_week, start_time, end_time, single_price, wl) VALUES
(1,  'Loisir GR TC 7 ans et +',             'Emma DUFOUR',                       'MONDAY',    '17:30:00', '18:45:00', 150.00, 0),
(2,  'Modern''Jazz Enfant',                  'Emma DUFOUR',                       'TUESDAY',   '17:30:00', '18:45:00', 150.00, 0),
(3,  'Modern''Jazz Ado',                     'Emma DUFOUR',                       'TUESDAY',   '18:45:00', '20:00:00', 150.00, 0),
(4,  'Initiation GR1 6-7-8 ans',            'Emma DUFOUR',                       'WEDNESDAY', '09:45:00', '11:00:00', 150.00, 0),
(5,  'Initiation GR2 7-8-9 ans',            'Emma DUFOUR',                       'WEDNESDAY', '11:00:00', '12:15:00', 150.00, 0),
(6,  'Coupe de Provence Mercredi',          'Emma DUFOUR , Marie-Laure DUFOUR',  'WEDNESDAY', '13:15:00', '15:15:00', 150.00, 1),
(7,  'Pré-Fédérale 6-10 ans',              'Emma DUFOUR , Marie-Laure DUFOUR',  'WEDNESDAY', '13:15:00', '15:15:00', 150.00, 1),
(8,  'Fédérale Mercredi',                   'Emma DUFOUR , Marie-Laure DUFOUR',  'WEDNESDAY', '15:15:00', '18:30:00', 150.00, 2),
(9,  'Eveil Parents-Enfants 2/4 ans Grp 1', 'Emma DUFOUR',                       'SATURDAY',  '10:15:00', '11:00:00', 150.00, 0),
(10, 'Baby Gym 3/4/5 ans',                  'Emma DUFOUR',                       'SATURDAY',  '11:00:00', '12:00:00', 150.00, 0),
(11, 'Coupe de Provence Samedi',            'Emma DUFOUR , Marie-Laure DUFOUR',  'SATURDAY',  '13:30:00', '15:30:00', 150.00, 1),
(12, 'Fédérale Samedi',                     'Emma DUFOUR , Marie-Laure DUFOUR',  'SATURDAY',  '13:30:00', '18:00:00', 150.00, 2);

-- 2. PACKAGES
INSERT INTO packages (id, name, price, description) VALUES
(1, 'Package Deux Activités Loisir GR et Danse', 270.00, 'Choix de 2 cours parmi les cours Loisir GR et Danse'),
(2, 'Package Forfait GR',                         470.00, 'Les 2 cours de Compétition Fédérale inclus'),
(3, 'Package 4h Compétition Débutante',           340.00, '1 cours du mercredi + cours du samedi Compétition Débutante'),
(4, 'Package Compétition + Loisir',               340.00, '1 cours Compétition Débutante + 1 cours Loisir du mardi');

-- 3. PACKAGE_SLOTS
-- P2LGRD (pkg=1)→slots 1,2 | PFGR (pkg=2)→slots 3,4 | P4CD (pkg=3)→slots 5,6 | PC+L (pkg=4)→slots 7,8
INSERT INTO package_slots (id, package_id, slot_order) VALUES
(1, 1, 1), (2, 1, 2),
(3, 2, 1), (4, 2, 2),
(5, 3, 1), (6, 3, 2),
(7, 4, 1), (8, 4, 2);

-- 4. PACKAGE_SLOT_COURSES
-- slot IDs: P2LGRD→1,2 | PFGR→3,4 | P4CD→5,6 | PC+L→7,8
INSERT INTO package_slot_courses (slot_id, course_id) VALUES
-- P2LGRD : les 2 slots peuvent choisir parmi tous les cours wl=0 (IDs 1-5, 9-10)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 9), (1, 10),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 9), (2, 10),
-- PFGR : slot 1 = Fédérale Mercredi (obligatoire), slot 2 = Fédérale Samedi (obligatoire)
(3, 8),
(4, 12),
-- P4CD : slot 1 = mercredi débutante {6,7}, slot 2 = samedi débutante {11} (obligatoire)
(5, 6), (5, 7),
(6, 11),
-- PC+L : slot 1 = tous wl=1 {6,7,11}, slot 2 = mardi wl=0 {2,3}
(7, 6), (7, 7), (7, 11),
(8, 2), (8, 3);

-- 5. UTILISATEURS (TEST)
INSERT INTO users (email, password_hash, first_name, last_name, gender, address, phone, role) VALUES

-- Comptes administrateurs
-- Mot de passe (tous) : Formation13@
('lando.morritz@isoverflow.xyz', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Lando', 'MORRITZ', 'MALE', '1 Place de l''Hôtel de Ville, 13200 Arles', '0600000001', 'SYS_ADMIN'),
('chantal.masneuf@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Chantal', 'MASNEUF', 'FEMALE', '3 Résidence les Ferrades, 13310 Saint-Martin-de-Crau', '0603090637', 'ADMIN'),

-- Comptes d'utilisateurs avec enfants inscrits
('martin.dupont@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Martin', 'DUPONT', 'MALE', '10 Rue de la République, 13200 Arles', '0601020304', 'USER'),
('sophie.martin@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Sophie', 'MARTIN', 'FEMALE', '25 Avenue des Alyscamps, 13200 Arles', '0611223344', 'USER'),
('lucas.bernard@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Lucas', 'BERNARD', 'MALE', '5 Place du Forum, 13200 Arles', '0622334455', 'USER'),
('emma.thomas@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Emma', 'THOMAS', 'FEMALE', '12 Rue Jouvène, 13200 Arles', '0633445566', 'USER'),
('alice.petit@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Alice', 'PETIT', 'FEMALE', '8 Chemin de Séverin, 13200 Arles', '0644556677', 'ADMIN'),

-- Comptes d'utilisateurs sans enfant inscrit (inscrits pour eux-mêmes)
('hugo.robert@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Hugo', 'ROBERT', 'MALE', '3 Impasse du Muguet, 13200 Arles', '0655667788', 'USER'),
('chloe.richard@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Chloé', 'RICHARD', 'FEMALE', '14 Boulevard des Lices, 13200 Arles', '0666778899', 'USER'),
('leo.durand@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Léo', 'DURAND', 'MALE', '7 Rue Portagnel, 13200 Arles', '0677889900', 'USER'),
('lea.moreau@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Léa', 'MOREAU', 'FEMALE', '9 Avenue Victor Hugo, 13200 Arles', '0688990011', 'USER'),
('jules.laurent@email.com', '$2b$10$OpkWerqnDLRhrvdpeeiqO.dc5AsJnfRfiZnKqhffmMPS3MDDpomXG', 'Jules', 'LAURENT', 'MALE', '22 Place de la Roquette, 13200 Arles', '0699001122', 'USER');

-- 6. MEMBRES (TEST)
INSERT INTO members (user_id, is_account_owner, first_name, last_name, gender, birth_date, address,
    guardian1_link_to_member,
    guardian2_first_name, guardian2_last_name, guardian2_gender, guardian2_email, guardian2_phone, guardian2_address, guardian2_link_to_member,
    emergency_contact_first_name, emergency_contact_last_name, emergency_contact_phone, emergency_link_to_member) VALUES

-- Adulte inscrit pour elle-même (is_account_owner = TRUE)
-- guardian1 = elle-même → lien non applicable (NULL)
(5, TRUE, 'Alice', 'PETIT', 'FEMALE', '1987-04-30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jacques', 'PETIT', '0656789012', 'PERE'),

-- Enfants inscrits
(1, FALSE, 'Léo', 'DUPONT', 'MALE', '2015-03-12', NULL, 'PERE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jeanne', 'DUPONT', '0612345678', 'MERE'),
(1, FALSE, 'Mia', 'DUPONT', 'FEMALE', '2017-08-24', NULL, 'PERE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jeanne', 'DUPONT', '0612345678', 'MERE'),
(2, FALSE, 'Tom', 'MARTIN-LEROY', 'MALE', '2014-11-05', '18 Rue du Pont, 13200 Arles', 'MERE', 'Julien', 'LEROY', 'MALE', 'julien.leroy@email.com', '0698765432', '18 Rue du Pont, 13200 Arles', 'PERE', 'Pierre', 'MARTIN', '0623456789', 'GRAND-PERE'),
(2, FALSE, 'Lina', 'MARTIN-LEROY', 'FEMALE', '2016-01-30', '18 Rue du Pont, 13200 Arles', 'MERE', 'Julien', 'LEROY', 'MALE', 'julien.leroy@email.com', '0698765432', '18 Rue du Pont, 13200 Arles', 'PERE', 'Pierre', 'MARTIN', '0623456789', 'GRAND-PERE'),
(3, FALSE, 'Arthur', 'BERNARD', 'MALE', '2013-05-16', NULL, 'PERE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Marie', 'BERNARD', '0634567890', 'MERE'),
(3, FALSE, 'Zoé', 'BERNARD', 'FEMALE', '2018-09-11', NULL, 'PERE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Marie', 'BERNARD', '0634567890', 'MERE'),
(4, FALSE, 'Louis', 'THOMAS', 'MALE', '2012-12-20', NULL, 'MERE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Paul', 'THOMAS', '0645678901', 'PERE'),
(4, FALSE, 'Jade', 'THOMAS', 'FEMALE', '2015-07-07', NULL, 'MERE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Paul', 'THOMAS', '0645678901', 'PERE'),
(5, FALSE, 'Gabriel', 'PETIT', 'MALE', '2014-04-04', NULL, 'MERE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jacques', 'PETIT', '0656789012', 'GRAND-PERE'),
(5, FALSE, 'Manon', 'PETIT', 'FEMALE', '2016-10-15', NULL, 'MERE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jacques', 'PETIT', '0656789012', 'GRAND-PERE');