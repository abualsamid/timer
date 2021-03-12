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
    <Layout>
      <div className="m-2 p-2">
        <Link href="/events/express">
          <a href="" className="d-block btn btn-lg btn-primary">
            Timer
          </a>
        </Link>
        <br />
        {user && (
          <Link href="/events">
            <a className="d-block btn btn-lg btn-primary">
              Past Results
              <br />
            </a>
          </Link>
        )}
      </div>
      {!user && (
        <div className="card m-2 p-2">
          <div className="card-body">
            <>
              <h5 className="card-title">
                advanced features (require free account)
              </h5>
              <br />
              <div className="card-text d-grid gap-3 col-6 mx-auto">
                <Link href="/login">
                  <a className="btn btn-lg btn-primary">Past Results</a>
                </Link>
              </div>
            </>
          </div>
        </div>
      )}
      <div className="m-2 p-2">
        <footer>{user && <AmplifySignOut />}</footer>
      </div>
    </Layout>
  )
}
export default Home