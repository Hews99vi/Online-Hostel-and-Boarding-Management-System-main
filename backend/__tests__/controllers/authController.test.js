const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../../controllers/authController');
const User = require('../../models/User');

describe('Auth Controller Tests', () => {
  describe('signup', () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      };
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com'
        // Missing phone and password
      };

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All fields are required'
      });
    });

    it('should return 400 if email already exists', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        phone: '+1234567890',
        password: 'password123'
      });

      req.body = {
        name: 'New User',
        email: 'existing@example.com',
        phone: '+0987654321',
        password: 'password123'
      };

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email already exists'
      });
    });

    it('should return 400 if password is less than 6 characters', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: '12345' // Only 5 characters
      };

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password must be at least 6 characters'
      });
    });

    it('should create user, hash password, set cookie, and return success', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      await authController.signup(req, res);

      // Check user was created
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeDefined();
      expect(user.name).toBe('John Doe');

      // Check password is hashed
      const isPasswordHashed = await bcrypt.compare('password123', user.password);
      expect(isPasswordHashed).toBe(true);

      // Check cookie was set
      expect(res.cookie).toHaveBeenCalled();
      const cookieCall = res.cookie.mock.calls[0];
      expect(cookieCall[0]).toBe('jwt-luxestay');

      // Check response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully'
      });
    });
  });

  describe('login', () => {
    let req, res;

    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: hashedPassword
      });

      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      };
    });

    it('should return 400 if user does not exist', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 400 if password is incorrect', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should set cookie and return success on valid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      await authController.login(req, res);

      // Check cookie was set
      expect(res.cookie).toHaveBeenCalled();
      const cookieCall = res.cookie.mock.calls[0];
      expect(cookieCall[0]).toBe('jwt-luxestay');

      // Check response
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged in Successfully'
      });
    });
  });

  describe('logout', () => {
    let req, res;

    beforeEach(() => {
      req = {};
      res = {
        json: jest.fn(),
        clearCookie: jest.fn()
      };
    });

    it('should clear cookie and return success message', async () => {
      await authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('jwt-luxestay');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully'
      });
    });
  });

  describe('checkAuth', () => {
    let req, res;

    beforeEach(() => {
      req = {
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        }
      };
      res = {
        json: jest.fn()
      };
    });

    it('should return the authenticated user', async () => {
      await authController.checkAuth(req, res);

      expect(res.json).toHaveBeenCalledWith(req.user);
    });
  });
});
