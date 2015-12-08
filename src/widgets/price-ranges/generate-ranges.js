function round(v, precision) {
  let res = Math.round(v / precision) * precision;
  if (res < 1) {
    res = 1;
  }
  return res;
}

function generateRanges(stats) {
  let precision;
  if (stats.avg < 100) {
    precision = 1;
  } else if (stats.avg < 1000) {
    precision = 10;
  } else {
    precision = 100;
  }
  let avg = round(Math.round(stats.avg), precision);
  let min = Math.ceil(stats.min);
  let max = round(Math.floor(stats.max), precision);
  while (max > stats.max) {
    max -= precision;
  }

  let next;
  let from;
  let facetValues = [];
  if (min !== max) {
    next = min;

    facetValues.push({
      to: next
    });

    while (next < avg) {
      from = facetValues[facetValues.length - 1].to;
      next = round(from + (avg - min) / 3, precision);
      if (next <= from) {
        next = from + 1;
      }
      facetValues.push({
        from: from,
        to: next
      });
    }
    while (next < max) {
      from = facetValues[facetValues.length - 1].to;
      next = round(from + (max - avg) / 3, precision);
      if (next <= from) {
        next = from + 1;
      }
      facetValues.push({
        from: from,
        to: next
      });
    }

    if (facetValues.length === 1) {
      if (next !== avg) {
        facetValues.push({
          from: next,
          to: avg
        });
        next = avg;
      }
    }

    if (facetValues.length === 1) {
      facetValues[0].from = stats.min;
      facetValues[0].to = stats.max;
    } else {
      delete facetValues[facetValues.length - 1].to;
    }
  }
  return facetValues;
}

export default generateRanges;
