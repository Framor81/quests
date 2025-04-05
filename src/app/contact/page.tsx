import Header from '@/components/Header'
import Navigation from '@/components/Navigation'

export const metadata = {
  title: 'Contact - Next.js and Supabase',
  description: 'Get in touch with us',
}

export default function ContactPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center gap-20">
      <Navigation />

      <div className="flex max-w-4xl flex-1 flex-col gap-20 px-3">
        <Header />
        <main className="flex flex-1 flex-col gap-6">
          <h2 className="mb-4 text-4xl font-bold">Contact Us</h2>
          <p className="mb-8 text-lg">
            Have questions? We&apos;d love to hear from you. Send us a message
            and we&apos;ll respond as soon as possible.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Email</h3>
              <p>contact@example.com</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Location</h3>
              <p>San Francisco, CA</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
