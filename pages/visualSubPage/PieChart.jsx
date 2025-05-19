import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from '../../styles/Chart.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PieChart = ({ totalMale, totalFemale }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const totalCount = totalMale + totalFemale;

  const getYellowOpacity = () => {
    return hoveredIndex === 0 ? 0.4 : 1;
  };

  const getBlueOpacity = () => {
    return hoveredIndex === 1 ? 0.4 : 1;
  };

  const data = {
    labels: ['Man', 'Woman'],
    datasets: [
      {
        label: 'Gender Distribution',
        data: [totalMale, totalFemale],
        backgroundColor: [
          `rgba(252, 225, 109, ${hoveredIndex === null ? 1 : getBlueOpacity()})`,
          `rgba(254, 178, 180, ${hoveredIndex === null ? 1 : getYellowOpacity()})`,
        ],
        borderColor: [
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
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
        formatter: (value, context) => {
          const percentage = ((value / totalCount) * 100).toFixed(2);
          return `${percentage}%`;
        },
        color: 'black',
        labels: {
          title: {
            font: {
              weight: 'bold',
              size: 16,
            },
          },
        },
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
    <div className={styles.chartContainer}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;
