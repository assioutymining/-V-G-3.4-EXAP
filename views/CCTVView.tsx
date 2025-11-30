
import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Info, AlertTriangle, Play } from 'lucide-react';
import { GoldCard, Select, Button } from '../components/UI';

export const CCTVView = () => {
   const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
   const [selectedDeviceId, setSelectedDeviceId] = useState('');
   const [isStreaming, setIsStreaming] = useState(false);
   const [permissionError, setPermissionError] = useState<string | null>(null);
   const [hasPermission, setHasPermission] = useState(false);
   const videoRef = useRef<HTMLVideoElement>(null);
   const streamRef = useRef<MediaStream | null>(null);

   const refreshDevices = async () => {
      try {
         const allDevices = await navigator.mediaDevices.enumerateDevices();
         const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
         setDevices(videoInputs);
         
         const labeled = videoInputs.some(d => d.label && d.label.length > 0);
         setHasPermission(labeled);

         if (labeled && videoInputs.length > 0 && !selectedDeviceId) {
             setSelectedDeviceId(videoInputs[videoInputs.length - 1].deviceId);
         }
      } catch (err) {
         console.error("Enumeration error:", err);
      }
   };

   useEffect(() => {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
         refreshDevices();
      }
   }, []);

   const handleRequestPermission = async () => {
      setPermissionError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('عذراً، المتصفح لا يدعم الوصول للكاميرا.');
        return;
      }

      try {
         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
         stream.getTracks().forEach(track => track.stop());
         await refreshDevices();
      } catch (err: any) {
         console.error("CCTV Permission Error:", err);
         if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setPermissionError('تم رفض الإذن. يرجى الضغط على أيقونة القفل في شريط العنوان والسماح بالكاميرا، ثم إعادة تحميل الصفحة.');
         } else if (err.name === 'NotFoundError') {
            setPermissionError('لم يتم العثور على كاميرا متصلة.');
         } else {
            setPermissionError(`حدث خطأ: ${err.message || err.name}`);
         }
      }
   };

   const toggleStream = async () => {
      if (isStreaming) {
         if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
         }
         if (videoRef.current) videoRef.current.srcObject = null;
         setIsStreaming(false);
      } else {
         setPermissionError(null);
         try {
            const constraints: MediaStreamConstraints = { 
                video: { width: { ideal: 1920 }, height: { ideal: 1080 } } 
            };
            if (selectedDeviceId) {
                (constraints.video as MediaTrackConstraints).deviceId = { exact: selectedDeviceId };
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            if (videoRef.current) {
               videoRef.current.srcObject = stream;
            }
            setIsStreaming(true);
         } catch (err: any) {
            console.error("Stream Error:", err);
            if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                 try {
                     const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                     streamRef.current = fallbackStream;
                     if (videoRef.current) videoRef.current.srcObject = fallbackStream;
                     setIsStreaming(true);
                     setPermissionError('تم تشغيل الكاميرا بدقة افتراضية (تعذر تطبيق الإعدادات المثالية).');
                     return;
                 } catch (fallbackErr) {
                     // ignore
                 }
            }
            setPermissionError(`تعذر تشغيل البث: ${err.message}`);
            setIsStreaming(false);
         }
      }
   };

   useEffect(() => {
      return () => {
         if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
         }
      };
   }, []);

   return (
      <GoldCard title="شاشة المراقبة (HDMI Input / CCTV)" icon={<Monitor />}>
         <div className="space-y-6">
            <div className="bg-zinc-900 p-4 rounded-lg border border-yellow-500/20 flex items-center gap-3 text-sm text-yellow-200/80">
               <Info className="w-5 h-5 flex-shrink-0" />
               <p>
                  يجب توصيل جهاز DVR أو الكاميرا باستخدام <span className="text-white font-bold">HDMI Video Capture Card</span>.
               </p>
            </div>
            
            {permissionError && (
               <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg flex items-start gap-3 animate-pulse">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                     <p className="text-red-200 font-bold">{permissionError}</p>
                  </div>
               </div>
            )}

            {!hasPermission ? (
                <div className="text-center p-8 bg-black/20 rounded-xl border border-dashed border-zinc-700">
                    <Monitor className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">مطلوب إذن الكاميرا</h3>
                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">للسماح للنظام بعرض تغذية الكاميرات أو جهاز الالتقاط، يرجى منح صلاحية الوصول للكاميرا.</p>
                    <Button onClick={handleRequestPermission} className="mx-auto">
                        <Play className="w-4 h-4 ml-2" /> منح الصلاحية
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Select 
                            label="مصدر الفيديو (Input Source)" 
                            value={selectedDeviceId} 
                            onChange={e => setSelectedDeviceId(e.target.value)}
                        >
                            {devices.map((d, idx) => (
                                <option key={d.deviceId} value={d.deviceId}>
                                {d.label || `Device ${idx + 1}`}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="mb-4">
                        <Button 
                            onClick={toggleStream} 
                            variant={isStreaming ? 'danger' : 'primary'}
                            className="min-w-[150px]"
                        >
                            {isStreaming ? 'إيقاف' : 'تشغيل'}
                        </Button>
                    </div>
                    </div>

                    <div className="relative bg-black rounded-xl overflow-hidden aspect-video border-4 border-zinc-800 shadow-2xl group">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className={`w-full h-full object-contain bg-black ${!isStreaming ? 'hidden' : ''}`}
                    />
                    {!isStreaming && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                            <Monitor className="w-16 h-16 mb-4 opacity-20" />
                            <p>البث متوقف</p>
                        </div>
                    )}
                    </div>
                </>
            )}
         </div>
      </GoldCard>
   );
};
