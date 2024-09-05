import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 })

export const setCache = (key, value, ttl) => {
    cache.set(key, value, ttl)
}

export const getCache = (key) => {
    return cache.get(key)
}

export const delCache = (key) => {
    cache.del(key)
}

export const flushCache = () => {
    cache.flushAll()
}

export default cache
