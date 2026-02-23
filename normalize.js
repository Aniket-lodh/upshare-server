const fs = require('fs');
const file = './controllers/user_controller.js';
let content = fs.readFileSync(file, 'utf8');

// replace .send( -> .json(
content = content.replace(/\.send\(/g, '.json(');

// replace status: 200 -> status: "success"
content = content.replace(/status:\s*200,?/g, 'status: "success",');

// replace status: 500 -> status: "error"
content = content.replace(/status:\s*500,?/g, 'status: "error",');

// remove code: 200,
content = content.replace(/code:\s*200,/g, '');

fs.writeFileSync(file, content);
console.log('Normalized user_controller.js');
