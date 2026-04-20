"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileVideo, Sparkles, AlertTriangle, CheckCircle2, ChevronRight, Activity, HardDrive, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

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
  const queryClient = useQueryClient();

  // Fetch videos
  const { data: response, isLoading, isError } = useQuery<ApiResponse<VideoFile[]>>({
    queryKey: ['videos'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/videos`);
      return res.data;
    },
    refetchInterval: 5000, // Poll every 5s for status updates
  });

  const videos = response?.data || [];

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
    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Header */}
      <header className="w-full h-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 z-10 transition-colors duration-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Nexus AI
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">VIDEO CLASSIFIER SYSTEM</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {isError ? (
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span className="font-medium text-slate-300">
              {isError ? 'Backend Offline' : 'System Online'}
            </span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 group">
            <HardDrive className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
            Storage: 45%
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-8 flex flex-col gap-8 z-10 overflow-hidden">
        
        {/* Top Section: Upload & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
          {/* Upload Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-2 relative rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 overflow-hidden
              ${isHovering 
                ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]' 
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
              <UploadCloud className={`w-10 h-10 ${isHovering ? 'text-indigo-400' : 'text-slate-400'} transition-colors`} />
            </div>
            <h3 className="text-xl text-white font-semibold mb-2 shadow-sm">AI 자동 분류를 위한 영상 업로드</h3>
            <p className="text-slate-400 text-center max-w-md text-sm mb-8">
              드래그 앤 드롭으로 동영상을 업로드하세요.<br/>
              시스템이 자동으로 확장자를 식별하고, AI를 통해 내용을 분석하여 카테고리화 및 정규식 파일명을 부여합니다.
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
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 업로드 중...</>
                ) : '파일 찾아보기'}
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-6 font-mono">지원: .mp4, .mov, .avi (저화질 자동 격리 적용)</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex-1 flex flex-col justify-center relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
              <p className="text-sm text-slate-400 font-medium mb-1">Total Classifications</p>
              <h2 className="text-4xl font-bold font-mono tracking-tight text-white mb-2">{videos.length}</h2>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <Activity className="w-3 h-3" />
                <span>+{(videos.length > 0 ? '12%' : '0%')} from yesterday</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl flex flex-col justify-center hover:bg-amber-500/5 hover:-translate-y-0.5 transition-all">
                <p className="text-xs text-slate-400 mb-2">Low Quality Isolated</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-amber-500">{isolatedCount}</span>
                  <span className="text-xs text-slate-500 pb-1 font-medium">videos</span>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl flex flex-col justify-center hover:bg-indigo-500/5 hover:-translate-y-0.5 transition-all">
                <p className="text-xs text-slate-400 mb-2">Processing</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-indigo-400">{processingCount}</span>
                  <span className="text-xs text-slate-500 pb-1 font-medium">active</span>
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
          className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden min-h-0"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">최근 처리된 영상 (Recent Pipeline Log)</h3>
              {isLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
            </div>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
              전체 보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y divide-white/5 overflow-y-auto w-full styled-scrollbar">
            {videos.length === 0 ? (
               <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                  <FileVideo className="w-12 h-12 mb-3 opacity-20" />
                  <p>처리된 영상이 없습니다.</p>
               </div>
            ) : (
             videos.map((video, idx) => (
              <motion.div 
                key={video.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:bg-white/[0.03] transition-colors group"
              >
                {/* Icon based on status */}
                <div className={`hidden md:flex w-12 h-12 rounded-xl items-center justify-center border shrink-0 shadow-inner overflow-hidden transition-colors
                  ${video.isLowQuality ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                    video.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    video.status === 'FAILED' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
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
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                     <p className={`text-sm font-medium truncate ${video.status === 'PROCESSING' || video.status === 'PENDING' ? 'text-slate-200' : 'text-slate-300'}`}>
                        {video.status === 'PROCESSING' || video.status === 'PENDING' ? video.originalName : (video.renamedName || video.originalName)}
                     </p>
                     {video.status === 'COMPLETED' && !video.isLowQuality && (
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono tracking-wider">
                         RENAMED
                       </span>
                     )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="truncate">원본: {video.originalName}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{new Date(video.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Categories & Quality */}
                <div className="hidden md:flex flex-col justify-center gap-2 w-32 lg:w-48 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 flex justify-center"><Sparkles className={`w-3.5 h-3.5 ${video.category ? 'text-indigo-400' : 'text-slate-600'}`} /></div>
                    <span className="text-xs font-semibold text-slate-300">{video.category || 'Analyzing...'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 flex justify-center"><FileVideo className={`w-3.5 h-3.5 ${video.quality ? 'text-slate-400' : 'text-slate-600'}`} /></div>
                    <span className={`text-[11px] font-medium ${video.isLowQuality ? 'text-amber-500' : 'text-slate-400'}`}>
                      {video.quality || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="w-full md:w-32 shrink-0 flex justify-start md:justify-end">
                  {video.status === 'PROCESSING' || video.status === 'PENDING' ? (
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      {video.status === 'PENDING' ? 'Queued' : 'Analyzing'}
                    </span>
                  ) : video.isLowQuality ? (
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      Isolated
                    </span>
                  ) : video.status === 'FAILED' ? (
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 w-fit">
                      Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit group-hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle2 className="w-3 h-3" />
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
