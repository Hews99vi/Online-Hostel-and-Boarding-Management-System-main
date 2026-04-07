const Room = require('../../models/Room');

describe('Room Model Tests', () => {
  describe('Room Creation', () => {
    it('should create a valid room successfully', async () => {
      const validRoom = {
        name: 'Deluxe Suite',
        type: 'Suite',
        price: 299.99,
        capacity: 4,
        size: 650,
        description: 'Luxurious suite with ocean view',
        image: 'https://example.com/image.jpg',
        amenities: ['WiFi', 'TV', 'Mini Bar']
      };

      const room = await Room.create(validRoom);

      expect(room._id).toBeDefined();
      expect(room.name).toBe(validRoom.name);
      expect(room.type).toBe(validRoom.type);
      expect(room.price).toBe(validRoom.price);
      expect(room.capacity).toBe(validRoom.capacity);
      expect(room.available).toBe(true); // Default value
      expect(room.amenities).toEqual(validRoom.amenities);
    });

    it('should fail without required fields', async () => {
      const roomWithoutName = new Room({
        type: 'Suite',
        price: 299.99,
        capacity: 4,
        size: 650,
        description: 'Test',
        image: 'https://example.com/image.jpg'
      });

      let error;
      try {
        await roomWithoutName.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    it('should only accept valid room types', async () => {
      const roomWithInvalidType = new Room({
        name: 'Test Room',
        type: 'Presidential', // Invalid type
        price: 299.99,
        capacity: 4,
        size: 650,
        description: 'Test',
        image: 'https://example.com/image.jpg'
      });

      let error;
      try {
        await roomWithInvalidType.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });

    it('should accept valid room types: Single, Double, Suite', async () => {
      const types = ['Single', 'Double', 'Suite'];

      for (const type of types) {
        const room = await Room.create({
          name: `${type} Room`,
          type: type,
          price: 100,
          capacity: 2,
          size: 300,
          description: 'Test room',
          image: 'https://example.com/image.jpg'
        });

        expect(room.type).toBe(type);
      }
    });

    it('should set default available to true', async () => {
      const room = await Room.create({
        name: 'Test Room',
        type: 'Single',
        price: 100,
        capacity: 2,
        size: 300,
        description: 'Test',
        image: 'https://example.com/image.jpg'
      });

      expect(room.available).toBe(true);
    });

    it('should allow setting available to false', async () => {
      const room = await Room.create({
        name: 'Test Room',
        type: 'Single',
        price: 100,
        capacity: 2,
        size: 300,
        description: 'Test',
        image: 'https://example.com/image.jpg',
        available: false
      });

      expect(room.available).toBe(false);
    });

    it('should initialize empty arrays for amenities and images', async () => {
      const room = await Room.create({
        name: 'Test Room',
        type: 'Single',
        price: 100,
        capacity: 2,
        size: 300,
        description: 'Test',
        image: 'https://example.com/image.jpg'
      });

      expect(room.amenities).toEqual([]);
      expect(room.images).toEqual([]);
    });
  });

  describe('Room Price Validation', () => {
    it('should accept positive price', async () => {
      const room = await Room.create({
        name: 'Test Room',
        type: 'Single',
        price: 150.50,
        capacity: 2,
        size: 300,
        description: 'Test',
        image: 'https://example.com/image.jpg'
      });

      expect(room.price).toBe(150.50);
    });
  });

  describe('Room Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', async () => {
      const room = await Room.create({
        name: 'Test Room',
        type: 'Single',
        price: 100,
        capacity: 2,
        size: 300,
        description: 'Test',
        image: 'https://example.com/image.jpg'
      });

      expect(room.createdAt).toBeDefined();
      expect(room.updatedAt).toBeDefined();
      expect(room.createdAt).toEqual(room.updatedAt);
    });
  });
});
