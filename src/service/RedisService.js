import bluebird from 'bluebird';
import redis from 'redis';
bluebird.promisifyAll(redis);
const EventEmitter = require('events');
class EventBus extends EventEmitter { }
const eventBus = new EventBus();

let client = null;
/**
 * 
 * @param {Object} tree 
 * @param {String[]} redisKeyParts
 */
function putKey(tree, redisKeyParts) {
    const [first, ...remain] = redisKeyParts;
    if (!tree[first]) {
        tree[first] = {};
    }
    // it is branch
    if (remain.length > 0) {
        putKey(tree[first], remain);
    }
}

export default {
    eventOn: function(eventName, callback){
        eventBus.on(eventName, callback);
    },
    eventOnce: function(eventName, callback){
        eventBus.once(eventName, callback);
    },
    eventEmit: function(eventName, ...args){
        eventBus.emit(eventName, ...args);
    },
    eventOffAll: function(eventName){
        eventBus.removeAllListeners(eventName);
    },
    /**
     * 
     * @param {String} host 
     */
    connect: async function (host) {
        client = redis.createClient({
            host,
            port: 6379,
            db: 0,
            connect_timeout: 3000
        });
        return client;
    },
    currentClient() {
        return client;
    },
    /**
     * 
     * @param {redis.RedisClient} client 
     */
    getKeyTree: async function () {
        const keyList = await client.keysAsync("*");
        // console.log("key list", keyList);
        const tree = {};
        for (let key of keyList) {
            putKey(tree, key.split(":"));
        }
        // console.log("tree" ,tree);
        return tree;
    },
    /**
     * @param {String} key 
     * @returns {String}
     */
    detail: async function (key) {
        const type = await client.typeAsync(key);
        const ttl = await client.ttlAsync(key);
        const detail = { key, type, ttl };
        switch (type) {
            case "string": {
                detail.string = {
                    value: await client.getAsync(key)
                };
                break;
            }
            case "list": {
                const pageSize = 10;
                const pageNum = 1;
                const from = (pageNum - 1) * pageSize;
                detail.list = {
                    len: await client.llenAsync(key),
                    pageSize,
                    pageNum,
                    slice: await client.lrangeAsync(key, from, from + pageSize),
                }
                break;
            }
            case "set": {
                const rs = await client.sscanAsync(key, 0, "count", 10);
                detail.set = {
                    len: await client.scardAsync(key),
                    corsor: rs[0],
                    slice: rs[1],
                }
                break;
            }
            case "hash": {
                const rs = await client.hscanAsync(key, 0, "count", 10);
                const slice = [];
                for (let i = 0; i < rs[1].length; i += 2) {
                    slice.push({
                        field: rs[1][i],
                        value: rs[1][i + 1]
                    });
                }
                detail.hash = {
                    len: await client.hlenAsync(key),
                    corsor: rs[0],
                    slice,
                }
                break;
            }
            case "zset": {
                const rs = await client.zscanAsync(key, 0, "count", 10);
                const slice = [];
                for (let i = 0; i < rs[1].length; i += 2) {
                    slice.push({
                        member: rs[1][i],
                        score: rs[1][i + 1]
                    });
                }
                detail.zset = {
                    len: await client.zcardAsync(key),
                    corsor: rs[0],
                    slice,
                }
                break;
            }
        }
        // console.log(`[Detail] ${key} >`, detail)
        return detail;
    },
};

