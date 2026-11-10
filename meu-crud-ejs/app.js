import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';
import { verificarAutenticacao } from './middleware/auth.js';

// Recriação das variáveis __filename e __dirname no contexto de ES6 Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuração do motor de templates EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares para parsing de dados vindos de formulários HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Configuração de sessão com express-session
app.use(session({
    secret: 'chave_secreta_para_sessao_saep',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// ==========================================
// ROTAS DE AUTENTICAÇÃO (LOGIN / LOGOUT)
// ==========================================

// Rota GET: Exibe a tela de login
app.get('/login', (req, res) => {
    res.render('login', { erro: null });
});

// Rota POST: Processa o login do usuário
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (resultado.rows.length === 0) {
            return res.render('login', { erro: 'Usuário não encontrado.' });
        }

        const usuario = resultado.rows[0];

        // Comparação da senha digitada com o hash salvo no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.render('login', { erro: 'Senha incorreta.' });
        }

        // Armazena as informações do usuário na sessão
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        // Redireciona para a lista de produtos
        res.redirect('/produtos');
    } catch (err) {
        console.error(err);
        res.render('login', { erro: 'Erro interno no servidor ao realizar login.' });
    }
});

// Rota GET: Realiza o logout destruindo a sessão
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ==========================================
// ROTAS DO CRUD DE PRODUTOS (PROTEGIDAS)
// ==========================================

// Rota GET: Lista os produtos com suporte a filtro de busca via Query String (?busca=termo)
app.get('/produtos', verificarAutenticacao, async (req, res) => {
    const busca = req.query.busca || '';

    try {
        let querySql = 'SELECT * FROM produtos ORDER BY id DESC';
        let params = [];

        if (busca) {
            querySql = 'SELECT * FROM produtos WHERE nome_produto ILIKE $1 ORDER BY id DESC';
            params = [`%${busca}%`];
        }

        const resultado = await pool.query(querySql, params);
        res.render('produtos', { 
            produtos: resultado.rows, 
            usuario: req.session.usuario,
            busca: busca 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar produtos.');
    }
});

// Rota GET: Exibe o formulário de cadastro de novo produto
app.get('/produtos/novo', verificarAutenticacao, (req, res) => {
    res.render('novo-produto', { usuario: req.session.usuario });
});

// Rota POST: Insere um novo produto no banco de dados
app.post('/produtos/novo', verificarAutenticacao, async (req, res) => {
    const { nome_produto, peso, preco } = req.body;

    try {
        await pool.query(
            'INSERT INTO produtos (nome_produto, peso, preco) VALUES ($1, $2, $3)',
            [nome_produto, peso, preco]
        );
        res.redirect('/produtos');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao cadastrar produto.');
    }
});

// Rota GET: Exibe o formulário de edição preenchido com os dados do produto selecionado
app.get('/produtos/editar/:id', verificarAutenticacao, async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
        
        if (resultado.rows.length === 0) {
            return res.status(404).send('Produto não encontrado.');
        }

        res.render('editar-produto', { 
            produto: resultado.rows[0], 
            usuario: req.session.usuario 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar produto para edição.');
    }
});

// Rota POST: Atualiza os dados do produto no banco de dados
app.post('/produtos/editar/:id', verificarAutenticacao, async (req, res) => {
    const { id } = req.params;
    const { nome_produto, peso, preco } = req.body;

    try {
        await pool.query(
            'UPDATE produtos SET nome_produto = $1, peso = $2, preco = $3 WHERE id = $4',
            [nome_produto, peso, preco, id]
        );
        res.redirect('/produtos');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar produto.');
    }
});

// Rota GET: Exclui um produto diretamente via link
app.get('/produtos/deletar/:id', verificarAutenticacao, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
        res.redirect('/produtos');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar produto.');
    }
});

// Redirecionamento da raiz '/' para a tela de produtos
app.get('/', (req, res) => {
    res.redirect('/produtos');
});

// Inicialização do servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});