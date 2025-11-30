
import { MarketData } from '../types';

// API Key Configuration
const GOLD_API_KEY = 'goldapi-15c87jsmil7xo6m-io';

export const MarketService = {
    async getLivePrices(): Promise<MarketData | null> {
        const prices: MarketData = { gold24: 0, gold21: 0, gold18: 0, usd: 0, ouncePriceUSD: 0, source: '' };
        
        const parseArabicNumber = (text: string) => {
            const clean = text.replace(/[^0-9.]/g, ''); 
            return parseFloat(clean);
        };

        // 1. Fetch Currency (USD) - Essential for reference and fallbacks
        try {
            const currencyRes = await fetch('https://open.er-api.com/v6/latest/USD');
            if (currencyRes.ok) {
                const cData = await currencyRes.json();
                prices.usd = Number(cData.rates.EGP.toFixed(2));
            }
        } catch (e) {
            console.warn("Currency fetch failed", e);
        }

        // 2. Try GoldAPI.io (Priority 1: Dedicated API Key)
        try {
            const myHeaders = new Headers();
            myHeaders.append("x-access-token", GOLD_API_KEY);
            myHeaders.append("Content-Type", "application/json");

            const requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            } as RequestInit;

            // Fetching XAU/EGP directly
            const response = await fetch("https://www.goldapi.io/api/XAU/EGP", requestOptions);
            
            if (response.ok) {
                const result = await response.json();
                
                // result.price is the price of 1 Ounce in EGP
                if (result.price) {
                     const ouncePriceEGP = result.price;
                     // 1 Troy Ounce = 31.1034768 grams
                     const gram24 = ouncePriceEGP / 31.1035;
                     
                     prices.gold24 = Math.floor(gram24);
                     prices.gold21 = Math.floor(gram24 * 0.875);
                     prices.gold18 = Math.floor(gram24 * 0.750);
                     
                     // Calculate USD Ounce based on exchange rate if available
                     if (prices.usd > 0) {
                        prices.ouncePriceUSD = Math.round(ouncePriceEGP / prices.usd);
                     }

                     prices.source = 'GoldAPI.io';
                     
                     return prices;
                }
            } else {
                console.warn(`GoldAPI Error: ${response.status}`);
            }
        } catch (error) {
            console.warn("GoldAPI failed, falling back to local scraping", error);
        }

        // 3. Try Fetching Local Market via Scraping (Priority 2)
        try {
            const targetUrl = 'https://egypt.gold-price-today.com/';
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
            
            const scrapRes = await fetch(proxyUrl);
            const scrapData = await scrapRes.json();
            
            if (scrapData.contents) {
                const html = scrapData.contents;
                const match24 = html.match(/سعر جرام الذهب عيار 24.*?(\d{1,3}(?:,\d{3})*)/s);
                const match21 = html.match(/سعر جرام الذهب عيار 21.*?(\d{1,3}(?:,\d{3})*)/s);
                const match18 = html.match(/سعر جرام الذهب عيار 18.*?(\d{1,3}(?:,\d{3})*)/s);

                if (match24 && match21 && match18) {
                    prices.gold24 = parseArabicNumber(match24[1]);
                    prices.gold21 = parseArabicNumber(match21[1]);
                    prices.gold18 = parseArabicNumber(match18[1]);
                    prices.source = 'Gold-Price-Today.com';
                    
                    // Estimate Ounce USD
                    if(prices.usd > 0) {
                        const ounceEGP = prices.gold24 * 31.1035;
                        prices.ouncePriceUSD = Math.round(ounceEGP / prices.usd);
                    }

                    return prices;
                }
            }
        } catch (e) {
            console.warn("Scraping failed, trying fallback calculation");
        }

        // 4. Fallback to Global API Calculation (Priority 3)
        // Only runs if previous methods failed (gold24 is still 0)
        if (prices.gold24 === 0) {
             const res = await fetch('https://open.er-api.com/v6/latest/USD');
             const data = await res.json();
             if (data && data.rates) {
                const usdToEgp = data.rates.EGP;
                const xauRate = data.rates.XAU; 
                
                const ouncePriceUSD = 1 / xauRate;
                const ouncePriceEGP = ouncePriceUSD * usdToEgp;
                const gram24EGP = ouncePriceEGP / 31.1035;

                prices.gold24 = Math.floor(gram24EGP);
                prices.gold21 = Math.floor(gram24EGP * 0.875);
                prices.gold18 = Math.floor(gram24EGP * 0.750);
                prices.ouncePriceUSD = Math.round(ouncePriceUSD);
                
                if(prices.usd === 0) prices.usd = Number(usdToEgp.toFixed(2));
                
                prices.source = 'Global Market (Calc)';
             }
        }
        
        return prices.gold24 > 0 ? prices : null;
    }
};
