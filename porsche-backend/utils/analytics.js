import prisma from '../prisma/client.js';
import { modelLabel } from '../config/contactOptions.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDay = (d) => d.toISOString().split('T')[0]; // UTC, like DATE() on the stored UTC timestamps

/**
 * One { date, count } per day for the `days` days ending `today`, oldest first. Rows for the same
 * day (e.g. one per inquiry type) are added up, days without enquiries are 0 and rows outside the
 * window are ignored, so the chart always has a full axis.
 */
export function fillDailyTrend(rows, days, today = new Date()) {
    const byDay = new Map();
    for (let i = days - 1; i >= 0; i--) byDay.set(isoDay(new Date(today.getTime() - i * DAY_MS)), 0);
    for (const { date, count } of rows) {
        if (byDay.has(date)) byDay.set(date, byDay.get(date) + Number(count));
    }
    return [...byDay].map(([date, count]) => ({ date, count }));
}

// `timeRange` in days, or null for all time.
const since = (timeRange) => {
    if (timeRange == null) return {};
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);
    return { createdAt: { gte: startDate } };
};

class Analytics {
    // Track conversion funnel
    static async getConversionStats(timeRange = null) {
        try {
            const stats = await prisma.contact.groupBy({
                by: ['status'],
                where: since(timeRange),
                _count: {
                    status: true
                }
            });

            let total = 0;
            const conversions = {
                new: 0,
                contacted: 0,
                qualified: 0,
                closed: 0
            };

            stats.forEach(stat => {
                const count = stat._count.status;
                total += count;
                conversions[stat.status] = count;
            });

            return {
                total,
                conversions,
                conversionRate: total > 0 ? ((conversions.closed / total) * 100).toFixed(2) : 0,
                contactedRate: total > 0 ? (((conversions.contacted + conversions.qualified + conversions.closed) / total) * 100).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Analytics conversion stats error:', error);
            return null;
        }
    }

    // Track popular models
    static async getModelPopularity(timeRange = null) {
        try {
            const modelStats = await prisma.contact.groupBy({
                by: ['modelInterest'],
                where: {
                    ...since(timeRange),
                    modelInterest: { not: 'Not_specified' }
                },
                _count: {
                    modelInterest: true
                },
                orderBy: {
                    _count: {
                        modelInterest: 'desc'
                    }
                }
            });

            return modelStats.map(stat => ({
                model: modelLabel(stat.modelInterest),
                count: stat._count.modelInterest
            }));
        } catch (error) {
            console.error('Analytics model popularity error:', error);
            return [];
        }
    }

    // Enquiries per day for the last `days` days (today included), every day present.
    static async getInquiryTrends(days = 30) {
        try {
            const rows = await prisma.$queryRaw`
                SELECT DATE("createdAt") as date, COUNT(*) as count
                FROM "Contact"
                WHERE "createdAt" >= CURRENT_DATE - (${days} - 1) * INTERVAL '1 day'
                GROUP BY DATE("createdAt")
            `;
            return fillDailyTrend(rows.map((r) => ({ date: isoDay(r.date), count: Number(r.count) })), days);
        } catch (error) {
            console.error('Analytics inquiry trends error:', error);
            return [];
        }
    }

    // Peak hours analysis
    static async getPeakHours(days = 30) {
        try {
            const hourlyData = await prisma.$queryRaw`
                SELECT EXTRACT(HOUR FROM "createdAt") as hour, COUNT(*) as count
                FROM "Contact"
                WHERE "createdAt" >= NOW() - INTERVAL '1 day' * ${days}
                GROUP BY EXTRACT(HOUR FROM "createdAt")
                ORDER BY hour ASC
            `;

            return hourlyData.map(data => ({
                hour: Number(data.hour),
                count: Number(data.count)
            }));
        } catch (error) {
            console.error('Analytics peak hours error:', error);
            return [];
        }
    }
}

export default Analytics;
