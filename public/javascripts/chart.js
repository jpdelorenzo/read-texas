var chart;
$(document).ready(function() {
  var chartData = [{
      values: [],
      key: 'X ',
      color: '#ff7f0e'
  }, {
      values: [],
      key: 'Z',
      color: '#Aca02c'
  }, {
      values: [],
      key: 'Mod',
      color: '#2ca02c'
  }];

  var exampleSocket = new WebSocket("ws://localhost:8080");
  exampleSocket.onmessage = function (event) {
    console.log(event);
    var data = JSON.parse(event.data);
    chartData[0].values.push({ x: data.timestamp, y: data.x });
    chartData[1].values.push({ x: data.timestamp, y: data.z });
    chartData[2].values.push({ x: data.timestamp, y: data.mod });
    if (chartData[0].values.length > 50) {
      chartData[0].values = chartData[0].values.slice(chartData[0].values.length - 50);
      chartData[1].values = chartData[1].values.slice(chartData[1].values.length - 50);
      chartData[2].values = chartData[2].values.slice(chartData[2].values.length - 50);
    }
    d3.select('#chart svg')
        .datum(chartData)
        .transition().duration(500)
        .call(chart);
    chart.update(true);
  }
  nv.addGraph(function() {
      chart = nv.models.lineChart()
          .interpolate("basis")
          .useInteractiveGuideline(true);
      chart.xAxis
          .axisLabel('Time')
          .tickFormat(function(d) { return d3.time.format('%M %S %L')(new Date(d)); })
          // .tickFormat(d3.format(',r'));
      chart.yAxis
          .axisLabel('Acceleration (G)')
          .tickFormat(d3.format('.02f'));
      d3.select('#chart svg')
          .datum(chartData)
          .transition().duration(500)
          .call(chart);
      nv.utils.windowResize(chart.update);
      chart.height(400)
      return chart;
  })
})
