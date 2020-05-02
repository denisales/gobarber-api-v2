import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const resultPerPage = 20;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      limit: resultPerPage,
      offset: (page - 1) * resultPerPage,
      attributes: ['id', 'date', 'user_id', 'past', 'cancelable'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.status(200).json(appointments);
  }

  async store(req, res) {
    const { date, provider_id } = req.body;

    const appointments = await CreateAppointmentService.run({
      provider_id,
      user_id: req.userId,
      date,
    });

    return res.status(201).json(appointments);
  }

  async delete(req, res) {
    const appointment = await CancelAppointmentService.run({
      provider_id: req.params.id,
      user_id: req.userId,
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
