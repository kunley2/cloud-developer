
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'
import { authConfig } from '../../config'

const certificate = authConfig.certificate

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken =  verifyToken(event.authorizationToken,certificate);
    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement:[
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*' 
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string, cert: string): JwtToken{
  if(!authHeader) 
    throw new Error('no authentication header present')

  if(!authHeader.toLowerCase().startsWith('bearer'))
    throw new Error("invalid Authentication Header")

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(
    token,
    cert,
    {algorithms: ['RS256']}
    ) as JwtToken
}
