import axios from 'axios';

const API_BASE_URL = '/api';

// Cấu hình timeout cho axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 giây timeout
  timeoutErrorMessage: 'Không thể kết nối tới server (timeout sau 5 giây)'
});

export type ServerType = 'server1' | 'server2';
export type EndpointType = 'nau' | 'fib';

export interface CodeResponse {
  code?: string;
  call: string;
  executable?: string;
  print_executable?: string;
  version?: string;
  cached?: boolean;
}

export const api = {
  getCode: async (
    _server: ServerType,
    endpoint: EndpointType,
    n: number,
    clientVersion?: string
  ): Promise<CodeResponse> => {
    try {
      const query = clientVersion ? `?client_version=${clientVersion}` : '';
      const response = await axiosInstance.get<CodeResponse>(`/${endpoint}/${n}${query}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Không thể kết nối tới server (timeout sau 5 giây)');
        }
        if (error.code === 'ERR_NETWORK' || !error.response) {
          throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra xem server đang chạy.');
        }
        if (error.response?.status === 502 || error.response?.status === 503) {
          throw new Error('Server đang không khả dụng. Vui lòng thử lại sau.');
        }
        // Ưu tiên đọc .error (Nau), sau đó đến .message (Fib), cuối cùng mới là fallback
        const serverError = error.response?.data?.message || error.response?.data?.error;
        throw new Error(serverError || 'Lỗi khi lấy code từ server');
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