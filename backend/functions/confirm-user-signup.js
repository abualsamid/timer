const DynamoDB = require('aws-sdk/clients/dynamodb')
const DocumentClient = new DynamoDB.DocumentClient()
const {TableName} = process.env
module.exports.handler = async event => {
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    const now = new Date().toJSON()
    const {name, email} = event.request.userAttributes
    // console.log(JSON.stringify(event))
    const Item = {
      id: event.userName,
      key: email, 
      name: name || event.userName, 
      email, 
      createdAt: now,
      updatedAt: now
    }
    await DocumentClient.put({
      TableName,
      Item,
      ConditionExpression: 'attribute_not_exists(id)'
    }).promise()

    await DocumentClient.put({
      TableName,
      Item: {
        id: email, 
        key: event.userName, 
        name: name || event.userName,
        email,
        createdAt: now,
        updatedAt: now,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    }).promise()

    return event 
  }
  return event 
}
