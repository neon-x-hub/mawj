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

export default function LegacyConvertedGradientChart() {
    const chartRef = useRef(null);
    const [gradient, setGradient] = useState(null);

    const labels = ["02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00"];
    const values = [25.0, 32.4, 22.2, 39.4, 34.2, 22.0, 23.2, 24.1, 20.0, 18.4, 19.1, 17.4];

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;
        const ctx = chart.ctx;
        const height = chart.chartArea?.bottom || 400;

        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, colors.primary_rgba(0.7));
        grad.addColorStop(1, colors.primary_rgba(0));

        setGradient(grad);
    }, []);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Temperature',
                data: values,
                borderColor: colors.primary,
                backgroundColor: gradient,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: colors.primary,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            point: {
                radius: 2,
                borderWidth: 1,
            },
            line: {
                borderWidth: 3,
            },
        },
        plugins: {
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { weight: 'bold' },
                callbacks: {
                    label: (context) => `${context.parsed.y}°C`,
                    title: (context) => `${context[0].label} hod`,
                },
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: (value) => `${value}°C`,
                },
            },
        },
    };

    return (
        <div style={{ height: '100%' }}>
            {<Line ref={chartRef} data={data} options={options} />}
        </div>
    );
}
