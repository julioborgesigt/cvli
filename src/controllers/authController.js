// src/controllers/authController.js
const asyncHandler = require('express-async-handler'); // 1. Importe o asyncHandler
const { User, AllowedEmail } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 2. "Embrulhe" a função com asyncHandler e remova o try...catch
exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Verifica se o e-mail está na lista de permitidos
  const isAllowed = await AllowedEmail.findOne({ where: { email } });
  if (!isAllowed) {
    res.status(403); // Apenas defina o status do erro
    throw new Error('Este e-mail não tem permissão para se cadastrar.'); // E lance o erro
  }

  // 2. Verifica se o e-mail já foi cadastrado
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    res.status(409);
    throw new Error('Este e-mail já está em uso.');
  }

  // 3. Cria o usuário (o hook no modelo vai cuidar da senha)
  const newUser = await User.create({ email, password });

  res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: newUser.id });
});


exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  const isMatch = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !isMatch) {
    res.status(401);
    throw new Error('Credenciais inválidas.');
  }

  const payload = { userId: user.id, email: user.email };
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  const userResponse = user.toJSON();
  delete userResponse.password;

  res.status(200).json({
    message: 'Login bem-sucedido!',
    token: token,
    user: userResponse
  });
});


exports.completeProfile = asyncHandler(async (req, res) => {
  const { newPassword, responsavelCadastro } = req.body;
  const userId = req.user.id; 

  if (!newPassword || !responsavelCadastro) {
    res.status(400);
    throw new Error('Nova senha e nome do responsável são obrigatórios.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await User.update(
    {
      password: hashedPassword,
      responsavelCadastro: responsavelCadastro,
      isFirstLogin: false
    },
    {
      where: { id: userId }
    }
  );

  res.status(200).json({ message: 'Cadastro finalizado com sucesso!' });
});