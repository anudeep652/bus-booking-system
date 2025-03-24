import { Request, Response } from 'express';
import { registerUser, loginUser } from '../../../controllers/userController.ts';
import { AuthServiceFactory } from '../../../services/auth/AuthServiceFactory.ts';
import type { IAuthService } from '../../../types/index.ts';

// Mock dependencies
jest.mock('../../../services/auth/AuthServiceFactory');

describe('userController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockAuthService: Partial<IAuthService>;
  
  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn()
    };
    
    (AuthServiceFactory.createAuthService as jest.Mock).mockReturnValue(mockAuthService);
  });
  
  describe('registerUser', () => {
    it('should call auth service and return result', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'passenger'
      };
      
      mockRequest.body = userData;
      
      const authResult = {
        success: true,
        message: 'User registered successfully',
        token: 'mockToken',
        statusCode: 201
      };
      
      (mockAuthService.register as jest.Mock).mockResolvedValue(authResult);
      
      // Act
      await registerUser(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith('user');
      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        token: 'mockToken'
      });
    });
  });
  
  describe('loginUser', () => {
    it('should call auth service and return result', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      mockRequest.body = loginData;
      
      const authResult = {
        success: true,
        message: 'Login successful',
        token: 'mockToken',
        statusCode: 200
      };
      
      (mockAuthService.login as jest.Mock).mockResolvedValue(authResult);
      
      // Act
      await loginUser(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith('user');
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginData.email, 
        loginData.password
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'mockToken'
      });
    });
  });
});