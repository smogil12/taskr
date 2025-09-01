import { Button } from '@/components/ui/button'
import { APP_NAME, APP_DESCRIPTION } from '@tail-ai/shared'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              {APP_NAME}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {APP_DESCRIPTION}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
