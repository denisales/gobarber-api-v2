import User from '../models/User';
import File from '../models/File';

class UsersController {
  async store(req, res) {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const { id, provider } = await User.create({
      name,
      email,
      password,
      provider: req.body.provider,
    });

    return res.status(201).json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });

      if (emailExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).send({ error: 'Password does not match' });
    }

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.status(200).json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UsersController();
