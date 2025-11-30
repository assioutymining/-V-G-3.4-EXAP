
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tv, Search, RefreshCw, WifiOff, Signal, Volume2, Maximize2, Radio, Activity, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { Button } from '../components/UI';
import { Channel, MarketData } from '../types';
import { MarketService } from '../services/market';

const M3U_URL = 'https://iptv-org.github.io/iptv/index.m3u';

export const FollowUpView = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [time, setTime] = useState(new Date());
  
  // Market Data State
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial Fetch
  useEffect(() => {
    fetchChannels();
    fetchMarketData();

    // Refresh market data every minute
    const marketInterval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(marketInterval);
  }, []);

  const fetchMarketData = async () => {
    try {
        const data = await MarketService.getLivePrices();
        if (data) setMarketData(data);
    } catch (e) {
        console.error("Failed to fetch market data in FollowUpView", e);
    }
  };

  const fetchChannels = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(M3U_URL);
      if (!response.ok) throw new Error('Failed to fetch playlist');
      const text = await response.text();
      const parsedChannels = parseM3U(text);
      
      const keywords = ['news', 'business', 'bloomberg', 'cnbc', 'arab', 'sky', 'jazeera', 'gold'];
      const preferred = parsedChannels.filter(c => 
          keywords.some(k => c.name.toLowerCase().includes(k))
      );
      
      const finalList = preferred.length > 0 ? [...preferred, ...parsedChannels.filter(c => !preferred.includes(c))] : parsedChannels;
      
      setChannels(finalList);
      
      if (finalList.length > 0 && !selectedChannel) {
        setSelectedChannel(finalList[0]);
      }
    } catch (err) {
      setError('فشل تحميل قائمة القنوات. تأكد من الاتصال بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const parseM3U = (data: string): Channel[] => {
    const lines = data.split('\n');
    const result: Channel[] = [];
    let currentChannel: Partial<Channel> = {};

    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('#EXTINF:')) {
        const infoPart = line.substring(8);
        const parts = infoPart.split(',');
        currentChannel.name = parts[parts.length - 1] || 'Unknown Channel';
        
        const logoMatch = line.match(/tvg-logo="([^"]*)"/);
        if (logoMatch) currentChannel.logo = logoMatch[1];
        
        const groupMatch = line.match(/group-title="([^"]*)"/);
        if (groupMatch) currentChannel.group = groupMatch[1];

      } else if (line.startsWith('http')) {
        currentChannel.url = line;
        if (currentChannel.name && currentChannel.url) {
          result.push(currentChannel as Channel);
        }
        currentChannel = {};
      }
    });
    return result;
  };

  useEffect(() => {
    if (!selectedChannel || !videoRef.current) return;

    const video = videoRef.current;
    const hlsSupported = window.Hls && window.Hls.isSupported();

    if (hlsRef.current) {
        hlsRef.current.destroy();
    }

    if (hlsSupported) {
      const hls = new window.Hls();
      hlsRef.current = hls;
      hls.loadSource(selectedChannel.url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => console.log('Autoplay prevented'));
      });
      hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
         if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
         }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = selectedChannel.url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    return () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }
    };
  }, [selectedChannel]);

  const filteredChannels = useMemo(() => {
     if (!searchQuery) return channels.slice(0, 50); 
     return channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 50);
  }, [channels, searchQuery]);

  // Dynamic Ticker based on Live Market Data
  const tickerItems = useMemo(() => {
    if (!marketData) return [
      { label: 'LOADING MARKET DATA...', val: '---', up: true }
    ];

    return [
      { label: 'GOLD (XAU) USD', val: marketData.ouncePriceUSD?.toLocaleString() || '0', up: true },
      { label: 'LOCAL 24K', val: marketData.gold24.toLocaleString(), up: true },
      { label: 'LOCAL 21K', val: marketData.gold21.toLocaleString(), up: true },
      { label: 'USD/EGP', val: marketData.usd.toFixed(2), up: false },
      { label: 'OUNCE EGP', val: (marketData.ouncePriceUSD ? Math.floor(marketData.ouncePriceUSD * marketData.usd).toLocaleString() : '0'), up: true },
    ];
  }, [marketData]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-[#050505] relative overflow-hidden rounded-xl border-2 border-zinc-800 shadow-2xl font-sans text-white">
        
        {/* Top Control Room Header */}
        <div className="bg-zinc-900 border-b border-gold-500/20 p-3 flex flex-wrap justify-between items-center z-20 shadow-md gap-2">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gold-600 rounded flex items-center justify-center shadow-gold-glow animate-pulse">
                        <Radio className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-gold-100 tracking-widest uppercase">غرفة التحكم</h2>
                        <div className="text-[9px] text-zinc-400 font-mono hidden sm:block">LIVE TRADING ROOM V2.0</div>
                    </div>
                </div>
                
                {/* World Clocks (Hidden on Mobile) */}
                <div className="hidden lg:flex items-center gap-6 border-r border-white/10 pr-6 mr-6">
                    <div className="text-center">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase">CAIRO</div>
                        <div className="text-xs font-mono font-bold text-white">{time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'Africa/Cairo'})}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase">NEW YORK</div>
                        <div className="text-xs font-mono font-bold text-gold-400">{time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'America/New_York'})}</div>
                    </div>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                 <Button onClick={() => { fetchChannels(); fetchMarketData(); }} variant="secondary" className="h-8 text-xs bg-zinc-800 hover:bg-zinc-700 border-zinc-600">
                    <RefreshCw className={`w-3 h-3 ml-1 ${loading ? 'animate-spin' : ''}`} /> تحديث
                 </Button>
             </div>
        </div>

        {/* Main Interface Layout - Responsive Flex (Col on mobile, Row on desktop) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden z-10">
            
            {/* Screen Area */}
            <div className="flex-[3] p-2 md:p-4 flex flex-col bg-gradient-to-br from-zinc-900 to-black relative min-h-[40vh]">
                <div className="flex-1 relative rounded-xl overflow-hidden border-2 border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] group bg-black">
                     {selectedChannel ? (
                        <>
                            <video 
                                ref={videoRef}
                                className="w-full h-full object-contain"
                                controls={false}
                            />
                            
                            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">LIVE</span>
                                <span className="bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">{selectedChannel.name}</span>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex justify-end gap-2">
                                <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur"><Volume2 className="w-4 h-4" /></button>
                                <button 
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur"
                                    onClick={() => videoRef.current?.requestFullscreen()}
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Activity className="w-16 h-16 text-zinc-800 mb-4" />
                            <p className="text-zinc-600 font-mono text-sm">NO SIGNAL INPUT</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Panel (Market Data & Channel List) */}
            <div className="flex-1 w-full lg:max-w-xs bg-zinc-900/80 backdrop-blur-md border-t lg:border-t-0 lg:border-r border-white/5 flex flex-col max-h-[50vh] lg:max-h-full">
                 
                 {/* Live Market Table */}
                 <div className="p-4 border-b border-white/10 bg-black/40">
                    <h3 className="text-xs font-bold text-gold-500 mb-3 flex items-center gap-2">
                         <Globe className="w-3 h-3" /> MARKET WATCH
                         {marketData && <span className="text-[9px] text-green-500 ml-auto animate-pulse">● LIVE</span>}
                    </h3>
                    
                    <div className="overflow-hidden rounded border border-white/5">
                        <table className="w-full text-xs">
                            <thead className="bg-zinc-800 text-zinc-400 font-bold text-[9px] uppercase">
                                <tr>
                                    <th className="p-2 text-right">Symbol</th>
                                    <th className="p-2 text-left">USD</th>
                                    <th className="p-2 text-left">EGP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-mono text-[10px] md:text-xs">
                                <tr>
                                    <td className="p-2 text-gold-400 font-bold">OUNCE</td>
                                    <td className="p-2 text-left">{marketData?.ouncePriceUSD?.toLocaleString() || '-'}</td>
                                    <td className="p-2 text-left font-bold text-white">{(marketData?.ouncePriceUSD && marketData?.usd ? Math.floor(marketData.ouncePriceUSD * marketData.usd).toLocaleString() : '-')}</td>
                                </tr>
                                <tr>
                                    <td className="p-2 text-white font-bold">GOLD 24K</td>
                                    <td className="p-2 text-left text-zinc-500">{(marketData?.ouncePriceUSD ? (marketData.ouncePriceUSD / 31.1035).toFixed(1) : '-')}</td>
                                    <td className="p-2 text-left font-bold text-gold-400">{marketData?.gold24.toLocaleString() || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="p-2 text-zinc-300">GOLD 21K</td>
                                    <td className="p-2 text-left text-zinc-500">-</td>
                                    <td className="p-2 text-left text-white">{marketData?.gold21.toLocaleString() || '-'}</td>
                                </tr>
                                <tr className="bg-blue-900/10">
                                    <td className="p-2 text-blue-300 font-bold flex items-center gap-1"><DollarSign className="w-3 h-3"/> USD</td>
                                    <td className="p-2 text-left text-blue-300 font-bold">1.00</td>
                                    <td className="p-2 text-left text-white font-bold">{marketData?.usd.toFixed(2) || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                 </div>

                 {/* Channels Search */}
                 <div className="p-3 border-b border-white/5 bg-zinc-900/50">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="بحث قنوات..." 
                            className="w-full bg-black/40 border border-zinc-700 rounded pl-8 pr-3 py-2 text-white text-xs focus:outline-none focus:border-gold-500 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-2.5" />
                    </div>
                 </div>

                 {/* Channels List */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                     <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50 sticky top-0 z-10 border-b border-white/5 flex justify-between">
                        <span>TV Feeds</span>
                        <span>{filteredChannels.length}</span>
                     </div>
                     
                     <div className="p-2 space-y-1">
                        {loading ? (
                            <div className="text-center py-8 text-zinc-500 text-xs flex flex-col items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" /> Fetching Satellites...
                            </div>
                        ) : error ? (
                             <div className="text-center py-8 text-red-500 text-xs px-4">
                                <WifiOff className="w-6 h-6 mx-auto mb-2 opacity-50" /> {error}
                             </div>
                        ) : (
                            filteredChannels.map((channel, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedChannel(channel)}
                                    className={`w-full flex items-center gap-3 p-2 rounded transition-all text-right border group ${
                                        selectedChannel?.url === channel.url 
                                        ? 'bg-gold-500/10 border-gold-500/40 text-white' 
                                        : 'bg-transparent border-transparent hover:bg-white/5 text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded bg-black border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-gold-500/30 transition-colors">
                                        {channel.logo ? (
                                            <img src={channel.logo} alt="" className="w-full h-full object-contain" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                        ) : (
                                            <Tv className="w-3 h-3 opacity-50" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="font-bold text-xs truncate leading-tight">{channel.name}</div>
                                    </div>
                                    {selectedChannel?.url === channel.url && (
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>
                                    )}
                                </button>
                            ))
                        )}
                     </div>
                 </div>
            </div>
        </div>

        {/* Bottom Ticker Tape */}
        <div className="h-8 md:h-10 bg-black border-t border-gold-600 flex items-center overflow-hidden relative z-20 flex-shrink-0">
            <div className="px-2 md:px-4 h-full flex items-center bg-gold-600 text-black font-black text-[10px] md:text-xs uppercase tracking-widest z-10 relative shadow-xl clip-path-slant whitespace-nowrap">
                Market
            </div>
            
            <div className="flex-1 overflow-hidden relative h-full flex items-center">
                 <div className="flex animate-marquee items-center whitespace-nowrap">
                    {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 md:px-6 border-r border-white/10">
                            <span className="text-zinc-400 text-[10px] md:text-xs font-bold">{item.label}</span>
                            <span className="text-white font-mono font-bold text-xs md:text-sm">{item.val}</span>
                            <span className={`text-[9px] ${item.up ? 'text-green-500' : 'text-red-500'}`}>
                                 {item.up ? '▲' : '▼'}
                            </span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    </div>
  );
};
