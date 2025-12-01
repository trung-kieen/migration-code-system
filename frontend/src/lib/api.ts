import axios from 'axios';

const API_BASE_URL = '/api';

export type ServerType = 'server1' | 'server2';
export type EndpointType = 'nau' | 'fib';

export interface CodeResponse {
  code: string;
  call: string;
  executable?: string;
  print_executable?: string;
}

export const api = {
  getCode: async (
    _server: ServerType,
    endpoint: EndpointType,
    n: number
  ): Promise<CodeResponse> => {
    try {
      const response = await axios.get<CodeResponse>(`${API_BASE_URL}/${endpoint}/${n}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch code from server');
      }
      throw error;
    }
  },

  executeCode: (code: string, call: string): string[] => {
    const capturedOutput: string[] = [];
    const originalConsoleLog = console.log;

    console.log = (...args: unknown[]): void => {
      const output = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      capturedOutput.push(output);
      originalConsoleLog(...args);
    };

    try {
      // Strip TypeScript type annotations for browser execution
      const jsCode = code
        .replace(/:\s*number/g, '')
        .replace(/:\s*string/g, '')
        .replace(/:\s*boolean/g, '')
        .replace(/:\s*any/g, '');
      
      const executableCode = `${jsCode}\nreturn ${call};`;
      const executeFunction = new Function(executableCode);
      const result = executeFunction();

      if (result !== undefined) {
        capturedOutput.push(String(result));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Code execution error:', errorMessage);
      capturedOutput.push(`Execution Error: ${errorMessage}`);
    } finally {
      console.log = originalConsoleLog;
    }

    return capturedOutput;
  }
};