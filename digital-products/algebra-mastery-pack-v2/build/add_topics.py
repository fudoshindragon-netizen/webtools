#!/usr/bin/env python3
"""Add the six paid-edition topics to content.json.

The free web app carries 12 topics / 64 questions. This script keeps those 12
untouched and appends six further topics (48 new questions, each with a worked
solution), then updates the pack's title, subtitle and disclaimer text.

Run from the pack root:  python3 build/add_topics.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PATH = os.path.join(ROOT, "content.json")


def mc(qid, prompt, options, answer, explanation):
    return {
        "id": qid,
        "type": "multiple-choice",
        "prompt": prompt,
        "options": options,
        "answer": answer,
        "explanation": explanation,
    }


def sa(qid, prompt, answer, explanation):
    return {
        "id": qid,
        "type": "short-answer",
        "prompt": prompt,
        "answer": answer,
        "explanation": explanation,
    }


NEW_TOPICS = [
    {
        "id": "absolute-value",
        "title": "Absolute Value Equations & Inequalities",
        "icon": "\u2194",
        "concept": (
            "The absolute value |x| is the distance from x to 0 on the number line, so it is never "
            "negative. Because distance ignores direction, an equation such as |x \u2212 3| = 5 has two "
            "solutions: x is 5 units from 3, either to the right (x = 8) or to the left (x = \u22122). "
            "Isolate the absolute-value expression first, then split it into two cases. Inequalities "
            "split differently: |x| < a means x sits between \u2212a and a, while |x| > a means x lies "
            "outside that interval. If an equation says an absolute value equals a negative number, "
            "there is no solution."
        ),
        "diagram": {
            "type": "text",
            "caption": "The four rules, plus the isolate-first step",
            "code": (
                "ABSOLUTE VALUE \u2014 rules\n"
                "1) |x| = a  (a \u2265 0)      \u2192  x = a  or  x = \u2212a\n"
                "2) |x| < a  (a > 0)      \u2192  \u2212a < x < a          (between)\n"
                "3) |x| > a  (a > 0)      \u2192  x < \u2212a  or  x > a    (outside)\n"
                "4) |x| = negative        \u2192  no solution\n"
                "\n"
                "Always: isolate the absolute value on one side FIRST,\n"
                "then apply one of the rules above to the whole inside."
            ),
        },
        "resources": [
            {
                "title": "Solving Absolute-Value Equations (Purplemath)",
                "url": "https://www.purplemath.com/modules/solveabs.htm",
            },
            {
                "title": "Absolute value & piecewise functions (Khan Academy)",
                "url": "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:absolute-value-piecewise-functions",
            },
        ],
        "questions": [
            mc(
                "absval-q1",
                "Solve |x| = 7.",
                ["x = 7 only", "x = \u22127 only", "x = 7 or x = \u22127", "No solution"],
                2,
                "|x| = 7 means x is 7 units from 0 on the number line, so x = 7 or x = \u22127. "
                "Check: |7| = 7 \u2713 and |\u22127| = 7 \u2713.",
            ),
            mc(
                "absval-q2",
                "Solve |x \u2212 3| = 5.",
                ["x = 8 only", "x = 8 or x = \u22122", "x = 2 only", "x = \u22128 or x = 2"],
                1,
                "Split into two cases. Case 1: x \u2212 3 = 5 \u2192 x = 8. Case 2: x \u2212 3 = \u22125 \u2192 x = \u22122. "
                "Check: |8 \u2212 3| = 5 \u2713 and |\u22122 \u2212 3| = |\u22125| = 5 \u2713.",
            ),
            sa(
                "absval-q3",
                "Solve |2x + 1| = 9. Enter the larger of the two solutions.",
                "4",
                "Case 1: 2x + 1 = 9 \u2192 2x = 8 \u2192 x = 4. Case 2: 2x + 1 = \u22129 \u2192 2x = \u221210 \u2192 x = \u22125. "
                "The larger solution is 4. Check: |2(4) + 1| = |9| = 9 \u2713.",
            ),
            mc(
                "absval-q4",
                "Solve |x \u2212 4| = \u22122.",
                ["x = 6", "x = 2", "x = 6 or x = 2", "No solution"],
                3,
                "An absolute value is a distance, so it can never equal a negative number. There is no "
                "value of x that makes |x \u2212 4| equal \u22122, so the equation has no solution.",
            ),
            mc(
                "absval-q5",
                "Solve |x| < 3 and write the answer as a single inequality.",
                ["x < 3", "\u22123 < x < 3", "x < \u22123 or x > 3", "x > \u22123"],
                1,
                "|x| < 3 means the distance from x to 0 is less than 3, so x lies strictly between "
                "\u22123 and 3: \u22123 < x < 3. Test x = 0: |0| = 0 < 3 \u2713. Test x = 4: |4| = 4 is not < 3.",
            ),
            mc(
                "absval-q6",
                "Solve |x \u2212 1| \u2265 4.",
                ["\u22123 \u2264 x \u2264 5", "x \u2264 \u22123 or x \u2265 5", "x \u2265 5 only", "\u22125 \u2264 x \u2264 3"],
                1,
                "A \u2265 inequality splits into two \u201coutside\u201d cases. Case 1: x \u2212 1 \u2265 4 \u2192 x \u2265 5. "
                "Case 2: x \u2212 1 \u2264 \u22124 \u2192 x \u2264 \u22123. Check x = 6: |5| = 5 \u2265 4 \u2713. Check x = 0: |\u22121| = 1, not \u2265 4 \u2717.",
            ),
            sa(
                "absval-q7",
                "Solve 3|x \u2212 2| = 12. Enter the larger of the two solutions.",
                "6",
                "Isolate the absolute value first: divide both sides by 3 \u2192 |x \u2212 2| = 4. Then x \u2212 2 = 4 \u2192 "
                "x = 6, or x \u2212 2 = \u22124 \u2192 x = \u22122. The larger solution is 6. Check: 3|6 \u2212 2| = 3(4) = 12 \u2713.",
            ),
            mc(
                "absval-q8",
                "A machined rod is accepted when its length L, in millimetres, satisfies |L \u2212 25| \u2264 0.5. "
                "Which range of lengths is accepted?",
                ["24.5 \u2264 L \u2264 25.5", "24 \u2264 L \u2264 26", "L \u2264 24.5 or L \u2265 25.5", "24.5 < L < 25.5"],
                0,
                "|L \u2212 25| \u2264 0.5 means the length is at most 0.5 mm away from 25, so \u22120.5 \u2264 L \u2212 25 \u2264 0.5. "
                "Add 25 to all three parts: 24.5 \u2264 L \u2264 25.5. The ends are included because the inequality is \u2264.",
            ),
        ],
    },
    {
        "id": "sequences-and-series",
        "title": "Arithmetic & Geometric Sequences",
        "icon": "\u2026",
        "concept": (
            "A sequence is an ordered list of numbers built by a rule. In an arithmetic sequence each "
            "term is the previous term plus a fixed number d, the common difference. In a geometric "
            "sequence each term is the previous term multiplied by a fixed number r, the common ratio. "
            "Find d by subtracting consecutive terms, and r by dividing one term by the one before it. "
            "The nth-term formulas let you jump straight to a far-away term without listing everything, "
            "and the sum formulas add a run of terms quickly. Substitution is the check: put n = 1 into "
            "your formula and you must get the first term."
        ),
        "diagram": {
            "type": "text",
            "caption": "Formulas for the nth term and the sum of n terms",
            "code": (
                "ARITHMETIC                         GEOMETRIC\n"
                "d = a\u2082 \u2212 a\u2081  (common difference)   r = a\u2082 / a\u2081  (common ratio)\n"
                "a\u2099 = a\u2081 + (n \u2212 1)d               a\u2099 = a\u2081 \u00b7 r\u207f\u207b\u00b9\n"
                "S\u2099 = n/2 \u00b7 (a\u2081 + a\u2099)              S\u2099 = a\u2081(1 \u2212 r\u207f)/(1 \u2212 r),  r \u2260 1\n"
                "\n"
                "Check: put n = 1 into a\u2099 and you must get a\u2081."
            ),
        },
        "resources": [
            {
                "title": "Arithmetic and geometric sequences (Purplemath)",
                "url": "https://www.purplemath.com/modules/series.htm",
            },
            {
                "title": "Arithmetic sequences and sums (Maths Is Fun)",
                "url": "https://www.mathsisfun.com/algebra/sequences-sums-arithmetic.html",
            },
        ],
        "questions": [
            mc(
                "seq-q1",
                "What is the next term of the arithmetic sequence 4, 7, 10, 13, \u2026?",
                ["14", "15", "16", "17"],
                2,
                "The common difference is d = 7 \u2212 4 = 3, and 10 \u2212 7 = 3 and 13 \u2212 10 = 3 confirm it. "
                "The next term is 13 + 3 = 16.",
            ),
            sa(
                "seq-q2",
                "An arithmetic sequence starts 3, 7, 11, \u2026 What is the 20th term?",
                "79",
                "a\u2081 = 3 and d = 4. a\u2099 = a\u2081 + (n \u2212 1)d gives a\u2082\u2080 = 3 + 19(4) = 3 + 76 = 79.",
            ),
            mc(
                "seq-q3",
                "What is the common ratio of the geometric sequence 2, 6, 18, 54, \u2026?",
                ["2", "3", "4", "12"],
                1,
                "Divide a term by the one before it: 6 \u00f7 2 = 3, and 18 \u00f7 6 = 3, and 54 \u00f7 18 = 3. "
                "The common ratio is 3.",
            ),
            sa(
                "seq-q4",
                "A geometric sequence starts 5, 10, 20, \u2026 What is its 6th term?",
                "160",
                "a\u2081 = 5 and r = 2. a\u2099 = a\u2081 r\u207f\u207b\u00b9 gives a\u2086 = 5 \u00b7 2\u2075 = 5 \u00b7 32 = 160. "
                "Check by listing: 5, 10, 20, 40, 80, 160 \u2713.",
            ),
            mc(
                "seq-q5",
                "What is the sum of the first 10 terms of the arithmetic sequence 2, 4, 6, 8, \u2026?",
                ["100", "110", "120", "210"],
                1,
                "a\u2081 = 2, d = 2, n = 10, so a\u2081\u2080 = 2 + 9(2) = 20. S\u2081\u2080 = n/2 \u00b7 (a\u2081 + a\u2099) = 10/2 \u00b7 (2 + 20) "
                "= 5 \u00b7 22 = 110.",
            ),
            sa(
                "seq-q6",
                "What is the sum of the first 5 terms of the geometric sequence 3, 6, 12, \u2026?",
                "93",
                "a\u2081 = 3, r = 2, n = 5. S\u2085 = a\u2081(1 \u2212 r\u207f)/(1 \u2212 r) = 3(1 \u2212 2\u2075)/(1 \u2212 2) = 3(1 \u2212 32)/(\u22121) = 3 \u00b7 31 = 93. "
                "Check by adding: 3 + 6 + 12 + 24 + 48 = 93 \u2713.",
            ),
            mc(
                "seq-q7",
                "Which sequence is geometric?",
                ["1, 4, 9, 16, \u2026", "3, 9, 27, 81, \u2026", "2, 5, 8, 11, \u2026", "1, 2, 4, 7, \u2026"],
                1,
                "A geometric sequence multiplies by the same number each step. 3, 9, 27, 81 multiplies by 3 "
                "every time. 1, 4, 9, 16 are perfect squares (differences 3, 5, 7 \u2014 not constant either). "
                "2, 5, 8, 11 has a constant difference of 3, so it is arithmetic. 1, 2, 4, 7 has differences "
                "1, 2, 3, so it is neither.",
            ),
            mc(
                "seq-q8",
                "Which formula gives the sequence 7, 11, 15, 19, \u2026 for n = 1, 2, 3, \u2026?",
                ["a\u2099 = 4n + 3", "a\u2099 = 3n + 4", "a\u2099 = 7n", "a\u2099 = 4n \u2212 3"],
                0,
                "The sequence is arithmetic with a\u2081 = 7 and d = 4, so a\u2099 = 7 + (n \u2212 1)4 = 4n + 3. "
                "Check n = 1: 4 + 3 = 7 \u2713. Check n = 2: 8 + 3 = 11 \u2713.",
            ),
        ],
    },
    {
        "id": "inverse-functions",
        "title": "Inverse Functions",
        "icon": "\u21c4",
        "concept": (
            "An inverse function undoes what the original function did: if f sends 2 to 9, then f\u207b\u00b9 "
            "sends 9 back to 2. To find one, write y = f(x), swap x and y, then solve for y. The domain "
            "of f\u207b\u00b9 is the range of f, and the range of f\u207b\u00b9 is the domain of f. An inverse is only "
            "a function when the original passes the horizontal line test \u2014 each output comes from "
            "exactly one input. That is why f(x) = x\u00b2 needs its domain restricted to x \u2265 0 before its "
            "inverse \u221ax is a function. The defining identity is f(f\u207b\u00b9(x)) = x and f\u207b\u00b9(f(x)) = x."
        ),
        "diagram": {
            "type": "text",
            "caption": "Finding an inverse, one step per line",
            "code": (
                "METHOD \u2014 Find the inverse of f\n"
                "1) Write y = f(x).\n"
                "2) Swap x and y.\n"
                "3) Solve for y.\n"
                "4) Rename the result f\u207b\u00b9(x).\n"
                "5) Check: f(f\u207b\u00b9(x)) = x.\n"
                "\n"
                "The graph of f\u207b\u00b9 is the graph of f reflected across y = x."
            ),
        },
        "resources": [
            {
                "title": "Inverse functions (Purplemath)",
                "url": "https://www.purplemath.com/modules/invrsfcn.htm",
            },
            {
                "title": "Functions (Khan Academy)",
                "url": "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions",
            },
        ],
        "questions": [
            mc(
                "inv-q1",
                "If f(2) = 9, what is f\u207b\u00b9(9)?",
                ["2", "9", "1/9", "\u22129"],
                0,
                "The inverse undoes f. Since f sends 2 to 9, f\u207b\u00b9 sends 9 back to 2, so f\u207b\u00b9(9) = 2.",
            ),
            sa(
                "inv-q2",
                "f(x) = 3x \u2212 6. What is f\u207b\u00b9(0)?",
                "2",
                "f\u207b\u00b9(0) asks which input gives an output of 0. Solve 3x \u2212 6 = 0 \u2192 3x = 6 \u2192 x = 2. "
                "Check: f(2) = 3(2) \u2212 6 = 0 \u2713.",
            ),
            mc(
                "inv-q3",
                "For f(x) = x\u00b2 with domain x \u2265 0, what is f\u207b\u00b9(x)?",
                ["\u221ax", "x\u00b2", "1/x\u00b2", "\u2212\u221ax"],
                0,
                "Restricting the domain to x \u2265 0 makes squaring one-to-one, so it has an inverse: the "
                "non-negative square root, f\u207b\u00b9(x) = \u221ax. Check: (\u221ax)\u00b2 = x for x \u2265 0 \u2713.",
            ),
            mc(
                "inv-q4",
                "Which function has an inverse that is also a function?",
                ["f(x) = x\u00b2 for all real x", "f(x) = |x| for all real x", "f(x) = 2x + 5", "f(x) = 4 (a constant)"],
                2,
                "f(x) = 2x + 5 is a straight line with a non-zero slope, so it passes both the vertical and the "
                "horizontal line test. x\u00b2 and |x| fail the horizontal line test (two inputs share an output), "
                "and a constant function sends every input to the same output, so neither can have a function inverse.",
            ),
            sa(
                "inv-q5",
                "f(x) = x/4 + 1. What is f\u207b\u00b9(3)?",
                "8",
                "Solve f(x) = 3: x/4 + 1 = 3 \u2192 x/4 = 2 \u2192 x = 8. So f\u207b\u00b9(3) = 8. "
                "Check: f(8) = 8/4 + 1 = 3 \u2713.",
            ),
            mc(
                "inv-q6",
                "If f and f\u207b\u00b9 are inverse functions, what is the domain of f\u207b\u00b9?",
                ["the same as the domain of f", "the range of f", "always all real numbers", "the x-intercepts of f"],
                1,
                "The inverse swaps inputs and outputs, so the domain of f\u207b\u00b9 is the set of outputs of f \u2014 its "
                "range. Likewise the range of f\u207b\u00b9 is the domain of f.",
            ),
            mc(
                "inv-q7",
                "What is the inverse of f(x) = (x + 5)/2?",
                ["f\u207b\u00b9(x) = 2x \u2212 5", "f\u207b\u00b9(x) = 2x + 5", "f\u207b\u00b9(x) = (x \u2212 5)/2", "f\u207b\u00b9(x) = x/2 + 5"],
                0,
                "Write y = (x + 5)/2, swap: x = (y + 5)/2, then multiply by 2: 2x = y + 5, so y = 2x \u2212 5. "
                "Check: f(2x \u2212 5) = ((2x \u2212 5) + 5)/2 = 2x/2 = x \u2713.",
            ),
            mc(
                "inv-q8",
                "If g is the inverse of f, what is f(g(7))?",
                ["7", "1", "0", "49"],
                0,
                "By the defining property of inverse functions, f(g(x)) = x for every x in the domain of g. "
                "So f(g(7)) = 7.",
            ),
        ],
    },
    {
        "id": "function-transformations",
        "title": "Function Transformations & Vertex Form",
        "icon": "\u2195",
        "concept": (
            "Transformations are read from the rule. Changes OUTSIDE the function move or stretch the "
            "graph vertically and behave the way they look: adding 3 raises the graph 3 units, multiplying "
            "by 3 stretches it vertically. Changes INSIDE the function act on x and behave the opposite way "
            "to the sign you see: f(x \u2212 2) shifts right 2, not left. Quadratic vertex form y = a(x \u2212 h)\u00b2 + k "
            "puts all of this in one place: the vertex sits at (h, k), a stretches or reflects the parabola, "
            "and the sign of a decides whether it opens up or down."
        ),
        "diagram": {
            "type": "table",
            "caption": "What each change does to the graph of y = f(x)",
            "headers": ["Change to the rule", "Effect on the graph"],
            "rows": [
                ["f(x) + 3", "Shift up 3 units"],
                ["f(x) \u2212 3", "Shift down 3 units"],
                ["f(x \u2212 2)", "Shift right 2 units"],
                ["f(x + 2)", "Shift left 2 units"],
                ["\u2212f(x)", "Reflect across the x-axis"],
                ["f(\u2212x)", "Reflect across the y-axis"],
                ["3f(x)", "Vertical stretch by a factor of 3"],
                ["f(2x)", "Horizontal compression by a factor of 1/2"],
            ],
        },
        "resources": [
            {
                "title": "Function transformations (Maths Is Fun)",
                "url": "https://www.mathsisfun.com/sets/function-transformations.html",
            },
            {
                "title": "Graphing function transformations (Purplemath)",
                "url": "https://www.purplemath.com/modules/fcntrans.htm",
            },
        ],
        "questions": [
            mc(
                "trans-q1",
                "The graph of y = f(x) + 3 is the graph of y = f(x)\u2026",
                ["shifted up 3 units", "shifted down 3 units", "shifted right 3 units", "stretched vertically by 3"],
                0,
                "The +3 is outside the function, so it changes the output: every y-value is 3 larger. "
                "That moves the whole graph up 3 units.",
            ),
            mc(
                "trans-q2",
                "The graph of y = f(x \u2212 2) is the graph of y = f(x)\u2026",
                ["shifted right 2 units", "shifted left 2 units", "shifted up 2 units", "compressed horizontally"],
                0,
                "Changes inside the function act on the input and run opposite to the sign. f(x \u2212 2) needs "
                "an input 2 larger to produce the same output, so the graph moves right 2 units.",
            ),
            mc(
                "trans-q3",
                "What does y = \u2212f(x) do to the graph of y = f(x)?",
                ["reflects it across the x-axis", "reflects it across the y-axis", "shifts it 1 unit down", "rotates it 90\u00b0"],
                0,
                "The minus sign outside the function negates every output: a point (x, y) becomes (x, \u2212y). "
                "That is a reflection across the x-axis. f(\u2212x) would be the reflection across the y-axis.",
            ),
            mc(
                "trans-q4",
                "y = f(2x) is a\u2026",
                ["horizontal compression by a factor of 1/2", "horizontal stretch by a factor of 2", "vertical compression by 1/2", "vertical stretch by 2"],
                0,
                "Inside changes act on x and run opposite to what you see. Multiplying the input by 2 makes the "
                "graph reach each value twice as fast, so it compresses horizontally by a factor of 1/2.",
            ),
            sa(
                "trans-q5",
                "g(x) = (x \u2212 4)\u00b2 + 1. What is the x-coordinate of the vertex?",
                "4",
                "Compare with vertex form y = a(x \u2212 h)\u00b2 + k. Here h = 4 and k = 1, so the vertex is (4, 1) "
                "and its x-coordinate is 4.",
            ),
            mc(
                "trans-q6",
                "What is the vertex of y = \u22122(x + 3)\u00b2 + 5?",
                ["(\u22123, 5)", "(3, 5)", "(\u22123, \u22125)", "(3, \u22125)"],
                0,
                "Write the bracket as (x \u2212 (\u22123)), so h = \u22123, and k = 5. The vertex is (\u22123, 5). The \u22122 "
                "decides the direction and width, not the position of the vertex.",
            ),
            mc(
                "trans-q7",
                "If f(x) = x\u00b2, which rule describes y = f(x \u2212 1) + 2?",
                ["y = (x \u2212 1)\u00b2 + 2", "y = (x + 1)\u00b2 + 2", "y = (x \u2212 2)\u00b2 + 1", "y = x\u00b2 \u2212 1 + 2"],
                0,
                "Substitute x \u2212 1 for the input of f: f(x \u2212 1) = (x \u2212 1)\u00b2, then add the outside +2, giving "
                "y = (x \u2212 1)\u00b2 + 2. Check the vertex: it moved from (0, 0) to (1, 2) \u2014 right 1, up 2 \u2713.",
            ),
            mc(
                "trans-q8",
                "What transformation turns y = x\u00b2 into y = 3x\u00b2?",
                ["vertical stretch by a factor of 3", "vertical shift up 3", "horizontal compression by a factor of 3", "horizontal shift right 3"],
                0,
                "The 3 multiplies the output, so every y-value is tripled and the graph is stretched vertically "
                "by a factor of 3. The vertex stays at (0, 0).",
            ),
        ],
    },
    {
        "id": "linear-inequalities-systems",
        "title": "Systems of Linear Inequalities & Linear Programming",
        "icon": "\u25e7",
        "concept": (
            "A linear inequality splits the plane into two half-planes. The solution set of a system is the "
            "overlap \u2014 the feasible region. Draw each boundary line first: solid when the inequality is \u2264 or "
            "\u2265 (the line itself counts), dashed when it is < or >. Then test one point, usually (0, 0), to see "
            "which side to shade. In linear programming you maximise or minimise an objective such as P = 3x + 2y "
            "over the feasible region. On a bounded region the best value always happens at a corner, so evaluate "
            "P at every vertex and compare \u2014 no need to search the interior."
        ),
        "diagram": {
            "type": "text",
            "caption": "Method for a two-variable system with an objective",
            "code": (
                "METHOD \u2014 Systems of inequalities & linear programming\n"
                "1) Graph each boundary line (solid for \u2264 / \u2265, dashed for < / >).\n"
                "2) Test (0, 0) in each inequality to choose the side to shade.\n"
                "3) The feasible region is where the shaded sides overlap.\n"
                "4) List every vertex (corner) of the region.\n"
                "5) Evaluate the objective at each vertex.\n"
                "6) The largest / smallest value is the answer; name its vertex."
            ),
        },
        "resources": [
            {
                "title": "Linear programming (Purplemath)",
                "url": "https://www.purplemath.com/modules/linprog.htm",
            },
            {
                "title": "Systems of linear inequalities (Maths Is Fun)",
                "url": "https://www.mathsisfun.com/algebra/systems-linear-inequalities.html",
            },
        ],
        "questions": [
            mc(
                "linineq-q1",
                "Which point is NOT a solution of the system y > x \u2212 1 and y \u2264 2x?",
                ["(1, 2)", "(0, 0)", "(2, 3)", "(\u22121, 0)"],
                3,
                "Test each point in both inequalities. (\u22121, 0): 0 > \u22121 \u2212 1 = \u22122 is true, but 0 \u2264 2(\u22121) = \u22122 is "
                "false, so it fails. The others pass both: (1, 2): 2 > 0 \u2713 and 2 \u2264 2 \u2713; (0, 0): 0 > \u22121 \u2713 and "
                "0 \u2264 0 \u2713; (2, 3): 3 > 1 \u2713 and 3 \u2264 4 \u2713.",
            ),
            mc(
                "linineq-q2",
                "Which point satisfies x \u2265 0, y \u2265 0 and x + y \u2264 4?",
                ["(3, 2)", "(\u22121, 2)", "(4, 1)", "(1, 1)"],
                3,
                "Check the sum first, then the signs. (1, 1): 1 + 1 = 2 \u2264 4 \u2713, both coordinates non-negative \u2713. "
                "(3, 2) gives 5, which is more than 4. (\u22121, 2) fails x \u2265 0. (4, 1) gives 5, which is more than 4.",
            ),
            mc(
                "linineq-q3",
                "A feasible region has vertices (0, 0), (5, 0), (0, 4) and (2, 3). Where is P = 3x + 2y maximised?",
                ["(0, 0)", "(5, 0)", "(0, 4)", "(2, 3)"],
                1,
                "Evaluate P at each vertex: (0, 0) \u2192 0; (5, 0) \u2192 15; (0, 4) \u2192 8; (2, 3) \u2192 6 + 6 = 12. "
                "The largest value is 15, at (5, 0).",
            ),
            sa(
                "linineq-q4",
                "A region is bounded by x \u2265 0, y \u2265 0 and x + y \u2264 10. What is the largest value of P = 2x + 3y on that region?",
                "30",
                "The vertices are (0, 0), (10, 0) and (0, 10). P = 0 at (0, 0), P = 20 at (10, 0) and "
                "P = 3(10) = 30 at (0, 10). The largest value is 30.",
            ),
            mc(
                "linineq-q5",
                "Does the point (2, 2) satisfy y < x?",
                ["Yes, because 2 < 2", "No, because 2 is not less than 2", "Yes, because both coordinates are equal", "No, because the point is outside the first quadrant"],
                1,
                "The inequality is strict: y must be strictly less than x. At (2, 2) the two values are equal, so "
                "2 < 2 is false and the point is not a solution. It would lie on the boundary line, which is dashed here.",
            ),
            mc(
                "linineq-q6",
                "Why is the boundary line of x + y \u2264 4 drawn solid?",
                ["because the inequality includes equality, so points on the line are solutions", "because the line has a positive slope", "because x and y are both positive", "because the region is unbounded"],
                0,
                "The symbol \u2264 includes equality, so points such as (4, 0) and (2, 2) on the line itself satisfy the "
                "inequality. A solid line shows the boundary is part of the solution set; a strict < or > would be dashed.",
            ),
            mc(
                "linineq-q7",
                "Which half-plane is shaded for y \u2265 2x \u2212 1?",
                ["the half-plane containing (0, 0), because 0 \u2265 \u22121 is true", "the half-plane containing (0, \u22125), because \u22125 \u2265 \u22121 is true", "only the part where x > 0", "neither; the inequality has no solution"],
                0,
                "Test (0, 0): 0 \u2265 2(0) \u2212 1 = \u22121 is true, so shade the side that contains the origin. The point "
                "(0, \u22125) fails, since \u22125 \u2265 \u22121 is false, so its half-plane is the one NOT shaded.",
            ),
            sa(
                "linineq-q8",
                "The lines x + y = 6 and y = 2x meet at a vertex of a feasible region. What is the x-coordinate of that vertex?",
                "2",
                "Substitute y = 2x into x + y = 6: x + 2x = 6 \u2192 3x = 6 \u2192 x = 2. Then y = 2(2) = 4, so the "
                "vertex is (2, 4). Check: 2 + 4 = 6 \u2713.",
            ),
        ],
    },
    {
        "id": "probability-two-way-tables",
        "title": "Probability from Two-Way Tables",
        "icon": "\u25a6",
        "concept": (
            "A two-way table sorts one group by two categories at once, so it answers probability questions "
            "without any formula beyond counting. The grand total is the denominator for an overall probability; "
            "a row or column total is the denominator for a conditional probability (\u201cgiven that\u201d). Read the "
            "question for the word \u201cgiven\u201d: it tells you to shrink the sample space to one row or column. "
            "Two events are independent when knowing one does not change the probability of the other \u2014 check "
            "whether P(A | B) equals P(A). And \u201cor\u201d needs care: add the two probabilities, then subtract the "
            "overlap so it is not counted twice."
        ),
        "diagram": {
            "type": "table",
            "caption": "Survey of 200 students: how they travel and whether they arrived on time",
            "headers": ["", "On time", "Late", "Total"],
            "rows": [
                ["Rides the bus", "60", "20", "80"],
                ["Walks", "90", "30", "120"],
                ["Total", "150", "50", "200"],
            ],
        },
        "resources": [
            {
                "title": "Two-way tables (Maths Is Fun)",
                "url": "https://www.mathsisfun.com/data/two-way-table.html",
            },
            {
                "title": "Probability library (Khan Academy)",
                "url": "https://www.khanacademy.org/math/statistics-probability/probability-library",
            },
        ],
        "questions": [
            mc(
                "twoway-q1",
                "Using the table, what is P(a student rides the bus)?",
                ["0.30", "0.40", "0.75", "0.80"],
                1,
                "80 of the 200 students ride the bus, so P = 80/200 = 0.40.",
            ),
            sa(
                "twoway-q2",
                "What is P(late | walks), as a decimal?",
                "0.25",
                "The \u201cgiven walks\u201d shrinks the sample space to the 120 walkers. Of those, 30 are late, so "
                "P = 30/120 = 0.25.",
            ),
            mc(
                "twoway-q3",
                "What is P(walks and is late)?",
                ["0.15", "0.25", "0.60", "0.30"],
                0,
                "\u201cAnd\u201d means the single cell where both are true: 30 students. Divide by the grand total, "
                "P = 30/200 = 0.15.",
            ),
            mc(
                "twoway-q4",
                "What is P(late)?",
                ["0.20", "0.25", "0.30", "0.50"],
                1,
                "The late column totals 50 students out of 200, so P = 50/200 = 0.25.",
            ),
            mc(
                "twoway-q5",
                "Are arriving late and walking independent?",
                ["Yes, because P(late | walks) = P(late | bus) = 0.25", "No, because the row totals differ", "Yes, because 30 students walk and are late", "Cannot be decided from a two-way table"],
                0,
                "P(late | walks) = 30/120 = 0.25 and P(late | bus) = 20/80 = 0.25, which also equals the overall "
                "P(late) = 50/200 = 0.25. The probability of being late is the same whichever way a student travels, "
                "so the two events are independent. Unequal row totals do not by themselves break independence.",
            ),
            mc(
                "twoway-q6",
                "What is P(on time | rides the bus)?",
                ["0.40", "0.60", "0.75", "0.80"],
                2,
                "Given that a student rides the bus, the sample space is the 80 bus riders. 60 of them are on time, "
                "so P = 60/80 = 0.75.",
            ),
            sa(
                "twoway-q7",
                "How many students walk and arrive on time?",
                "90",
                "The \u201cWalks\u201d row and the \u201cOn time\u201d column meet in the cell holding 90.",
            ),
            mc(
                "twoway-q8",
                "What is P(rides the bus or is late)?",
                ["0.40", "0.55", "0.65", "0.75"],
                1,
                "Add the two totals and subtract the overlap so it is not counted twice: 80 + 50 \u2212 20 = 110. "
                "So P = 110/200 = 0.55.",
            ),
        ],
    },
]


def main():
    with open(PATH, encoding="utf-8") as fh:
        content = json.load(fh)

    existing = {t["id"] for t in content["topics"]}
    for topic in NEW_TOPICS:
        if topic["id"] in existing:
            continue
        content["topics"].append(topic)

    topics = content["topics"]
    questions = sum(len(t["questions"]) for t in topics)
    content["app"]["title"] = "Algebra Mastery Pack"
    content["app"]["subtitle"] = (
        f"Grade 11 algebra, functions & data analysis \u2014 {len(topics)} topics, "
        f"{questions} questions, 3 printable practice tests"
    )
    content["app"]["edition"] = "Paid edition (v2)"
    content["app"]["disclaimer"] = (
        "This is a self-study aid to help a learner practice and understand grade-11 algebra, functions, "
        "and data analysis. It is not a substitute for the learner's course, teacher, textbook, or curriculum, "
        "and is not affiliated with or endorsed by any textbook publisher, OpenStax, Khan Academy, or any "
        "referenced site. All questions are written for this pack and the worked solutions were checked by "
        "substitution. Content is independently authored from standard mathematical facts and methods and does "
        "not reproduce any publisher's text, examples, or figures. Always follow your teacher's methods and the "
        "course syllabus, and treat the worked steps here as one valid approach, not the only one."
    )

    for topic in topics:
        for q in topic["questions"]:
            if not q.get("explanation"):
                raise SystemExit(f"question {q['id']} has no worked solution")
            if q["type"] == "multiple-choice" and not (0 <= q["answer"] < len(q["options"])):
                raise SystemExit(f"question {q['id']} has a bad answer index")

    with open(PATH, "w", encoding="utf-8") as fh:
        json.dump(content, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print(f"{len(topics)} topics, {questions} questions")


if __name__ == "__main__":
    main()
