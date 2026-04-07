const roomController = require('../../controllers/roomController');
const Room = require('../../models/Room');
const Booking = require('../../models/Booking');
const User = require('../../models/User');

describe('Room Controller Tests', () => {
  let adminUser;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'admin'
    });
  });

  describe('getRooms', () => {
    beforeEach(async () => {
      await Room.create([
        {
          name: 'Deluxe Suite',
          type: 'Suite',
          price: 300,
          capacity: 4,
          size: 650,
          description: 'Luxury suite',
          image: 'https://example.com/1.jpg'
        },
        {
          name: 'Single Room',
          type: 'Single',
          price: 100,
          capacity: 1,
          size: 200,
          description: 'Cozy room',
          image: 'https://example.com/2.jpg',
          available: false
        },
        {
          name: 'Double Room',
          type: 'Double',
          price: 150,
          capacity: 2,
          size: 300,
          description: 'Comfortable room',
          image: 'https://example.com/3.jpg'
        }
      ]);
    });

    it('should return all rooms when no filters applied', async () => {
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await roomController.getRooms(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const rooms = res.json.mock.calls[0][0];
      expect(rooms).toHaveLength(3);
    });

    it('should filter rooms by type', async () => {
      const req = { query: { type: 'Single' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await roomController.getRooms(req, res);

      const rooms = res.json.mock.calls[0][0];
      expect(rooms).toHaveLength(1);
      expect(rooms[0].type).toBe('Single');
    });

    it('should filter rooms by price range', async () => {
      const req = { query: { minPrice: '120', maxPrice: '200' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await roomController.getRooms(req, res);

      const rooms = res.json.mock.calls[0][0];
      expect(rooms).toHaveLength(1);
      expect(rooms[0].price).toBe(150);
    });

    it('should filter rooms by availability', async () => {
      const req = { query: { available: 'true' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await roomController.getRooms(req, res);

      const rooms = res.json.mock.calls[0][0];
      expect(rooms).toHaveLength(2);
      expect(rooms.every(room => room.available)).toBe(true);
    });

    it('should search rooms by name', async () => {
      const req = { query: { q: 'suite' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await roomController.getRooms(req, res);

      const rooms = res.json.mock.calls[0][0];
      expect(rooms).toHaveLength(1);
      expect(rooms[0].name).toContain('Suite');
    });
  });

  describe('createRoom', () => {
    let req, res;

    beforeEach(() => {
      req = {
        user: adminUser,
        body: {
          name: 'New Room',
          type: 'Double',
          price: 200,
          capacity: 2,
          size: 350,
          description: 'Brand new room',
          image: 'https://example.com/new.jpg',
          amenities: ['WiFi', 'TV']
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should return 403 if user is not admin', async () => {
      req.user.role = 'user';

      await roomController.createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized'
      });
    });

    it('should return 400 if required fields are missing', async () => {
      delete req.body.name;

      await roomController.createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for invalid room type', async () => {
      req.body.type = 'Presidential';

      await roomController.createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid room type. Must be Single, Double, or Suite'
      });
    });

    it('should create room successfully', async () => {
      await roomController.createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response.message).toBe('Room created successfully');
      expect(response.room.name).toBe('New Room');
    });
  });

  describe('deleteRoom', () => {
    let room, req, res;

    beforeEach(async () => {
      room = await Room.create({
        name: 'Test Room',
        type: 'Single',
        price: 100,
        capacity: 1,
        size: 200,
        description: 'Test',
        image: 'https://example.com/test.jpg'
      });

      req = {
        user: adminUser,
        params: { id: room._id.toString() }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should return 403 if user is not admin', async () => {
      req.user.role = 'user';

      await roomController.deleteRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if room does not exist', async () => {
      req.params.id = '507f1f77bcf86cd799439011';

      await roomController.deleteRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Room not found'
      });
    });

    it('should return 409 if room has active bookings', async () => {
      const user = await User.create({
        name: 'Guest',
        email: 'guest@example.com',
        phone: '+1234567890',
        password: 'password123'
      });

      await Booking.create({
        user: user._id,
        room: room._id,
        checkInDate: new Date('2026-02-15'),
        checkOutDate: new Date('2026-02-18'),
        guests: 1,
        totalPrice: 300,
        guestName: 'Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890',
        status: 'confirmed'
      });

      await roomController.deleteRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json.mock.calls[0][0].message).toContain('active bookings');
    });

    it('should delete room successfully if no active bookings', async () => {
      await roomController.deleteRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Room deleted successfully'
      });

      const deletedRoom = await Room.findById(room._id);
      expect(deletedRoom).toBeNull();
    });
  });
});
