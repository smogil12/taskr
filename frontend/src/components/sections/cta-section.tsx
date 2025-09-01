import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-24 bg-blue-600 dark:bg-blue-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to transform your time management?
        </h2>
        <p className="mt-4 text-lg text-blue-100">
          Join thousands of teams already using Tail.AI to work smarter
        </p>
        <div className="mt-8 flex items-center justify-center gap-x-6">
          <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  )
}
