CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    eth_address VARCHAR(42) NOT NULL UNIQUE, -- Адрес контракта в Ethereum
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount VARCHAR(64) NOT NULL,      -- Сумма в Wei (храним как строку для точности)
    owner_address VARCHAR(42) NOT NULL,      -- Адрес создателя (MetaMask)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);