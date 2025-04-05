import Header from '@/components/Header'
import Navigation from '@/components/Navigation'

export const metadata = {
  title: 'About - Next.js and Supabase',
  description: 'Learn more about our platform',
}

export default function AboutPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center gap-20">
      <Navigation />

      <div className="flex max-w-4xl flex-1 flex-col gap-20 px-3">
        <Header />
        <main className="flex flex-1 flex-col gap-6">
          <h2 className="mb-4 text-4xl font-bold">About Us</h2>
          <p className="text-lg">
            Welcome to our platform. We&apos;re dedicated to providing the best
            experience for our users through cutting-edge technology and
            exceptional service.
          </p>
        </main>
      </div>
    </div>
  )
}
