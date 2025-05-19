import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from '../../styles/Histogram.module.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, ChartDataLabels);

const HistogramGender = ({ Data, dates }) => {
  // Function to process the data for given dates
  const processData = (dates) => {
    const combinedData = {};

    dates.forEach(date => {
      Data.forEach(entry => {
        if (entry.date === date) {
          const time = entry.time;
          const manCount = entry.maleCount;
          const womanCount = entry.femaleCount;
          
          if (!combinedData[time]) {
            combinedData[time] = { man: 0, woman: 0 };
          }
          combinedData[time].man += manCount;
          combinedData[time].woman += womanCount;
        }
      });
    });

    const labels = Object.keys(combinedData).sort();
    const manCounts = labels.map(label => combinedData[label].man);
    const womanCounts = labels.map(label => combinedData[label].woman);

    return { labels, manCounts, womanCounts };
  };

  const { labels, manCounts, womanCounts } = processData(dates);

  const maxManCount = Math.max(...manCounts);
  const maxManIndex = manCounts.indexOf(maxManCount);

  const maxWomanCount = Math.max(...womanCounts);
  const maxWomanIndex = womanCounts.indexOf(maxWomanCount);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Man',
        data: manCounts,
        backgroundColor: labels.map((label, index) =>
          index === maxManIndex ? 'rgba(252, 225, 109, 1)' : 'rgba(252, 225, 109, 0.6)'
        ),
        borderColor: labels.map((label, index) =>
          index === maxManIndex ? 'rgba(252, 225, 109, 1)' : 'rgba(252, 225, 109, 0.6)'
        ),
        borderWidth: 0,
      },
      {
        label: 'Woman',
        data: womanCounts,
        backgroundColor: labels.map((label, index) =>
          index === maxWomanIndex ? 'rgba(254, 178, 180, 1)' : 'rgba(254, 220, 220, 0.8)'
        ),
        borderColor: labels.map((label, index) =>
          index === maxWomanIndex ? 'rgba(254, 178, 180, 1)' : 'rgba(254, 220, 220, 0.8)'
        ),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const formattedValue = new Intl.NumberFormat().format(value);
            return `Count: ${formattedValue}`;
          },
        },
      },
      datalabels: {
        color: 'black',  // Change this to the desired color
        font: {
          size: 12,
          weight: 'bold',  // Change this to the desired font size
        },
        anchor: 'end',
        align: 'top',
        formatter: (value) => new Intl.NumberFormat().format(value),
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Intervals',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Count',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default HistogramGender;
