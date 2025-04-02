// @ts-nocheck
import { Request, Response } from 'express';
import * as busController from '../../controllers/busController.ts';
import * as busService from '../../services/BusService.ts';
import { jest } from '@jest/globals';

jest.mock('../../services/BusService');

describe('Bus Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any = {};

  beforeEach(() => {
    responseObject = {};
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBus', () => {
    const busData = { 
      registrationNumber: 'ABC123', 
      capacity: 40, 
      model: 'Mercedes Citaro' 
    };
    const newBus = { 
      id: '1', 
      ...busData 
    };

    test('should create a new bus and return 201 status', async () => {
      mockRequest = {
        body: busData
      };
      jest.spyOn(busService, 'createBus').mockResolvedValue(newBus);

      await busController.createBus(mockRequest as Request, mockResponse as Response);

      expect(busService.createBus).toHaveBeenCalledWith(busData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newBus);
    });

    test('should return 500 status when service throws error', async () => {
      mockRequest = {
        body: busData
      };
      const error = new Error('Database error');
      jest.spyOn(busService, 'createBus').mockRejectedValue(error);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await busController.createBus(mockRequest as Request, mockResponse as Response);

      expect(busService.createBus).toHaveBeenCalledWith(busData);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to create bus.' });
      expect(console.error).toHaveBeenCalledWith('Error creating bus:', error);
    });
  });

  describe('updateBus', () => {
    const busId = '1';
    const updateData = { capacity: 45 };
    const updatedBus = { 
      id: busId, 
      registrationNumber: 'ABC123', 
      capacity: 45, 
      model: 'Mercedes Citaro' 
    };

    test('should update bus and return 200 status', async () => {
      mockRequest = {
        params: { id: busId },
        body: updateData
      };
      jest.spyOn(busService, 'updateBus').mockResolvedValue(updatedBus);

      await busController.updateBus(mockRequest as Request, mockResponse as Response);

      expect(busService.updateBus).toHaveBeenCalledWith(busId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedBus);
    });

    test('should return 404 when bus not found', async () => {
      mockRequest = {
        params: { id: busId },
        body: updateData
      };
      jest.spyOn(busService, 'updateBus').mockResolvedValue(null);

      await busController.updateBus(mockRequest as Request, mockResponse as Response);

      expect(busService.updateBus).toHaveBeenCalledWith(busId, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Bus not found.' });
    });

    test('should return 500 status when service throws error', async () => {
      mockRequest = {
        params: { id: busId },
        body: updateData
      };
      const error = new Error('Database error');
      jest.spyOn(busService, 'updateBus').mockRejectedValue(error);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await busController.updateBus(mockRequest as Request, mockResponse as Response);

      expect(busService.updateBus).toHaveBeenCalledWith(busId, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to update bus.' });
      expect(console.error).toHaveBeenCalledWith('Error updating bus:', error);
    });
  });

  describe('deleteBus', () => {
    const busId = '1';
    const deletedBus = { id: busId };

    test('should delete bus and return success message', async () => {
      mockRequest = {
        params: { id: busId }
      };
      jest.spyOn(busService, 'deleteBus').mockResolvedValue(deletedBus);

      await busController.deleteBus(mockRequest as Request, mockResponse as Response);

      expect(busService.deleteBus).toHaveBeenCalledWith(busId);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Bus deleted successfully.' });
    });

    test('should return 404 when bus not found', async () => {
      mockRequest = {
        params: { id: busId }
      };
      jest.spyOn(busService, 'deleteBus').mockResolvedValue(null);

      await busController.deleteBus(mockRequest as Request, mockResponse as Response);

      expect(busService.deleteBus).toHaveBeenCalledWith(busId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Bus not found.' });
    });

    test('should return 500 status when service throws error', async () => {
      mockRequest = {
        params: { id: busId }
      };
      const error = new Error('Database error');
      jest.spyOn(busService, 'deleteBus').mockRejectedValue(error);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await busController.deleteBus(mockRequest as Request, mockResponse as Response);

      expect(busService.deleteBus).toHaveBeenCalledWith(busId);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to delete bus.' });
      expect(console.error).toHaveBeenCalledWith('Error deleting bus:', error);
    });
  });

  describe('getBusesByOperator', () => {
    const operatorId = 'op123';
    const buses = [
      { id: '1', registrationNumber: 'ABC123', operatorId },
      { id: '2', registrationNumber: 'XYZ789', operatorId }
    ];

    test('should return buses for specified operator', async () => {
      mockRequest = {
        query: { operator_id: operatorId }
      };
      jest.spyOn(busService, 'getBusesByOperator').mockResolvedValue(buses);

      await busController.getBusesByOperator(mockRequest as Request, mockResponse as Response);

      expect(busService.getBusesByOperator).toHaveBeenCalledWith(operatorId);
      expect(mockResponse.json).toHaveBeenCalledWith(buses);
    });

    test('should return 400 when operator_id is missing', async () => {
      mockRequest = {
        query: {}
      };

      await busController.getBusesByOperator(mockRequest as Request, mockResponse as Response);

      expect(busService.getBusesByOperator).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Operator ID is required.' });
    });

    test('should return 500 status when service throws error', async () => {
      mockRequest = {
        query: { operator_id: operatorId }
      };
      const error = new Error('Database error');
      jest.spyOn(busService, 'getBusesByOperator').mockRejectedValue(error);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await busController.getBusesByOperator(mockRequest as Request, mockResponse as Response);

      expect(busService.getBusesByOperator).toHaveBeenCalledWith(operatorId);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to fetch buses.' });
      expect(console.error).toHaveBeenCalledWith('Error fetching buses:', error);
    });
  });
});