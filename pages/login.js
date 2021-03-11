import { onAuthUIStateChange } from '@aws-amplify/ui-components'
import {
  AmplifyAuthenticator,

  AmplifySignIn, AmplifySignUp
} from '@aws-amplify/ui-react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default () => {
  const [authState, setAuthState] = useState()
  const [user, setUser] = useState()
  const router = useRouter()
  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState)
      setUser(authData)
    })
  }, [])

  if(user) {
    router.push('/')
  }

  return (
    <AmplifyAuthenticator usernameAlias="email">
      <AmplifySignUp
        slot="sign-up"
        usernameAlias="email"
        formFields={[
          {
            type: 'email',
            label: 'email',
            placeholder: 'email',
            required: true,
          },
          {
            type: 'password',
            label: 'Password',
            placeholder: 'password',
            required: true,
          }
        ]}
      />
      <AmplifySignIn slot="sign-in" usernameAlias="email" />
    </AmplifyAuthenticator>
  )
}