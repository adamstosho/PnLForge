import type { Trade } from './types'

/**
 * Generates 60-100 trades from Jan 1 - Feb 16, 2026 with realistic characteristics
 */

const SYMBOLS = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'AVAX-PERP', 'MATIC-PERP', 'ARB-PERP']
const SIDES: ('long' | 'short')[] = ['long', 'short']
const ORDER_TYPES: ('market' | 'limit')[] = ['market', 'limit']
const TAGS = ['breakout', 'momentum', 'swing', 'scalping', 'trending', 'reversal', 'support', 'resistance']

// Price ranges for different symbols (realistic for 2026)
const PRICE_RANGES: Record<string, { min: number; max: number }> = {
    'BTC-PERP': { min: 42000, max: 48000 },
    'ETH-PERP': { min: 2200, max: 2600 },
    'SOL-PERP': { min: 95, max: 125 },
    'AVAX-PERP': { min: 32, max: 45 },
    'MATIC-PERP': { min: 0.75, max: 1.05 },
    'ARB-PERP': { min: 1.8, max: 2.4 },
}

/**
 * Simple seeded random number generator (mulberry32)
 */
function seededRandom(seed: number) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

/**
 * Generate a numeric seed from a string (e.g. wallet address)
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

/**
 * Generate an array of realistic trades, optionally seeded by wallet address
 */
export function generateMockTrades(count: number = 60, seedString?: string): Trade[] {
    const seed = seedString ? hashString(seedString) : 12345;
    const rng = seededRandom(seed);

    // Override local random functions to use our RNG
    const localRandomInRange = (min: number, max: number) => rng() * (max - min) + min;
    const localRandomIntInRange = (min: number, max: number) => Math.floor(rng() * (max - min) + min);
    const localRandomChoice = <T>(array: T[]) => array[Math.floor(rng() * array.length)];
    const localRandomDate = (start: Date, end: Date) => new Date(start.getTime() + rng() * (end.getTime() - start.getTime()));

    const startDate = new Date('2026-01-01T00:00:00Z');
    const endDate = new Date('2026-02-16T10:59:59Z');

    const trades: Trade[] = [];

    for (let i = 0; i < count; i++) {
        const symbol = localRandomChoice(SYMBOLS);
        const side = localRandomChoice(SIDES);
        const orderType = localRandomChoice(ORDER_TYPES);

        const priceRange = PRICE_RANGES[symbol];
        const entryPrice = localRandomInRange(priceRange.min, priceRange.max);

        // Deterministic win rate based on seed + index to feel organic
        const winChance = seedString ? 0.58 : 0.60;
        const isWin = rng() < winChance;
        const priceChangePercent = isWin
            ? localRandomInRange(0.5, 4.0)
            : localRandomInRange(-3.5, -0.1);

        const priceChange = entryPrice * (priceChangePercent / 100);
        const exitPrice = side === 'long'
            ? entryPrice + priceChange
            : entryPrice - priceChange;

        let size: number;
        if (symbol === 'BTC-PERP') size = localRandomInRange(0.01, 0.4);
        else if (symbol === 'ETH-PERP') size = localRandomInRange(0.2, 4.0);
        else if (symbol === 'SOL-PERP') size = localRandomInRange(5, 120);
        else size = localRandomInRange(50, 500);

        const pnl = side === 'long'
            ? (exitPrice - entryPrice) * size
            : (entryPrice - exitPrice) * size;

        const positionValue = entryPrice * size;
        const totalFees = positionValue * localRandomInRange(0.0004, 0.0009);

        const makerFee = orderType === 'limit' ? totalFees * 0.65 : totalFees * 0.25;
        const takerFee = orderType === 'market' ? totalFees * 0.75 : totalFees * 0.35;
        const otherFee = totalFees - makerFee - takerFee;

        const entryTime = localRandomDate(startDate, endDate);
        const durationMinutes = localRandomIntInRange(10, 1440); // Up to 24h
        const exitTime = new Date(entryTime.getTime() + durationMinutes * 60 * 1000);

        const numTags = localRandomIntInRange(1, 3);
        const tradeTags = Array.from({ length: numTags }, () => localRandomChoice(TAGS))
            .filter((tag, index, self) => self.indexOf(tag) === index);

        trades.push({
            id: `tr-${seed.toString(16)}-${i}`,
            wallet_address: seedString || 'solana:7kL5m2n3pQ8xY9zR4vW1bC6tH8jK0mN',
            market: 'Deriverse',
            symbol,
            side,
            order_type: orderType,
            size: parseFloat(size.toFixed(4)),
            entry_price: parseFloat(entryPrice.toFixed(2)),
            exit_price: parseFloat(exitPrice.toFixed(2)),
            entry_time: entryTime.toISOString(),
            exit_time: exitTime.toISOString(),
            pnl: parseFloat(pnl.toFixed(2)),
            fees: parseFloat(totalFees.toFixed(2)),
            fees_breakdown: {
                maker: parseFloat(makerFee.toFixed(2)),
                taker: parseFloat(takerFee.toFixed(2)),
                other: parseFloat(otherFee.toFixed(2)),
            },
            tags: tradeTags,
            reviewed: rng() > 0.4,
        });
    }

    trades.sort((a, b) => new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime());
    return trades;
}

/**
 * Get the default trade dataset
 */
let cachedTrades: { [key: string]: Trade[] } = {};

export function getDefaultTrades(seedString?: string): Trade[] {
    const key = seedString || 'default';
    if (!cachedTrades[key]) {
        cachedTrades[key] = generateMockTrades(seedString ? 120 : 80, seedString);
    }
    return cachedTrades[key];
}

export function resetTrades(): void {
    cachedTrades = {};
}
