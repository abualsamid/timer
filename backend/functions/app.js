const DynamoDB = require('aws-sdk/clients/dynamodb')
// const db = new DynamoDB.DocumentClient()
const db = new DynamoDB()
const  ulid =require('ulid') 
const { TableName } = process.env
const nodeCache = require('node-cache')
const { unmarshall } = require('@aws-sdk/util-dynamodb')
const cache = new nodeCache({stdTTL: 600})

function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, '')

  // Make the string lowercase
  str = str.toLowerCase()

  // Remove accents, swap ñ for n, etc
  var from =
    'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;'
  var to =
    'AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------'
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  // Remove invalid chars
  str = str
    .replace(/[^a-z0-9 -]/g, '')
    // Collapse whitespace and replace by -
    .replace(/\s+/g, '-')
    // Collapse dashes
    .replace(/-+/g, '-')

  return str
}
const extractUser = (event) => {
  const { requestContext } = event
  const { authorizer } = requestContext
  const { jwt } = authorizer
  const { claims } = jwt
  return [claims.sub, claims.email]
}

const Insert = async (Item,userId) => {
  const _now = Date.now() 

  Item.createdAt = Item.createdAt || _now 
  Item.updatedAt = Item.updatedAt || _now 
    
  const item = JSON.stringify(Item).replace(/"/g,"'")
  const Statement = `insert into "${TableName}" value ${item}`
  const cacheItem = JSON.stringify({
    id: `${userId}-cache`,
    key: 'cache',
    now: _now 
  }).replace(/"/g,"'")

  const updateCache = `insert into "${TableName}" value ${cacheItem} `
  // console.log(Statement)
  try {
    await db
      .executeStatement({ Statement })
      .promise()
    return Item 
  } catch (error) {
    console.error('Insert error ', Statement, error )
  }
}
const updateCacheMarker = async userId => {
  const _now = Date.now()
  const Statement = `update "${TableName}" set "now"='${_now}' where "id"='${userId}-cache' and "key"='cache'`

  try {
    await db.executeStatement({Statement}).promise()
  } catch (error) {
    // ConditionalCheckFailedException : item does not already exist 
    console.log(Statement, error)
    try {
      const cacheItem = JSON.stringify({
        id: `${userId}-cache`,
        key: 'cache',
        now: _now,
      }).replace(/"/g, "'")
      const Statement = `insert into "${TableName}" value ${cacheItem} `
      await db.executeStatement({Statement}).promise()
    } catch (error) {
      console.log(Statement, error)
    }
  }
}
const canUseCache = async userId => {
  try {
    const Statement = `select * from "${TableName}" where "id"='${userId}-cache' and 'key'='cache'`
    const res = await db.executeStatement({Statement}).promise()
    res.Items = res.Items.map((item) => unmarshall(item))
    const item = res.Items[0]
    const _now = item.now 
    if (_now < Date.now() - 600*1000) {
      return true 
    }
  } catch (error) {
    return false 
  }
  return false 
}
const get = async ({id, key, userId}) => {
  const cacheKey = key ? `${id}-${key}` : id

  const _canUseCache = await canUseCache(userId)
  let res = cache.get(cacheKey)
  if (res == undefined || _canUseCache==false ) {
    const Statement = key
      ? `select * from "${TableName}" where "id"='${id}' and begins_with("key",'${key}') order by "key" desc`
      : `select * from "${TableName}" where "id"='${id}' order by "key" desc`
    res = await db.executeStatement({ Statement }).promise()
    res.Items = res.Items.map((item) => unmarshall(item))
    cache.set(cacheKey, res)
    return res
  } else {
    console.log('returning items for ', id, key, ' from cache: ', res)
    return res
  }
} 

exports.createEvent = async event => {
  try {
    const data = JSON.parse(event.body)
    const [id, email] = extractUser(event)
    const _now = Date.now()
    const key = ulid.ulid()

    const Item = {
      ...data,
      createdAt: _now,
      updatedAt: _now,
      id: `${id}-event`,
      key,
    }
    await Insert(Item, id)
    return {
      Item,
      message: 'created event'
    }
  } catch (error) {
    console.error(error)
  }
}
exports.createTimer = async (event, context) => {
  try {
    const data = JSON.parse(event.body)
    
    const [id, email] = extractUser(event)
    const _now = Date.now()
    const key = ulid.ulid()

    const Item = {
      ...data, 
      createdAt: _now,
      updatedAt: _now,
      id: `${id}-time`, 
      key: `${data.eventId}-${key}`
    }
    await Insert(Item)
    // if (data.track) {
    //   try {
    //     await Insert({id: `${id}-track`, key: `${data.track}`})
        
    //   } catch (error) {
    //     if (error.code !== 'DuplicateItemException') console.log(error)
    //   }
    // }
    if (data.athlete) {
      try {
        await Insert({id: `${id}-athlete`, key: `${data.athlete}`},id)
       
      } catch (error) {
        if (error.code !== 'DuplicateItemException') console.log(error)
        
      }
    }
    const response = {
      Item, 
      message: 'giddy up, posted time.',
    }
    return response 
  } catch (error) {
    console.log(error)
    return {
      error,
    }
  }
}

exports.getEvents = async event => {
  const [userId, email] = extractUser(event) 
  const cacheKey = `${id}-event`
  return await get({id: cacheKey, userId})
  
}

exports.getAthletes = async event => {
  const [userId, email] = extractUser(event)
  const cacheKey = `${userId}-athlete`
  return await get({id: cacheKey, userId})
}
exports.addAthlete = async event => {
  const [userId, email] = extractUser(event)
  const cacheKey = `${userId}-athlete`
  const data = JSON.parse(event.body)

  const item = {
    id: cacheKey,
    key: data.id || ulid.ulid(),
    ...data
  }

  const Item = await Insert(item, userId )
  await updateCacheMarker(userId)
  try {
    const cached = cache.get(cacheKey)
    if (cached) {
      cached.Items = [...cached.Items, Item]
      cache.set(cacheKey, cached)
      console.log('set new item in cache, ', cacheKey, cached)
    }
  } catch (error) {
    console.log(error)
  }
  
  return Item
}
exports.getTimes = async (event, context) => {
  const [userId, email] = extractUser(event)
  const { eventId } = event.pathParameters
  return await get({id: `${userId}-time`, key: eventId, userId})
}

exports.myProfile = async (event, context) => {

  const [id, email] = extractUser(event)
  const Key = {
    id,
    key: email,
  }
  try {
    const resp = await DocumentClient.get({
      TableName,
      Key,
    }).promise()
    return resp.Item
  } catch (error) {
    console.log('Doh ', error)
    return null
  }
}


exports.handler = event => {
  console.log(event)
}