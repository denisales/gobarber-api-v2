import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Notification from '../models/Notification';

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    /**
     * Check if provider_id is a provider
     */
    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkIsProvider) {
      throw new Error('You can only create appointments with providers');
    }

    /**
     * Check userId é igual a provider_id
     */
    if (provider_id === user_id) {
      throw new Error('Appointment cannot be with yourself');
    }

    const hourStart = startOfHour(parseISO(date));

    /**
     * Check past dates
     */
    if (isBefore(hourStart, new Date())) {
      throw new Error('Past dates are not permitted');
    }

    /**
     * Check date availability
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      throw new Error('Appointment date is not available');
    }

    const appointments = await Appointment.create({
      user_id,
      provider_id,
      date: hourStart,
    });

    /**
     * Notify appointement provider
     */

    const user = await User.findByPk(user_id);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: ptBr }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user_id: provider_id,
    });

    return appointments;
  }
}

export default new CreateAppointmentService();
