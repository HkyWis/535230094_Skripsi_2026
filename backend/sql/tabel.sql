CREATE TABLE role (
    role_id VARCHAR(50) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    role_id VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id)
        REFERENCES role(role_id)
);

CREATE TABLE customer (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    no_telepon VARCHAR(30) NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jenis_laptop (
    laptop_id VARCHAR(50) PRIMARY KEY,
    laptop_name VARCHAR(150) NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jenis_service (
    jenis_service_id VARCHAR(50) PRIMARY KEY,
    jenis_service VARCHAR(50) NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service (
    service_id VARCHAR(50) PRIMARY KEY,

    user_id VARCHAR(50),
    customer_id VARCHAR(50) NOT NULL,
    laptop_id VARCHAR(50) NOT NULL,
    jenis_service_id VARCHAR(50) NOT NULL,

    nomor_tiket_service VARCHAR(100) NOT NULL UNIQUE,
    tanggal_masuk DATE NOT NULL,

    laptop_sn varchar(100),
    status_garansi VARCHAR(20) NOT NULL,
    status_service VARCHAR(30) NOT NULL,

    solusi TEXT,
    kategori_kerusakan VARCHAR(150),
    harga INTEGER,
    estimasi_hari INTEGER,
    tanggal_selesai DATE,

    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_service_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id),

    CONSTRAINT fk_service_laptop
        FOREIGN KEY (laptop_id)
        REFERENCES jenis_laptop(laptop_id),

    CONSTRAINT fk_service_jenis
        FOREIGN KEY (jenis_service_id)
        REFERENCES jenis_service(jenis_service_id)
);

CREATE TABLE keluhan (
    keluhan_id VARCHAR(50) PRIMARY KEY,
    service_id VARCHAR(50) NOT NULL,

    keluhan TEXT NOT NULL,
    jumlah_keluhan INTEGER NOT NULL,

    keluhan_lcd BOOLEAN DEFAULT FALSE,
    keluhan_keyboard BOOLEAN DEFAULT FALSE,
    keluhan_charger BOOLEAN DEFAULT FALSE,
    keluhan_baterai BOOLEAN DEFAULT FALSE,
    keluhan_engsel BOOLEAN DEFAULT FALSE,
    keluhan_motherboard BOOLEAN DEFAULT FALSE,
    keluhan_storage BOOLEAN DEFAULT FALSE,
    keluhan_memory BOOLEAN DEFAULT FALSE,
    keluhan_booting BOOLEAN DEFAULT FALSE,
    keluhan_kipas BOOLEAN DEFAULT FALSE,
    keluhan_port BOOLEAN DEFAULT FALSE,
    keluhan_software_os BOOLEAN DEFAULT FALSE,
    keluhan_password BOOLEAN DEFAULT FALSE,
    keluhan_touchpad BOOLEAN DEFAULT FALSE,
    keluhan_speaker BOOLEAN DEFAULT FALSE,
    keluhan_part BOOLEAN DEFAULT FALSE,
    keluhan_kamera BOOLEAN DEFAULT FALSE,
    keluhan_power BOOLEAN DEFAULT FALSE,

    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_keluhan_service
        FOREIGN KEY (service_id)
        REFERENCES service(service_id)
        ON DELETE CASCADE
);

INSERT INTO jenis_service (jenis_service_id, jenis_service)
VALUES
    ('JS001', 'ZSC'),
    ('JS002', 'Partner'),
    ('JS003', 'Walkin'),
    ('JS004', 'Onsite');

INSERT INTO role (role_id, role_name)
VALUES
    ('R001', 'Super Admin'),
    ('R002', 'Admin');

INSERT INTO users (user_id, role_id, username, password)
VALUES (
    'U001',
    'R001',
    'Administrator',
    crypt('admin123', gen_salt('bf'))
)
ON CONFLICT (user_id) DO NOTHING;