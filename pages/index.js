import Layout from '@/components/layout'
import { onAuthUIStateChange } from '@aws-amplify/ui-components'
import { Auth } from 'aws-amplify'
import Link from 'next/link'
import { useEffect, useState } from 'react'



const Home = () => {
    const [authState, setAuthState] = useState()
    const [user, setUser] = useState(null)
    useEffect(() => {
      async function checkUser() {
        const _u = await Auth.currentAuthenticatedUser()
        setUser(_u)
      }
      checkUser()
      return onAuthUIStateChange((nextAuthState, authData) => {
        setAuthState(nextAuthState)
        setUser(authData)
      })
    }, [])

  return (
    <Layout user={user}>
      <div className="container-fluid text-center m-2 p-2">
        <Link href="/events/express">
          <a>
            <i
              className="bi-alarm"
              style={{ fontSize: '3em', color: 'cornflowerblue' }}
            ></i>
          </a>
        </Link>
        <br />
        {user ? (
          <>
            <Link href="/results/event">
              <a>
                <i
                  className="bi-journal-text"
                  style={{ fontSize: '3em', color: 'green' }}
                ></i>
              </a>
            </Link>
            <br/>
            <Link href="/track">
              <a href="">
                <i
                  className="bi-clipboard"
                  style={{ fontSize: '3em', color: 'green' }}
                ></i>
              </a>
            </Link>
          </>
        ) : (
          <Link href="/login">
            <a className="navbar-brand">
              <i className="bi-person" style={{ color: 'red' }}></i>
            </a>
          </Link>
        )}
      </div>
    </Layout>
  )
}
export default Home