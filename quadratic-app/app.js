'use strict';

/* =====================================================================
   Quadratic Functions & Transformations — Interactive Explainer
   Free-only static app. No monetization surfaces anywhere.
   ===================================================================== */

const DISCLAIMER =
  'Study aid — for learning and practice. Verify against your course materials and instructor; not a substitute for your course or standards.';

const SOURCES = [
  { title: 'PurpleMath — Quadratic/vertex form & graphing', url: 'https://www.purplemath.com/modules/grphquad.htm' },
  { title: 'PurpleMath — Vertex form (completing the square)', url: 'https://www.purplemath.com/modules/sqrvertx.htm' },
  { title: 'OpenStax College Algebra 2e — §5.1 Quadratic Functions', url: 'https://openstax.org/details/books/college-algebra-2e' },
  { title: 'Khan Academy — Graphing quadratics in vertex form', url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations' },
  { title: "Paul's Notes (Algebra) — Parabolas", url: 'https://tutorial.math.lamar.edu/Classes/Alg/Parabolas.aspx' },
  { title: 'LibreTexts — Graphs of Quadratic Functions', url: 'https://math.libretexts.org/' },
  { title: 'Desmos — interactive graphing reference', url: 'https://www.desmos.com/calculator' }
];

const EXAMPLES = ['y = 2(x - 3)^2 + 4', 'y = 2x^2 - 12x + 22', 'y = 2(x - 1)(x - 5)'];

/* =====================================================================
   Number formatting helpers
   ===================================================================== */

function fmt(n) {
  if (n === 0) return '0';
  if (!isFinite(n)) return String(n);
  const r = Math.round(n * 1e9) / 1e9;
  if (Number.isInteger(r)) return String(r);
  return String(parseFloat(r.toFixed(5)));
}

function abs(n) {
  return Math.abs(n);
}

function fmtSigned(n) {
  const v = fmt(n);
  if (n > 0) return '+' + v;
  return v;
}

// "(x − 3)" / "(x + 1)" / "(x)" — the inside of vertex form
function insideParen(h) {
  if (h === 0) return '(x)';
  return '(x ' + (h > 0 ? '− ' + fmt(h) : '+ ' + fmt(abs(h))) + ')';
}

// "x − 3" / "x + 1" / "x"
function xPlusConst(val) {
  if (val === 0) return 'x';
  return 'x ' + (val > 0 ? '+ ' : '− ') + fmt(abs(val));
}

// "right 3" / "left 1" / "no horizontal shift"
function shiftDesc(h) {
  if (h === 0) return 'no horizontal shift (h = 0)';
  return h > 0 ? 'shift right ' + fmt(h) : 'shift left ' + fmt(abs(h));
}

// "2x² − 12x + 22" from a,b,c
function stdFormStr(a, b, c) {
  const parts = [];
  if (a !== 0) {
    if (a === 1) parts.push('x²');
    else if (a === -1) parts.push('−x²');
    else parts.push(fmt(a) + 'x²');
  }
  if (b !== 0) {
    const sign = b > 0 ? '+ ' : '− ';
    const coeff = abs(b) === 1 ? '' : fmt(abs(b));
    parts.push(sign + coeff + 'x');
  }
  if (c !== 0) {
    const sign = c > 0 ? '+ ' : '− ';
    parts.push(sign + fmt(abs(c)));
  }
  if (parts.length === 0) return '0';
  return parts.join(' ');
}

// "2(x − 3)² + 4" from a,h,k
function vertexFormStr(a, h, k) {
  let s = '';
  if (a === 1) s += '';
  else if (a === -1) s += '−';
  else s += fmt(a);
  s += insideParen(h) + '²';
  if (k !== 0) s += (k > 0 ? ' + ' + fmt(k) : ' − ' + fmt(abs(k)));
  return s;
}

// "2(x − 1)(x − 5)" from a, r1, r2
function factoredFormStr(a, r1, r2) {
  let s = '';
  if (a === 1) s += '';
  else if (a === -1) s += '−';
  else s += fmt(a);
  s += '(x ' + (r1 > 0 ? '− ' + fmt(r1) : '+ ' + fmt(abs(r1))) + ')' +
       '(x ' + (r2 > 0 ? '− ' + fmt(r2) : '+ ' + fmt(abs(r2))) + ')';
  return s;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

/* =====================================================================
   Normalization + form detection
   ===================================================================== */

function normalize(raw) {
  let s = String(raw).trim();
  // strip leading "y =", "f(x) =", "f =", etc.
  s = s.replace(/^(y|f|g|h)\s*(?:\(\s*x\s*\))?\s*=\s*/i, '');
  s = s.replace(/^=\s*/, '');
  // unicode → ascii
  s = s.replace(/[−–—]/g, '-').replace(/[×·⋅]/g, '*').replace(/²/g, '^2').replace(/³/g, '^3');
  s = s.replace(/\*\*/g, '^');
  // drop all whitespace for parsing
  s = s.replace(/\s+/g, '');
  return s;
}

function detectForm(s) {
  if (/\([^()]*\)\^2/.test(s)) return 'vertex';          // (...)^2
  if (/\(x[^()]*\)\(x[^()]*\)/.test(s)) return 'factored'; // (x…)(x…)
  if (/x\^2/.test(s)) return 'standard';                 // x^2
  return null;
}

/* =====================================================================
   Coefficient parsing
   ===================================================================== */

// leading coefficient a (default 1, "+"/"-" alone → ±1)
function parseA(part) {
  if (part === undefined || part === '') return 1;
  if (part === '+') return 1;
  if (part === '-') return -1;
  return parseFloat(part);
}

// signed value inside parens / trailing constant (default 0)
function parseSigned(part) {
  if (part === undefined || part === '') return 0;
  if (part === '+' || part === '-') return 0;
  return parseFloat(part);
}

/* =====================================================================
   Parsers (input is normalized, no spaces)
   ===================================================================== */

const VERTEX_RE = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+)?)\(x([+-](?:\d+(?:\.\d+)?|\.\d+)?)?\)\^2([+-](?:\d+(?:\.\d+)?|\.\d+)?)?$/;
const FACTORED_RE = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+)?)\(x([+-](?:\d+(?:\.\d+)?|\.\d+)?)?\)\(x([+-](?:\d+(?:\.\d+)?|\.\d+)?)?\)$/;

function parseVertex(s) {
  const m = s.match(VERTEX_RE);
  if (!m) throw new Error('bad-vertex');
  const a = parseA(m[1]);
  const h = -parseSigned(m[2]);
  const k = parseSigned(m[3]);
  return { a, h, k };
}

function parseStandard(s) {
  const terms = [];
  const re = /([+-]?)([^+-]+)/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m[2]) terms.push({ sign: m[1] === '-' ? -1 : 1, body: m[2] });
  }
  let a = 0, b = 0, c = 0;
  for (const t of terms) {
    const body = t.body;
    if (body.endsWith('^2')) {
      const num = body.slice(0, -2);
      const coeffStr = num.endsWith('x') ? num.slice(0, -1) : num;
      const coeff = coeffStr === '' ? 1 : parseFloat(coeffStr);
      a = t.sign * coeff;
    } else if (body.endsWith('x')) {
      const coeffStr = body.slice(0, -1);
      const coeff = coeffStr === '' ? 1 : parseFloat(coeffStr);
      b = t.sign * coeff;
    } else {
      c = t.sign * parseFloat(body);
    }
  }
  if (!isFinite(a) || !isFinite(b) || !isFinite(c)) throw new Error('bad-standard');
  return { a, b, c };
}

function parseFactored(s) {
  const m = s.match(FACTORED_RE);
  if (!m) throw new Error('bad-factored');
  const a = parseA(m[1]);
  const r1 = -parseSigned(m[2]);
  const r2 = -parseSigned(m[3]);
  return { a, r1, r2 };
}

/* =====================================================================
   Convert to vertex form
   ===================================================================== */

function standardToVertex(a, b, c) {
  const h = -b / (2 * a);
  const k = a * h * h + b * h + c; // plug h back in
  return { h, k };
}

function factoredToVertex(a, r1, r2) {
  const h = (r1 + r2) / 2; // midpoint of roots
  const k = a * (h - r1) * (h - r2); // plug h back in
  return { h, k };
}

/* =====================================================================
   Top-level analyze
   ===================================================================== */

function analyze(raw) {
  const norm = normalize(raw);
  if (!norm) throw { kind: 'empty' };

  // Fractions (e.g. "1/2") are not supported — reject gracefully with a hint.
  if (norm.includes('/')) throw { kind: 'fraction' };

  const form = detectForm(norm);
  if (!form) throw { kind: 'unrecognized' };

  let r;
  if (form === 'vertex') {
    const v = parseVertex(norm);
    r = { form, a: v.a, h: v.h, k: v.k };
  } else if (form === 'standard') {
    const s = parseStandard(norm);
    const v = standardToVertex(s.a, s.b, s.c);
    r = { form, a: s.a, b: s.b, c: s.c, h: v.h, k: v.k };
  } else {
    const f = parseFactored(norm);
    const v = factoredToVertex(f.a, f.r1, f.r2);
    r = { form, a: f.a, r1: f.r1, r2: f.r2, h: v.h, k: v.k };
  }

  if (!isFinite(r.a) || !isFinite(r.h) || !isFinite(r.k)) throw { kind: 'unrecognized' };
  if (r.a === 0) throw { kind: 'a-zero' };

  return r;
}

/* =====================================================================
   Concept content builders
   ===================================================================== */

function describeA(a) {
  const absA = Math.abs(a);
  const parts = [];
  if (absA > 1) parts.push('|a| = ' + fmt(absA) + ' &gt; 1 → <strong>vertical stretch</strong> (narrower)');
  else if (absA < 1) parts.push('0 &lt; |a| = ' + fmt(absA) + ' &lt; 1 → <strong>vertical compression</strong> (wider)');
  else parts.push('a = 1 → <strong>no vertical scaling</strong> (same width as the parent)');
  if (a < 0) parts.push('a &lt; 0 → <strong>reflection across the x-axis</strong> (opens downward)');
  return parts.join('. ');
}

function buildConcepts(r) {
  const { a, h, k, form } = r;

  // Concept 1 — a
  const c1How =
    form === 'vertex'
      ? 'Read <span class="calc">a</span> directly from vertex form: <span class="calc">a = ' + fmt(a) + '</span>.'
      : form === 'standard'
        ? 'In standard form <span class="calc">ax² + bx + c</span>, a is the coefficient of x²: <span class="calc">a = ' + fmt(a) + '</span>.'
        : 'a is the leading coefficient in front of the factors: <span class="calc">a = ' + fmt(a) + '</span>.';

  // Concept 2 — h
  const c2How =
    'Set the inside <span class="calc">(x − h)</span> and read h as the number subtracted from x. Here <span class="calc">' +
    insideParen(h) +
    '</span> means <strong>' + shiftDesc(h) + '</strong>' +
    (h > 0 ? ' — the minus sign inside means a <em>right</em> shift.' : h < 0 ? ' — "(x + ' + fmt(abs(h)) + ')" = "(x − (' + fmt(-h) + '))" means a <em>left</em> shift.' : '.');

  // Concept 3 — k
  const c3How =
    form === 'standard'
      ? 'Read <span class="calc">k</span> after completing the square: <span class="calc">k = c − b²/(4a) = ' + fmt(k) + '</span>.'
      : 'Read <span class="calc">k</span> directly from vertex form: <span class="calc">k = ' + fmt(k) + '</span>.';

  // Concept 4 — vertex
  const c4How =
    form === 'vertex'
      ? 'Vertex form gives it directly: <span class="calc">(h, k) = (' + fmt(h) + ', ' + fmt(k) + ')</span>.'
      : form === 'standard'
        ? '<span class="calc">h = −b/(2a) = ' + fmt(h) + '</span>, then <span class="calc">k = f(h) = ' + fmt(k) + '</span>. Vertex = <span class="calc">(' + fmt(h) + ', ' + fmt(k) + ')</span>.'
        : '<span class="calc">h = (r₁ + r₂)/2 = ' + fmt(h) + '</span>, then <span class="calc">k = f(h) = ' + fmt(k) + '</span>. Vertex = <span class="calc">(' + fmt(h) + ', ' + fmt(k) + ')</span>.';

  // Concept 5 — axis
  const c5How =
    form === 'standard'
      ? '<span class="calc">x = h = ' + fmt(h) + '</span> (equivalently <span class="calc">x = −b/(2a)</span>).'
      : '<span class="calc">x = h = ' + fmt(h) + '</span>.';

  // Concept 7 — range
  const c7How =
    a > 0
      ? '<span class="calc">a = ' + fmt(a) + ' &gt; 0</span> (opens up), so the vertex is the <strong>minimum</strong> → range = <span class="calc">[' + fmt(k) + ', ∞)</span>.'
      : '<span class="calc">a = ' + fmt(a) + ' &lt; 0</span> (opens down), so the vertex is the <strong>maximum</strong> → range = <span class="calc">(−∞, ' + fmt(k) + ']</span>.';

  // Concept 8 — intervals of increasing and decreasing
  const c8How =
    (a > 0
      ? '<span class="calc">a = ' + fmt(a) + ' &gt; 0</span> (opens up, vertex is a <strong>minimum</strong>): <strong>Decreasing on (−∞, ' + fmt(h) + ')</strong> — as x moves left→right toward the vertex, y falls to the minimum. <strong>Increasing on (' + fmt(h) + ', ∞)</strong> — after the vertex, y rises without bound.'
      : '<span class="calc">a = ' + fmt(a) + ' &lt; 0</span> (opens down, vertex is a <strong>maximum</strong>): <strong>Increasing on (−∞, ' + fmt(h) + ')</strong> — as x moves toward the vertex, y rises to the maximum. <strong>Decreasing on (' + fmt(h) + ', ∞)</strong> — after the vertex, y falls without bound.')
    + ' The vertex <span class="calc">x = ' + fmt(h) + '</span> is the <strong>single turning point</strong>, so both intervals are <strong>open</strong> at ' + fmt(h) + ' (they exclude ' + fmt(h) + ').';

  const concepts = [
    {
      title: '1. Vertical scale / stretch — a',
      sub: 'the leading coefficient',
      what: 'The coefficient <span class="calc">a</span> in <span class="calc">y = a(x − h)² + k</span> (also the leading coefficient in standard form).',
      how: c1How,
      why: 'Every output of the parent is multiplied by a. Because <span class="calc">y = a·(x − h)² + k</span>, scaling the squared term scales every point\'s vertical distance from the axis line by a. ' + describeA(a) + '.'
    },
    {
      title: '2. Horizontal shift — h',
      sub: 'the "inside" constant',
      what: 'In <span class="calc">y = a(x − h)² + k</span>, <span class="calc">h</span> is the horizontal shift (the "inside" constant).',
      how: c2How,
      why: 'Replacing x with (x − h) makes the input reach its "zero" (the center) at <span class="calc">x = h</span> instead of x = 0. To reproduce any parent output at x = t you now need x = h + t, so every point slides right by h. The minus sign <em>looks</em> like a left shift but actually moves it right, because you\'re subtracting h from x <em>before</em> squaring.'
    },
    {
      title: '3. Vertical shift — k',
      sub: 'the constant added at the end',
      what: 'In <span class="calc">y = a(x − h)² + k</span>, <span class="calc">k</span> is the constant added at the end.',
      how: c3How,
      why: 'Adding <span class="calc">k</span> adds k to <em>every</em> output value, so the entire graph moves up by k (down if negative) with <strong>no change in shape</strong>. It shifts the whole parabola equally, not individual points differently.'
    },
    {
      title: '4. Vertex',
      sub: 'the turning point — minimum or maximum',
      what: 'The turning point of the parabola — the minimum (if a &gt; 0) or maximum (if a &lt; 0).',
      how: c4How,
      why: '<span class="calc">(x − h)²</span> is always ≥ 0 and equals 0 only when <span class="calc">x = h</span>. So <span class="calc">a(x − h)²</span> stays on one side of zero (≥ 0 when a &gt; 0, ≤ 0 when a &lt; 0) and hits 0 exactly at x = h. Therefore <span class="calc">y = k + a(x − h)²</span> reaches its extreme value k precisely at x = h — that point is the vertex. Here the vertex is a <strong>' + (a > 0 ? 'minimum' : 'maximum') + '</strong>.'
    },
    {
      title: '5. Axis of symmetry',
      sub: 'the mirror line through the vertex',
      what: 'The vertical line through the vertex that splits the parabola into two mirror-image halves.',
      how: c5How,
      why: '<span class="calc">(x − h)² = (h − x)²</span>, so a point t units to the right of h gives the same output as a point t units to the left: <span class="calc">f(h + t) = f(h − t)</span>. That two-sided sameness <em>is</em> the mirror symmetry.'
    },
    {
      title: '6. Domain',
      sub: 'all valid inputs x',
      what: 'The set of all valid inputs <span class="calc">x</span>.',
      how: 'Ask whether any x is forbidden. For a quadratic (a polynomial), none is.',
      why: 'Squaring, multiplying, and adding are defined for every real number — no division by zero and no even root of a negative are involved. So the domain is <strong>all real numbers</strong>, written <span class="calc">(−∞, ∞)</span>.'
    },
    {
      title: '7. Range',
      sub: 'all outputs y the function can produce',
      what: 'The set of all outputs <span class="calc">y</span> the function can produce.',
      how: c7How,
      why: 'From the vertex reasoning, <span class="calc">k</span> is the lowest (or highest) possible output, hit at x = h; outputs grow without bound in the direction the parabola opens.'
    },
    {
      title: '8. Intervals of increasing and decreasing',
      sub: 'where the graph rises vs falls',
      what: 'The x-axis intervals where the output <strong>rises</strong> as x increases (increasing) or <strong>falls</strong> as x increases (decreasing). Always stated in terms of x (the domain), using interval notation.',
      how: c8How,
      why: 'The vertex is the one place the direction changes. Because the parabola is symmetric about <span class="calc">x = ' + fmt(h) + '</span>, the two sides behave as mirror opposites: the graph always moves <em>toward</em> the vertex on one side and <em>away</em> from it on the other. ' +
        (a > 0
          ? 'Here the vertex is a <strong>minimum</strong>, so the graph descends into it (decreasing) then climbs out (increasing).'
          : 'Here the vertex is a <strong>maximum</strong>, so it climbs in (increasing) then descends out (decreasing).') +
        ' At <span class="calc">x = ' + fmt(h) + '</span> exactly, the slope is flat (the function is neither increasing nor decreasing), which is why ' + fmt(h) + ' is excluded from both intervals.'
    }
  ];

  return concepts;
}

/* =====================================================================
   Conversion step builders
   ===================================================================== */

function buildSteps(a, b, c, bOverA, half, halfSq, aHalfSq, k, h) {
  const aFmt = a === 1 ? '' : (a === -1 ? '−' : fmt(a));
  const xSqTerm = function (coeff) {
    if (coeff === 1) return 'x²';
    if (coeff === -1) return '−x²';
    return fmt(coeff) + 'x²';
  };
  const steps = [];
  steps.push('y = ' + stdFormStr(a, b, c));
  steps.push('y = ' + aFmt + '(' + xSqTerm(1) + ' ' + (bOverA > 0 ? '+ ' : '− ') + fmt(abs(bOverA)) + 'x) + ' + fmt(c));
  steps.push('Half of ' + fmt(bOverA) + ' is ' + fmt(half) + ', and (' + fmt(half) + ')² = ' + fmt(halfSq) + '. Add and subtract it:  y = ' + aFmt + '(' + xSqTerm(1) + ' ' + (bOverA > 0 ? '+ ' : '− ') + fmt(abs(bOverA)) + 'x + ' + fmt(halfSq) + ' − ' + fmt(halfSq) + ') + ' + fmt(c));
  steps.push('y = ' + aFmt + '((' + xPlusConst(half) + ')² − ' + fmt(halfSq) + ') + ' + fmt(c));
  steps.push('y = ' + aFmt + '(' + xPlusConst(half) + ')² − ' + fmt(aHalfSq) + ' + ' + fmt(c));
  steps.push('y = ' + aFmt + '(' + xPlusConst(half) + ')² + ' + fmt(k));
  steps.push('So h = ' + fmt(h) + ' and k = ' + fmt(k) + '.');
  return steps;
}

function factoredSteps(a, r1, r2, h, k) {
  const steps = [];
  steps.push('y = ' + factoredFormStr(a, r1, r2));
  steps.push('Roots: r₁ = ' + fmt(r1) + ', r₂ = ' + fmt(r2) + ' (each factor equals 0).');
  steps.push('The axis of symmetry is the midpoint of the roots: h = (r₁ + r₂)/2 = (' + fmt(r1) + ' + ' + fmt(r2) + ')/2 = ' + fmt(h) + '.');
  steps.push('k = f(h) = a(h − r₁)(h − r₂) = ' + fmt(a) + '(' + fmt(h) + ' − ' + fmt(r1) + ')(' + fmt(h) + ' − ' + fmt(r2) + ') = ' + fmt(k) + '.');
  steps.push('So vertex form: y = ' + vertexFormStr(a, h, k) + '.');
  return steps;
}

/* =====================================================================
   SVG graph
   ===================================================================== */

function svgEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Nice "round" step for axis ticks
function niceStep(range, n) {
  const raw = range / Math.max(1, n);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}

// Build a full graph SVG string
function buildGraphSVG(a, h, k, showParent) {
  const W = 640, H = 460;
  const padL = 62, padR = 24, padT = 28, padB = 46;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const absA = Math.abs(a) || 1;
  let span = 5 / Math.sqrt(absA);
  span = Math.max(2.5, Math.min(8, span));
  const xMin = h - span;
  const xMax = h + span;

  const yEdge = a * span * span + k;
  let yMin = Math.min(k, yEdge);
  let yMax = Math.max(k, yEdge);

  // Include parent y=x² only if its vertex (0,0) is in the x-range, to keep both comparable;
  // otherwise keep the user function framed and let the parent be a clipped ghost.
  if (showParent && xMin <= 0 && xMax >= 0) {
    const pEdge = Math.max(xMin * xMin, xMax * xMax);
    yMin = Math.min(yMin, 0);
    yMax = Math.max(yMax, pEdge);
  }

  const pad = Math.max((yMax - yMin) * 0.12, (yMax - yMin) === 0 ? 1 : 0.5);
  yMin -= pad;
  yMax += pad;

  const sx = plotW / (xMax - xMin);
  const sy = plotH / (yMax - yMin);
  const X = function (x) { return padL + (x - xMin) * sx; };
  const Y = function (y) { return H - padB - (y - yMin) * sy; };

  const parts = [];
  parts.push('<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graph of y = a(x - h)² + k with the parent y = x²">');

  // Grid
  const xStep = niceStep(xMax - xMin, 8);
  const yStep = niceStep(yMax - yMin, 6);
  const grid = [];
  for (let gx = Math.ceil(xMin / xStep) * xStep; gx <= xMax; gx += xStep) {
    const px = X(gx);
    grid.push('<line x1="' + px.toFixed(1) + '" y1="' + padT + '" x2="' + px.toFixed(1) + '" y2="' + (H - padB) + '" stroke="#eef2f7" stroke-width="1"/>');
  }
  for (let gy = Math.ceil(yMin / yStep) * yStep; gy <= yMax; gy += yStep) {
    const py = Y(gy);
    grid.push('<line x1="' + padL + '" y1="' + py.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + py.toFixed(1) + '" stroke="#eef2f7" stroke-width="1"/>');
  }
  parts.push('<g>' + grid.join('') + '</g>');

  // Increasing / decreasing region tint (behind axes and curves)
  const decFill = '#fde2e2', incFill = '#dcfce7';
  const decText = '#b91c1c', incText = '#15803d';
  const leftIsDec = a > 0;
  const leftLabel = leftIsDec ? 'decreasing' : 'increasing';
  const rightLabel = leftIsDec ? 'increasing' : 'decreasing';
  const leftFill = leftIsDec ? decFill : incFill;
  const rightFill = leftIsDec ? incFill : decFill;
  const leftTextCol = leftIsDec ? decText : incText;
  const rightTextCol = leftIsDec ? incText : decText;
  const hx = X(h);
  const leftW = hx - padL;
  const rightW = (padL + plotW) - hx;
  parts.push('<rect x="' + padL + '" y="' + padT + '" width="' + leftW.toFixed(1) + '" height="' + plotH + '" fill="' + leftFill + '" opacity="0.5"/>');
  parts.push('<rect x="' + hx.toFixed(1) + '" y="' + padT + '" width="' + rightW.toFixed(1) + '" height="' + plotH + '" fill="' + rightFill + '" opacity="0.5"/>');
  parts.push('<text x="' + (padL + leftW / 2).toFixed(1) + '" y="' + (padT + 24) + '" text-anchor="middle" font-size="12" font-weight="600" fill="' + leftTextCol + '">' + leftLabel + '</text>');
  parts.push('<text x="' + (hx + rightW / 2).toFixed(1) + '" y="' + (padT + 24) + '" text-anchor="middle" font-size="12" font-weight="600" fill="' + rightTextCol + '">' + rightLabel + '</text>');

  // Axes
  parts.push('<line x1="' + padL + '" y1="' + Y(0).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + Y(0).toFixed(1) + '" stroke="#5a6b82" stroke-width="1.5"/>');
  parts.push('<line x1="' + X(0).toFixed(1) + '" y1="' + padT + '" x2="' + X(0).toFixed(1) + '" y2="' + (H - padB) + '" stroke="#5a6b82" stroke-width="1.5"/>');

  // Tick labels
  for (let gx = Math.ceil(xMin / xStep) * xStep; gx <= xMax; gx += xStep) {
    if (Math.abs(gx) < xStep * 0.5 && gx !== 0) continue;
    parts.push('<text x="' + X(gx).toFixed(1) + '" y="' + (H - padB + 18) + '" text-anchor="middle" font-size="12" fill="#5a6b82">' + fmt(gx) + '</text>');
  }
  for (let gy = Math.ceil(yMin / yStep) * yStep; gy <= yMax; gy += yStep) {
    if (Math.abs(gy) < yStep * 0.5 && gy !== 0) continue;
    parts.push('<text x="' + (padL - 8) + '" y="' + (Y(gy) + 4).toFixed(1) + '" text-anchor="end" font-size="12" fill="#5a6b82">' + fmt(gy) + '</text>');
  }

  // Axis labels
  parts.push('<text x="' + (W - padR - 4) + '" y="' + (Y(0) - 8).toFixed(1) + '" text-anchor="end" font-size="13" font-weight="700" fill="#1a2333">x</text>');
  parts.push('<text x="' + (X(0) + 8).toFixed(1) + '" y="' + (padT + 14) + '" font-size="13" font-weight="700" fill="#1a2333">y</text>');

  // Clip for curves
  const clipId = 'plotclip-' + Math.round(Math.random() * 1e6);
  parts.push('<defs><clipPath id="' + clipId + '"><rect x="' + padL + '" y="' + padT + '" width="' + plotW + '" height="' + plotH + '"/></clipPath></defs>');

  // Sample a function into a polyline path
  function curvePath(fn, n) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const x = xMin + (xMax - xMin) * (i / n);
      const y = fn(x);
      const px = X(x).toFixed(1);
      const py = Y(y).toFixed(1);
      d += (i === 0 ? 'M' : 'L') + px + ' ' + py;
    }
    return d;
  }

  // Parent (dashed)
  if (showParent) {
    parts.push('<g clip-path="url(#' + clipId + ')"><path d="' + curvePath(function (x) { return x * x; }, 160) + '" fill="none" stroke="#9aa7b8" stroke-width="1.8" stroke-dasharray="6 5" opacity="0.85"/></g>');
  }

  // User function (solid)
  parts.push('<g clip-path="url(#' + clipId + ')"><path d="' + curvePath(function (x) { return a * (x - h) * (x - h) + k; }, 200) + '" fill="none" stroke="#1a56db" stroke-width="2.6"/></g>');

  // Axis of symmetry (vertical dashed line at x = h)
  parts.push('<line x1="' + X(h).toFixed(1) + '" y1="' + padT + '" x2="' + X(h).toFixed(1) + '" y2="' + (H - padB) + '" stroke="#d97706" stroke-width="1.6" stroke-dasharray="4 4"/>');
  parts.push('<text x="' + X(h).toFixed(1) + '" y="' + (padT + 12) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#d97706">x = ' + fmt(h) + '</text>');

  // Vertex dot + label
  parts.push('<circle cx="' + X(h).toFixed(1) + '" cy="' + Y(k).toFixed(1) + '" r="5" fill="#b91c1c" stroke="#fff" stroke-width="1.5"/>');
  parts.push('<text x="' + (X(h) + 8).toFixed(1) + '" y="' + (Y(k) - 8).toFixed(1) + '" font-size="13" font-weight="700" fill="#b91c1c">(' + fmt(h) + ', ' + fmt(k) + ')</text>');

  parts.push('</svg>');
  return parts.join('');
}

// Static parent reference graph (y = x² only)
function buildParentSVG() {
  const W = 340, H = 260;
  const padL = 44, padR = 16, padT = 18, padB = 38;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xMin = -5, xMax = 5;
  const yMin = -2, yMax = 27;

  const sx = plotW / (xMax - xMin);
  const sy = plotH / (yMax - yMin);
  const X = function (x) { return padL + (x - xMin) * sx; };
  const Y = function (y) { return H - padB - (y - yMin) * sy; };

  const parts = [];
  parts.push('<svg viewBox="0 0 ' + W + ' ' + H + '" aria-label="Parent function y equals x squared">');

  // axes
  parts.push('<line x1="' + padL + '" y1="' + Y(0).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + Y(0).toFixed(1) + '" stroke="#5a6b82" stroke-width="1.5"/>');
  parts.push('<line x1="' + X(0).toFixed(1) + '" y1="' + padT + '" x2="' + X(0).toFixed(1) + '" y2="' + (H - padB) + '" stroke="#5a6b82" stroke-width="1.5"/>');

  // grid + ticks
  const grid = [];
  for (let gx = -5; gx <= 5; gx++) {
    const px = X(gx);
    grid.push('<line x1="' + px.toFixed(1) + '" y1="' + padT + '" x2="' + px.toFixed(1) + '" y2="' + (H - padB) + '" stroke="#eef2f7" stroke-width="1"/>');
    if (gx !== 0) parts.push('<text x="' + px.toFixed(1) + '" y="' + (H - padB + 16) + '" text-anchor="middle" font-size="11" fill="#5a6b82">' + gx + '</text>');
  }
  for (let gy = 0; gy <= 25; gy += 5) {
    const py = Y(gy);
    grid.push('<line x1="' + padL + '" y1="' + py.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + py.toFixed(1) + '" stroke="#eef2f7" stroke-width="1"/>');
    parts.push('<text x="' + (padL - 6) + '" y="' + (py + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="#5a6b82">' + gy + '</text>');
  }
  parts.push('<g>' + grid.join('') + '</g>');

  // curve y = x²
  let d = '';
  for (let i = 0; i <= 160; i++) {
    const x = xMin + (xMax - xMin) * (i / 160);
    const y = x * x;
    d += (i === 0 ? 'M' : 'L') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1);
  }
  parts.push('<path d="' + d + '" fill="none" stroke="#1a56db" stroke-width="2.4"/>');

  // vertex
  parts.push('<circle cx="' + X(0).toFixed(1) + '" cy="' + Y(0).toFixed(1) + '" r="4.5" fill="#b91c1c" stroke="#fff" stroke-width="1.5"/>');
  parts.push('<text x="' + (X(0) + 8).toFixed(1) + '" y="' + (Y(0) - 8).toFixed(1) + '" font-size="12" font-weight="700" fill="#b91c1c">(0, 0)</text>');

  parts.push('</svg>');
  return parts.join('');
}

/* =====================================================================
   Rendering
   ===================================================================== */

function renderResults(r) {
  const resultsEl = document.getElementById('results');
  resultsEl.classList.remove('hidden');

  // Detected form
  const detectedEl = document.getElementById('detected-form');
  let detectedHtml = '';
  if (r.form === 'vertex') {
    detectedHtml = 'Detected: <strong>vertex form</strong> — ' + svgEscape('y = ' + vertexFormStr(r.a, r.h, r.k)) +
      ' &nbsp;with a = ' + fmt(r.a) + ', h = ' + fmt(r.h) + ', k = ' + fmt(r.k) + '.';
  } else if (r.form === 'standard') {
    detectedHtml = 'Detected: <strong>standard form</strong> — ' + svgEscape('y = ' + stdFormStr(r.a, r.b, r.c)) +
      ' &nbsp;with a = ' + fmt(r.a) + ', b = ' + fmt(r.b) + ', c = ' + fmt(r.c) + '.';
  } else {
    detectedHtml = 'Detected: <strong>factored form</strong> — ' + svgEscape('y = ' + factoredFormStr(r.a, r.r1, r.r2)) +
      ' &nbsp;with a = ' + fmt(r.a) + ', roots r₁ = ' + fmt(r.r1) + ', r₂ = ' + fmt(r.r2) + '.';
  }
  detectedEl.innerHTML = detectedHtml;

  // Conversion to vertex form
  const convEl = document.getElementById('conversion');
  if (r.form === 'standard') {
    const steps = buildSteps(r.a, r.b, r.c, r.b / r.a, (r.b / r.a) / 2, ((r.b / r.a) / 2) * ((r.b / r.a) / 2), r.a * ((r.b / r.a) / 2) * ((r.b / r.a) / 2), r.k, r.h);
    convEl.innerHTML = '<h3>Converting standard → vertex form (completing the square)</h3>' +
      steps.map(function (s, i) { return '<div class="step">' + (i + 1) + '. ' + s + '</div>'; }).join('');
    convEl.classList.remove('hidden');
  } else if (r.form === 'factored') {
    const steps = factoredSteps(r.a, r.r1, r.r2, r.h, r.k);
    convEl.innerHTML = '<h3>Converting factored → vertex form (midpoint of roots)</h3>' +
      steps.map(function (s, i) { return '<div class="step">' + (i + 1) + '. ' + s + '</div>'; }).join('');
    convEl.classList.remove('hidden');
  } else {
    convEl.innerHTML = '<h3>Already in vertex form</h3><div class="step">y = ' + vertexFormStr(r.a, r.h, r.k) + '</div><div class="step-note">No conversion needed — h and k are read directly.</div>';
    convEl.classList.remove('hidden');
  }

  // Graph
  const graphEl = document.getElementById('graph');
  const showParent = document.getElementById('toggle-parent-btn').getAttribute('aria-pressed') !== 'false';
  graphEl.innerHTML = buildGraphSVG(r.a, r.h, r.k, showParent);
  const caption = document.getElementById('graph-caption');
  caption.textContent = 'y = ' + vertexFormStr(r.a, r.h, r.k) + '  (solid)  vs. parent y = x² (dashed) — vertex (' + fmt(r.h) + ', ' + fmt(r.k) + '), axis x = ' + fmt(r.h) + '.';

  // Concept cards
  const conceptsEl = document.getElementById('concepts');
  const concepts = buildConcepts(r);
  conceptsEl.innerHTML = concepts.map(function (c) {
    return '<article class="concept-card">' +
      '<h3>' + c.title + '</h3>' +
      '<p class="concept-sub">' + c.sub + '</p>' +
      '<div class="concept-block what"><span class="block-label">What</span><p>' + c.what + '</p></div>' +
      '<div class="concept-block how"><span class="block-label">How</span><p>' + c.how + '</p></div>' +
      '<div class="concept-block why"><span class="block-label">Why</span><p>' + c.why + '</p></div>' +
      '</article>';
  }).join('');

  // Sources
  const sourcesEl = document.getElementById('sources');
  sourcesEl.innerHTML = '<h3>Sources</h3><ul>' +
    SOURCES.map(function (s) { return '<li><a href="' + s.url + '" target="_blank" rel="noopener noreferrer">' + s.title + '</a></li>'; }).join('') +
    '</ul>';
}

function renderError(err) {
  const resultsEl = document.getElementById('results');
  resultsEl.classList.add('hidden');
  const errEl = document.getElementById('error-msg');
  errEl.classList.remove('hidden');

  if (err.kind === 'empty') {
    errEl.innerHTML = 'Enter an equation first — for example:';
    errEl.innerHTML += '<ul class="error-examples">' + EXAMPLES.map(function (e) { return '<li><code>' + e + '</code></li>'; }).join('') + '</ul>';
  } else if (err.kind === 'a-zero') {
    errEl.innerHTML = 'The leading coefficient <strong>a</strong> can\'t be 0 — that isn\'t a quadratic function. Try one of:';
    errEl.innerHTML += '<ul class="error-examples">' + EXAMPLES.map(function (e) { return '<li><code>' + e + '</code></li>'; }).join('') + '</ul>';
  } else if (err.kind === 'fraction') {
    errEl.innerHTML = 'Fractions aren\'t supported yet — enter the coefficient as a decimal instead (e.g. <code>0.5</code> instead of <code>1/2</code>).';
  } else {
    errEl.innerHTML = 'I couldn\'t parse that. Enter it in one of the three accepted forms:';
    errEl.innerHTML += '<ul class="error-examples">' +
      '<li>Vertex: <code>y = 2(x - 3)^2 + 4</code></li>' +
      '<li>Standard: <code>y = 2x^2 - 12x + 22</code></li>' +
      '<li>Factored: <code>y = 2(x - 1)(x - 5)</code></li>' +
      '</ul>';
  }
}

/* =====================================================================
   Events
   ===================================================================== */

function runAnalyze() {
  const input = document.getElementById('equation-input');
  const raw = input.value;
  const errEl = document.getElementById('error-msg');
  errEl.classList.add('hidden');
  errEl.innerHTML = '';

  try {
    const r = analyze(raw);
    renderResults(r);
  } catch (e) {
    renderError(e || { kind: 'unrecognized' });
  }
}

function init() {
  document.getElementById('app-disclaimer').textContent = DISCLAIMER;
  document.getElementById('parent-graph').innerHTML = buildParentSVG();

  const input = document.getElementById('equation-input');
  const btn = document.getElementById('analyze-btn');

  btn.addEventListener('click', runAnalyze);
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') runAnalyze();
  });

  // Example chips
  document.querySelectorAll('.example-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      input.value = chip.getAttribute('data-eq');
      runAnalyze();
    });
  });

  // Parent overlay toggle
  const toggleBtn = document.getElementById('toggle-parent-btn');
  toggleBtn.addEventListener('click', function () {
    const pressed = toggleBtn.getAttribute('aria-pressed') !== 'false';
    toggleBtn.setAttribute('aria-pressed', String(!pressed));
    toggleBtn.textContent = pressed ? 'Show parent overlay' : 'Hide parent overlay';
    // Re-render the graph if results are visible
    if (!document.getElementById('results').classList.contains('hidden')) {
      const raw = input.value;
      if (raw.trim()) {
        try {
          const r = analyze(raw);
          document.getElementById('graph').innerHTML = buildGraphSVG(r.a, r.h, r.k, !pressed);
        } catch (e) { /* ignore */ }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
