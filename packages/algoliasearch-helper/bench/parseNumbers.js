'use strict';

var merge = require('../src/functions/merge');
var SearchParameters = require('../src/SearchParameters');
var { performance } = require('perf_hooks');

// ---------------------------------------------------------------------------
// Old implementation (master) — inlined for side-by-side comparison
// ---------------------------------------------------------------------------

function oldParseNumbers(partialState) {
  if (partialState instanceof SearchParameters) return partialState;

  var numbers = {};

  var numberKeys = [
    'aroundPrecision',
    'aroundRadius',
    'getRankingInfo',
    'minWordSizefor2Typos',
    'minWordSizefor1Typo',
    'page',
    'maxValuesPerFacet',
    'distinct',
    'minimumAroundRadius',
    'hitsPerPage',
    'minProximity',
  ];

  numberKeys.forEach(function (k) {
    var value = partialState[k];
    if (typeof value === 'string') {
      var parsedValue = parseFloat(value);
      numbers[k] = isNaN(parsedValue) ? value : parsedValue;
    }
  });

  if (Array.isArray(partialState.insideBoundingBox)) {
    numbers.insideBoundingBox = partialState.insideBoundingBox.map(function (
      geoRect
    ) {
      if (Array.isArray(geoRect)) {
        return geoRect.map(function (value) {
          return parseFloat(value);
        });
      }
      return geoRect;
    });
  }

  if (partialState.numericRefinements) {
    var numericRefinements = {};
    Object.keys(partialState.numericRefinements).forEach(function (attribute) {
      var operators = partialState.numericRefinements[attribute] || {};
      numericRefinements[attribute] = {};
      Object.keys(operators).forEach(function (operator) {
        var values = operators[operator];
        var parsedValues = values.map(function (v) {
          if (Array.isArray(v)) {
            return v.map(function (vPrime) {
              if (typeof vPrime === 'string') {
                return parseFloat(vPrime);
              }
              return vPrime;
            });
          } else if (typeof v === 'string') {
            return parseFloat(v);
          }
          return v;
        });
        numericRefinements[attribute][operator] = parsedValues;
      });
    });
    numbers.numericRefinements = numericRefinements;
  }

  return merge(partialState, numbers);
}

// ---------------------------------------------------------------------------
// New implementation — imported from source
// ---------------------------------------------------------------------------

var newParseNumbers = SearchParameters._parseNumbers;

// ---------------------------------------------------------------------------
// Seeded PRNG (reproducible across runs)
// ---------------------------------------------------------------------------

function createRng(seed) {
  var state = seed;
  return function () {
    // Mulberry32
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    var t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// ---------------------------------------------------------------------------
// Value pools
// ---------------------------------------------------------------------------

// Uniform pool — every code path equally represented (for edge-case stress testing)
var UNIFORM_POOL = [
  // Integer strings → parseFloat valid
  '0', '1', '5', '42', '100', '999',
  // Float strings → parseFloat valid
  '3.14', '0.001', '99.99', '0.5', '123.456',
  // Negative strings → parseFloat valid
  '-1', '-0.5', '-100', '-3.14',
  // Scientific notation → parseFloat valid
  '1e3', '2.5e-4', '1e10', '-1e2',
  // Leading junk that still parses → parseFloat partial
  '123abc', '42.5xyz',
  // Infinity strings → parseFloat !isFinite (new path)
  'Infinity', '-Infinity',
  // NaN string → parseFloat isNaN
  'NaN',
  // Non-numeric strings → parseFloat NaN → keep original
  'all', 'auto', '', 'abc', 'hello',
  // Already-numeric integers → typeof !== 'string'
  0, 1, 5, 20, 100,
  // Already-numeric floats
  3.14, 0.001, 99.99,
  // Numeric Infinity/-Infinity → new !isFinite branch
  Infinity, -Infinity,
  // Numeric NaN → new !isFinite branch
  NaN,
];

// Realistic pool — weighted distribution reflecting actual usage:
//   ~90% valid numeric strings, ~5% non-numeric strings, ~5% already-numbers, <1% edge cases
var REALISTIC_POOL = (function () {
  var pool = [];
  // 90 valid numeric strings (ints, floats, negatives, scientific)
  var numericStrings = [
    '0', '1', '2', '3', '5', '7', '10', '12', '16', '20',
    '25', '30', '42', '50', '64', '80', '100', '128', '200', '500',
    '999', '1000', '0.5', '0.001', '1.5', '2.5', '3.14', '4.99',
    '9.99', '10.5', '12.95', '19.99', '24.99', '49.99', '99.99',
    '123.456', '0.1', '0.01', '0.25', '0.75',
    '-1', '-0.5', '-3', '-10', '-100',
    '1e3', '2.5e-4', '1e2', '-1e2', '5e1',
  ];
  for (var i = 0; i < 90; i++) {
    pool.push(numericStrings[i % numericStrings.length]);
  }
  // 5 non-numeric strings
  pool.push('all', 'auto', 'abc', '', 'none');
  // 5 already-parsed numbers
  pool.push(0, 1, 5, 20, 100);
  // <1% edge cases (but at least present)
  pool.push('Infinity', '-Infinity', Infinity, -Infinity, NaN);
  return pool;
})();

// Geo-specific pool — numeric strings only (realistic for lat/lng coordinates)
var GEO_POOL = [
  '48.8566', '2.3522', '48.8156', '2.2909',
  '40.7128', '-74.0060', '40.6892', '-74.0445',
  '51.5074', '-0.1278', '51.4826', '-0.1563',
  '35.6762', '139.6503', '35.6586', '139.7454',
  '-33.8688', '151.2093', '-33.8915', '151.1956',
  '46.650828', '7.123047', '45.172110', '1.009766',
  '49.626259', '4.618164', '47.715070', '0.482422',
  '0', '-0.001', '90', '-90', '180', '-180',
];

var NUMBER_KEYS = [
  'aroundPrecision',
  'aroundRadius',
  'getRankingInfo',
  'minWordSizefor2Typos',
  'minWordSizefor1Typo',
  'page',
  'maxValuesPerFacet',
  'distinct',
  'minimumAroundRadius',
  'hitsPerPage',
  'minProximity',
];

var OPERATORS = ['>=', '<=', '=', '!=', '>', '<'];
var ATTRIBUTES = ['price', 'rating', 'stock', 'weight', 'popularity'];

// ---------------------------------------------------------------------------
// Input generators
// ---------------------------------------------------------------------------

function generateNumberKeysInput(rng, valuePool) {
  var obj = { query: 'test' };
  var keyCount = randInt(rng, 2, 6);
  var shuffled = NUMBER_KEYS.slice();
  // Fisher-Yates partial shuffle
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  for (var k = 0; k < keyCount; k++) {
    obj[shuffled[k]] = pick(rng, valuePool);
  }
  return obj;
}

function generateGeoRect(rng, geoPool) {
  var rect = [];
  for (var i = 0; i < 4; i++) {
    rect.push(pick(rng, geoPool));
  }
  return rect;
}

function generateInsideBoundingBox(rng, geoPool) {
  var count = randInt(rng, 1, 2);
  var boxes = [];
  for (var i = 0; i < count; i++) {
    boxes.push(generateGeoRect(rng, geoPool));
  }
  return boxes;
}

function generateNumericRefinements(rng, valuePool) {
  var refinements = {};
  var attrCount = randInt(rng, 1, 2);
  for (var a = 0; a < attrCount; a++) {
    var attr = pick(rng, ATTRIBUTES);
    refinements[attr] = {};
    var opCount = randInt(rng, 1, 2);
    for (var o = 0; o < opCount; o++) {
      var op = pick(rng, OPERATORS);
      var valCount = randInt(rng, 1, 3);
      var vals = [];
      for (var v = 0; v < valCount; v++) {
        // Occasionally use nested arrays (range pairs)
        if (rng() < 0.2) {
          vals.push([pick(rng, valuePool), pick(rng, valuePool)]);
        } else {
          vals.push(pick(rng, valuePool));
        }
      }
      refinements[attr][op] = vals;
    }
  }
  return refinements;
}

function generateInputs(count, options) {
  var rng = createRng(options.seed || 12345);
  var valuePool = options.valuePool || UNIFORM_POOL;
  var geoPool = options.geoPool || valuePool;
  var inputs = [];
  for (var i = 0; i < count; i++) {
    var obj = generateNumberKeysInput(rng, valuePool);
    if (options.insideBoundingBox) {
      obj.insideBoundingBox = generateInsideBoundingBox(rng, geoPool);
    }
    if (options.numericRefinements) {
      obj.numericRefinements = generateNumericRefinements(rng, valuePool);
    }
    inputs.push(obj);
  }
  return inputs;
}

// ---------------------------------------------------------------------------
// Scenarios — 1000 varied inputs each
// ---------------------------------------------------------------------------

var INPUT_COUNT = 1000;

var scenarios = {
  'uniform: keys only': generateInputs(INPUT_COUNT, {
    seed: 11111,
    valuePool: UNIFORM_POOL,
    insideBoundingBox: false,
    numericRefinements: false,
  }),
  'uniform: + geo': generateInputs(INPUT_COUNT, {
    seed: 22222,
    valuePool: UNIFORM_POOL,
    geoPool: UNIFORM_POOL,
    insideBoundingBox: true,
    numericRefinements: false,
  }),
  'uniform: + refinements': generateInputs(INPUT_COUNT, {
    seed: 33333,
    valuePool: UNIFORM_POOL,
    insideBoundingBox: false,
    numericRefinements: true,
  }),
  'uniform: full mixed': generateInputs(INPUT_COUNT, {
    seed: 44444,
    valuePool: UNIFORM_POOL,
    geoPool: UNIFORM_POOL,
    insideBoundingBox: true,
    numericRefinements: true,
  }),
  'realistic: keys only': generateInputs(INPUT_COUNT, {
    seed: 55555,
    valuePool: REALISTIC_POOL,
    insideBoundingBox: false,
    numericRefinements: false,
  }),
  'realistic: + geo': generateInputs(INPUT_COUNT, {
    seed: 66666,
    valuePool: REALISTIC_POOL,
    geoPool: GEO_POOL,
    insideBoundingBox: true,
    numericRefinements: false,
  }),
  'realistic: + refinements': generateInputs(INPUT_COUNT, {
    seed: 77777,
    valuePool: REALISTIC_POOL,
    insideBoundingBox: false,
    numericRefinements: true,
  }),
  'realistic: full mixed': generateInputs(INPUT_COUNT, {
    seed: 88888,
    valuePool: REALISTIC_POOL,
    geoPool: GEO_POOL,
    insideBoundingBox: true,
    numericRefinements: true,
  }),
};

// ---------------------------------------------------------------------------
// Benchmark runner
// ---------------------------------------------------------------------------

var WARMUP = 2000;
var ITERATIONS = 100000;
var ROUNDS = 10;

function benchFn(fn, inputs, iterations) {
  var len = inputs.length;
  var start = performance.now();
  for (var i = 0; i < iterations; i++) {
    fn(inputs[i % len]);
  }
  return performance.now() - start;
}

function msToOps(ms) {
  return (ITERATIONS / ms) * 1000;
}

function stats(arr) {
  var n = arr.length;
  var sorted = arr.slice().sort(function (a, b) { return a - b; });
  var mid = Math.floor(n / 2);
  var med = n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  var mean = arr.reduce(function (s, v) { return s + v; }, 0) / n;
  var variance = arr.reduce(function (s, v) { return s + (v - mean) * (v - mean); }, 0) / n;
  var stddev = Math.sqrt(variance);
  return { median: med, mean: mean, stddev: stddev, min: sorted[0], max: sorted[n - 1] };
}

function fmtOps(ops) {
  return Math.round(ops).toLocaleString();
}

function fmtMs(ms) {
  return ms.toFixed(2) + ' ms';
}

function runBenchmark(name, inputs) {
  // Warmup both
  benchFn(oldParseNumbers, inputs, WARMUP);
  benchFn(newParseNumbers, inputs, WARMUP);

  var oldTimes = [];
  var newTimes = [];

  for (var r = 0; r < ROUNDS; r++) {
    // Alternate order each round to reduce systematic bias
    if (r % 2 === 0) {
      oldTimes.push(benchFn(oldParseNumbers, inputs, ITERATIONS));
      newTimes.push(benchFn(newParseNumbers, inputs, ITERATIONS));
    } else {
      newTimes.push(benchFn(newParseNumbers, inputs, ITERATIONS));
      oldTimes.push(benchFn(oldParseNumbers, inputs, ITERATIONS));
    }
  }

  var oldOps = oldTimes.map(msToOps);
  var newOps = newTimes.map(msToOps);

  var oldStats = stats(oldOps);
  var newStats = stats(newOps);

  // Per-round diffs (ops/s)
  var rawDiffs = [];
  for (var i = 0; i < ROUNDS; i++) {
    rawDiffs.push(newOps[i] - oldOps[i]);
  }
  var diffStats = stats(rawDiffs);

  // Percentage diff based on medians
  var pctDiff = ((newStats.median - oldStats.median) / oldStats.median) * 100;

  return {
    name: name,
    oldTimes: oldTimes,
    newTimes: newTimes,
    oldOps: oldOps,
    newOps: newOps,
    oldStats: oldStats,
    newStats: newStats,
    rawDiffs: rawDiffs,
    diffStats: diffStats,
    pctDiff: pctDiff,
  };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log('_parseNumbers benchmark (synthetic varied inputs)');
console.log('=================================================');
console.log('Input objects per scenario: ' + INPUT_COUNT.toLocaleString());
console.log('Iterations per round:      ' + ITERATIONS.toLocaleString());
console.log('Rounds:                    ' + ROUNDS);
console.log('Warmup iterations:         ' + WARMUP.toLocaleString());
console.log('');
console.log('Pools:');
console.log('  uniform  — all value types equally represented (edge-case stress test)');
console.log('  realistic — ~90% numeric strings, ~5% non-numeric, ~5% numbers, <1% edge cases');
console.log('  geo      — numeric coordinate strings only (for insideBoundingBox)');
console.log('');

var scenarioNames = Object.keys(scenarios);
var results = {};

scenarioNames.forEach(function (name, idx) {
  var r = runBenchmark(name, scenarios[name]);
  results[name] = r;

  console.log('━'.repeat(72));
  console.log('  ' + r.name.toUpperCase());
  console.log('━'.repeat(72));

  // Per-round table
  var rndHdr =
    'Round'.padEnd(8) +
    'Old (ms)'.padStart(12) +
    'New (ms)'.padStart(12) +
    'Old (ops/s)'.padStart(16) +
    'New (ops/s)'.padStart(16) +
    'Diff (ops/s)'.padStart(16);
  console.log(rndHdr);
  console.log('-'.repeat(rndHdr.length));

  for (var i = 0; i < ROUNDS; i++) {
    console.log(
      ('  ' + (i + 1)).padEnd(8) +
      fmtMs(r.oldTimes[i]).padStart(12) +
      fmtMs(r.newTimes[i]).padStart(12) +
      fmtOps(r.oldOps[i]).padStart(16) +
      fmtOps(r.newOps[i]).padStart(16) +
      ((r.rawDiffs[i] >= 0 ? '+' : '') + fmtOps(r.rawDiffs[i])).padStart(16)
    );
  }

  console.log('');
  console.log('  Summary (ops/s):');
  console.log('                    Old                  New');
  console.log('    Median:   ' + fmtOps(r.oldStats.median).padStart(12) + fmtOps(r.newStats.median).padStart(21));
  console.log('    Mean:     ' + fmtOps(r.oldStats.mean).padStart(12) + fmtOps(r.newStats.mean).padStart(21));
  console.log('    Std Dev:  ' + fmtOps(r.oldStats.stddev).padStart(12) + fmtOps(r.newStats.stddev).padStart(21));
  console.log('    Min:      ' + fmtOps(r.oldStats.min).padStart(12) + fmtOps(r.newStats.min).padStart(21));
  console.log('    Max:      ' + fmtOps(r.oldStats.max).padStart(12) + fmtOps(r.newStats.max).padStart(21));

  console.log('');
  console.log('  Diff (new - old):');
  console.log('    Median:   ' + ((r.diffStats.median >= 0 ? '+' : '') + fmtOps(r.diffStats.median)).padStart(12) + ' ops/s');
  console.log('    Mean:     ' + ((r.diffStats.mean >= 0 ? '+' : '') + fmtOps(r.diffStats.mean)).padStart(12) + ' ops/s');
  console.log('    Std Dev:  ' + fmtOps(r.diffStats.stddev).padStart(12) + ' ops/s');

  var sign = r.pctDiff >= 0 ? '+' : '';
  console.log('');
  console.log('  Relative:   ' + sign + r.pctDiff.toFixed(2) + '%  (median new vs median old)');
  console.log('');
});

// ---------------------------------------------------------------------------
// Compact summary table
// ---------------------------------------------------------------------------

console.log('━'.repeat(72));
console.log('  SUMMARY');
console.log('━'.repeat(72));

var sumHdr =
  'Scenario'.padEnd(30) +
  'Old med'.padStart(12) +
  'New med'.padStart(12) +
  'Diff'.padStart(12) +
  'Std Dev'.padStart(12) +
  '   %'.padStart(8);
console.log(sumHdr);
console.log('-'.repeat(sumHdr.length));

scenarioNames.forEach(function (name) {
  var r = results[name];
  var diff = r.newStats.median - r.oldStats.median;
  var sign = diff >= 0 ? '+' : '';
  var pctSign = r.pctDiff >= 0 ? '+' : '';
  console.log(
    name.padEnd(30) +
    fmtOps(r.oldStats.median).padStart(12) +
    fmtOps(r.newStats.median).padStart(12) +
    (sign + fmtOps(diff)).padStart(12) +
    ('±' + fmtOps(r.diffStats.stddev)).padStart(12) +
    (pctSign + r.pctDiff.toFixed(2) + '%').padStart(8)
  );
});

console.log('');
console.log('Positive diff/% = new is slower, negative = new is faster.');
