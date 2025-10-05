// gerarHash.js
const bcrypt = require('bcrypt');

const novaSenha = 'senhaforte1234'; // <-- COLOQUE SUA NOVA SENHA AQUI

bcrypt.hash(novaSenha, 10, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar hash:', err);
    return;
  }
  console.log('Seu novo hash é:');
  console.log(hash);
});