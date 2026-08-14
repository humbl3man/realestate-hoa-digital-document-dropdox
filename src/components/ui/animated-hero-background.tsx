"use client";

import { FileText, UploadCloud, FolderOpen, ArrowUpCircle, Shield } from "lucide-react";

export function AnimatedHeroBackground({ alignCenter = false }: { alignCenter?: boolean }) {
  return (
    <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center ${alignCenter ? 'items-center' : 'pt-24'}`}>
      <div 
        className="relative w-full max-w-7xl h-[600px] transition-transform duration-75 ease-out"
      >
        {/* Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] transform-gpu will-change-transform" />
        
        {/* Floating Document 1 (Uploading) */}
        <div className="absolute top-[20%] left-[10%] sm:left-[20%] -translate-x-1/2 -translate-y-1/2 z-0 rotate-[-12deg] opacity-30 transform-gpu will-change-transform">
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="w-12 h-12 text-muted-foreground" strokeWidth={1} />
            <div className="bg-background/50 backdrop-blur-sm border border-border p-6 rounded-xl shadow-xl flex flex-col gap-3">
              <FileText className="w-12 h-12 text-accent" strokeWidth={1} />
              <div className="h-2 w-16 bg-muted rounded-full" />
              <div className="h-2 w-10 bg-muted rounded-full" />
            </div>
          </div>
        </div>

        {/* Floating Document 2 (Stacked Papers) */}
        <div className="absolute top-[40%] right-[10%] sm:right-[15%] translate-x-1/2 translate-y-1/2 z-0 rotate-[15deg] opacity-30 transform-gpu will-change-transform">
          <div className="relative">
            {/* Back paper */}
            <div className="absolute -top-4 -right-4 bg-muted/50 backdrop-blur-sm border border-border p-6 rounded-xl shadow-md rotate-[20deg]">
              <FileText className="w-12 h-12 text-muted-foreground opacity-50" strokeWidth={1} />
            </div>
            {/* Front paper */}
            <div className="relative bg-background/50 backdrop-blur-sm border border-border p-6 rounded-xl shadow-xl flex flex-col gap-3">
              <FileText className="w-12 h-12 text-secondary" strokeWidth={1} />
              <div className="h-2 w-16 bg-muted rounded-full" />
              <div className="h-2 w-12 bg-muted rounded-full" />
              <div className="h-2 w-8 bg-muted rounded-full" />
            </div>
          </div>
        </div>

        {/* Floating Folder */}
        <div className="absolute top-[60%] left-[15%] sm:left-[25%] -translate-x-1/2 translate-y-1/2 z-0 rotate-[-5deg] opacity-20 transform-gpu will-change-transform">
          <div className="bg-background/50 backdrop-blur-sm border border-border p-5 rounded-xl shadow-xl flex flex-col items-center justify-center">
            <FolderOpen className="w-16 h-16 text-primary" strokeWidth={1} />
          </div>
        </div>

        {/* Floating Data Transfer */}
        <div className="absolute top-[10%] right-[25%] sm:right-[35%] -translate-y-1/2 z-0 rotate-[25deg] opacity-20 transform-gpu will-change-transform">
           <div className="bg-background/50 backdrop-blur-sm border border-border p-4 rounded-full shadow-xl">
              <ArrowUpCircle className="w-10 h-10 text-accent" strokeWidth={1} />
           </div>
        </div>

        {/* Floating Shield */}
        <div className="absolute top-[10%] right-[10%] sm:right-[20%] translate-x-1/2 translate-y-1/2 z-0 rotate-[10deg] opacity-20 transform-gpu will-change-transform">
           <div className="bg-background/50 backdrop-blur-sm border border-border p-6 rounded-xl shadow-xl flex flex-col items-center justify-center">
              <Shield className="w-20 h-20 text-accent" strokeWidth={1} />
           </div>
        </div>

        {/* Data Transfer Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 15 30 Q 50 10 50 50" stroke="var(--primary)" strokeWidth="1" fill="none" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          <path d="M 85 60 Q 80 50 50 50" stroke="var(--secondary)" strokeWidth="1" fill="none" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          <path d="M 30 70 Q 40 90 50 50" stroke="var(--accent)" strokeWidth="1" fill="none" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}
