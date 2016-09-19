var chart;
var maxAcceleration = 0;
var GRAPH_VALUES = 100;

$(document).ready(function() {
  var chartData = [{
      values: [],
      type: 'line',
      yAxis: 1,
      key: 'Speed',
      color: '#ff0000'
  }];

  var exampleSocket = new WebSocket("ws://localhost:8080");
  exampleSocket.onmessage = function (event) {
    var data = JSON.parse(event.data);
    console.log(event.data);

    chartData[0].values.push({ x: data.timestamp, y: data.accele });
    if (chartData[0].values.length > GRAPH_VALUES) {
      chartData[0].values = chartData[0].values.slice(chartData[0].values.length - GRAPH_VALUES);
    }

    maxAcceleration = maxAcceleration < data.accele ? data.accele : maxAcceleration;
    d3.select('#chart svg')
        .datum(chartData)
        .transition().duration(500)
        .call(chart);
    chart.yDomain1([-1, maxAcceleration]);
    chart.update(true);
    $('.resting').replaceWith('<div class="resting">Resting ' + data.resting + '</div>');
  }

  nv.addGraph(function() {
      chart = nv.models.multiChart()
          .interpolate("basis")
          .useInteractiveGuideline(true);
      chart.xAxis
          .axisLabel('Time')
          .tickFormat(function(d) { return d3.time.format('%M %S %L')(new Date(d)); });
      chart.yAxis1
          .axisLabel('Acceleration')
          .tickFormat(d3.format('.02f'));
      d3.select('#chart svg')
          .datum(chartData)
          .transition().duration(500)
          .call(chart);
      nv.utils.windowResize(chart.update);
      chart.height(400);
      return chart;
  });
});
