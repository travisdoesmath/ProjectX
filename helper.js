function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hexDesaturate(hex) {
    let lambda = 0.5
    let rgb = hexToRgb(hex);
    let intensity = 0.3 * rgb.r + 0.59 * rgb.g + 0.11 * rgb.b;
    return `rgb(${intensity * lambda + rgb.r * (1 - lambda)},${intensity * lambda + rgb.g * (1 - lambda)},${intensity * lambda + rgb.b * (1 - lambda)})`;
}

function hexWashout(hex) {
    let rgb = hexToRgb(hex);
    return `rgb(${0.5*(rgb.r + 255)},${0.5*(rgb.g + 255)},${0.5*(rgb.b + 255)})`
}

function hexDarker(hex) {
    let lambda = 0.3
    let rgb = hexToRgb(hex);
    return `rgb(${lambda * rgb.r},${lambda * rgb.g},${lambda * rgb.b})`
}