import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import styles from '../../styles/Histogram.module.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Histogram = ({ Data, dates }) => {
  // Function to process the data for given dates
  const processData = (dates) => {
    const combinedData = {};

    dates.forEach(date => {
      Data.forEach(entry => {
        if (entry.date === date) {
          const time = entry.time;
          const count = entry.maleCount + entry.femaleCount; // Sum of male and female counts
          if (combinedData[time]) {
            combinedData[time] += count;
          } else {
            combinedData[time] = count;
          }
        }
      });
    });

    const labels = Object.keys(combinedData).sort();
    const dataValues = labels.map(label => combinedData[label]);

    return { labels, dataValues };
  };

  const { labels, dataValues } = processData(dates);

  const maxCount = Math.max(...dataValues);
  const maxIndex = dataValues.indexOf(maxCount);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Participants',
        data: dataValues,
        backgroundColor: labels.map((label, index) =>
          index === maxIndex ? 'rgba(252, 225, 109, 1)' : 'rgba(252, 225, 109, 0.6)'
        ),
        borderColor: labels.map((label, index) =>
          index === maxIndex ? 'rgba(252, 225, 109, 1)' : 'rgba(252, 225, 109, 0.6)'
        ),
        borderWidth: 1,
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
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Intervals',
          font: {
            weight: 'bold',
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Frequency',
          font: {
            weight: 'bold',
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Histogram;
