import Layout from '@/components/layout'
import { useUser } from '@/lib/auth'
import Link from 'next/link'
import {useEffect} from 'react'

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
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox
      // add event listeners to handle any of PWA lifecycle event
      // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-window.Workbox#events
      wb.addEventListener('installed', (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener('controlling', (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener('activated', (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      // NOTE: MUST set skipWaiting to false in next.config.js pwa object
      // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
      const promptNewVersionAvailable = (event) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.
        if (
          confirm(
            'A newer version of CoachTimer is available, reload to update?'
          )
        ) {
          wb.addEventListener('controlling', (event) => {
            window.location.reload()
          })

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting()
        } else {
          console.log(
            'User rejected to reload the web app, keep using old version. New version will be automatically load when user open the app next time.'
          )
        }
      }

      wb.addEventListener('waiting', promptNewVersionAvailable)

      // ISSUE - this is not working as expected, why?
      // I could only make message event listenser work when I manually add this listenser into sw.js file
      wb.addEventListener('message', (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      /*
      wb.addEventListener('redundant', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })
      wb.addEventListener('externalinstalled', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })
      wb.addEventListener('externalactivated', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })
      */

      // never forget to call register as auto register is turned off in next.config.js
      wb.register()
    }
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