import { useState, useEffect } from 'react';
import { invoiceRepo } from '../db/repositories/invoiceRepository';
import { projectRepo } from '../db/repositories/projectRepository';
import { clientRepo } from '../db/repositories/clientRepository';

export const useDashboardMetrics = () => {
    const [data, setData] = useState({
        monthlyRevenue: 0,
        monthlyHours: 0,
        ytdRevenue: 0,
        ytdHours: 0,
        activeProjects: 0,
        totalClients: 0,
        recentInvoices: [],
        revenueTrend: [], // { name: 'Month', revenue: 0, hours: 0 }
        clientRevenue: [], // { name: 'Client', value: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invoices, projects, clients] = await Promise.all([
                    invoiceRepo.getAll(),
                    projectRepo.getAll(),
                    clientRepo.getAll()
                ]);

                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                // Sort invoices by date desc
                const sortedInvoices = [...invoices].sort((a, b) => 
                    new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
                );

                // --- Calculate Metrics ---
                let monthlyRev = 0;
                let monthlyHrs = 0;
                let ytdRev = 0;
                let ytdHrs = 0;
                const clientRevMap = {};
                const trendMap = {}; // "YYYY-MM" -> { revenue, hours }

                // Initialize trend map for last 6 months
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    const monthName = d.toLocaleString('default', { month: 'short' });
                    trendMap[key] = { name: monthName, revenue: 0, hours: 0, sortKey: key };
                }

                invoices.forEach(inv => {
                    const d = new Date(inv.invoiceDate);
                    const amount = Number(inv.totalAmount) || 0;
                    const hours = Number(inv.totalHours) || 0;
                    
                    // Monthly & YTD
                    if (d.getFullYear() === currentYear) {
                        ytdRev += amount;
                        ytdHrs += hours;
                        if (d.getMonth() === currentMonth) {
                            monthlyRev += amount;
                            monthlyHrs += hours;
                        }
                    }

                    // Client Revenue
                    const clientName = inv.client?.name || 'Unknown';
                    clientRevMap[clientName] = (clientRevMap[clientName] || 0) + amount;

                    // Trend Data
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    if (trendMap[key]) {
                        trendMap[key].revenue += amount;
                        trendMap[key].hours += hours;
                    }
                });

                // Format Trend Data
                const revenueTrend = Object.values(trendMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

                // Format Client Revenue Data
                const clientRevenue = Object.entries(clientRevMap)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value); // Descending

                setData({
                    monthlyRevenue: monthlyRev,
                    monthlyHours: monthlyHrs,
                    ytdRevenue: ytdRev,
                    ytdHours: ytdHrs,
                    activeProjects: projects.length, // Assuming all projects in DB are active
                    totalClients: clients.length,
                    recentInvoices: sortedInvoices.slice(0, 5),
                    revenueTrend,
                    clientRevenue
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};
