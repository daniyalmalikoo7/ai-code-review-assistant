// Create a direct mock for the invoke method
const mockInvoke = jest.fn().mockImplementation(async (messages) => {
  const messageText = messages[messages.length - 1].content;
  return { content: `Mock response for: ${messageText}` };
});

// Set up the mocks before importing the service
jest.mock('@langchain/anthropic', () => {
  return {
    ChatAnthropic: jest.fn().mockImplementation(() => ({
      invoke: mockInvoke
    }))
  };
});

jest.mock('../../src/utils/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}));

// Now import the service (after all mocks are set up)
import * as llmService from '../../src/services/llmService';

describe('LLM Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPrompt', () => {
    it('should send a prompt and return a response', async () => {
      const result = await llmService.sendPrompt('Test prompt');
      expect(result).toContain('Mock response for: Test prompt');
      expect(mockInvoke).toHaveBeenCalled();
    });

    it('should include system prompt when provided', async () => {
      const result = await llmService.sendPrompt('Test prompt', 'System instruction');
      expect(result).toContain('Mock response for: Test prompt');
      expect(mockInvoke).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ content: 'System instruction' }),
          expect.objectContaining({ content: 'Test prompt' })
        ])
      );
    });

    it('should handle errors gracefully', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('API error'));
      await expect(llmService.sendPrompt('Error prompt')).rejects.toThrow('Failed to process prompt');
    });
  });

  describe('executePromptChain', () => {
    it('should execute a chain of prompts', async () => {
      const prompts = ['First prompt', 'Second prompt'];
      
      // Mock sendPrompt directly since we're testing executePromptChain
      const sendPromptSpy = jest.spyOn(llmService, 'sendPrompt')
        .mockImplementation(async (prompt) => `Response to: ${prompt}`);
      
      const result = await llmService.executePromptChain(prompts);
      
      expect(result).toContain('Response to');
      expect(sendPromptSpy).toHaveBeenCalledTimes(prompts.length);
    });
    
    it('should pass results from one step to the next', async () => {
      const prompts = ['First prompt', 'Second prompt'];
      
      // Store what was passed to sendPrompt
      const capturedPrompts: string[] = [];
      
      jest.spyOn(llmService, 'sendPrompt')
        .mockImplementation(async (prompt) => {
          capturedPrompts.push(prompt);
          return `Response to: ${prompt}`;
        });
      
      await llmService.executePromptChain(prompts);
      
      // First prompt should be called as-is
      expect(capturedPrompts[0]).toBe('First prompt');
      
      // Second prompt should include the response from the first
      expect(capturedPrompts[1]).toContain('Previous output: Response to');
    });
    
    it('should handle errors in the chain', async () => {
      const prompts = ['First prompt', 'Second prompt'];
      
      // Make sendPrompt throw on the second call
      let callCount = 0;
      jest.spyOn(llmService, 'sendPrompt')
        .mockImplementation(async () => {
          callCount++;
          if (callCount === 2) {
            throw new Error('Chain error');
          }
          return 'Mock response';
        });
      
      await expect(llmService.executePromptChain(prompts)).rejects.toThrow('Failed to execute prompt chain');
    });
  });

  describe('analyzeCode', () => {
    it('should analyze code in multiple steps', async () => {
      // Mock executePromptChain since we're testing analyzeCode
      const executeChainSpy = jest.spyOn(llmService, 'executePromptChain')
        .mockResolvedValueOnce('Code analysis results');
      
      const code = 'function test() { return true; }';
      const language = 'javascript';
      
      const result = await llmService.analyzeCode(code, language);
      
      expect(result).toBe('Code analysis results');
      
      // Verify executePromptChain was called with the correct parameters
      expect(executeChainSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining('javascript code'),
          expect.any(String),
          expect.any(String)
        ]),
        undefined
      );
    });
    
    it('should handle missing language parameter', async () => {
      // Mock executePromptChain
      jest.spyOn(llmService, 'executePromptChain')
        .mockResolvedValueOnce('Code analysis results');
      
      const code = 'function test() { return true; }';
      
      const result = await llmService.analyzeCode(code);
      
      expect(result).toBe('Code analysis results');
    });
    
    it('should propagate errors from the chain', async () => {
      jest.spyOn(llmService, 'executePromptChain')
        .mockRejectedValueOnce(new Error('Failed to analyze code'));
      
      const code = 'function test() { return true; }';
      await expect(llmService.analyzeCode(code)).rejects.toThrow('Failed to analyze code');
    });
  });
});