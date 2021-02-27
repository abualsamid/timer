import Amplify from 'aws-amplify'
import 'bootstrap/dist/css/bootstrap.min.css'
import awsconfig from '../aws-exports'
import '../styles/globals.css'


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
  return <Component {...pageProps} />
}

export default MyApp
