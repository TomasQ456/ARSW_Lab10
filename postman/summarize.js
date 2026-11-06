const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const runs = fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(path.join(dir, file))).run);

const executions = runs.flatMap(run => run.executions);
const times = executions
    .filter(execution => execution.response)
    .map(execution => execution.response.responseTime)
    .sort((a, b) => a - b);
const ok = executions.filter(execution => execution.response && execution.response.code === 200).length;

console.log(`peticiones: ${executions.length}, exitosas: ${ok}, fallidas: ${executions.length - ok}`);
if (times.length) {
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    console.log(`tiempo ms -> min: ${times[0]}, media: ${Math.round(mean)}, max: ${times[times.length - 1]}`);
}
