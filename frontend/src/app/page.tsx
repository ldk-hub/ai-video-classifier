"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileVideo, Sparkles, AlertTriangle, CheckCircle2, ChevronRight, Activity, HardDrive, Loader2, Menu, X, ArrowUpRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { DiskDashboard } from '../components/DiskDashboard';

// Backend Types
interface VideoFile {
  id: number;
  originalName: string;
  renamedName: string | null;
  category: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'ISOLATED_LOW_QUALITY';
  quality: string | null;
  isLowQuality: boolean;
  createdAt: string;
  processedAt: string | null;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const API_BASE = 'http://localhost:8080/api/v1';

export default function Dashboard() {
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch videos
  const { data: response, isLoading, isError } = useQuery<ApiResponse<VideoFile[]>>({
    queryKey: ['videos'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/videos`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const videos = response?.data || [];

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${API_BASE}/videos/scan`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (filename: string) => {
      const res = await axios.post(`${API_BASE}/videos/upload`, null, {
        params: { filename }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    }
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      uploadMutation.mutate(file.name);
    }
  }, [uploadMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files[0].name);
    }
  };

  const processedCount = videos.filter(v => v.status === 'COMPLETED').length;
  const isolatedCount = videos.filter(v => v.isLowQuality).length;
  const processingCount = videos.filter(v => v.status === 'PROCESSING' || v.status === 'PENDING').length;

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col font-sans overflow-x-hidden relative selection:bg-indigo-500/30">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Header */}
      <header className="sticky top-0 w-full h-16 md:h-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl z-50 transition-colors duration-500">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                Nexus AI
              </h1>
            </div>
          </div>
          
          {/* Desktop Header Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
              {isError ? (
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </div>
              ) : (
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
              )}
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isError ? 'System Offline' : 'System Online'}
              </span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-16 left-0 w-full bg-slate-900 border-b border-white/5 z-40 p-4"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
               <div className={`w-2.5 h-2.5 rounded-full ${isError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
               <span className="text-sm font-bold text-white">{isError ? 'Backend Offline' : 'System Online'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col gap-6 md:gap-10 z-10">
        
        {/* Disk Monitoring */}
        <DiskDashboard />

        {/* Top Section: Upload & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-2 relative rounded-3xl border border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 md:p-14 overflow-hidden shadow-2xl backdrop-blur-sm
              ${isHovering 
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
                : 'border-slate-700 bg-white/[0.02] hover:bg-white/[0.03] hover:border-slate-600'
              }`}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-transparent border border-indigo-500/20 flex items-center justify-center mb-6 shadow-inner">
              <UploadCloud className={`w-8 h-8 md:w-10 md:h-10 ${isHovering ? 'text-indigo-400 scale-110' : 'text-slate-400'} transition-all duration-300`} />
            </div>
            <h3 className="text-lg md:text-2xl text-white font-bold mb-3 tracking-tight text-center">AI 비디오 자동 분석 및 분류</h3>
            <p className="text-slate-400 text-center max-w-md text-sm md:text-base leading-relaxed mb-8">
              동영상을 이곳에 드래그하거나 파일을 선택하세요. 시스템이 즉시 분석하여 화질 검증 및 카테고리를 분류합니다.
            </p>
            
            <div className="relative">
              <input 
                 type="file" 
                 id="file-upload" 
                 className="hidden" 
                 onChange={handleFileInput} 
                 accept=".mp4,.mov,.avi"
                 disabled={uploadMutation.isPending}
              />
              <label 
                htmlFor="file-upload" 
                className="px-6 md:px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2 group border border-indigo-500"
              >
                {uploadMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> 업로드 진행 중...</>
                ) : (
                  <>비디오 선택하기 <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></>
                )}
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-6 font-mono font-medium">지원 포맷: .mp4, .mov, .avi</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4 md:gap-6"
          >
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-white/5 p-6 md:p-8 rounded-3xl flex-1 flex flex-col justify-center relative overflow-hidden group shadow-2xl backdrop-blur-sm">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <p className="text-xs md:text-sm text-indigo-300 font-bold mb-2 uppercase tracking-wider">Total Processed</p>
              <h2 className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-white mb-2">{videos.length}</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 w-fit px-2.5 py-1 rounded-full border border-emerald-400/20">
                <Activity className="w-3.5 h-3.5" />
                <span>Active</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-6 flex-1">
              <div className="bg-white/[0.02] border border-white/5 p-4 md:p-6 rounded-3xl flex flex-col justify-center hover:bg-amber-500/5 hover:border-amber-500/20 transition-all shadow-xl">
                <p className="text-[10px] md:text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">Low Quality</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl md:text-4xl font-black text-amber-500">{isolatedCount}</span>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 md:p-6 rounded-3xl flex flex-col justify-center hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all shadow-xl">
                <p className="text-[10px] md:text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">Processing</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl md:text-4xl font-black text-indigo-400">{processingCount}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Video List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm"
        >
          <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                 <FileVideo className="w-4 h-4 text-slate-300" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-white tracking-tight">작업 로그</h3>
              {isLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin ml-2" />}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scanMutation.mutate()}
                disabled={scanMutation.isPending}
                className="text-xs md:text-sm text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 active:scale-95"
              >
                {scanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                디스크 자동 스캔
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {videos.length === 0 ? (
               <div className="p-16 flex flex-col items-center justify-center text-slate-500">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                     <FileVideo className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="font-medium text-slate-400">등록된 영상이 없습니다</p>
                  <p className="text-sm mt-1">업로드 영역을 통해 비디오를 추가해 보세요.</p>
               </div>
            ) : (
             videos.map((video, idx) => (
              <motion.div 
                key={video.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Mobile Header: Icon + Status */}
                <div className="flex items-center justify-between sm:hidden w-full">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner
                    ${video.isLowQuality ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                      video.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      video.status === 'FAILED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                      'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    }
                  `}>
                    {video.isLowQuality ? <AlertTriangle className="w-5 h-5" /> : 
                     video.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : 
                     video.status === 'FAILED' ? <AlertTriangle className="w-5 h-5" /> : 
                     <Activity className="w-5 h-5 animate-pulse" />
                    }
                  </div>
                  
                  {/* Status Badge (Mobile) */}
                  <div className="shrink-0">
                    {video.status === 'PROCESSING' || video.status === 'PENDING' ? (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Analyzing
                      </span>
                    ) : video.isLowQuality ? (
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Isolated
                      </span>
                    ) : video.status === 'FAILED' ? (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop Icon */}
                <div className={`hidden sm:flex w-12 h-12 rounded-2xl items-center justify-center border shrink-0 shadow-inner
                  ${video.isLowQuality ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                    video.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    video.status === 'FAILED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                    'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  }
                `}>
                  {video.isLowQuality ? <AlertTriangle className="w-5 h-5" /> : 
                   video.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : 
                   video.status === 'FAILED' ? <AlertTriangle className="w-5 h-5" /> : 
                   <Activity className="w-5 h-5 animate-pulse" />
                  }
                </div>

                {/* File Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                     <p className={`text-sm md:text-base font-bold truncate ${video.status === 'PROCESSING' || video.status === 'PENDING' ? 'text-slate-200' : 'text-slate-100'}`}>
                        {video.status === 'PROCESSING' || video.status === 'PENDING' ? video.originalName : (video.renamedName || video.originalName)}
                     </p>
                     {video.status === 'COMPLETED' && !video.isLowQuality && (
                       <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest">
                         Renamed
                       </span>
                     )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-slate-500 font-medium">
                    <span className="truncate max-w-[200px] sm:max-w-xs">{video.originalName}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 bg-white/5 rounded border border-white/5">{new Date(video.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Categories & Quality (Desktop + Tablet) */}
                <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2 sm:w-32 lg:w-48 shrink-0 bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/5 sm:border-transparent mt-2 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <Sparkles className={`w-3 h-3 ${video.category ? 'text-indigo-400' : 'text-slate-600'}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-300 truncate">{video.category || '분석 대기중'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                      <FileVideo className={`w-3 h-3 ${video.quality ? 'text-slate-400' : 'text-slate-600'}`} />
                    </div>
                    <span className={`text-[11px] font-bold ${video.isLowQuality ? 'text-amber-500' : 'text-slate-400'}`}>
                      {video.quality || '대기중'}
                    </span>
                  </div>
                </div>

                {/* Status Badge (Desktop) */}
                <div className="hidden sm:flex w-28 shrink-0 justify-end">
                  {video.status === 'PROCESSING' || video.status === 'PENDING' ? (
                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      Analyzing
                    </span>
                  ) : video.isLowQuality ? (
                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Isolated
                    </span>
                  ) : video.status === 'FAILED' ? (
                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                      Completed
                    </span>
                  )}
                </div>
              </motion.div>
            )))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
