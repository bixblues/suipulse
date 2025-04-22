import {
  validateStreamConfig,
  validateSnapshotConfig,
  validateAddress,
  validatePermissionLevel,
  validateStreamId,
  validateBatchSize,
  throwIfInvalid
} from '../validation';
import { SuiPulseError, SuiPulseErrorType } from '../types';

describe('Validation Utilities', () => {
  describe('validateStreamConfig', () => {
    it('should validate a correct stream config', () => {
      const config = {
        name: 'Test Stream',
        description: 'Test Description',
        isPublic: true,
        tags: ['test']
      };
      const result = validateStreamConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should fail on empty name', () => {
      const config = {
        name: '',
        description: 'Test Description',
        isPublic: true
      };
      const result = validateStreamConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stream name is required');
    });
  });

  describe('validateSnapshotConfig', () => {
    it('should validate a correct snapshot config', () => {
      const config = {
        metadata: 'Test Metadata'
      };
      const result = validateSnapshotConfig(config);
      expect(result.isValid).toBe(true);
    });

    it('should fail on empty metadata', () => {
      const config = {
        metadata: ''
      };
      const result = validateSnapshotConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Snapshot metadata is required');
    });
  });

  describe('validateAddress', () => {
    it('should validate a correct Sui address', () => {
      const address = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const result = validateAddress(address);
      expect(result.isValid).toBe(true);
    });

    it('should fail on invalid address format', () => {
      const address = 'invalid-address';
      const result = validateAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid Sui address format');
    });
  });

  describe('validatePermissionLevel', () => {
    it('should validate correct permission levels', () => {
      [0, 1, 2].forEach(level => {
        const result = validatePermissionLevel(level);
        expect(result.isValid).toBe(true);
      });
    });

    it('should fail on invalid permission level', () => {
      const result = validatePermissionLevel(3);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Permission level must be 0 (read), 1 (write), or 2 (admin)');
    });
  });

  describe('validateStreamId', () => {
    it('should validate a correct stream ID', () => {
      const id = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const result = validateStreamId(id);
      expect(result.isValid).toBe(true);
    });

    it('should fail on invalid stream ID format', () => {
      const id = 'invalid-id';
      const result = validateStreamId(id);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid stream ID format');
    });
  });

  describe('validateBatchSize', () => {
    it('should validate correct batch sizes', () => {
      const result = validateBatchSize(10);
      expect(result.isValid).toBe(true);
    });

    it('should fail on zero batch size', () => {
      const result = validateBatchSize(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Batch size must be greater than 0');
    });

    it('should fail on exceeding max batch size', () => {
      const result = validateBatchSize(51);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Batch size cannot exceed 50');
    });
  });

  describe('throwIfInvalid', () => {
    it('should not throw on valid result', () => {
      expect(() => {
        throwIfInvalid({ isValid: true });
      }).not.toThrow();
    });

    it('should throw SuiPulseError on invalid result', () => {
      expect(() => {
        throwIfInvalid({
          isValid: false,
          errors: ['Test error']
        });
      }).toThrow(SuiPulseError);
    });
  });
}); 