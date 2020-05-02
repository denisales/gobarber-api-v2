import { isBefore, subHours } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import CancellationMail from '../jobs/CancellationMail';

class CancelAppointmentService {
  async run({ provider_id, user_id }) {
    const appointment = await Appointment.findOne({
      where: {
        id: provider_id,
        canceled_at: null,
      },
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.user_id !== user_id) {
      throw new Error("You don't have permission to cancel this appointment");
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      throw new Error('You can only cancel appointments 2 hours in advance');
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    CancellationMail.handle({ appointment });

    return appointment;
  }
}

export default new CancelAppointmentService();
