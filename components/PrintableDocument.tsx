import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Printer, FileText, Save, ZoomIn, ZoomOut, QrCode } from 'lucide-react';
import { Settings as SettingsType } from '../types';
import { exportToCSV } from '../utils/exporter';

interface PrintableDocumentProps {
    data: any | any[];
    type: 'BUY' | 'SELL' | 'ANALYSIS' | 'EXPENSE' | 'PERMISSION' | 'REPORT';
    settings: SettingsType;
    onClose: () => void;
}

export const PrintableDocument = ({ data, type, settings, onClose }: PrintableDocumentProps) => {
    const [zoom, setZoom] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Professional Color Palette & Config
    const getConfig = () => {
        switch(type) {
            case 'BUY': 
                return { 
                    ar: 'فاتورة شراء ذهب', en: 'PURCHASE INVOICE', 
                    themeColor: '#1e3a8a', // Dark Blue
                    themeBg: 'bg-blue-50',
                    themeBorder: 'border-blue-900',
                    themeText: 'text-blue-900'
                };
            case 'SELL': 
                return { 
                    ar: 'فاتورة بيع ضريبية', en: 'TAX SALES INVOICE', 
                    themeColor: '#78350f', // Dark Amber
                    themeBg: 'bg-amber-50',
                    themeBorder: 'border-amber-800',
                    themeText: 'text-amber-900'
                };
            case 'ANALYSIS': 
                return { 
                    ar: 'شهادة فحص وتحليل', en: 'ASSAY CERTIFICATE', 
                    themeColor: '#581c87', // Dark Purple
                    themeBg: 'bg-purple-50',
                    themeBorder: 'border-purple-900',
                    themeText: 'text-purple-900'
                };
            case 'EXPENSE': 
                return { 
                    ar: 'سند صرف نقدية', en: 'PAYMENT VOUCHER', 
                    themeColor: '#7f1d1d', // Dark Red
                    themeBg: 'bg-red-50',
                    themeBorder: 'border-red-900',
                    themeText: 'text-red-900'
                };
            case 'PERMISSION': 
                return { 
                    ar: 'تصريح خروج / نقل', en: 'SECURITY GATE PASS', 
                    themeColor: '#c2410c', // Dark Orange
                    themeBg: 'bg-orange-50',
                    themeBorder: 'border-orange-800',
                    themeText: 'text-orange-900'
                };
            default: 
                return { 
                    ar: 'تقرير عام', en: 'GENERAL REPORT', 
                    themeColor: '#18181b', // Zinc 900
                    themeBg: 'bg-gray-50',
                    themeBorder: 'border-black',
                    themeText: 'text-black'
                };
        }
    };
    
    const config = getConfig();
    const printSettings = settings.printSettings;
    const paperSize = printSettings.paperSize || 'A5';

    // Paper Dimensions Logic
    let paperClass = "";
    let pageStyle = "";
    
    if (paperSize === 'A5') {
        paperClass = "w-[148mm] min-h-[210mm] text-[12px]";
        pageStyle = `@page { size: A5; margin: 0; }`;
    } else if (paperSize === '1015') {
        paperClass = "w-[100mm] min-h-[150mm] text-[11px]";
        pageStyle = `@page { size: 100mm 150mm; margin: 0; }`;
    } else if (paperSize === 'RECEIPT') {
        paperClass = "w-[80mm] min-h-auto text-[10px]";
        pageStyle = `@page { size: 80mm auto; margin: 0; }`;
    } else {
        paperClass = "w-[210mm] min-h-[297mm] text-sm";
        pageStyle = `@page { size: A4; margin: 0; }`;
    }

    const handlePrint = () => {
        document.title = `${config.en}_${data.id || 'Doc'}`;
        window.print();
    };

    const handlePDF = () => {
        document.title = `PyramidsGold_${type}_${data.id || Date.now()}`;
        window.print();
    };

    const handleExcel = () => {
        const rows = Array.isArray(data) ? data : [data];
        exportToCSV(rows, `${config.en}_${Date.now()}`);
    };

    const handleSaveJSON = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Record_${data.id || Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate Totals for Arrays
    const calculateTotal = () => {
        if (Array.isArray(data)) {
            return data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
        }
        return data.totalAmount || 0;
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex justify-center overflow-hidden font-sans print:bg-white print:block print:inset-auto print:z-auto print:static">
            <style>
                {`
                ${pageStyle}
                @media print { 
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; overflow: visible !important; }
                    .no-print, .sidebar-controls { display: none !important; }
                    .print-shadow-none { box-shadow: none !important; transform: none !important; margin: 0 !important; }
                    .print-m-0 { margin: 0 !important; }
                    #root { display: none; }
                    .print-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; background: white; }
                    .print-content { transform: none !important; opacity: 1 !important; }
                    /* Force black text for printers */
                    .print-text-black { color: #000 !important; }
                    .print-border-black { border-color: #000 !important; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #111; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
                `}
            </style>

            {/* === SIDEBAR CONTROLS === */}
            <div className="sidebar-controls fixed top-0 left-0 bottom-0 w-24 bg-zinc-900 border-r border-gold-500/20 flex flex-col items-center py-6 gap-4 z-[100000] shadow-2xl">
                <button 
                    onClick={onClose} 
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex flex-col items-center justify-center shadow-lg transition-all hover:scale-110 mb-4 group"
                    title="Close"
                >
                    <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                </button>
                <div className="w-12 h-px bg-white/10 mb-2"></div>
                <button onClick={handlePrint} className="w-14 h-14 rounded-xl bg-gold-500 hover:bg-gold-400 text-black flex flex-col items-center justify-center shadow-lg transition-all hover:scale-105" title="Print">
                    <Printer className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-bold">طباعة</span>
                </button>
                <button onClick={handlePDF} className="w-14 h-14 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105" title="PDF">
                    <FileText className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-bold">PDF</span>
                </button>
                <button onClick={handleExcel} className="w-14 h-14 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-green-400 border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105" title="Excel">
                    <FileSpreadsheet className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-bold">Excel</span>
                </button>
                <button onClick={handleSaveJSON} className="w-14 h-14 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-blue-400 border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105" title="Save JSON">
                    <Save className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-bold">حفظ</span>
                </button>
                <div className="mt-auto flex flex-col gap-2">
                    <button onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))} className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* === DOCUMENT === */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 ml-24 flex items-start justify-center custom-scrollbar h-full bg-[#0a0a0a] print:ml-0 print:p-0 print:h-auto print:block print:bg-white print-container" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div 
                    className={`print-content relative transition-all duration-500 ease-out transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                >
                    {/* Shadow & Glow (Screen Only) */}
                    <div className={`no-print absolute inset-0 bg-white/5 blur-3xl -z-10 rounded-[30px]`}></div>
                    
                    {/* PAPER START */}
                    <div className={`bg-white text-black relative shadow-2xl mx-auto flex flex-col print-shadow-none print-m-0 overflow-hidden ${paperClass}`}>
                        
                        {/* Decorative Top Border */}
                        <div className="h-3 w-full print-color-adjust" style={{ backgroundColor: config.themeColor }}></div>

                        {/* Header Section */}
                        <header className="p-8 pb-4 flex justify-between items-start border-b border-gray-100">
                            {/* Company Info (Right) */}
                            <div className="flex-1 text-right">
                                <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1" style={{ color: printSettings.primaryColor !== '#000000' ? printSettings.primaryColor : undefined }}>
                                    {printSettings.companyName}
                                </h1>
                                <p className="text-sm font-bold text-black mb-2">{printSettings.companyAddress}</p>
                                <div className="text-xs text-black space-y-0.5 font-mono">
                                    <p>ت. ضريبي: <span className="font-bold text-black">{printSettings.taxNumber}</span></p>
                                    <p>س. تجاري: <span className="font-bold text-black">{printSettings.commercialRegister}</span></p>
                                    <p>هاتف: <span className="font-bold text-black">{printSettings.contactNumber}</span></p>
                                </div>
                            </div>

                            {/* Center Info / Logo (If available) */}
                            {printSettings.logoUrl && (
                                <div className="flex-shrink-0 mx-6">
                                    <img src={printSettings.logoUrl} alt="Logo" className="h-24 w-auto object-contain grayscale opacity-80" />
                                </div>
                            )}

                            {/* Document Title (Left) */}
                            <div className="flex-1 text-left flex flex-col items-end">
                                <div className={`inline-block px-4 py-2 border-2 text-sm font-bold uppercase tracking-widest mb-2 ${config.themeText} ${config.themeBorder} ${config.themeBg}`}>
                                    {config.en}
                                </div>
                                <h2 className={`text-xl font-bold ${config.themeText}`}>{config.ar}</h2>
                                <div className="mt-auto">
                                   <QrCode className="w-12 h-12 text-gray-800" />
                                </div>
                            </div>
                        </header>

                        {/* Meta Data Grid */}
                        <div className="p-8 py-4">
                            <div className="grid grid-cols-3 gap-0 border border-gray-300 print-border-black">
                                <div className="border-l border-gray-300 p-3 bg-gray-50 print-border-black">
                                    <span className="block text-[10px] font-bold text-black uppercase">رقم المستند NO.</span>
                                    <span className="block text-lg font-mono font-bold text-black">{data.id || '---'}</span>
                                </div>
                                <div className="border-l border-gray-300 p-3 bg-gray-50 print-border-black">
                                    <span className="block text-[10px] font-bold text-black uppercase">التاريخ DATE</span>
                                    <span className="block text-lg font-mono font-bold text-black">{data.date || new Date().toISOString().split('T')[0]}</span>
                                </div>
                                <div className="p-3 bg-gray-50">
                                    <span className="block text-[10px] font-bold text-black uppercase">المستخدم USER</span>
                                    <span className="block text-lg font-bold text-black">{type === 'PERMISSION' ? 'Security' : 'Admin'}</span>
                                </div>
                            </div>

                            {/* Customer/Employee Section */}
                            {!Array.isArray(data) && (
                                <div className="mt-4 border border-gray-300 print-border-black p-3 flex justify-between items-center">
                                    <div>
                                        <span className="block text-[10px] font-bold text-black uppercase">
                                            {type === 'PERMISSION' ? 'الموظف / السائق' : 'العميل / السيد'}
                                        </span>
                                        <span className="block text-xl font-bold text-black mt-1">
                                            {data.customerName || data.employeeName || 'عميل نقدي'}
                                        </span>
                                    </div>
                                    {data.phone && (
                                        <div className="text-right">
                                            <span className="block text-[10px] font-bold text-black uppercase">رقم الهاتف</span>
                                            <span className="block text-base font-mono font-bold text-black">{data.phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Content Body */}
                        <main className="flex-1 px-8">
                            {type === 'PERMISSION' ? (
                                <div className="space-y-6 mt-2">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="border border-black p-4 rounded bg-gray-50">
                                            <span className="block text-xs font-bold text-black mb-1">من (From)</span>
                                            <span className="block font-bold text-black">المقر الرئيسي - الإدارة</span>
                                        </div>
                                        <div className="border border-black p-4 rounded bg-gray-50">
                                            <span className="block text-xs font-bold text-black mb-1">إلى (Destination)</span>
                                            <span className="block font-bold text-black">{data.destination}</span>
                                        </div>
                                    </div>
                                    <div className="border border-black p-4 rounded min-h-[150px]">
                                        <span className="block text-xs font-bold text-black mb-2 border-b border-black pb-2">بيان المنقولات / العهدة (Items)</span>
                                        <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-black">{data.items}</p>
                                    </div>
                                </div>
                            ) : (
                                <table className="w-full text-right border-collapse border border-gray-300 print-border-black">
                                    <thead className={`${config.themeBg} print-color-adjust`}>
                                        <tr>
                                            <th className={`border border-gray-300 print-border-black p-3 text-xs font-bold text-black uppercase w-12 text-center`}>#</th>
                                            <th className={`border border-gray-300 print-border-black p-3 text-xs font-bold text-black uppercase`}>البيان / الوصف</th>
                                            <th className={`border border-gray-300 print-border-black p-3 text-xs font-bold text-black uppercase w-24 text-center`}>الوزن</th>
                                            {type !== 'EXPENSE' && <th className={`border border-gray-300 print-border-black p-3 text-xs font-bold text-black uppercase w-24 text-center`}>العيار</th>}
                                            {type !== 'ANALYSIS' && <th className={`border border-gray-300 print-border-black p-3 text-xs font-bold text-black uppercase w-32 text-left`}>السعر / القيمة</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {!Array.isArray(data) ? (
                                            <tr>
                                                <td className="border border-gray-300 print-border-black p-4 text-center font-mono text-black">01</td>
                                                <td className="border border-gray-300 print-border-black p-4 font-bold text-black">
                                                    {type === 'BUY' && (data.details?.goldType === 'raw' ? 'شراء ذهب خام (Raw Gold)' : 'شراء ذهب كسر (Scrap Gold)')}
                                                    {type === 'SELL' && (data.details?.goldType === 'raw' ? 'بيع ذهب خام (Raw Gold)' : 'بيع ذهب كسر (Scrap Gold)')}
                                                    {type === 'ANALYSIS' && 'خدمة فحص وتحليل فني'}
                                                    {type === 'EXPENSE' && (data.description || data.details?.category)}
                                                    {(type === 'ANALYSIS' || type === 'EXPENSE') && data.details?.type && <span className="text-xs text-black block mt-1"> النوع: {data.details.type}</span>}
                                                </td>
                                                <td className="border border-gray-300 print-border-black p-4 text-center font-mono font-bold text-black">{data.weight ? data.weight.toFixed(2) : '-'}</td>
                                                {type !== 'EXPENSE' && <td className="border border-gray-300 print-border-black p-4 text-center font-mono font-bold text-black">{data.karat || '-'}</td>}
                                                {type !== 'ANALYSIS' && (
                                                    <td className="border border-gray-300 print-border-black p-4 text-left font-mono font-bold text-black">
                                                        {data.totalAmount?.toLocaleString()}
                                                    </td>
                                                )}
                                            </tr>
                                        ) : (
                                            data.map((row: any, i: number) => (
                                                <tr key={i} className="even:bg-gray-50 print:even:bg-transparent">
                                                    <td className="border border-gray-300 print-border-black p-2 text-center text-xs text-black">{i+1}</td>
                                                    <td className="border border-gray-300 print-border-black p-2 font-bold text-black">{row.type === 'BUY' ? 'شراء' : row.type === 'SELL' ? 'بيع' : row.customerName || 'عملية'}</td>
                                                    <td className="border border-gray-300 print-border-black p-2 text-center font-mono text-black">{row.weight}</td>
                                                    <td className="border border-gray-300 print-border-black p-2 text-center font-mono text-black">{row.karat}</td>
                                                    <td className="border border-gray-300 print-border-black p-2 text-left font-mono text-black">{row.totalAmount.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        )}
                                        
                                        {/* Blank rows to fill space if needed */}
                                        {!Array.isArray(data) && (
                                            <>
                                                <tr className="h-8"><td className="border border-gray-300 print-border-black" colSpan={5}></td></tr>
                                                <tr className="h-8"><td className="border border-gray-300 print-border-black" colSpan={5}></td></tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {/* Totals Section */}
                            <div className="flex justify-end mt-4">
                                <div className="w-1/2 border border-gray-300 print-border-black">
                                    <div className="flex justify-between items-center p-3 border-b border-gray-300 print-border-black bg-gray-50">
                                        <span className="font-bold text-sm text-black">المجموع Total</span>
                                        <span className="font-mono font-bold text-black">{calculateTotal().toLocaleString()}</span>
                                    </div>
                                    <div className={`flex justify-between items-center p-4 ${config.themeBg} print-color-adjust`}>
                                        <span className={`font-black text-lg ${config.themeText}`}>الإجمالي النهائي NET</span>
                                        <span className={`font-mono font-black text-xl ${config.themeText}`}>
                                            {calculateTotal().toLocaleString()} <span className="text-xs">EGP</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* Footer */}
                        <footer className="p-8 mt-auto">
                            <div className="grid grid-cols-2 gap-12 mb-8">
                                <div className="text-center">
                                    <div className="h-16 border-b border-dashed border-gray-400 mb-2"></div>
                                    <span className="text-xs font-bold text-black uppercase">توقيع المستلم / العميل</span>
                                </div>
                                <div className="text-center">
                                    <div className="h-16 border-b border-dashed border-gray-400 mb-2"></div>
                                    <span className="text-xs font-bold text-black uppercase">توقيع المدير / المحاسب</span>
                                </div>
                            </div>
                            
                            <div className="text-center border-t border-gray-200 pt-4">
                                <p className="text-[10px] text-black mb-1 leading-tight">
                                    {printSettings.footerText}
                                </p>
                                <p className="text-[9px] text-black font-mono">
                                    System Generated by Pyramids Gold v2.0 | {new Date().toISOString()}
                                </p>
                            </div>
                        </footer>

                        {/* Bottom Color Strip */}
                        <div className="h-2 w-full print-color-adjust" style={{ backgroundColor: config.themeColor }}></div>
                    </div>
                    {/* PAPER END */}
                </div>
            </div>
        </div>
    );
};