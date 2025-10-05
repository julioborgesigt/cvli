// src/controllers/userController.js

// @desc    Obter perfil do usuário logado
// @route   GET /api/users/profile
// @access  Privado
exports.getUserProfile = async (req, res) => {
  // O middleware já encontrou o usuário e o anexou em req.user
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(404).json({ message: 'Usuário não encontrado.' });
  }
};

exports.updateUserProfile = async (req, res) => {
  // O middleware já nos deu o usuário em req.user
  const user = req.user;

  if (user) {
    // Pega os dados do corpo da requisição
    const { nomeDelegacia, responsavelCadastro, cidadeId, seccionalId } = req.body;

    // Atualiza os campos do usuário
    user.nomeDelegacia = nomeDelegacia || user.nomeDelegacia;
    user.responsavelCadastro = responsavelCadastro || user.responsavelCadastro;
    user.cidadeId = cidadeId || user.cidadeId;
    user.seccionalId = seccionalId || user.seccionalId;

    // Salva o usuário atualizado no banco
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } else {
    res.status(404).json({ message: 'Usuário não encontrado.' });
  }
};