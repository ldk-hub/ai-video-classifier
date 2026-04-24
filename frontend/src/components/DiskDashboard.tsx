import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDiskStatus } from '../api/disk';
import { HardDrive, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const DiskDashboard = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['diskStatus'],
    queryFn: getDiskStatus,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="w-full relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:p-8 animate-pulse shadow-2xl">
         <div className="h-6 w-48 bg-white/10 rounded-lg mb-6"></div>
         <div className="h-2.5 w-full bg-white/5 rounded-full mb-8"></div>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div className="h-20 w-full bg-white/5 rounded-2xl"></div>
           <div className="h-20 w-full bg-white/5 rounded-2xl"></div>
           <div className="h-20 w-full bg-white/5 rounded-2xl"></div>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full relative overflow-hidden bg-rose-950/20 border border-rose-500/20 rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-5 w-full">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-inner">
             <AlertCircle className="w-7 h-7 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-rose-300">스토리지 연동 실패</h3>
            <p className="text-sm text-rose-400/70 mt-1">백엔드 서버(localhost:8080)와 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.</p>
          </div>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 transition-all rounded-xl text-rose-300 text-sm font-bold border border-rose-500/20 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? '연결 중...' : '재시도'}
        </button>
      </div>
    );
  }

  if (!data) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getUsageColor = (percentage: number) => {
    if (percentage > 90) return 'from-rose-500 to-red-600 shadow-[0_0_30px_rgba(244,63,94,0.6)]';
    if (percentage > 75) return 'from-amber-400 to-orange-500 shadow-[0_0_30px_rgba(251,191,36,0.5)]';
    return 'from-emerald-400 to-teal-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:p-8 hover:bg-white/[0.04] transition-colors shadow-2xl backdrop-blur-xl"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner">
            <HardDrive className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">시스템 스토리지</h2>
            <p className="text-xs text-indigo-200/50 font-mono mt-1 break-all">{data.path}</p>
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:text-right">
          <span className="text-4xl font-black text-white tracking-tighter">{data.usagePercentage}<span className="text-2xl text-white/50">%</span></span>
        </div>
      </div>

      <div className="relative w-full h-3 bg-black/50 rounded-full overflow-hidden mb-8 shadow-inner ring-1 ring-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${data.usagePercentage}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getUsageColor(data.usagePercentage)} rounded-full`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="flex flex-col p-5 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
          <span className="text-xs text-slate-500 font-bold mb-1.5 uppercase tracking-wider">총 용량 (Total)</span>
          <span className="text-xl font-semibold text-slate-200 font-mono tracking-tight">{formatBytes(data.totalSpaceBytes)}</span>
        </div>
        <div className="flex flex-col p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 relative overflow-hidden group shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="text-xs text-indigo-400/80 font-bold mb-1.5 uppercase tracking-wider">사용 가능 (Usable)</span>
          <span className="text-xl font-semibold text-indigo-300 font-mono tracking-tight">{formatBytes(data.usableSpaceBytes)}</span>
        </div>
        <div className="flex flex-col p-5 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
          <span className="text-xs text-slate-500 font-bold mb-1.5 uppercase tracking-wider">여유 공간 (Free)</span>
          <span className="text-xl font-semibold text-slate-300 font-mono tracking-tight">{formatBytes(data.freeSpaceBytes)}</span>
        </div>
      </div>
    </motion.div>
  );
};
