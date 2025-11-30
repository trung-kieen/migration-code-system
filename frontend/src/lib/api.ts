import axios from 'axios';

const SERVER1_URL = 'http://localhost:8080';
const SERVER2_URL = 'http://localhost:8080';

export type ServerType = 'server1' | 'server2';
export type EndpointType = 'nau' | 'fib';

export interface CodeResponse {
  code: string;
  call: string;
  print_executable?: string;  
}

export const api = {
  getCode: async (_server: ServerType, _endpoint: EndpointType, n: number): Promise<CodeResponse> => {
    const response = await axios.get<CodeResponse>(`/api/fib/${n}`);
    return response.data;
  },
  executeCode: (code: string, call: string): string[] => {
    const capturedOutput: string[] = [];
    const originalLog = console.log;
    
    console.log = (...args: any[]) => {
      capturedOutput.push(args.join(' '));
      originalLog(...args);
    };

    try {
      eval(code + call);
    } finally {
      console.log = originalLog;
    }

    return capturedOutput;
  }
}