const DynamoDB = require('aws-sdk/clients/dynamodb')
// const db = new DynamoDB.DocumentClient()
const db = new DynamoDB()
const  ulid =require('ulid') 
const { TableName } = process.env
const nodeCache = require('node-cache')
const cache = new nodeCache({stdTTL: 60})

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

const Insert = async Item => {
  const item = JSON.stringify(Item).replace(/"/g,"'")
  const Statement = `insert into "${TableName}" value ${item}`
  return await db.executeStatement({Statement}).promise()
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
    await Insert(Item)
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
    
    const [sub, email] = extractUser(event)
    const _now = Date.now()
    const key = ulid.ulid()

    const Item = {
      ...data, 
      createdAt: _now,
      updatedAt: _now,
      id: `${sub}-time`, 
      key: `${data.eventId}-${key}`
    }
    await Insert(Item)
    // if (data.track) {
    //   try {
    //     await Insert({id: `${sub}-track`, key: `${data.track}`})
        
    //   } catch (error) {
    //     if (error.code !== 'DuplicateItemException') console.log(error)
    //   }
    // }
    if (data.athlete) {
      try {
        await Insert({id: `${sub}-athlete`, key: `${data.athlete}`})
       
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

const get = async (id, key) => {
  const cacheKey = key ? `${id}-${key}`: id 
  let res = cache.get(cacheKey) 
  if (res == undefined) {
    const Statement = key
          ? `select * from "${TableName}" where "id"='${id}' and begins_with("key",'${key}') order by "key" desc`
          : `select * from "${TableName}" where "id"='${id}' order by "key" desc`
    console.log(Statement)
    res = await db
      .executeStatement({Statement})
      .promise()
    cache.set(cacheKey, res) 
    return res 
  } else {
    return res 
  }
} 
exports.getEvents = async event => {
  const [id, email] = extractUser(event) 
  const cacheKey = `${id}-event`
  return await get(cacheKey)
  
}

exports.getTimes = async (event, context) => {
  const [id, email] = extractUser(event)
  const { eventId } = event.pathParameters
  return await get(`${id}-time`, eventId)
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
