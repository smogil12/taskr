import { APP_FEATURES } from '@tail-ai/shared'

const featureList = [
  {
    name: 'Smart Time Tracking',
    description: 'AI-powered time estimation and automatic tracking',
    icon: '⏱️',
  },
  {
    name: 'Project Management',
    description: 'Comprehensive project and task management',
    icon: '📊',
  },
  {
    name: 'Team Collaboration',
    description: 'Multi-user teams with role-based access',
    icon: '👥',
  },
  {
    name: 'AI Insights',
    description: 'Productivity analytics and smart suggestions',
    icon: '🤖',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need for modern time management
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Built for teams that want to work smarter, not harder
          </p>
        </div>
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featureList.map((feature) => (
            <div key={feature.name} className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.name}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
