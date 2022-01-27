import createBlob from './blobs.js';
import Mapper from './mapper.js';
import data from '../out.json' assert { type: "json" };

const width = window.innerWidth;
const height = window.innerHeight;

// set svg size
document.getElementsByTagName("svg")[0].setAttribute("viewBox", `0 0 ${width} ${height}`)

const mapper = new Mapper(data);
const mapped = data.map(file => mapper.map(file))


// create blobs
mapped.forEach(file => {
    const blob_params = {
        RADIUS: file.n_lines, 
        MAGNITUDE: file.line_len_std
    };

    createBlob({
        file: file,
        
        POS: {
            x: blob_params.RADIUS*2 + Math.random() * (width - blob_params.RADIUS*2), 
            y: blob_params.RADIUS*2 + Math.random() * (height - blob_params.RADIUS*2)
        },
        ...blob_params
    });
})