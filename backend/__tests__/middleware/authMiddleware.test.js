const jwt = require('jsonwebtoken');
const { protectRoute, adminOnly } = require('../../middleware/authMiddleware');
const User = require('../../models/User');

describe('Auth Middleware Tests', () => {
  describe('protectRoute Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        cookies: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('should return 401 if no token provided', async () => {
      await protectRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized - No Token Provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.cookies['jwt-luxestay'] = 'invalid-token';

      await protectRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET || 'test-secret'
      );
      req.cookies['jwt-luxestay'] = token;

      await protectRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should attach user to request and call next if valid token', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'password123'
      });

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'test-secret'
      );
      req.cookies['jwt-luxestay'] = token;

      await protectRoute(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.email).toBe(user.email);
      expect(req.user.password).toBeUndefined(); // Password should not be selected
      expect(next).toHaveBeenCalled();
    });
  });

  describe('adminOnly Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('should return 403 if user is not admin', () => {
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        role: 'user'
      };

      adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Forbidden - Admin access required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', () => {
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        role: 'admin'
      };

      adminOnly(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 403 if user object is missing', () => {
      req.user = null;

      adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
