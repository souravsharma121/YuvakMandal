// This file is specifically for Vercel serverless deployment
// Do NOT use this for local development

const serverless = require('serverless-http');
const app = require('../server');

module.exports = serverless(app);
