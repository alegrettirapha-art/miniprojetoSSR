-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Criação da tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome_produto VARCHAR(100) NOT NULL,
    peso NUMERIC(10, 2) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL
);

-- =========================================================================================
-- INSERÇÃO DO USUÁRIO INICIAL COM EXPLICAÇÃO DA CLÁUSULA 'ON CONFLICT':
-- 
-- Email: admin@email.com | Senha original: 123456
-- O valor no campo 'senha' é o hash gerado pelo bcrypt na Etapa 2.
--
-- POR QUE USAR 'ON CONFLICT (email) DO NOTHING'?
-- A coluna 'email' possui a restrição UNIQUE. Se executarmos este arquivo schema.sql mais de
-- uma vez no mesmo banco de dados, a tentativa de inserir o mesmo e-mail geraria um erro de
-- chave duplicada, interrompendo a execução do script.
-- A instrução 'ON CONFLICT (email) DO NOTHING' orienta o PostgreSQL a ignorar silenciosamente
-- a inserção caso o e-mail já esteja cadastrado, garantindo a idependencia do script SQL.
-- =========================================================================================
INSERT INTO usuarios (nome, email, senha) 
VALUES ('Administrador', 'admin@email.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQOEg6Lruj3vjPGga31lW')
ON CONFLICT (email) DO NOTHING;