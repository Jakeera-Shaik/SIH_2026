-- V2__seed_data.sql - Seed dataset for Indian Agriculture and Market Linkage

-- 1. Seed Crops
INSERT INTO crops (id, name, category, unit) VALUES
(1, 'Onion', 'Vegetables', 'Quintal'),
(2, 'Tomato', 'Vegetables', 'Quintal'),
(3, 'Potato', 'Vegetables', 'Quintal'),
(4, 'Paddy', 'Cereals', 'Quintal'),
(5, 'Cotton', 'Fiber Crops', 'Quintal'),
(6, 'Chilli', 'Spices', 'Quintal')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Crop Varieties
INSERT INTO crop_varieties (id, crop_id, name, description) VALUES
(1, 1, 'Nasik Red', 'High pungency, excellent storage shelf life.'),
(2, 1, 'Garhwa', 'Summer onion crop with dark red color.'),
(3, 2, 'Hybrid Green', 'Firm texture suitable for long distance transport.'),
(4, 2, 'Vaishali', 'High yield table variety.'),
(5, 3, 'Kufri Jyoti', 'Standard round white tuber, multipurpose.'),
(6, 4, 'Basmati 1121', 'Extra long grain aromatic rice.'),
(7, 5, 'Medium Staple', 'Fiber length 24.5mm - 27.0mm.'),
(8, 6, 'Guntur Teja', 'Extra hot red chilli with high SHU capsaicin.')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Markets (APMCs)
INSERT INTO markets (id, name, state, district, address, latitude, longitude, active) VALUES
(1, 'Nashik APMC', 'Maharashtra', 'Nashik', 'Dindori Road, Nashik, MH 422004', 20.0059, 73.7898, TRUE),
(2, 'Pune APMC (Gultekdi)', 'Maharashtra', 'Pune', 'Market Yard, Gultekdi, Pune, MH 411037', 18.4900, 73.8650, TRUE),
(3, 'Mumbai Vashi APMC', 'Maharashtra', 'Thane', 'Sector 19, Vashi, Navi Mumbai, MH 400703', 19.0760, 73.0070, TRUE),
(4, 'Azadpur Mandi', 'Delhi', 'North Delhi', 'Azadpur, New Delhi, DL 110033', 28.7160, 77.1770, TRUE),
(5, 'Kurnool APMC', 'Andhra Pradesh', 'Kurnool', 'Mandi Road, Kurnool, AP 518003', 15.8281, 78.0373, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Demo Users (BCrypt hash for 'password123': $2a$10$wN10rU80qf/Nq4z2u5aH4e7Yy2iBf1x8dC6jKl3nOpQrStUvWxYz.)
-- Precomputed BCrypt $2a$10$wN10rU80qf/Nq4z2u5aH4e7Yy2iBf1x8dC6jKl3nOpQrStUvWxYz. = 'password123'
INSERT INTO users (id, name, email, mobile, password, role, status) VALUES
(1, 'Ramesh Patil', 'ramesh.patil@example.com', '+91 9876543210', '$2a$10$e8.847l0vGg4eQ0v.1v55eG7w.vY51e6O8uG3/K7m1sY4p1G1k3a2', 'ROLE_FARMER', 'ACTIVE'),
(2, 'Anil Gupta', 'procurement@abcfoods.com', '+91 9123456789', '$2a$10$e8.847l0vGg4eQ0v.1v55eG7w.vY51e6O8uG3/K7m1sY4p1G1k3a2', 'ROLE_BUYER', 'ACTIVE'),
(3, 'Admin Officer', 'admin@krishisetu.gov.in', '+91 9000000000', '$2a$10$e8.847l0vGg4eQ0v.1v55eG7w.vY51e6O8uG3/K7m1sY4p1G1k3a2', 'ROLE_ADMIN', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Farmer Profile
INSERT INTO farmer_profiles (id, user_id, state, district, village, latitude, longitude, preferred_language, farm_size) VALUES
(1, 1, 'Maharashtra', 'Nashik', 'Pimplegaon', 20.0059, 73.7898, 'Marathi', '5.5 Acres')
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Buyer Profile
INSERT INTO buyer_profiles (id, user_id, business_name, business_type, state, district, address, latitude, longitude, verified, rating, total_transactions) VALUES
(1, 2, 'ABC Foods & Processing Ltd', 'Food Processor & Distributor', 'Maharashtra', 'Pune', 'Chakan Industrial Area, Pune', 18.7500, 73.8500, TRUE, 4.8, 128)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Farmer Crop
INSERT INTO farmer_crops (id, farmer_id, crop_id, variety_id, quantity, available_date, expected_price, quality, latitude, longitude, status) VALUES
(1, 1, 1, 1, 1000.0, CURRENT_DATE, 3300.0, 'Grade A Premium', 20.0059, 73.7898, 'AVAILABLE'),
(2, 1, 2, 3, 500.0, CURRENT_DATE + INTERVAL '5 days', 2800.0, 'Grade A', 20.0059, 73.7898, 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Buyer Requirements
INSERT INTO buyer_requirements (id, buyer_id, crop_id, variety_id, quantity, minimum_quality, required_date, location, latitude, longitude, offer_price, description, status) VALUES
(1, 1, 1, 1, 5000.0, 'Grade A Premium', CURRENT_DATE + INTERVAL '10 days', 'Sinnar, Nashik', 19.8500, 74.0000, 3400.0, 'Need sorted 45mm+ onions with moisture < 12%', 'ACTIVE'),
(2, 1, 2, 3, 10000.0, 'Grade A', CURRENT_DATE + INTERVAL '14 days', 'Chakan, Pune', 18.7500, 73.8500, 2800.0, 'Hybrid red tomatoes for puree processing', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Market Prices (Historical & Today)
INSERT INTO market_prices (id, market_id, crop_id, variety_id, date, min_price, max_price, modal_price, arrival_quantity, unit, source) VALUES
-- Nashik APMC
(1, 1, 1, 1, CURRENT_DATE - INTERVAL '6 days', 2900, 3100, 2950, 4100, '₹/Quintal', 'AGMARKNET'),
(2, 1, 1, 1, CURRENT_DATE - INTERVAL '4 days', 2950, 3150, 3020, 4250, '₹/Quintal', 'AGMARKNET'),
(3, 1, 1, 1, CURRENT_DATE - INTERVAL '2 days', 3050, 3250, 3120, 4400, '₹/Quintal', 'AGMARKNET'),
(4, 1, 1, 1, CURRENT_DATE, 3000, 3450, 3200, 4500, '₹/Quintal', 'AGMARKNET'),
-- Pune APMC
(5, 2, 1, 1, CURRENT_DATE, 3100, 3500, 3350, 6200, '₹/Quintal', 'AGMARKNET'),
-- Mumbai Vashi APMC
(6, 3, 1, 1, CURRENT_DATE, 3250, 3700, 3500, 9800, '₹/Quintal', 'AGMARKNET'),
-- Azadpur Mandi
(7, 4, 1, 1, CURRENT_DATE, 3400, 3900, 3680, 14000, '₹/Quintal', 'AGMARKNET'),
-- Kurnool APMC
(8, 5, 1, 1, CURRENT_DATE, 2800, 3200, 3000, 3100, '₹/Quintal', 'AGMARKNET')
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Offers
INSERT INTO offers (id, farmer_id, buyer_id, requirement_id, crop_id, quantity, price_per_unit, total_amount, message, status) VALUES
(1, 1, 1, 1, 1, 1000.0, 3400.0, 34000.0, 'Farmer offering 10 quintals Grade A Nasik Red Onion', 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence sequences if necessary
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('farmer_profiles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM farmer_profiles));
SELECT setval('buyer_profiles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM buyer_profiles));
SELECT setval('crops_id_seq', (SELECT COALESCE(MAX(id), 1) FROM crops));
SELECT setval('crop_varieties_id_seq', (SELECT COALESCE(MAX(id), 1) FROM crop_varieties));
SELECT setval('markets_id_seq', (SELECT COALESCE(MAX(id), 1) FROM markets));
SELECT setval('market_prices_id_seq', (SELECT COALESCE(MAX(id), 1) FROM market_prices));
SELECT setval('buyer_requirements_id_seq', (SELECT COALESCE(MAX(id), 1) FROM buyer_requirements));
SELECT setval('farmer_crops_id_seq', (SELECT COALESCE(MAX(id), 1) FROM farmer_crops));
SELECT setval('offers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM offers));
