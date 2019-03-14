import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/BioteaBioschemasShowcase.js',
        format: 'iife',
        name: 'BioteaBioschemasShowcase',
        sourcemap: true        
    },
    plugins: [
        nodeResolve({jsnext: true}),
        commonjs({
            include: 'node_modules/**'
        }),
        babel({
            exclude: 'node_modules/**',
            runtimeHelpers: true
        })
    ],
};
