'use strict'

// util used for logging objects on the request object.
const util = require('util');

// Style codes for the terminal.
const style = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	standout: '\x1b[3m',
	underline: '\x1b[4m',
	blink: '\x1b[5m',
	inverse: '\x1b[7m',
	hidden: '\x1b[8m',
	nobright: '\x1b[22m',
	nostandout: '\x1b[23m',
	nounderline: '\x1b[24m',
	noblink: '\x1b[25m',
	noinverse: '\x1b[27m',
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
	bg_black: '\x1b[40m',
	bg_red: '\x1b[41m',
	bg_green: '\x1b[42m',
	bg_yellow: '\x1b[43m',
	bg_blue: '\x1b[44m',
	bg_magenta: '\x1b[45m',
	bg_cyan: '\x1b[46m',
	bg_white: '\x1b[47m'
}

// Style associations.
const msgDecor = {
	default: `${style.cyan}`,
	error: `${style.red}`,
	port: `${style.green}${style.underline}`,
	url: `${style.yellow}`,
	brackets: `${style.cyan}`,
	reqMETHOD: `${style.cyan}`,
	reqPARAMS: `${style.yellow}`,
	reqQUERY: `${style.blue}`,
	reqBODY: `${style.magenta}`
}

const stylized = {
	default: (string) => `${msgDecor.default}${string}${style.reset}`,
	error: (string) => `${msgDecor.error}${string}${style.reset}`,
	port: (string) => `${msgDecor.port}${string}${style.reset}`,
	url: (string) => `${msgDecor.url}${string}${style.reset}`,
	reqMETHOD: (string) => `${msgDecor.reqMETHOD}${string}${style.reset}`,
	reqPARAMS: (string) => `${msgDecor.reqPARAMS}${string}${style.reset}`,
	reqQUERY: (string) => `${msgDecor.reqQUERY}${string}${style.reset}`,
	reqBODY: (string) => `${msgDecor.reqBODY}${string}${style.reset}`
}

const syntax = {
	brackets: (string) => `${msgDecor.brackets}[${style.reset}${string}${msgDecor.brackets}]${style.reset}`,
}

const reqLog = {
	// Returns stylized string containing info from req.method and req.url.
	basic: (req) => `${syntax.brackets(`${stylized.reqMETHOD(req.method)} ${stylized.url(req.url)}`)}`,

	// Returns stylized string containing info from from req.params, req.query, and req.body.
	additional: (req) => {
		let reqInfo = '';
		// req.params always has '0': /req.url
		if (Object.keys(req.params).length > 1) reqInfo += ` ${stylized.reqPARAMS(`req.params: ${util.inspect(req.params)}`)}`;
		if (Object.keys(req.query).length > 0) reqInfo += ` ${stylized.reqQUERY(`req.query: ${util.inspect(req.query)}`)}`;
		if (Object.keys(req.body).length > 0) reqInfo += ` ${stylized.reqBODY(`req.body: ${util.inspect(req.body)}`)}`;
		return reqInfo.trim();
	}
}

const actions = {
	print: (logmsg) => console.log(logmsg)
}

// serverReporter object contains methods to print serverside console messages.
const serverReporter = {

	// Log message indicating that the server is listening on a specified port.
	listenPort: (port) => actions.print(stylized.port(`🤘 ready to rock on port ${port}`)),

	// Log request method and route.
	request: (req, res, next) => {

		// Log message will have two parts:
		// 1) basic info (req.method and req.url)
		// 2) additional info (req.params, req.query, req.body).
		const logmsg = `${reqLog.basic(req)} ${stylized.default(`request received`)} ${reqLog.additional(req)}`;

		// Log message.
		actions.print(logmsg);

		// Move to next middleware.
		return next();
	},

	// Log final result of dealing with request.
	response: (req, res, next) => {

		// Check res.locals.err for an error object (must update controllers to conform).
		if (res.locals.err) {
			actions.print(`❗ ${stylized.error(res.locals.err.message)}`);
		}
		// If no error, assume successful delivery of payload and log confirmation. Check for custom msg in res.locals.successMsg first.
		else {
			const logmsg = res.locals.successMsg ? res.locals.successMsg : 'payload delivered';
			actions.print(`${reqLog.basic(req)} ${stylized.default(logmsg)}`);
		}

		// As this is meant to be the last middleware, it does not call next().
	}

}

module.exports = serverReporter;
