import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
import styles from '../../styles/Chart.module.css';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const LineGraph = ({ data }) => {
    // Extracting mention data from the passed data prop
    const labels = data.map(entry => entry.date); // Assuming the date field is named 'date'
    const mentionCounts = data.map(entry => entry.positiveMentionCount + entry.negativeMentionCount);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Mentions',
                data: mentionCounts,
                borderColor: 'rgba(14, 156, 255, 1)',
                backgroundColor: 'rgba(14, 156, 255, 0.2)',
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
                text: 'Mention Counts Over Time',
            },
            datalabels: {
                display: false,
            },
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
                },
            },
            y: {
                title: {
                    display: false,
                    text: 'Mentions Count',
                },
                beginAtZero: true,
            },
        },
        elements: {
            point: {
                radius: 4,
            },
        },
    };

    return (
        <div className={styles.lineGraphContainer}>
            <div className={styles.graphLocation}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default LineGraph;
