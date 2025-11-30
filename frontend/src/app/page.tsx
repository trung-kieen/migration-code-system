'use client';
import React, { use, useState } from 'react';
import { Server, Monitor, ArrowRight, Play, Code2, Clock, Activity, CheckCircle, Terminal } from 'lucide-react';
import { api, ServerType, EndpointType } from '../lib/api';

type LogType = 'info' | 'success' | 'error';

type LogItem = {
  message: string;
  type: LogType;
  time: string;
};

type HistoryItem = {
  id: number;
  server: string;
  endpoint: string;
  n: number;
  serverTime: string;
  clientTime: string;
  timestamp: string;
  totalNumbers: number;
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

  const addLog = (message: string, type: LogType = 'info') => {
    setProcessingLog(prev => [
      ...prev,
      { message, type, time: new Date().toLocaleTimeString() }
    ]);
  };

  const delay = (ms: number) =>
    new Promise<void>(resolve => setTimeout(resolve, ms));

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

    const serverName = selectedServer === 'server1' ? 'Server 1' : 'Server 2';

    try {
      // Step 1: Frontend show code lấy được từ server là mã như nào
      setCurrentStep('step1');
      addLog(` Gửi request đến ${serverName} với endpoint /${selectedEndpoint}/${n}`, 'info');
      await delay(500);

      const startServer = performance.now();
      const data = await api.getCode(selectedServer, selectedEndpoint, parseInt(n));
      const endServer = performance.now();
      setServerTime((endServer - startServer).toFixed(2));

      addLog(` ${serverName} đã trả về code function`, 'success');
      setServerCode(data.code);
      await delay(800);

      // Step 2:  chạy code đó
      setCurrentStep('step2');
      addLog(` Bắt đầu thực thi code trên Client...`, 'info');
      await delay(500);

      const startClient = performance.now();
      const capturedOutput = api.executeCode(data.code, data.call);
      const endClient = performance.now();
      setClientTime((endClient - startClient).toFixed(2));

      addLog(` Code đã chạy thành công`, 'success');
      await delay(500);

      // Step 3: Hiển thị ra kết quả
      setCurrentStep('step3');
      addLog(` Hiển thị kết quả từ endpoint /${selectedEndpoint}`, 'info');
      setExecutionResult(capturedOutput.join('\n'));
      await delay(500);

      // Step 4: Hiển thị quá trình xử lý đầy đủ lên màn hình 
      setCurrentStep('step4');
      addLog(`Hoàn thành! Tổng thời gian: Server ${(endServer - startServer).toFixed(2)}ms + Client ${(endClient - startClient).toFixed(2)}ms`, 'success');

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        server: serverName,
        endpoint: selectedEndpoint,
        n: parseInt(n),
        serverTime: (endServer - startServer).toFixed(2),
        clientTime: (endClient - startClient).toFixed(2),
        timestamp: new Date().toLocaleTimeString(),
        totalNumbers: parseInt(n) + 1
      }, ...prev]);

    } catch (error) {
      if (error instanceof Error) {
        addLog(` Lỗi: ${error.message}`, 'error');
        setExecutionResult(`Error: ${error.message}`);
      } else {
        addLog(' Lỗi không xác định', 'error');
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Code Migration - Distributed System
          </h1>
          <p className="text-slate-300 text-lg">Hệ thống phân tán: 2 Servers + 1 Client</p>
        </div>

        {/* System Architecture */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-slate-700/50">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {/* Server 1 */}
            <button
              onClick={() => !isRunning && setSelectedServer('server1')}
              disabled={isRunning}
              className={`p-6 rounded-2xl border-2 transition-all ${selectedServer === 'server1'
                ? 'border-cyan-400 bg-cyan-900/20 shadow-lg shadow-cyan-500/30 scale-105'
                : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Server size={40} className={selectedServer === 'server1' ? 'text-cyan-400' : 'text-slate-400'} />
                <div className="text-center">
                  <div className="font-bold text-lg">Server 1</div>
                  <div className="text-xs text-slate-400">Port 3002</div>
                </div>
              </div>
            </button>

            <ArrowRight className="text-slate-500" size={32} />

            {/* Client */}
            <div className="p-6 rounded-2xl border-2 border-purple-400 bg-purple-900/20 shadow-lg shadow-purple-500/30">
              <div className="flex flex-col items-center gap-3">
                <Monitor size={40} className="text-purple-400" />
                <div className="text-center">
                  <div className="font-bold text-lg">Client</div>
                  <div className="text-xs text-slate-400">Browser</div>
                </div>
              </div>
            </div>

            <ArrowRight className="text-slate-500 rotate-180" size={32} />

            {/* Server 2 */}
            <button
              onClick={() => !isRunning && setSelectedServer('server2')}
              disabled={isRunning}
              className={`p-6 rounded-2xl border-2 transition-all ${selectedServer === 'server2'
                ? 'border-orange-400 bg-orange-900/20 shadow-lg shadow-orange-500/30 scale-105'
                : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Server size={40} className={selectedServer === 'server2' ? 'text-orange-400' : 'text-slate-400'} />
                <div className="text-center">
                  <div className="font-bold text-lg">Server 2</div>
                  <div className="text-xs text-slate-400">Port 3003</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Endpoint Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Chọn Endpoint
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEndpoint('nau')}
                  disabled={isRunning}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${selectedEndpoint === 'nau'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                  /nau
                </button>
                <button
                  onClick={() => setSelectedEndpoint('fib')}
                  disabled={isRunning}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${selectedEndpoint === 'fib'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                  /fib
                </button>
              </div>
            </div>

            {/* N Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Nhập giá trị N (số nguyên ≥ 0)
              </label>
              <input
                type="number"
                value={n}
                onChange={(e) => setN(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-mono text-lg"
                placeholder="e.g., 10"
                min="0"
              />
            </div>

            {/* Run Button */}
            <div className="flex items-end">
              <button
                onClick={runMigration}
                disabled={isRunning}
                className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg"
              >
                <Play size={22} />
                {isRunning ? 'Đang xử lý...' : 'Chạy Migration'}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Steps Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Step 1: Frontend show code lấy được từ server là mã như nào */}
          <div className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${currentStep === 'step1' ? 'border-cyan-400 shadow-lg shadow-cyan-500/30' : 'border-slate-700/50'
            }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-bold text-lg">Frontend show code lấy được từ server</h3>
                <p className="text-xs text-slate-400">Code function được sinh ra từ server</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              {serverCode ? (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <Code2 size={16} />
                    <span className="text-xs font-semibold">Generated Code:</span>
                  </div>
                  <pre className="text-xs text-green-400 font-mono">{serverCode}</pre>
                </div>
              ) : (
                <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                  Chờ server trả về code...
                </div>
              )}
            </div>
          </div>

          {/* Step 2: R chạy code đó */}
          <div className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${currentStep === 'step2' ? 'border-blue-400 shadow-lg shadow-blue-500/30' : 'border-slate-700/50'
            }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-bold text-lg">R chạy code đó</h3>
                <p className="text-xs text-slate-400">Client thực thi code trên browser</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 min-h-[200px]">
              {isRunning && currentStep === 'step2' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-3 text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold">Đang thực thi code...</span>
                  </div>
                </div>
              ) : executionResult ? (
                <div className="text-green-400 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} />
                    <span className="font-semibold">Code đã chạy thành công!</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} />
                    <span>Thời gian: {clientTime}ms</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                  Chờ thực thi...
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Hiển thị ra kết quả */}
          <div className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${currentStep === 'step3' ? 'border-purple-400 shadow-lg shadow-purple-500/30' : 'border-slate-700/50'
            }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-bold text-lg">Hiển thị ra kết quả</h3>
                <p className="text-xs text-slate-400">Output từ endpoint</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              {executionResult ? (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <Terminal size={16} />
                    <span className="text-xs font-semibold">Console Output:</span>
                  </div>
                  <pre className="text-sm text-green-400 font-mono leading-relaxed">{executionResult}</pre>
                </div>
              ) : (
                <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                  Chờ kết quả...
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Hiển thị quá trình xử lý đầy đủ lên màn hình để ông coi */}
          <div className={`bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${currentStep === 'step4' ? 'border-green-400 shadow-lg shadow-green-500/30' : 'border-slate-700/50'
            }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-bold text-lg">Hiển thị quá trình xử lý đầy đủ</h3>
                <p className="text-xs text-slate-400">Log chi tiết từng bước</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              {processingLog.length > 0 ? (
                <div className="space-y-2">
                  {processingLog.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <span className="text-slate-500 shrink-0">{log.time}</span>
                      <span className={`${log.type === 'success' ? 'text-green-400' :
                        log.type === 'error' ? 'text-red-400' : 'text-slate-300'
                        }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                  Chờ bắt đầu xử lý...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-6 border border-cyan-700/50">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Server size={20} className="text-cyan-400" />
              Server Processing Time
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-cyan-400">{serverTime}</span>
              <span className="text-slate-400">milliseconds</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-700/50">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Monitor size={20} className="text-purple-400" />
              Client Execution Time
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-purple-400">{clientTime}</span>
              <span className="text-slate-400">milliseconds</span>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-blue-400" />
            <h3 className="font-bold text-lg">Execution History</h3>
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
                      <span className="font-mono font-bold text-cyan-400">{item.server}</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${item.endpoint === 'nau' ? 'bg-blue-600/30 text-blue-300' : 'bg-green-600/30 text-green-300'
                        }`}>
                        /{item.endpoint}
                      </span>
                      <span className="text-slate-400 ml-2">| N = {item.n} ({item.totalNumbers} số)</span>
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