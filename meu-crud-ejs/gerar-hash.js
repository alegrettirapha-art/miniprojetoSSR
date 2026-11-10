import bcrypt from 'bcrypt';

// Senha em texto simples fornecida pelo usuário
const senhaTextoPuro = '123456';

// Custo de processamento (salt rounds): 10 é o valor padrão recomendado
const saltRounds = 10;

// Geração assíncrona do hash
console.log('Gerando hash para a senha:', senhaTextoPuro);

const hashGerado = await bcrypt.hash(senhaTextoPuro, saltRounds);

console.log('--- HASH GERADO COM SUCESSO ---');
console.log(hashGerado);
console.log('-------------------------------');
console.log('Copie o hash acima e cole no comando INSERT SQL do seu script schema.sql.');