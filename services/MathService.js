
exports.average = function(array) {
  if (!array || array.length == 0) {
    return 0;
  }
  var sum = 0;
  array.forEach(function(each, i) {
    sum += each;
  });
  return sum / array.length;
};

exports.deviation = function(array) {
  var average = exports.average(array);
  var sum = 0;
  array.forEach(function(a) {
    sum += Math.pow(a - average, 2);
  });
  return Math.sqrt(sum / (array.length - 1));
};
