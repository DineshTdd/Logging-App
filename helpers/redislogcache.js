const {client} = require('../config/redisconfig');
const { performance, PerformanceObserver } = require('perf_hooks');


 
exports.RedisLogCache = async (message) => {
    try{

    // Observes high resolution performance metrics
    const obs = new PerformanceObserver((items) => {
        console.log('It took ' + items.getEntries()[0].duration + ' ms.');
        performance.clearMark();
      });
    obs.observe({ entryTypes: ['measure'] });


    performance.mark('A')
    const buffer = Buffer.from(JSON.stringify(message), 'ascii'); 
    performance.mark('B')
    performance.measure('A to B', 'A', 'B') // It took 0.1151 ms.
    

    await client.LPUSH('logscache', buffer);
    await client.LRANGE('logscache', 0, -1, async (err, reply) => {
        if (err) console.log(err); 
        // performance.mark('A')
        await reply.forEach(element => {
            // console.log(JSON.parse(element).message)
        });
        // performance.mark('B')
        // performance.measure('A to B', 'A', 'B')
    });
    } catch(err) {
        console.log(err)
    }
};