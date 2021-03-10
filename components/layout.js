import { AmplifySignOut } from '@aws-amplify/ui-react'
import { Auth } from 'aws-amplify'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const Layout = ({children}) => {
  const [user, setUser]  = useState(null)
  useEffect(
    async function checkUser() {
      const u = await Auth.currentAuthenticatedUser()
      setUser(u)
    }
  ,[])  
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
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <nav className="navbar navbar-light bg-light mb-3">
        <div className="container-fluid">
          <Link href="/">
            <a className="navbar-brand small-caps" href="#">
              CoachTimer
            </a>
          </Link>
          {
            user ? <AmplifySignOut /> : <Link href='/login'><a>Sign Up/In</a></Link>
          }
          
        </div>
      </nav>
      <div className="my-3">
        {children}
      </div>
    </div>
  )
}

export default Layout