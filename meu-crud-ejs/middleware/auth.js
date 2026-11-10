// Middleware para verificar se a sessão do usuário está ativa (Exportação nomeada ES6)
export function verificarAutenticacao(req, res, next) {
    if (req.session && req.session.usuario) {
        // Se a sessão existir, permite que a requisição continue
        return next();
    }
    // Se não estiver logado, redireciona instantaneamente para a tela de login
    res.redirect('/login');
}