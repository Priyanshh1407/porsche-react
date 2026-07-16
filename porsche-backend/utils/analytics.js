import prisma from '../prisma/client.js';

class Analytics {
    // Track conversion funnel
    static async getConversionStats(timeRange = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - timeRange);

            const stats = await prisma.contact.groupBy({
                by: ['status'],
                where: {
                    createdAt: { gte: startDate }
                },
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
    static async getModelPopularity(timeRange = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - timeRange);

            const modelStats = await prisma.contact.groupBy({
                by: ['modelInterest'],
                where: {
                    createdAt: { gte: startDate },
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
                model: stat.modelInterest.replace('_', ' '),
                count: stat._count.modelInterest
            }));
        } catch (error) {
            console.error('Analytics model popularity error:', error);
            return [];
        }
    }

    // Track inquiry trends
    static async getInquiryTrends(days = 7) {
        try {
            // Prisma doesn't have a direct grouping by DATE() function natively without raw SQL,
            // but we can query raw or fetch and group in memory if the data isn't huge.
            // For Postgres, we can use queryRaw.
            const trends = await prisma.$queryRaw`
                SELECT DATE("createdAt") as date, "inquiryType", COUNT(*) as count
                FROM "Contact"
                WHERE "createdAt" >= NOW() - INTERVAL '1 day' * ${days}
                GROUP BY DATE("createdAt"), "inquiryType"
                ORDER BY date ASC
            `;

            return trends.map(t => ({
                _id: {
                    date: t.date.toISOString().split('T')[0],
                    inquiryType: t.inquiryType
                },
                count: Number(t.count)
            }));
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
