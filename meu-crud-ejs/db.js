import pg from 'pg';

const { Pool } = pg;

// Ajuste as credenciais conforme a sua instalação local do PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'meu_banco_db',
    password: 'senai',
    port: 5432,
});

export default pool;