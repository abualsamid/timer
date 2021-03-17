import Head from 'next/head'
import Link from 'next/link'


const Layout = ({children, user}) => {
  
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
          {user && <small>{user?.attributes?.email}</small>}
        </div>
      </nav>
      <div className="container-fluid m-auto">{children}</div>
      <br />
      <br />
      <br />
      <nav className="navbar fixed-bottom navbar-light bg-light">
        <div className="mx-auto">
          <ul className="navbar-nav list-group list-group-horizontal">
            <li className="nav-item mx-4">
              <Link href="/events/express">
                <a className="nav-link">
                  <i
                    className="bi-alarm"
                    style={{ fontSize: '1.5rem', color: 'cornflowerblue' }}
                  ></i>
                </a>
              </Link>
            </li>
            {
              user ? (
                <>
                  <li className="nav-item mx-4">
                    <Link href="/results/event">
                        <a className="nav-link">
                          <i
                            className="bi-journal-text"
                            style={{ fontSize: '1.5rem', color: 'green' }}
                          ></i>
                        </a>
                    </Link>
                  </li>
                  <li className="nav-item mx-4">
                    <Link href="/track">
                        <a className="nav-link">
                          <i
                            className="bi-clipboard"
                            style={{ fontSize: '1.5rem', color: 'green' }}
                          ></i>
                        </a>
                    </Link>
                  </li>
                </>
              )
              :
              <li className="nav-item mx-4">
                <Link href="/login">
                  <a className="nav-link">
                    <i
                      className="bi-person"
                      style={{ fontSize: '1.5rem', color: 'red' }}
                    ></i>
                  </a>
                </Link>
              </li>
            }
            
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default Layout