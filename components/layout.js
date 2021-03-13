import { onAuthUIStateChange } from '@aws-amplify/ui-components'
import { Auth } from 'aws-amplify'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'


const Layout = ({children}) => {
  const [authState, setAuthState] = useState()
  const [user, setUser] = useState(null)
  useEffect(() => {
    async function checkUser() {
      const _u =await Auth.currentAuthenticatedUser()
      setUser(_u)
    }
    checkUser()
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState)
      setUser(authData)
    })
  }, [])
  
  return (
    <div className="container-fluid">
      <Head>
        <title>timers because no good ones exist</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#90cdf4" />
        <link rel="apple-touch-icon" href="/logo-96x96.png" />
        <meta name="apple-mobile-web-app-status-bar" content="#90cdf4" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
      </Head>
      <nav className="navbar navbar-light bg-light mb-3">
        <div className="container-fluid">
          <Link href="/">
            <a className="navbar-brand small-caps" href="#">
              CoachTimer
            </a>
          </Link>
          {user && <small>{user.attributes.email}</small>}
        </div>
      </nav>
      <div>{children}</div>
      <br />
      <br />
      <footer class="footer fixed-bottom my-auto py-100 bg-light">
        <div class="container">
          <Link href="/events/express">
            <a className="navbar-brand small-caps" href="#">
              <i
                className="bi-alarm"
                style={{ fontSize: '1.2rem', color: 'cornflowerblue' }}
              ></i>
            </a>
          </Link>
          {user ? (
            <Link href="/results/event">
              <a className="navbar-brand" href="#">
                <i
                  className="bi-journal-text"
                  style={{ fontSize: '1.2rem', color: 'green' }}
                ></i>
              </a>
            </Link>
          ) : (
            <Link href="/login">
              <a className="navbar-brand" href="#">
                <i
                  className="bi-person"
                  style={{ fontSize: '1.2rem', color: 'red' }}
                ></i>
              </a>
            </Link>
          )}
        </div>
      </footer>
      {/* <div className="container">
        <nav className="navbar fixed-bottom navbar-light bg-light">
          <div className="container-fluid">
            <Link href="/events/express">
              <a className="navbar-brand small-caps" href="#">
                <i
                  className="bi-alarm"
                  style={{ fontSize: '1.2rem', color: 'cornflowerblue' }}
                ></i>
                <br />
                <small>Timer</small>
              </a>
            </Link>
            {user ? (
              <Link href="/results/event">
                <a className="navbar-brand" href="#">
                  <i
                    className="bi-journal-text"
                    style={{ fontSize: '1.2rem', color: 'cornflowerblue' }}
                  ></i>
                  <br />
                  <small>results</small>
                </a>
              </Link>
            ) : (
              <Link href="/login">
                <a className="navbar-brand" href="#">
                  <i
                    className="bi-person"
                    style={{ fontSize: '1.2rem', color: 'cornflowerblue' }}
                  ></i>
                  <br />
                  <small>Sign In/Up</small>
                </a>
              </Link>
            )}
            <br />
          </div>
        </nav>
      </div> */}
    </div>
  )
}

export default Layout