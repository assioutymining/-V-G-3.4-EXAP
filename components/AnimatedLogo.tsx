
import React from 'react';

export const AnimatedLogo = ({ size = "large" }: { size?: "small" | "large" }) => {
  const isLarge = size === "large";
  return (
    <div className={`relative flex items-center justify-center ${isLarge ? 'w-40 h-40' : 'w-12 h-12'} perspective-1000`}>
      <style>{`
        @keyframes rotatePyramid {
          0% { transform: rotateY(0deg) rotateX(15deg); }
          100% { transform: rotateY(360deg) rotateX(15deg); }
        }
        .pyramid-container {
          transform-style: preserve-3d;
          animation: rotatePyramid 8s linear infinite;
          width: 100%;
          height: 100%;
          position: relative;
        }
        .side {
          position: absolute;
          width: 0;
          height: 0;
          border-left: ${isLarge ? '50px' : '15px'} solid transparent;
          border-right: ${isLarge ? '50px' : '15px'} solid transparent;
          border-bottom: ${isLarge ? '100px' : '30px'} solid rgba(255, 215, 0, 0.8);
          transform-origin: 50% 100%;
        }
        .side-1 { transform: translateZ(${isLarge ? '28px' : '8px'}) rotateX(30deg); border-bottom-color: #FFD700; }
        .side-2 { transform: rotateY(90deg) translateZ(${isLarge ? '28px' : '8px'}) rotateX(30deg); border-bottom-color: #FDB813; }
        .side-3 { transform: rotateY(180deg) translateZ(${isLarge ? '28px' : '8px'}) rotateX(30deg); border-bottom-color: #B8860B; }
        .side-4 { transform: rotateY(-90deg) translateZ(${isLarge ? '28px' : '8px'}) rotateX(30deg); border-bottom-color: #DAA520; }
        .base {
          position: absolute;
          width: ${isLarge ? '100px' : '30px'};
          height: ${isLarge ? '100px' : '30px'};
          background: #B8860B;
          transform: rotateX(90deg) translateZ(${isLarge ? '-30px' : '-10px'});
          box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
        }
      `}</style>
      
      <div className="pyramid-container">
        <div className="side side-1 flex items-end justify-center"><div className={`text-black font-black ${isLarge ? 'text-xs pb-4' : 'text-[4px] pb-1'}`}>PG</div></div>
        <div className="side side-2"></div>
        <div className="side side-3"></div>
        <div className="side side-4"></div>
        <div className="base"></div>
      </div>
    </div>
  );
};
