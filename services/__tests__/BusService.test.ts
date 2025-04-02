// @ts-nocheck
import { jest } from '@jest/globals';
import * as busService from '../../services/BusService.ts';
import {Bus as busSchema} from '../../models/busSchema.ts'; 

jest.mock('../../models/busSchema', () => ({
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn()
}));

describe('Bus Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBus', () => {
    const busData = {
      registrationNumber: 'ABC123',
      capacity: 40,
      model: 'Mercedes Benz',
      operatorId: 'op123'
    };
    
    const createdBus = {
      id: '1',
      ...busData
    };

    test('should create a new bus', async () => {
      (busSchema.create as jest.Mock).mockResolvedValue(createdBus);
      
      const result = await busService.createBus(busData);
      
      expect(busSchema.create).toHaveBeenCalledWith(busData);
      expect(result).toEqual(createdBus);
    });

    test('should throw error when creation fails', async () => {
      const error = new Error('Database error');
      (busSchema.create as jest.Mock).mockRejectedValue(error);
      
      await expect(busService.createBus(busData)).rejects.toThrow(error);
      expect(busSchema.create).toHaveBeenCalledWith(busData);
    });
  });

  describe('updateBus', () => {
    const busId = '1';
    const updateData = { capacity: 45 };
    const updatedBus = {
      id: busId,
      registrationNumber: 'ABC123',
      capacity: 45,
      model: 'Mercedes Citaro',
      operatorId: 'op123'
    };

    test('should update and return the bus', async () => {
      (busSchema.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedBus);
      
      const result = await busService.updateBus(busId, updateData);
      
      expect(busSchema.findByIdAndUpdate).toHaveBeenCalledWith(
        busId, 
        updateData, 
        { new: true }
      );
      expect(result).toEqual(updatedBus);
    });

    test('should return null when bus not found', async () => {
      (busSchema.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      
      const result = await busService.updateBus(busId, updateData);
      
      expect(busSchema.findByIdAndUpdate).toHaveBeenCalledWith(
        busId, 
        updateData, 
        { new: true }
      );
      expect(result).toBeNull();
    });

    test('should throw error when update fails', async () => {
      const error = new Error('Database error');
      (busSchema.findByIdAndUpdate as jest.Mock).mockRejectedValue(error);
      await expect(busService.updateBus(busId, updateData)).rejects.toThrow(error);
      expect(busSchema.findByIdAndUpdate).toHaveBeenCalledWith(
        busId, 
        updateData, 
        { new: true }
      );
    });
  });

  describe('deleteBus', () => {
    const busId = '1';
    const deletedBus = {
      id: busId,
      registrationNumber: 'ABC123',
      capacity: 40,
      model: 'Mercedes bus',
      operatorId: 'op123'
    };

    test('should delete and return the bus', async () => {
      (busSchema.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedBus);
      
      const result = await busService.deleteBus(busId);
      
      expect(busSchema.findByIdAndDelete).toHaveBeenCalledWith(busId);
      expect(result).toEqual(deletedBus);
    });

    test('should return null when bus not found', async () => {
      (busSchema.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      
      const result = await busService.deleteBus(busId);
      
      expect(busSchema.findByIdAndDelete).toHaveBeenCalledWith(busId);
      expect(result).toBeNull();
    });

    test('should throw error when deletion fails', async () => {
      const error = new Error('Database error');
      (busSchema.findByIdAndDelete as jest.Mock).mockRejectedValue(error);
      
      await expect(busService.deleteBus(busId)).rejects.toThrow(error);
      expect(busSchema.findByIdAndDelete).toHaveBeenCalledWith(busId);
    });
  });

  describe('getBusesByOperator', () => {
    const operatorId = 'op123';
    const buses = [
      { id: '1', registrationNumber: 'ABC123', operatorId },
      { id: '2', registrationNumber: 'XYZ789', operatorId }
    ];

    test('should return buses for specified operator', async () => {
      (busSchema.find as jest.Mock).mockResolvedValue(buses);
      
      const result = await busService.getBusesByOperator(operatorId);
      
      expect(busSchema.find).toHaveBeenCalledWith({ operatorId });
      expect(result).toEqual(buses);
    });

    test('should return empty array when no buses found', async () => {
      (busSchema.find as jest.Mock).mockResolvedValue([]);
      
      const result = await busService.getBusesByOperator(operatorId);
      
      expect(busSchema.find).toHaveBeenCalledWith({ operatorId });
      expect(result).toEqual([]);
    });

    test('should throw error when fetch fails', async () => {
      const error = new Error('Database error');
      (busSchema.find as jest.Mock).mockRejectedValue(error);
      
      await expect(busService.getBusesByOperator(operatorId)).rejects.toThrow(error);
      expect(busSchema.find).toHaveBeenCalledWith({ operatorId });
    });
  });
});