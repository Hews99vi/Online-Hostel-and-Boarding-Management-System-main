const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model Tests', () => {
  describe('User Creation', () => {
    it('should create a valid user successfully', async () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      const user = await User.create(validUser);

      expect(user._id).toBeDefined();
      expect(user.name).toBe(validUser.name);
      expect(user.email).toBe(validUser.email.toLowerCase());
      expect(user.phone).toBe(validUser.phone);
      expect(user.role).toBe('user'); // Default role
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should fail to create user without required fields', async () => {
      const userWithoutEmail = new User({
        name: 'John Doe',
        phone: '+1234567890',
        password: 'password123'
      });

      let error;
      try {
        await userWithoutEmail.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      await User.create(userData);

      let error;
      try {
        await User.create(userData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Duplicate key error
    });

    it('should fail to create user with password less than 6 characters', async () => {
      const userWithShortPassword = new User({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: '12345' // Only 5 characters
      });

      let error;
      try {
        await userWithShortPassword.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should convert email to lowercase', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        phone: '+1234567890',
        password: 'password123'
      });

      expect(user.email).toBe('john@example.com');
    });

    it('should set default values correctly', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      });

      expect(user.role).toBe('user');
      expect(user.profilePicture).toBe('');
      expect(user.address).toBe('');
      expect(user.about).toBe('');
    });

    it('should create admin user when role is specified', async () => {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'admin'
      });

      expect(adminUser.role).toBe('admin');
    });
  });

  describe('User Schema Validation', () => {
    it('should only accept valid roles', async () => {
      const userWithInvalidRole = new User({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'superadmin' // Invalid role
      });

      let error;
      try {
        await userWithInvalidRole.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });

    it('should trim email whitespace', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: '  john@example.com  ',
        phone: '+1234567890',
        password: 'password123'
      });

      expect(user.email).toBe('john@example.com');
    });
  });
});
