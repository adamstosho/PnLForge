'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LogoAnimatedProps {
    className?: string
    size?: number
}

export function LogoAnimated({ className, size = 32 }: LogoAnimatedProps) {
    return (
        <div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Outer Plate 1 - Accent Purple */}
                <path
                    className="plate-1"
                    d="M16 4L28 16L16 28L4 16L16 4Z"
                    stroke="#7b5cff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Outer Plate 2 - Offset - Minor shade for depth */}
                <path
                    className="plate-2"
                    d="M16 8L24 16L16 24L8 16L16 8Z"
                    stroke="#078fb6"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                />

                {/* Central Core - The Spark - Primary Cyan */}
                <path
                    className="spark-core"
                    d="M16 11L21 16L16 21L11 16L16 11Z"
                    fill="#0aaadf"
                />

                {/* Dynamic Spark Lines */}
                <line x1="16" y1="13" x2="16" y2="10" stroke="#0aaadf" strokeWidth="1.5" strokeLinecap="round" className="spark-line-v" />
                <line x1="16" y1="19" x2="16" y2="22" stroke="#0aaadf" strokeWidth="1.5" strokeLinecap="round" className="spark-line-v" />
                <line x1="13" y1="16" x2="10" y2="16" stroke="#0aaadf" strokeWidth="1.5" strokeLinecap="round" className="spark-line-h" />
                <line x1="19" y1="16" x2="22" y2="16" stroke="#0aaadf" strokeWidth="1.5" strokeLinecap="round" className="spark-line-h" />
            </svg>

            <style jsx>{`
        .plate-1 {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: draw-line 2.5s ease-out forwards, glow-border 4s ease-in-out infinite 2.5s;
        }
        
        .plate-2 {
          opacity: 0;
          animation: fade-in 1s ease-out forwards 1.5s;
        }

        .spark-core {
          transform-origin: center;
          animation: breathe 3s ease-in-out infinite;
        }

        .spark-line-v {
          animation: spark-pulse-v 2s ease-in-out infinite;
        }

        .spark-line-h {
          animation: spark-pulse-h 2s ease-in-out infinite;
        }

        @keyframes draw-line {
          to { stroke-dashoffset: 0; }
        }

        @keyframes glow-border {
          0%, 100% { stroke-opacity: 1; filter: drop-shadow(0 0 2px #7b5cff); }
          50% { stroke-opacity: 0.6; filter: drop-shadow(0 0 5px #7b5cff); }
        }

        @keyframes fade-in {
          to { opacity: 0.5; }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes spark-pulse-v {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-2px); opacity: 1; }
        }

        @keyframes spark-pulse-h {
          0%, 100% { transform: translateX(0); opacity: 0.4; }
          50% { transform: translateX(2px); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
