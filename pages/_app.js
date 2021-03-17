import Amplify from 'aws-amplify'
import 'bootstrap/dist/css/bootstrap.min.css'
import Head from 'next/head'
import awsconfig from '../aws-exports'
import '../styles/globals.css'


const APP_NAME = 'CoachTimer'
const APP_DESCRIPTION = 'CoachTimer.net'

Amplify.configure({
  ...awsconfig,
  Auth: {
    mandatorySignIn: true,
    region: process.env.NEXT_PUBLIC_REGION || 'us-east-1',
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_APP_CLIENT_ID
  }
})

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <meta
          name="description"
          content="A timer for coaches with multiple athletes"
        />
        <meta
          name="keywords"
          content="timer, lap, athletes, special olympics"
        />
        <title>a timer that works</title>

        <link rel="manifest" href="/manifest.json" />

        <meta name="theme-color" content="#90cdf4" />
        <meta name="application-name" content={APP_NAME} />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="apple-mobile-web-app-status-bar" content="#90cdf4" />
        <meta name="format-detection" content="telephone=no" />

        <link rel="apple-touch-icon" href="/icons/logo-96x96.png" />
        <link rel="icon" href="/icons/logo-512x512.png" />
        <link rel="shortcut icon" href="/icons/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  ) 
}

export default MyApp
