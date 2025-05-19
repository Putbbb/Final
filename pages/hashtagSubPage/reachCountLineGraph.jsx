import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
import styles from '../../styles/Chart.module.css';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const ReachCountLineGraph = ({ data }) => {
    if (!data || data.length === 0) {
        return <div>Data not found or incorrect path in JSON structure</div>;
    }

    const labels = data.map(entry => entry.date);
    const socialMediaReach = data.map(entry => entry.socialReach);
    const nonsocialMediaReach = data.map(entry => entry.nonSocialReach);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Social Media Reach',
                data: socialMediaReach,
                borderColor: 'rgba(0, 255, 255, 1)',
                backgroundColor: 'rgba(0, 255, 255, 0.2)',
                fill: false,
                tension: 0.1,
            },
            {
                label: 'Non-Social Media Reach',
                data: nonsocialMediaReach,
                borderColor: 'rgba(71, 14, 234, 1)',
                backgroundColor: 'rgba(71, 14, 234, 0.2)',
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
                text: 'Reach Counts Over Time',
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
                    text: 'Reach Count',
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

export default ReachCountLineGraph;
