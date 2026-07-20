const sequelize = require('../common/database');
const defineTicket = require('../common/models/Ticket');
const defineEvent = require('../common/models/Event');

const Ticket = defineTicket(sequelize);
const Event = defineEvent(sequelize);

Ticket.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

// Tüm biletleri listeler
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['event_id', 'title', 'event_date']
        }
      ],
      order: [['ticket_id', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Yeni bilet türü oluşturur
exports.createTicket = async (req, res) => {
  try {
    const {
      event_id,
      ticket_type,
      total_quantity,
      available_quantity
    } = req.body;

    if (
      !event_id ||
      !ticket_type ||
      total_quantity === undefined ||
      available_quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'event_id, ticket_type, total_quantity ve available_quantity zorunludur.'
      });
    }

    if (total_quantity < 0 || available_quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Bilet miktarları negatif olamaz.'
      });
    }

    if (available_quantity > total_quantity) {
      return res.status(400).json({
        success: false,
        message:
          'Mevcut bilet sayısı toplam bilet sayısından fazla olamaz.'
      });
    }

    const event = await Event.findByPk(event_id);

    if (!event) {
      return res.status(400).json({
        success: false,
        message: 'Belirtilen event_id için etkinlik bulunamadı.'
      });
    }

    const ticket = await Ticket.create({
      event_id,
      ticket_type,
      total_quantity,
      available_quantity
    });

    return res.status(201).json({
      success: true,
      message: 'Bilet türü başarıyla oluşturuldu.',
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// ID değerine göre bilet getirir
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['event_id', 'title', 'event_date']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Bilet bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Bilet bilgilerini günceller
exports.updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Bilet bulunamadı.'
      });
    }

    const {
      event_id,
      ticket_type,
      total_quantity,
      available_quantity
    } = req.body;

    if (event_id !== undefined) {
      const event = await Event.findByPk(event_id);

      if (!event) {
        return res.status(400).json({
          success: false,
          message: 'Belirtilen etkinlik bulunamadı.'
        });
      }
    }

    const newTotal = total_quantity ?? ticket.total_quantity;
    const newAvailable =
      available_quantity ?? ticket.available_quantity;

    if (newTotal < 0 || newAvailable < 0) {
      return res.status(400).json({
        success: false,
        message: 'Bilet miktarları negatif olamaz.'
      });
    }

    if (newAvailable > newTotal) {
      return res.status(400).json({
        success: false,
        message:
          'Mevcut bilet sayısı toplam bilet sayısından fazla olamaz.'
      });
    }

    await ticket.update({
      event_id: event_id ?? ticket.event_id,
      ticket_type: ticket_type ?? ticket.ticket_type,
      total_quantity: newTotal,
      available_quantity: newAvailable
    });

    return res.status(200).json({
      success: true,
      message: 'Bilet başarıyla güncellendi.',
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Bileti siler
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Bilet bulunamadı.'
      });
    }

    await ticket.destroy();

    return res.status(200).json({
      success: true,
      message: 'Bilet başarıyla silindi.'
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        success: false,
        message:
          'Bu bilete ait kayıtlar bulunduğu için bilet silinemez.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};