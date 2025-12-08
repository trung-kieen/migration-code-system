'use client';
import React, { useState } from 'react';
import { Server, Monitor, ArrowRight, Play, Code2, Clock, Activity, CheckCircle, Terminal, Network, Zap, AlertCircle, XCircle } from 'lucide-react';
import { api } from '../lib/api';

type ServerType = 'server1' | 'server2';
type EndpointType = 'nau' | 'fib';
type LogType = 'info' | 'success' | 'error';

interface LogItem {
  message: string;
  type: LogType;
  time: string;
}

interface HistoryItem {
  id: number;
  server: string;
  endpoint: string;
  n: number;
  serverTime: string;
  clientTime: string;
  timestamp: string;
  totalNumbers: number;
  serverInfo: string;
}

const serverConfig = {
  server1: {
    name: 'NAU Server',
    port: '3002',
    ip: 'nau-server',
    color: 'cyan',
    description: 'Máy chủ đếm số'
  },
  server2: {
    name: 'Fibonacci Server',
    port: '3001',
    ip: 'fib-server',
    color: 'orange',
    description: 'Máy chủ Fibonacci'
  }
};

export default function DistributedCodeMigration() {
  const [n, setN] = useState<string>('10');
  const [selectedServer, setSelectedServer] = useState<ServerType>('server1');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointType>('nau');
  const [serverCode, setServerCode] = useState('');
  const [executionResult, setExecutionResult] = useState('');
  const [processingLog, setProcessingLog] = useState<LogItem[]>([]);
  const [serverTime, setServerTime] = useState<string>('0');
  const [clientTime, setClientTime] = useState<string>('0');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [routingInfo, setRoutingInfo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const addLog = (message: string, type: LogType = 'info') => {
    setProcessingLog(prev => [
      ...prev,
      { message, type, time: new Date().toLocaleTimeString() }
    ]);
  };

  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  const executeCode = (code: string, call: string): string[] => {
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
      const executableCode = `${code}\nreturn ${call};`;
      const executeFunction = new Function(executableCode);
      const result = executeFunction();

      if (result !== undefined) {
        capturedOutput.push(String(result));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      capturedOutput.push(`Execution Error: ${errorMessage}`);
    } finally {
      console.log = originalConsoleLog;
    }

    return capturedOutput;
  };

  const runMigration = async () => {
    if (!n || isNaN(Number(n)) || parseInt(n) < 0) {
      alert('Vui lòng nhập số nguyên >= 0');
      return;
    }

    setIsRunning(true);
    setProcessingLog([]);
    setServerCode('');
    setExecutionResult('');
    setCurrentStep('');
    setRoutingInfo('');
    setErrorMessage('');
    setShowErrorModal(false);

    const config = serverConfig[selectedServer];

    try {
      // Step 1: Code Retrieval
      setCurrentStep('step1');
      const routeInfo = `Cân Bằng Tải (nginx:80) → /${selectedEndpoint}/${n} → ${config.ip}:${config.port}`;
      setRoutingInfo(routeInfo);
      addLog(`🔄 Định tuyến request qua Load Balancer`, 'info');
      addLog(`📍 Đích: ${config.name} (${config.ip}:${config.port})`, 'info');
      await delay(500);

      const startServer = performance.now();
      const data = await api.getCode(selectedServer, selectedEndpoint, parseInt(n));
      const endServer = performance.now();
      setServerTime((endServer - startServer).toFixed(2));

      addLog(`✅ Đã lấy code thành công từ ${config.name}`, 'success');
      setServerCode(data.code);
      await delay(800);

      // Step 2: Code Execution
      setCurrentStep('step2');
      addLog(`⚙️ Đang thực thi code trên client...`, 'info');
      await delay(500);

      const startClient = performance.now();
      const capturedOutput = executeCode(data.code, data.call);
      const endClient = performance.now();
      setClientTime((endClient - startClient).toFixed(2));

      addLog(`✅ Thực thi code hoàn tất`, 'success');
      await delay(500);

      // Step 3: Result Display
      setCurrentStep('step3');
      addLog(`📊 Hiển thị kết quả từ endpoint /${selectedEndpoint}`, 'info');
      setExecutionResult(capturedOutput.join('\n'));
      await delay(500);

      // Step 4: Complete
      setCurrentStep('step4');
      addLog(`🎉 Migration hoàn thành! Server: ${(endServer - startServer).toFixed(2)}ms + Client: ${(endClient - startClient).toFixed(2)}ms`, 'success');

      setHistory(prev => [{
        id: Date.now(),
        server: config.name,
        endpoint: selectedEndpoint,
        n: parseInt(n),
        serverTime: (endServer - startServer).toFixed(2),
        clientTime: (endClient - startClient).toFixed(2),
        timestamp: new Date().toLocaleTimeString(),
        totalNumbers: parseInt(n) + 1,
        serverInfo: `${config.ip}:${config.port}`
      }, ...prev]);

    } catch (error) {
      if (error instanceof Error) {
        const errorMsg = error.message;
        addLog(`❌ Lỗi: ${errorMsg}`, 'error');
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        setExecutionResult(`Lỗi: ${errorMsg}`);
        setCurrentStep('');
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border-2 border-red-500 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-500/20">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <XCircle className="text-red-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-red-400 mb-2">Không thể kết nối tới Server</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-yellow-400" size={16} />
                <span className="text-xs font-semibold text-yellow-400">Nguyên nhân có thể:</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1 ml-6 list-disc">
                <li>Server đang không chạy hoặc đã bị dừng</li>
                <li>Load balancer không hoạt động</li>
                <li>Cổng {serverConfig[selectedServer].port} không khả dụng</li>
                <li>Mạng bị gián đoạn hoặc timeout</li>
              </ul>
            </div>

            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-semibold transition-all"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Hệ Thống Code Migration Phân Tán
          </h1>
          <p className="text-slate-300 text-lg">Kiến trúc cân bằng tải với thực thi code động</p>
        </div>

        {/* System Architecture with Load Balancer */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-slate-700/50">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {/* Server 1 */}
            <button
              onClick={() => !isRunning && setSelectedServer('server1')}
              disabled={isRunning}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedServer === 'server1'
                  ? 'border-cyan-400 bg-cyan-900/20 shadow-lg shadow-cyan-500/30 scale-105'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Server size={40} className={selectedServer === 'server1' ? 'text-cyan-400' : 'text-slate-400'} />
                <div className="text-center">
                  <div className="font-bold text-lg">{serverConfig.server1.name}</div>
                  <div className="text-xs text-slate-400">{serverConfig.server1.ip}</div>
                  <div className="text-xs text-slate-500">Port {serverConfig.server1.port}</div>
                </div>
              </div>
            </button>

            <ArrowRight className="text-slate-500" size={32} />

            {/* Load Balancer */}
            <div className="p-6 rounded-2xl border-2 border-blue-400 bg-blue-900/20 shadow-lg shadow-blue-500/30">
              <div className="flex flex-col items-center gap-3">
                <Network size={40} className="text-blue-400" />
                <div className="text-center">
                  <div className="font-bold text-lg">Cân Bằng Tải</div>
                  <div className="text-xs text-slate-400">nginx:80</div>
                  <div className="text-xs text-slate-500">Cổng 8080</div>
                </div>
              </div>
            </div>

            <ArrowRight className="text-slate-500" size={32} />

            {/* Client */}
            <div className="p-6 rounded-2xl border-2 border-purple-400 bg-purple-900/20 shadow-lg shadow-purple-500/30">
              <div className="flex flex-col items-center gap-3">
                <Monitor size={40} className="text-purple-400" />
                <div className="text-center">
                  <div className="font-bold text-lg">Client</div>
                  <div className="text-xs text-slate-400">Trình duyệt</div>
                  <div className="text-xs text-slate-500">Ứng dụng Next.js</div>
                </div>
              </div>
            </div>

            <ArrowRight className="text-slate-500 rotate-180" size={32} />

            {/* Server 2 */}
            <button
              onClick={() => !isRunning && setSelectedServer('server2')}
              disabled={isRunning}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedServer === 'server2'
                  ? 'border-orange-400 bg-orange-900/20 shadow-lg shadow-orange-500/30 scale-105'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Server size={40} className={selectedServer === 'server2' ? 'text-orange-400' : 'text-slate-400'} />
                <div className="text-center">
                  <div className="font-bold text-lg">{serverConfig.server2.name}</div>
                  <div className="text-xs text-slate-400">{serverConfig.server2.ip}</div>
                  <div className="text-xs text-slate-500">Port {serverConfig.server2.port}</div>
                </div>
              </div>
            </button>
          </div>

          {/* Routing Information */}
          {routingInfo && (
            <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Zap size={16} />
                <span className="text-xs font-semibold">Tuyến đường đang hoạt động:</span>
              </div>
              <div className="text-sm font-mono text-slate-300">{routingInfo}</div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Chọn Endpoint
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedEndpoint('nau');
                    setSelectedServer('server1');
                  }}
                  disabled={isRunning}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    selectedEndpoint === 'nau'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  /nau
                </button>
                <button
                  onClick={() => {
                    setSelectedEndpoint('fib');
                    setSelectedServer('server2');
                  }}
                  disabled={isRunning}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    selectedEndpoint === 'fib'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  /fib
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Nhập giá trị N (số nguyên ≥ 0)
              </label>
              <input
                type="number"
                value={n}
                onChange={(e) => setN(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-mono text-lg"
                placeholder="Ví dụ: 10"
                min="0"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={runMigration}
                disabled={isRunning}
                className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg"
              >
                <Play size={22} />
                {isRunning ? 'Đang xử lý...' : 'Thực thi Migration'}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Steps Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Step 1: Code Retrieval */}
          <div className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${
            currentStep === 'step1' ? 'border-cyan-400 shadow-lg shadow-cyan-500/30' : 'border-slate-700/50'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-bold text-lg">Giai đoạn Lấy Code</h3>
                <p className="text-xs text-slate-400">Server tạo code có thể thực thi</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              {errorMessage && !serverCode ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <XCircle className="text-red-400 mb-3" size={32} />
                  <p className="text-red-400 text-sm font-semibold mb-2">Không thể lấy code từ server</p>
                  <p className="text-slate-500 text-xs">Vui lòng kiểm tra kết nối và thử lại</p>
                </div>
              ) : serverCode ? (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <Code2 size={16} />
                    <span className="text-xs font-semibold">Code đã sinh:</span>
                  </div>
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{serverCode}</pre>
                </div>
              ) : (
                <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                  Đang chờ phản hồi từ server...
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Code Execution */}
          <div className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${
            currentStep === 'step2' ? 'border-blue-400 shadow-lg shadow-blue-500/30' : 'border-slate-700/50'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-bold text-lg">Giai đoạn Thực Thi</h3>
                <p className="text-xs text-slate-400">Chạy code trên client</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 min-h-[200px]">
              {isRunning && currentStep === 'step2' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-3 text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold">Đang thực thi trên trình duyệt...</span>
                  </div>
                </div>
              ) : executionResult ? (
                <div className="text-green-400 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} />
                    <span className="font-semibold">Thực thi thành công!</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} />
                    <span>Thời gian: {clientTime}ms</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                  Đang chờ thực thi...
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Output Rendering */}
          <div className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${
            currentStep === 'step3' ? 'border-purple-400 shadow-lg shadow-purple-500/30' : 'border-slate-700/50'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-bold text-lg">Giai đoạn Hiển Thị Kết Quả</h3>
                <p className="text-xs text-slate-400">Xuất kết quả tính toán</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              {executionResult ? (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <Terminal size={16} />
                    <span className="text-xs font-semibold">Kết quả Console:</span>
                  </div>
                  <pre className="text-sm text-green-400 font-mono leading-relaxed">{executionResult}</pre>
                </div>
              ) : (
                <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                  Đang chờ kết quả...
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Process Monitoring */}
          <div className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${
            currentStep === 'step4' ? 'border-green-400 shadow-lg shadow-green-500/30' : 'border-slate-700/50'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-bold text-lg">Giám Sát Quá Trình</h3>
                <p className="text-xs text-slate-400">Log chi tiết thời gian thực</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              {processingLog.length > 0 ? (
                <div className="space-y-2">
                  {processingLog.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <span className="text-slate-500 shrink-0">{log.time}</span>
                      <span className={`${
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'error' ? 'text-red-400' : 'text-slate-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                  Đang chờ bắt đầu...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-6 border border-cyan-700/50">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Server size={20} className="text-cyan-400" />
              Thời Gian Phản Hồi Server
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-cyan-400">{serverTime}</span>
              <span className="text-slate-400">ms</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">Sinh code & truyền tải</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-700/50">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Monitor size={20} className="text-purple-400" />
              Thời Gian Thực Thi Client
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-purple-400">{clientTime}</span>
              <span className="text-slate-400">ms</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">Thời gian tính toán</div>
          </div>
        </div>

        {/* Execution History */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-blue-400" />
            <h3 className="font-bold text-lg">Lịch Sử Thực Thi</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-slate-500 text-center py-8">Chưa có lịch sử thực thi</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="text-green-400" size={20} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400">{item.server}</span>
                        <span className="text-xs text-slate-500">({item.serverInfo})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.endpoint === 'nau' ? 'bg-blue-600/30 text-blue-300' : 'bg-green-600/30 text-green-300'
                        }`}>
                          /{item.endpoint}
                        </span>
                        <span className="text-slate-400 text-sm">N = {item.n} ({item.totalNumbers} số)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-slate-400">
                      Server: <span className="text-cyan-400 font-mono">{item.serverTime}ms</span>
                    </div>
                    <div className="text-slate-400">
                      Client: <span className="text-purple-400 font-mono">{item.clientTime}ms</span>
                    </div>
                    <div className="text-slate-500 text-xs">{item.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}