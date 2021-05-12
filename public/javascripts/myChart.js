let options = {
  type: 'line',
  data: {
    labels: [],
      datasets: [{
        label: 'Time',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }, {
        label: 'Time(AVG)',
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)'
        ]
      }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
}

addData = (chart, label, time, avg) => {
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(time);
  chart.data.datasets[1].label = avg + 'ms (AVG)';
  chart.update();
}

resetData = (chart) => {
  chart.data.labels = new Array();
  chart.data.datasets[0].data = new Array();
  chart.data.datasets[1].label = 'Time(AVG)';
  chart.update();
}