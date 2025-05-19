import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
import styles from '../../styles/Chart.module.css';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const SentimentGraph = ({ data }) => {
    if (!data || data.length === 0) {
        return <div>Data not found or incorrect path in JSON structure</div>;
    }

    const labels = data.map(entry => entry.date);
    const positiveMentions = data.map(entry => entry.positiveMentionCount);
    const negativeMentions = data.map(entry => entry.negativeMentionCount);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Positive Mentions',
                data: positiveMentions,
                borderColor: 'rgba(0, 255, 41, 1)',
                backgroundColor: 'rgba(0, 255, 41, 0.2)',
                fill: false,
                tension: 0.1,
            },
            {
                label: 'Negative Mentions',
                data: negativeMentions,
                borderColor: 'rgba(234, 14, 53, 1)',
                backgroundColor: 'rgba(234, 14, 53, 0.2)',
                fill: false,
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: false,
                text: 'Sentiment',
            },
            datalabels: {
                display: false,
            }
        },
        scales: {
            x: {
                title: {
                    display: false,
                    text: 'Date',
                },
                ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                    maxTicksLimit: 8,
                }
            },
            y: {
                title: {
                    display: false,
                    text: 'Count',
                },
                beginAtZero: true,
            },
        },
        elements: {
            point: {
                radius: 4
            }
        }
    };

    return (
        <div className={styles.lineGraphContainer}>
            <div className={styles.graphLocation}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default SentimentGraph;
