import config from '../config.json' assert { type: "json" };

export default class Mapper {

    // the keys that should be mapped
    mapped = [
        "n_lines",
        "line_len_std"
    ]

    constructor(data) {
        this.data = data;
        this.__config = config;
        this.mappings = {};
        this.mapped.forEach(key => {
            const keyConfig = this.__config?.mapping[key]

            // start with identity mapping first
            this.mappings[key] = (d) => d

            // apply scale (defaults to identity)
            switch (keyConfig?.scale) {
                case "standardize":
                    this.mappings[key] = this.scaleStandardize(key);
                    break;
                case "normalize":
                    this.mappings[key] = this.scaleNormalize(key);
                    break;
                case "identity":
                    this.mappings[key] = this.identity(key);
                    break;
                case undefined:
                    this.mappings[key] = this.identity(key);
                    break;
                default:
                    this.mappings[key] = this.identity(key);
                    break;
            }

            // apply transform (defaults to identity)
            switch (keyConfig?.transform) {
                case "log":
                    this.mappings[key] = this.logTransform(key);
                    break;
                case "identity":
                    this.mappings[key] = this.identity(key);
                    break;
                case undefined:
                    this.mappings[key] = this.identity(key);
                    break;
                default:
                    this.mappings[key] = this.identity(key);
                    break;
            }

            // apply multiplier (defaults to 1)
            this.mappings[key] = this.multipy(key);

            // apply offset (defaults to 0)
            this.mappings[key] = this.offset(key);
        })
    }

    multipy(key) {
        const mapping = this.mappings[key]
        const multiplier = this.__config?.mapping[key]?.multiplier || 10;
        return d => mapping(d) * multiplier;
    }

    offset(key) {
        const mapping = this.mappings[key]
        const offset = this.__config?.mapping[key]?.offset || 0;
        return d => mapping(d) + offset;
    }

    identity(key) {
        return this.mappings[key]
    }

    scaleNormalize(key) {
        // generate a normalized ([0-1]) mapping for a given key in the dataset
        const data = this.data;
        const max = Math.max.apply(Math, data.map(o => o[key]));
        const min = Math.min.apply(Math, data.map(o => o[key]));
        return d => (d - min) / (max - min);
    }

    scaleStandardize(key) {
        // generate a standardized (mean 0, std 1) mapping for a given key in the dataset
        const data = this.data;
        const mean = data.reduce((a, b) => a[key] + b[key], 0) / data.length;
        const std =  Math.sqrt(data.map(x => Math.pow(x[key] - mean, 2)).reduce((a, b) => a + b) / data.length)
        return d => (d - mean)/std
    }

    logTransform(key) {
        const mapping = this.mappings[key]

        // get base for log transform. Default e (as in log e)
        const logBase = this.__config?.mapping[key]?.logBase || Math.E;

        return d => Math.log(mapping(d)) / Math.log(logBase);
    }

    map(file) {
        // map all values in the file
        let out = {};
        Object.keys(file).forEach(key => {

            if (this.mapped.includes(key)) {
                // apply mapping
                out[key] = this.mappings[key](file[key]);
            } else {
                // pass unchanged value
                out[key] = file[key];
            }
            
        })
        return out;
        
    }
}