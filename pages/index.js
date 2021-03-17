import Layout from '@/components/layout'
import { useUser } from '@/lib/auth'
import { post } from 'lib/fetch'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [registration, setRegistration] = useState(null)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (
            sub &&
            !(
              sub.expirationTime &&
              Date.now() > sub.expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub)
            setIsSubscribed(true)
          }
        })
        setRegistration(reg)
      })
    }
  }, [])

    const subscribeButtonOnClick = async (event) => {
      event.preventDefault()
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(
          process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
        ),
      })
      // TODO: you should call your API to save subscription data on server in order to send web push notification from server
      setSubscription(sub)
      setIsSubscribed(true)
      console.log('web push subscribed!')
      console.log(sub)
    }

    const unsubscribeButtonOnClick = async (event) => {
      event.preventDefault()
      await subscription.unsubscribe()
      // TODO: you should call your API to delete or invalidate subscription data on server
      setSubscription(null)
      setIsSubscribed(false)
      console.log('web push unsubscribed!')
    }

    const sendNotificationButtonOnClick = async (event) => {
      event.preventDefault()
      if (subscription == null) {
        console.error('web push not subscribed')
        return
      }

      await post('notification', subscription)
    }

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
        <br />
        {process.env.NODE_ENV === 'development' && (
          <>
            <button onClick={subscribeButtonOnClick} disabled={isSubscribed}>
              Subscribe
            </button>
            <br/>
            <button onClick={unsubscribeButtonOnClick} disabled={!isSubscribed}>
              Unsubscribe
            </button>
            <br/>
            <button
              onClick={sendNotificationButtonOnClick}
              disabled={!isSubscribed}
            >
              Send Notification
            </button>
          </>
        )}
      </div>
    </Layout>
  )
}
export default Home