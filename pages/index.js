import Layout from '@/components/layout'
import { useUser } from '@/lib/auth'
import Link from 'next/link'

const base64ToUint8Array = (base64) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(b64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const Home = () => {
  const user = useUser()
  
  
  
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
            <br />
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
              <i
                className="bi-person"
                style={{ fontSize: '3em', color: 'red' }}
              ></i>
            </a>
          </Link>
        )}
        
      </div>
    </Layout>
  )
}
export default Home