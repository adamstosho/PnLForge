import Link from 'next/link'
import { LogoAnimated } from '@/components/logo-animated'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-8">
          <LogoAnimated size={64} />
        </div>

        <h1 className="text-5xl font-bold text-muted-900 mb-2">404</h1>
        <p className="text-xl text-muted-600 mb-8">Page not found</p>

        <p className="text-muted-600 mb-8">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
