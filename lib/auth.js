import { onAuthUIStateChange } from '@aws-amplify/ui-components'
import { Auth } from 'aws-amplify'
import { useEffect, useState } from 'react'

export function useUser() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    async function checkUser() {
      const _u = await Auth.currentAuthenticatedUser()
      setUser(_u)
    }
    checkUser()
    return onAuthUIStateChange((nextAuthState, authData) => {
      setUser(authData)
    })
  }, [])
  return user
}