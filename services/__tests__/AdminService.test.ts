import { AdminService } from '../../services/AdminService.ts';
import { User } from '../../models/userSchema.ts';
import { Operator } from '../../models/operatorSchema.ts';

jest.mock('../../models/userSchema.ts');
jest.mock('../../models/operatorSchema.ts');

describe('AdminService', () => {
  let adminService: AdminService;

  beforeEach(() => {
    adminService = new AdminService();
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should retrieve users successfully', async () => {
      const mockUsers = [
        { 
          _id: 'user1',
          name: 'User 1', 
          email: 'user1@test.com', 
          status: 'active' 
        },
        { 
          _id: 'user2',
          name: 'User 2', 
          email: 'user2@test.com', 
          status: 'inactive' 
        }
      ];

      // Mock the mongoose find method
      (User.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockUsers)
      });

      const users = await adminService.listUsers(1, 10);
      
      expect(users.length).toBe(2);
      expect(users[0].name).toBe('User 1');
      expect(User.find).toHaveBeenCalled();
    });

    it('should handle errors when retrieving users', async () => {
      (User.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(adminService.listUsers(1, 10)).rejects.toThrow('Error fetching users');
    });
  });

  describe('listOperators', () => {
    it('should retrieve operators successfully', async () => {
      const mockOperators = [
        { 
          _id: 'operator1',
          company_name: 'Company 1', 
          email: 'company1@test.com', 
          verification_status: 'pending' 
        },
        { 
          _id: 'operator2',
          company_name: 'Company 2', 
          email: 'company2@test.com', 
          verification_status: 'verified' 
        }
      ];

      (Operator.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockOperators)
      });

      const operators = await adminService.listOperators(1, 10);
      
      expect(operators.length).toBe(2);
      expect(operators[0].company_name).toBe('Company 1');
      expect(Operator.find).toHaveBeenCalled();
    });

    it('should handle errors when retrieving operators', async () => {
      (Operator.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(adminService.listOperators(1, 10)).rejects.toThrow('Error fetching operators');
    });
  });

  describe('changeUserStatus', () => {
    it('should change user status successfully', async () => {
      const mockUser = { 
        _id: 'user1',
        name: 'Test User', 
        email: 'test@test.com', 
        status: 'inactive' 
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const updatedUser = await adminService.changeUserStatus('user1', 'inactive');
      
      expect(updatedUser?.status).toBe('inactive');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user1', 
        { status: 'inactive' }, 
        { new: true, select: '-password -__v' }
      );
    });

    it('should handle errors when changing user status', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Update error'));

      await expect(adminService.changeUserStatus('user1', 'inactive'))
        .rejects.toThrow('Error changing user status');
    });
  });

  describe('changeOperatorVerificationStatus', () => {
    it('should change operator verification status successfully', async () => {
      const mockOperator = { 
        _id: 'operator1',
        company_name: 'Test Company', 
        email: 'test@company.com', 
        verification_status: 'verified' 
      };

      (Operator.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockOperator);

      const updatedOperator = await adminService.changeOperatorVerificationStatus(
        'operator1', 
        'verified'
      );
      
      expect(updatedOperator?.verification_status).toBe('verified');
      expect(Operator.findByIdAndUpdate).toHaveBeenCalledWith(
        'operator1', 
        { verification_status: 'verified' }, 
        { new: true, select: '-password -__v' }
      );
    });

    it('should handle errors when changing operator verification status', async () => {
      (Operator.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Update error'));

      await expect(adminService.changeOperatorVerificationStatus('operator1', 'verified'))
        .rejects.toThrow('Error changing operator verification status');
    });
  });

  describe('getReports', () => {
    it('should generate reports successfully', async () => {
      (User.countDocuments as jest.Mock)
        .mockImplementation((query?: any) => {
          if (!query) return Promise.resolve(3);
          if (query.status === 'active') return Promise.resolve(2);
          if (query.status === 'inactive') return Promise.resolve(1);
          return Promise.resolve(0);
        });

      (Operator.countDocuments as jest.Mock)
        .mockImplementation((query?: any) => {
          if (!query) return Promise.resolve(3);
          if (query.verification_status === 'verified') return Promise.resolve(1);
          if (query.verification_status === 'pending') return Promise.resolve(1);
          if (query.verification_status === 'rejected') return Promise.resolve(1);
          return Promise.resolve(0);
        });

      const reports = await adminService.getReports();
      
      expect(reports.users.total).toBe(3);
      expect(reports.users.active).toBe(2);
      expect(reports.users.inactive).toBe(1);
      
      expect(reports.operators.total).toBe(3);
      expect(reports.operators.verified).toBe(1);
      expect(reports.operators.pending).toBe(1);
      expect(reports.operators.rejected).toBe(1);
    });

    it('should handle errors when generating reports', async () => {
      (User.countDocuments as jest.Mock).mockRejectedValue(new Error('Report generation error'));

      await expect(adminService.getReports())
        .rejects.toThrow('Error generating reports');
    });
  });
});