import { useState } from 'react'
import MainForm from './MainForm.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MainForm/>
    </>
  )
}

export default App
