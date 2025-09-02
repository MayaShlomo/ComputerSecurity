// מתג בחירה בין זיכרון ו-MySQL
// זה מה שהשאר ישתמשו בו

const dataBackend = process.env.DATA_BACKEND || 'memory';

console.log('Data backend mode:', dataBackend);

let repo;

if (dataBackend === 'mysql') {
  console.log('Loading MySQL repository...');
  repo = require('./mysql');
} else {
  console.log('Loading Memory repository...');
  repo = require('./memory');
}

// יצוא הrepo הנבחר
module.exports = repo;