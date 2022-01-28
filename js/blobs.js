import { spline } from 'https://cdn.skypack.dev/@georgedoescode/spline@1.0.1';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@2.4.0';
import { showTooltip, hideTooltip } from 'http://localhost:8001/js/tooltip.js';

import config from '../config.json' assert { type: "json" };


export default function createBlob({
        file,

        // position
        POS = {x: 100, y: 100},
        
        // movement
        NOISE_STEP = config.constants.speed, // how fast we progress through "time" (blob speed)
        NOISE_STEP_HOVER = 3, // multiplier for speed increase on hover

        // size and shape
        MAGNITUDE = 20, // how far the blob stretches
        NUM_POINTS = 6,
        RADIUS = 75,
        
    } = {}) {
    

    if (NUM_POINTS < 3) {throw new RangeError("numPoints must be > 2")}


    function map(n, start1, end1, start2, end2) {
        // map a number from 1 range to another
        return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
    }

    function createPoints() {

        const points = [];

        // used to equally space each point around the circle
        const angleStep = (Math.PI * 2) / NUM_POINTS;

        for (let i = 1; i <= NUM_POINTS; i++) {
            // x & y coordinates of the current point
            const theta = i * angleStep;

            const x = POS.x + Math.cos(theta) * RADIUS;
            const y = POS.y + Math.sin(theta) * RADIUS;

            // store the point
            points.push({
                x: x,
                y: y,
                /* we need to keep a reference to the point's original {x, y} coordinates 
                for when we modulate the values later */
                originX: x,
                originY: y,
                noiseOffsetX: Math.random() * 1000,
                noiseOffsetY: Math.random() * 1000,
            });
        }

        return points;
    }

    const root = document.documentElement;
    const svg = document.getElementsByTagName('svg')[0];

    let currentSpeed = NOISE_STEP;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "url('#gradient')");

    // add event listeners
    path.addEventListener("mouseover", evt => showTooltip(evt, file));
    path.addEventListener("mouseout", hideTooltip);

    // add to DOM
    svg.appendChild(path);

    // initialize blob state
    const points = createPoints(6);
    let hueNoiseOffset = 0;

    // for creating noise
    const simplex = new SimplexNoise();
    function noise(x, y) {
        // return a value at {x point in time} {y point in time}
        return simplex.noise2D(x, y);
    }


    // morph blob point locations, animating over time
    function animate() {

        // for every point...
        for (let i = 0; i < points.length; i++) {
            const point = points[i];

            // return a pseudo random value between -1 / 1 based on this point's current x, y positions in "time"
            const nX = noise(point.noiseOffsetX, point.noiseOffsetX);
            const nY = noise(point.noiseOffsetY, point.noiseOffsetY);
            // map this noise value to a new value, somewhere between it's original location +- MAGNITUDE
            const x = map(nX, -1, 1, point.originX - MAGNITUDE, point.originX + MAGNITUDE);
            const y = map(nY, -1, 1, point.originY - MAGNITUDE, point.originY + MAGNITUDE);

            // update the point's current coordinates
            point.x = x;
            point.y = y;

            
            // progress the point's x, y values through "time"
            point.noiseOffsetX += currentSpeed;
            point.noiseOffsetY += currentSpeed;
        }

        path.setAttribute('d', spline(points, 1, true));

        // we want the hue to move a little slower than the rest of the shape
        hueNoiseOffset += currentSpeed / 10;
        const hueNoise = noise(hueNoiseOffset, hueNoiseOffset);
        const hue = map(hueNoise, -1, 1, 0, 360);

        root.style.setProperty("--startColor", `hsl(${hue}, 100%, 75%)`);
        root.style.setProperty("--stopColor", `hsl(${hue + 60}, 100%, 75%)`);
        document.body.style.background = `hsl(${hue + 60}, 75%, 6%)`;

    };

    // add hover effect
    path.addEventListener("mouseover", () => {
        currentSpeed = NOISE_STEP * NOISE_STEP_HOVER;
    })
    path.addEventListener("mouseout", () => {
        currentSpeed = NOISE_STEP;
    })

    return animate;
}




