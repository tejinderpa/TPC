import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Component } from 'react'

class RuntimeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // you could log to an external service here
    // console.error(error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold text-red-600">Runtime error while rendering app</h2>
            <pre className="mt-4 text-sm text-gray-700">{String(this.state.error)}</pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  return (
    <RuntimeErrorBoundary>
      <RouterProvider router={router} />
    </RuntimeErrorBoundary>
  )
}

export default App;