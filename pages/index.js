import Layout from '@/components/layout'
import { onAuthUIStateChange } from '@aws-amplify/ui-components'
import { AmplifySignOut } from '@aws-amplify/ui-react'
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
    <>
      <Layout>
        <div className="m-2 p-2" style={{ border: '1px' }}>
          <span>
            Time athletes without any setup - results are not saved in database
          </span>
          <Link href="/events/express">
            <a href="" className="d-block btn btn-lg btn-primary p-2 m-2">
              Timer
            </a>
          </Link>
          <br />
        </div>

        <div className="card m-2 p-2">
          <div className="card-body">
            <h5 className="card-title">
              Advanced Features (require free account)
            </h5>
            <br />
            <div className="card-text d-grid gap-3 col-6 mx-auto">
              <Link href="/events">
                <a className="btn btn-lg btn-primary">
                  Results
                  <br />
                </a>
              </Link>
              <Link href="/results/event">
                <a className="btn btn-lg btn-primary">
                  Historical Results By Event
                </a>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
      <footer>
        {user && (
          <AmplifySignOut username={user.attributes.email}></AmplifySignOut>
        )}
      </footer>
    </>
  )
}
export default Home