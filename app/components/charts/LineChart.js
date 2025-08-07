'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import React, { useRef, useEffect, useState } from 'react';
import { colors } from '@/app/styles/designTokens';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

export default function LegacyConvertedGradientChart({ data, eventType }) {
    const chartRef = useRef(null);
    const [gradient, setGradient] = useState(null);

    // Extract daily stats for the current eventType
    const dailyStats = data?.stats?.[eventType]?.daily || {};

    // Prepare chart data
    const labels = Object.keys(dailyStats).sort();
    const values = labels.map(date => {
        const stat = dailyStats[date];
        return stat?.count || stat?.totalCount || 0;
    });

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        const chartArea = chart.chartArea;

        if (!chartArea) return;

        const gradient = ctx.createLinearGradient(
            0, chartArea.top,
            0, chartArea.bottom
        );

        gradient.addColorStop(0, colors.primary_rgba(0.7));
        gradient.addColorStop(1, colors.primary_rgba(0));

        setGradient(gradient);
    }, [data, eventType]);

    const chartData = {
        labels,
        datasets: [
            {
                label: `${eventType.replace(/_/g, ' ')} per day`,
                data: values,
                borderColor: colors.primary,
                backgroundColor: gradient,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: colors.primary,
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { weight: 'bold' },
                callbacks: {
                    label: (context) => {
                        const date = context.label;
                        const stats = dailyStats[date] || {};
                        return [
                            `Events: ${stats.count || stats.totalCount || 0}`,
                            `Time: ${stats.timeTaken || 0}ms`,
                        ];
                    },
                    title: (context) => context[0].label,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => Number.isInteger(value) ? value : '',
                },
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
        },
    };

    if (labels.length === 0) {
        return (
            <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                    <div className="text-gray-400 mb-2">📊</div>
                    <p className="text-sm text-gray-500">
                        No {eventType.replace(/_/g, ' ')} activity recorded yet
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <Line
                ref={chartRef}
                data={chartData}
                options={options}
                redraw={true}
            />
        </div>
    );
}
