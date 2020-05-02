import Sequelize, { Model } from 'sequelize';

class Notification extends Model {
  static init(sequelize) {
    super.init(
      {
        content: Sequelize.STRING,
        read: Sequelize.BOOLEAN,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default Notification;
