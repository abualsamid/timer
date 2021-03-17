import { Auth } from 'aws-amplify'
import useSWR from 'swr'

const URI = process.env.NEXT_PUBLIC_API
export async function fetcher(path) {
  const session = await Auth.currentSession()
  const token = session.getIdToken().getJwtToken()
  const url = URI + path

  return fetch(url, {
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    },
  }).then((res) => res.json())
}

export function useGet(path) {
  const { data, error, mutate } = useSWR(path, fetcher)
  
  return {
    data,
    loading: !error && !data,
    error,
    mutate 
  }
}

export async function usePost(path, data) {
  const session = await Auth.currentSession()
  const token = session.getIdToken().getJwtToken()
  const url = URI + path
  try {
    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(data),
    }).then((res) => res.json())
  } catch (error) {
    console.log('usePost Error ', error)
    return null 
  }
  
}

export async function post(path, data) {
  const session = await Auth.currentSession()
  const token = session.getIdToken().getJwtToken()
  const url = URI + path
  try {
    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(data),
    }).then((res) => res.json())
  } catch (error) {
    console.log('usePost Error ', error)
    return null
  }
}
