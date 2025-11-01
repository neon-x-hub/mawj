const InterpolationEngine = {
  compute(interp, context = {}) {
    if (!interp || interp.type !== "interpolation") {
      throw new Error("Invalid interpolation object");
    }

    const { variable, points, unit = "", consider_diacritics = false } = interp;

    let x;
    if (variable === "textLength") {
      const text = context.content || "";

      if (consider_diacritics) {
        x = [...text].length;
      } else {
        // Remove Arabic and general combining marks (tashkeel)
        const withoutDiacritics = text.replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "");
        x = [...withoutDiacritics].length;
      }
    } else {
      throw new Error(`Unknown variable: ${variable}`);
    }

    if (points.length === 0) return `0${unit}`;
    if (points.length === 1) return `${points[0].y}${unit}`;

    const sorted = points.slice().sort((a, b) => a.x - b.x);

    if (x <= sorted[0].x) return `${sorted[0].y}${unit}`;
    if (x >= sorted[sorted.length - 1].x) return `${sorted[sorted.length - 1].y}${unit}`;

    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i];
      const p2 = sorted[i + 1];
      if (x >= p1.x && x <= p2.x) {
        const t = (x - p1.x) / (p2.x - p1.x);
        const y = p1.y + t * (p2.y - p1.y);
        return `${y}${unit}`;
      }
    }

    return `${sorted[sorted.length - 1].y}${unit}`;
  }
};

export default InterpolationEngine;
