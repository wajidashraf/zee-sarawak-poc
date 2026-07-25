import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { AuthLoadingScreen } from './components/auth/AuthLoadingScreen'
import { RequireAuth } from './components/auth/RequireAuth'
import { SignInModal } from './components/auth/SignInModal'
import { AppLayout } from './components/layout/AppLayout'
import { useAuth } from './hooks/useAuth'
import { HomePage } from './pages/HomePage'
import { CreateProjectPage } from './pages/CreateProjectPage'
import { ExternalLoginConfirmationPage } from './pages/ExternalLoginConfirmationPage'
import { ProjectDetailsPage } from './pages/ProjectDetailsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { sanitizeReturnUrl } from './services/authService'

function LoginRoute() {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()
  const requestedReturnUrl = new URLSearchParams(location.search).get('returnUrl')
  const returnUrl = sanitizeReturnUrl(requestedReturnUrl || '/')

  if (isLoading) return <AuthLoadingScreen />
  if (isAuthenticated) return <Navigate replace to={returnUrl} />
  return <SignInModal returnUrl={returnUrl} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginRoute />} path="login" />
        <Route
          element={<ExternalLoginConfirmationPage />}
          path="external-login-confirmation"
        />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<CreateProjectPage />} />
            <Route
              path="projects/:projectId"
              element={<ProjectDetailsPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
