import Head from 'next/head'
import Link from 'next/link'

const Layout = ({children}) => {
  return (
    <div className="container">
      <Head>
        <title>timers because no good ones exist</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="navbar navbar-light bg-light mb-3">
        <div className="container-fluid">
          <Link href="/">
            <a class="navbar-brand" href="#">
              Home
            </a>
          </Link>
        </div>
      </nav>

      {children}
    </div>
  )
}

export default Layout