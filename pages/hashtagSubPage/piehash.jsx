import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from '../../styles/Chart.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    
    const igCount = data.reduce((total, entry) => total + (entry.IG || 0), 0);
    const fbCount = data.reduce((total, entry) => total + (entry.FB || 0), 0);
    const tiktokCount = data.reduce((total, entry) => total + (entry.Tiktok || 0), 0);
    const xCount = data.reduce((total, entry) => total + (entry.X || 0), 0);

    const otherCount = xCount; // Assuming otherCount includes only X in this example
    const dataValues = [igCount, fbCount, tiktokCount, otherCount];
    const totalCount = dataValues.reduce((acc, value) => acc + value, 0);

    const getOpacity = (index) => {
        return hoveredIndex !== null && hoveredIndex !== index ? 0.3 : 1;
    };

    const chartData = {
        labels: ['Instagram', 'Facebook', 'TikTok', 'Other'],
        datasets: [
            {
                label: '# of Mentions',
                data: dataValues,
                backgroundColor: [
                    `rgba(255, 58, 140, ${getOpacity(0)})`, // Pink for Instagram
                    `rgba(24, 119, 242, ${getOpacity(1)})`, // Blue for Facebook
                    `rgba(249, 197, 219, ${getOpacity(2)})`, // Black for TikTok
                    `rgba(255, 213, 79, ${getOpacity(3)})`, // Yellow for Other
                ],
                borderColor: [
                    'rgba(255, 255, 255, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const percentage = ((tooltipItem.raw / totalCount) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${tooltipItem.raw} (${percentage}%)`;
                    },
                },
            },
            datalabels: {
                display: false,
            },
        },
        onHover: (event, chartElement) => {
            if (chartElement.length) {
                setHoveredIndex(chartElement[0].index);
            } else {
                setHoveredIndex(null);
            }
        },
    };

    return (
        <div className={styles.piehash}>
            <Pie data={chartData} options={options} />
        </div>
    );
};

export default PieChart;
