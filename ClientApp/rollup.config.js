import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file - better for performance
			css: css => {
				css.write('public/build/bundle.css');
			}
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

function serve() {
	let started = false;
	return {
		writeBundle() {
			if (!started) {
				//HACK: MSFT ASP.NET extension for react will pass a port and expect a web server on that port. 
				let port = parseInt(process.env.PORT, 10) || 8083;
				started = true;
				let npm = require('child_process').spawn('npm', ['run', 'start', '--', '--dev', '--port', port], {
					//STDIN: Ignore, STDIOUT: Pipe to this script, STDIERR: Pass to MSBuild
					stdio: ['ignore', 'pipe', 'inherit'],
					shell: true
				});
				npm.stdout.on('data', (data) => {
					//HACK
					//Problem: MSFT ASP.NET react extension will expect a "Starting the development server..." message when the web server is ready and hosting our webpage.
					//Solution: We will listen for a sirv standard message "Your application is ready" then we will let know ASP.NET that we are ready.
					if(data.includes('Your application is ready'))
					{
						console.log('Starting the development server...\n');
					}
				});
			}
		}
	};
}
