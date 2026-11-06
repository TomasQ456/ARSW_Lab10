var bigInt = require("big-integer");

// Lives at module level: it survives between invocations only while the instance stays warm
var memo = { 0: bigInt.zero, 1: bigInt.one };

function fibonacci(n) {
    if (memo[n] === undefined)
        memo[n] = fibonacci(n - 1).add(fibonacci(n - 2))
    return memo[n]
}

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    let nth = req.body.nth
    let cached = memo[nth] !== undefined

    if (nth < 0)
        throw 'must be greater than 0'

    let answer = fibonacci(nth)

    context.res = {
        headers: {
            'x-memo-hit': String(cached),
            'x-memo-size': String(Object.keys(memo).length)
        },
        body: answer.toString()
    };
}
