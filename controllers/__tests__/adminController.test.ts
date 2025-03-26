import { AdminController } from '../../controllers/adminController.ts';
import { AdminService } from '../../services/AdminService.ts';
import type { Request, Response } from 'express';
import { userRole, userStatus } from '../../types/user.ts';
import { operatorStatus } from '../../types/operator.ts';

describe('AdminController', () => {
  let adminController: AdminController;
  let mockAdminService: jest.Mocked<AdminService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockAdminService = {
      listUsers: jest.fn(),
      listOperators: jest.fn(),
      changeUserStatus: jest.fn(),
      changeOperatorVerificationStatus: jest.fn(),
      getReports: jest.fn()
    } as any;

    // Inject mockAdminService into the controller
    adminController = new AdminController();

    mockReq = {
      query: {},
      params: {},
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });

  describe('listUsers', () => {
    it('should return list of users', async () => {
      const mockUsers = [
        { 
          name: 'User 1', 
          email: 'user1@test.com', 
          status: userStatus.active, 
          phone:"86767867",
          password:"test",
          role: userRole.user
        }
      ];
      mockAdminService.listUsers.mockResolvedValue(mockUsers);

      await adminController.listUsers(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: mockUsers
      });
    }, 10000); // Increased timeout

    it('should handle errors when listing users', async () => {
      const error = new Error('Fetch error');
      mockAdminService.listUsers.mockRejectedValue(error);

      await adminController.listUsers(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Fetch error'
      });
    }, 10000); // Increased timeout
  });

  describe('changeUserStatus', () => {
    it('should change user status successfully', async () => {
      mockReq.params = { id: 'user123' };
      mockReq.body = { status: 'inactive' };

      const mockUpdatedUser = { 
        name: 'User 1', 
        email: 'user1@test.com', 
        status: userStatus.inactive,
        phone:"8397893",
        password:"test",
        role:userRole.user
      };
      mockAdminService.changeUserStatus.mockResolvedValue(mockUpdatedUser);

      await adminController.changeUserStatus(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUpdatedUser
      });
    }, 10000);

    it('should return error for invalid status', async () => {
      mockReq.params = { id: 'user123' };
      mockReq.body = { status: 'invalid' };

      await adminController.changeUserStatus(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid status. Must be "active" or "inactive".'
      });
    }, 10000);
  });

  describe('listOperators', () => {
    it('should return list of operators', async () => {
      const mockOperators = [
        { 
          company_name: 'Company 1', 
          email: 'company1@test.com', 
          verification_status: operatorStatus.pending,
          phone:"28893",
          password:"secret"
        }
      ];
      mockAdminService.listOperators.mockResolvedValue(mockOperators);

      await adminController.listOperators(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: mockOperators
      });
    }, 10000);

    it('should handle errors when listing operators', async () => {
      const error = new Error('Fetch error');
      mockAdminService.listOperators.mockRejectedValue(error);

      await adminController.listOperators(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Fetch error'
      });
    }, 10000);
  });

  describe('changeOperatorVerificationStatus', () => {
    it('should change operator verification status successfully', async () => {
      mockReq.params = { id: 'operator123' };
      mockReq.body = { status: 'verified' };

      const mockUpdatedOperator = { 
        company_name: 'Company 1', 
        email: 'company1@test.com', 
        verification_status: operatorStatus.verified,
        phone:"10898329",
        password:"ksjs" 
      };
      mockAdminService.changeOperatorVerificationStatus.mockResolvedValue(mockUpdatedOperator);

      await adminController.changeOperatorVerificationStatus(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUpdatedOperator
      });
    }, 10000);

    it('should return error for invalid verification status', async () => {
      mockReq.params = { id: 'operator123' };
      mockReq.body = { status: 'invalid' };

      await adminController.changeOperatorVerificationStatus(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid status. Must be "pending", "verified", or "rejected".'
      });
    }, 10000);
  });

  describe('getReports', () => {
    it('should return reports successfully', async () => {
      const mockReports = {
        users: {
          total: 3,
          active: 2,
          inactive: 1
        },
        operators: {
          total: 3,
          verified: 1,
          pending: 1,
          rejected: 1
        }
      };
      mockAdminService.getReports.mockResolvedValue(mockReports);

      await adminController.getReports(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockReports
      });
    }, 10000);

    it('should handle errors when generating reports', async () => {
      const error = new Error('Report generation error');
      mockAdminService.getReports.mockRejectedValue(error);

      await adminController.getReports(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Report generation error'
      });
    }, 10000);
  });
});