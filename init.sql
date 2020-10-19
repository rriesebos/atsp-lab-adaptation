DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    surname VARCHAR,
    name VARCHAR,
    password VARCHAR,
    is_admin BOOLEAN,
    balance DECIMAL
);

DROP TABLE IF EXISTS transactions;
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    from_user_id SERIAL,
    to_user_id SERIAL,
    amount DECIMAL,
    reference VARCHAR
);

INSERT INTO users 
    (surname, name, password, is_admin, balance)
VALUES
    ('Alice', 'Adams', 'Mantsje', FALSE, 1000),
    ('Bob', 'Baker', 'Spazzy', FALSE, 1001),
    ('Carol', 'Campbell', 'ccdev', FALSE, 10000000),
    ('Dan', 'Davis', 'dandavis', FALSE, 1234),
    ('Eric', 'Evans', 'very_secure_password', TRUE, 100000);


INSERT INTO transactions
    (from_user_id, to_user_id, amount, reference)
VALUES
    (1, 2, 1, 'Thanks Bob!'),
    (2, 3, 1, 'Thanks Carol!'),
    (3, 4, 1, 'Thanks Dan!'),
    (4, 5, 1, 'Thanks Eric!'),
    (5, 1, 1, 'Thanks Alice!');