import { EyePopProvider } from './hooks/EyePopContext'
import Index from './components/Index'
import './style/App.css'

function App()
{
  const config = {
    'secretKey': 'AAF8CqARHHgQBcLhHqLPUjJxZ0FBQUFBQmw0QXNqX2pqMzlaZ292b05LdHhrRmowUGlrNUREUDVYQTE2TW1zQWYyU2U0eVRmQS0xSVdnWkZvRldQOGd2Y2hKWG9kYnI0MzJnRGwyWGJoTExYNkVwQzVLdHZvRzBIMTlLdTFaZ2JEWFJPTERzbTQ9',
    'popId': 'ab3cb23c05c045a29ee6ea00c765f167'
  }

  return (
    <EyePopProvider config={config} >

      <Index />

    </EyePopProvider >
  )
}

export default App
