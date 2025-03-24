import { UserAuthService } from '../UserAuthService.ts';
import { User } from '../../../models/userSchema.ts';
import * as authUtils from '../../../utils/authUtils.ts';

// Mock dependencies
jest.mock('../../../models/userSchema');
jest.mock('../../../utils/authUtils');

describe('UserAuthService', () => {
  let userAuthService: UserAuthService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    userAuthService = new UserAuthService();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'passenger'
      };
      
      const mockUser = {
        _id: 'user123',
        ...userData,
        save: jest.fn().mockResolvedValue(true)
      };
      
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (authUtils.signJwt as unknown as jest.Mock).mockReturnValue('mockToken');
      
      // Act
      const result = await userAuthService.register(userData);
      
      // Assert
      expect(authUtils.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(User).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: 'hashedPassword',
        role: userData.role,
        status: 'active'
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(authUtils.signJwt).toHaveBeenCalledWith('user123', 'user');
      expect(result).toEqual({
        success: true,
        message: 'user registered successfully',
        token: 'mockToken',
        statusCode: 201
      });
    });
    
    it('should return error when required fields are missing', async () => {
      // Arrange
      const incompleteData = {
        name: 'Test User',
        email: 'test@example.com',
        password:"test"
        // Missing phone, password, role
      };
      
      // Act
      const result = await userAuthService.register(incompleteData);
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Name, email, phone, password, and role are required',
        statusCode: 400
      });
      expect(User).not.toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'passenger'
      };
      
      const mockError = new Error('Database error');
      const mockUser = {
        save: jest.fn().mockRejectedValue(mockError)
      };
      
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      
      // Act
      const result = await userAuthService.register(userData);
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Database error',
        statusCode: 500
      });
    });
  });
  
  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      const mockUser = {
        _id: 'user123',
        email,
        password: 'hashedPassword'
      };
      
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (authUtils.signJwt as unknown as jest.Mock).mockReturnValue('mockToken');
      
      // Act
      const result = await userAuthService.login(email, password);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(authUtils.comparePassword).toHaveBeenCalledWith(password, 'hashedPassword');
      expect(authUtils.signJwt).toHaveBeenCalledWith('user123', 'user');
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        token: 'mockToken',
        statusCode: 200
      });
    });
    
    it('should return error when email is missing', async () => {
      // Act
      const result = await userAuthService.login('', 'password123');
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Email and password are required',
        statusCode: 400
      });
      expect(User.findOne).not.toHaveBeenCalled();
    });
    
    it('should return error when user is not found', async () => {
      // Arrange
      User.findOne = jest.fn().mockResolvedValue(null);
      
      // Act
      const result = await userAuthService.login('nonexistent@example.com', 'password123');
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: 'No user with the given email found',
        statusCode: 401
      });
      expect(authUtils.comparePassword).not.toHaveBeenCalled();
    });
    
    it('should return error when password is incorrect', async () => {
      // Arrange
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword'
      };
      
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(false);
      
      // Act
      const result = await userAuthService.login('test@example.com', 'wrongpassword');
      
      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Invalid credentials',
        statusCode: 401
      });
      expect(authUtils.signJwt).not.toHaveBeenCalled();
    });
  });
});
