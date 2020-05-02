import Notification from '../models/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Only provider can load notifications' });
    }

    const notifications = await Notification.findAll({
      where: { user_id: req.userId },
      limit: 20,
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(401).json({ error: 'Notification not found' });
    }

    notification.read = true;

    await notification.save();

    return res.status(200).json(notification);
  }
}

export default new NotificationController();
