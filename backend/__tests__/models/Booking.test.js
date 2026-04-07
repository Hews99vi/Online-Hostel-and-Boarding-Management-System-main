const mongoose = require('mongoose');
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const Room = require('../../models/Room');

describe('Booking Model Tests', () => {
  let testUser;
  let testRoom;

  beforeEach(async () => {
    // Create test user and room
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123'
    });

    testRoom = await Room.create({
      name: 'Test Room',
      type: 'Single',
      price: 100,
      capacity: 2,
      size: 300,
      description: 'Test room',
      image: 'https://example.com/image.jpg'
    });
  });

  describe('Booking Creation', () => {
    it('should create a valid booking successfully', async () => {
      const checkInDate = new Date('2026-02-15');
      const checkOutDate = new Date('2026-02-18');

      const booking = await Booking.create({
        user: testUser._id,
        room: testRoom._id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guests: 2,
        totalPrice: 300,
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890'
      });

      expect(booking._id).toBeDefined();
      expect(booking.user.toString()).toBe(testUser._id.toString());
      expect(booking.room.toString()).toBe(testRoom._id.toString());
      expect(booking.guests).toBe(2);
      expect(booking.totalPrice).toBe(300);
      expect(booking.status).toBe('pending'); // Default status
    });

    it('should fail without required fields', async () => {
      const bookingWithoutUser = new Booking({
        room: testRoom._id,
        checkInDate: new Date('2026-02-15'),
        checkOutDate: new Date('2026-02-18'),
        guests: 2,
        totalPrice: 300,
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890'
      });

      let error;
      try {
        await bookingWithoutUser.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.user).toBeDefined();
    });

    it('should set default status to pending', async () => {
      const booking = await Booking.create({
        user: testUser._id,
        room: testRoom._id,
        checkInDate: new Date('2026-02-15'),
        checkOutDate: new Date('2026-02-18'),
        guests: 2,
        totalPrice: 300,
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890'
      });

      expect(booking.status).toBe('pending');
    });

    it('should accept valid status values', async () => {
      const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];

      for (const status of statuses) {
        const booking = await Booking.create({
          user: testUser._id,
          room: testRoom._id,
          checkInDate: new Date('2026-02-15'),
          checkOutDate: new Date('2026-02-18'),
          guests: 2,
          totalPrice: 300,
          guestName: 'Test Guest',
          guestEmail: 'guest@example.com',
          guestPhone: '+1234567890',
          status: status
        });

        expect(booking.status).toBe(status);
      }
    });

    it('should fail with invalid status', async () => {
      const bookingWithInvalidStatus = new Booking({
        user: testUser._id,
        room: testRoom._id,
        checkInDate: new Date('2026-02-15'),
        checkOutDate: new Date('2026-02-18'),
        guests: 2,
        totalPrice: 300,
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890',
        status: 'invalid-status'
      });

      let error;
      try {
        await bookingWithInvalidStatus.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });

    it('should enforce minimum guests of 1', async () => {
      const bookingWithZeroGuests = new Booking({
        user: testUser._id,
        room: testRoom._id,
        checkInDate: new Date('2026-02-15'),
        checkOutDate: new Date('2026-02-18'),
        guests: 0,
        totalPrice: 300,
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890'
      });

      let error;
      try {
        await bookingWithZeroGuests.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.guests).toBeDefined();
    });

    it('should set default specialRequests to empty string', async () => {
      const booking = await Booking.create({
        user: testUser._id,
        room: testRoom._id,
        checkInDate: new Date('2026-02-15'),
        checkOutDate: new Date('2026-02-18'),
        guests: 2,
        totalPrice: 300,
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890'
      });

      expect(booking.specialRequests).toBe('');
    });
  });

  describe('Booking References', () => {
    it('should populate user reference', async () => {
      const booking = await Booking.create({
        user: testUser._id,
        room: testRoom._id,
        checkInDate: new Date('2026-02-15'),
        checkOutDate: new Date('2026-02-18'),
        guests: 2,
        totalPrice: 300,
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890'
      });

      const populatedBooking = await Booking.findById(booking._id).populate('user');
      
      expect(populatedBooking.user.name).toBe(testUser.name);
      expect(populatedBooking.user.email).toBe(testUser.email);
    });

    it('should populate room reference', async () => {
      const booking = await Booking.create({
        user: testUser._id,
        room: testRoom._id,
        checkInDate: new Date('2026-02-15'),
        checkOutDate: new Date('2026-02-18'),
        guests: 2,
        totalPrice: 300,
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890'
      });

      const populatedBooking = await Booking.findById(booking._id).populate('room');
      
      expect(populatedBooking.room.name).toBe(testRoom.name);
      expect(populatedBooking.room.type).toBe(testRoom.type);
    });
  });
});
