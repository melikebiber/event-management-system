const sequelize = require('../common/database');
const defineEvent = require('../common/models/Event');
const defineUser = require('../common/models/User');
const defineCategory = require('../common/models/Category');
const defineLocation = require('../common/models/Location');

const Event = defineEvent(sequelize);
const User = defineUser(sequelize);
const Category = defineCategory(sequelize);
const Location = defineLocation(sequelize);

// İlişkiler
Event.belongsTo(User, {
  foreignKey: 'organizer_id',
  as: 'organizer'
});

Event.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Event.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location'
});

// Tüm etkinlikleri listeler
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['user_id', 'name', 'surname', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'category_name']
        },
        {
          model: Location,
          as: 'location',
          attributes: [
            'location_id',
            'location_name',
            'city',
            'district'
          ]
        }
      ],
      order: [
        ['event_date', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    return res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ID değerine göre tek etkinlik getirir
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['user_id', 'name', 'surname', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'category_name']
        },
        {
          model: Location,
          as: 'location',
          attributes: [
            'location_id',
            'location_name',
            'address',
            'city',
            'district',
            'capacity'
          ]
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Yeni etkinlik oluşturur
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      capacity,
      status,
      organizer_id,
      category_id,
      location_id
    } = req.body;

    if (!title || !event_date || !organizer_id) {
      return res.status(400).json({
        success: false,
        message:
          'title, event_date ve organizer_id alanları zorunludur.'
      });
    }

    if (capacity !== undefined && capacity !== null && capacity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Kapasite negatif olamaz.'
      });
    }

    const organizer = await User.findByPk(organizer_id);

    if (!organizer) {
      return res.status(400).json({
        success: false,
        message: 'Belirtilen organizer_id için kullanıcı bulunamadı.'
      });
    }

    if (category_id !== undefined && category_id !== null) {
      const category = await Category.findByPk(category_id);

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Belirtilen category_id için kategori bulunamadı.'
        });
      }
    }

    if (location_id !== undefined && location_id !== null) {
      const location = await Location.findByPk(location_id);

      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Belirtilen location_id için konum bulunamadı.'
        });
      }
    }

    if (start_time && end_time && start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'Bitiş saati başlangıç saatinden sonra olmalıdır.'
      });
    }

    const event = await Event.create({
      title,
      description: description || null,
      event_date,
      start_time: start_time || null,
      end_time: end_time || null,
      capacity: capacity ?? null,
      status: status || 'active',
      organizer_id,
      category_id: category_id ?? null,
      location_id: location_id ?? null
    });

    return res.status(201).json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu.',
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// Etkinliği günceller
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      capacity,
      status,
      organizer_id,
      category_id,
      location_id
    } = req.body;

    if (capacity !== undefined && capacity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Kapasite negatif olamaz.'
      });
    }

    if (start_time && end_time && start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'Bitiş saati başlangıç saatinden sonra olmalıdır.'
      });
    }

    if (organizer_id !== undefined) {
      const organizer = await User.findByPk(organizer_id);

      if (!organizer) {
        return res.status(400).json({
          success: false,
          message: 'Belirtilen organizer_id için kullanıcı bulunamadı.'
        });
      }
    }

    if (category_id !== undefined && category_id !== null) {
      const category = await Category.findByPk(category_id);

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Belirtilen category_id için kategori bulunamadı.'
        });
      }
    }

    if (location_id !== undefined && location_id !== null) {
      const location = await Location.findByPk(location_id);

      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Belirtilen location_id için konum bulunamadı.'
        });
      }
    }

    await event.update({
      title: title ?? event.title,
      description: description ?? event.description,
      event_date: event_date ?? event.event_date,
      start_time: start_time ?? event.start_time,
      end_time: end_time ?? event.end_time,
      capacity: capacity ?? event.capacity,
      status: status ?? event.status,
      organizer_id: organizer_id ?? event.organizer_id,
      category_id: category_id ?? event.category_id,
      location_id: location_id ?? event.location_id
    });

    return res.status(200).json({
      success: true,
      message: 'Etkinlik başarıyla güncellendi.',
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Etkinliği siler
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    await event.destroy();

    return res.status(200).json({
      success: true,
      message: 'Etkinlik başarıyla silindi.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};