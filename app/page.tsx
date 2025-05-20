import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="DeepLove Logo" width={32} height={32} />
          <span className="font-bold text-xl">DeepLove AI</span>
        </div>
        <Button variant="default" className="bg-black text-white rounded-full text-sm px-4">
          Download App
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center relative">
        <p className="text-gray-600 mb-2">Make Your Dreams Come True</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-2xl mx-auto">
          Chat with Your Favorite Character Every Day!
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          Create your own exclusive character and experience the magic of AI-powered conversations. Let your imagination run wild with DeepLove!
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <Link
            href="https://apps.apple.com/us/app/deeplove-ai-ai-love-chat/id6741785278"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-2 rounded-full bg-black hover:bg-gray-900 transition text-white shadow-lg"
            aria-label="Download on the App Store"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="mr-2">
              <path d="M19.665 13.574c-.02-2.043 1.668-3.018 1.744-3.066-0.951-1.389-2.426-1.579-2.946-1.597-1.252-.127-2.444.735-3.08.735-.635 0-1.613-.717-2.654-.697-1.364.02-2.627.793-3.33 2.018-1.423 2.465-.363 6.104 1.022 8.104.677.98 1.482 2.08 2.54 2.04 1.025-.04 1.41-.66 2.646-.66 1.236 0 1.574.66 2.655.64 1.099-.02 1.789-.997 2.462-1.98.78-1.14 1.104-2.25 1.122-2.307-.025-.012-2.153-.826-2.174-3.28zm-2.56-6.02c.56-.68.94-1.62.84-2.554-.81.032-1.78.54-2.36 1.22-.52.6-.98 1.56-.81 2.48.96.075 1.77-.49 2.33-1.146z" />
            </svg>
            <div className="text-left">
              <div className="text-xs">Download on the</div>
              <div className="font-semibold text-base leading-tight">App Store</div>
            </div>
          </Link>
          <Link
            href="https://play.google.com/store/apps/details?id=xxxxxxxx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-2 rounded-full bg-black hover:bg-gray-900 transition text-white shadow-lg"
            aria-label="Get it on Google Play"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" className="mr-2">
              <g>
                <polygon fill="#FFD400" points="3.89,1.44 14.53,12.08 3.89,22.72" />
                <polygon fill="#FF3333" points="3.89,1.44 20.11,12.08 14.53,12.08" />
                <polygon fill="#48FF48" points="3.89,22.72 20.11,12.08 14.53,12.08" />
                <polygon fill="#3BCCFF" points="20.11,12.08 21.5,12.91 14.53,17.09" />
              </g>
            </svg>
            <div className="text-left">
              <div className="text-xs">Get it on</div>
              <div className="font-semibold text-base leading-tight">Google Play</div>
            </div>
          </Link>
        </div>


        {/* Phone Mockup */}
        <div className="relative max-w-xs mx-auto mb-12">
          <Image src="/characters.png" alt="LuxiQue App" width={300} height={600} className="mx-auto" />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-purple-100 rounded-3xl p-6 relative overflow-hidden">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm mb-4">
              1
            </div>
            <h3 className="text-xl font-bold mb-4">Chat with AI Character</h3>
            <Image
              src="/chat.png"
              alt="Chat with AI Character"
              width={200}
              height={300}
              className="mx-auto mt-4"
            />
          </div>
          <div className="bg-purple-100 rounded-3xl p-6 relative overflow-hidden">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm mb-4">
              2
            </div>
            <h3 className="text-xl font-bold mb-4">Gradual increase in affection</h3>
            <Image
              src="/affection.png"
              alt="Gradual increase in affection"
              width={200}
              height={300}
              className="mx-auto mt-4"
            />
          </div>
          <div className="bg-gray-200 rounded-3xl p-6 relative overflow-hidden">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm mb-4">
              3
            </div>
            <h3 className="text-xl font-bold mb-4">Record your memories</h3>
            <Image
              src="/memory.png"
              alt="Record your memories"
              width={200}
              height={300}
              className="mx-auto mt-4"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="container mx-auto px-4 py-12 bg-white rounded-3xl my-8">
        <h2 className="text-3xl font-bold mb-8">
          Customer reviews <br />
          and feedback from <br />
          real users.
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Robert Mason"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">Robert Mason</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="gold"
                      stroke="gold"
                      strokeWidth="2"
                      className="icon icon-star"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700">
              Amazing experience! Smooth ordering process. Fast shipping, and the quality of the items is outstanding!
              I'll be returning for more purchases.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="William Blake"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">William Blake</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="gold"
                      stroke="gold"
                      strokeWidth="2"
                      className="icon icon-star"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700">
              Highly impressed! The product arrived on time. Excellent interface, intuitive navigation, and the customer
              support made the process even better. Five stars!
            </p>
          </div>
        </div>
      </section> */}

      {/* Download Section */}
      {/* <section className="container mx-auto px-4 py-12 bg-gray-100 rounded-3xl my-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              Download
              <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs mx-2">
                &darr;
              </span>
              Mobile App
            </h2>
            <div className="flex gap-4">
              <Link
                href="https://apps.apple.com/app/idxxxxxxxx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-2 rounded-full bg-black hover:bg-gray-900 transition text-white shadow-lg"
                aria-label="Download on the App Store"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="mr-2">
                  <path d="M19.665 13.574c-.02-2.043 1.668-3.018 1.744-3.066-0.951-1.389-2.426-1.579-2.946-1.597-1.252-.127-2.444.735-3.08.735-.635 0-1.613-.717-2.654-.697-1.364.02-2.627.793-3.33 2.018-1.423 2.465-.363 6.104 1.022 8.104.677.98 1.482 2.08 2.54 2.04 1.025-.04 1.41-.66 2.646-.66 1.236 0 1.574.66 2.655.64 1.099-.02 1.789-.997 2.462-1.98.78-1.14 1.104-2.25 1.122-2.307-.025-.012-2.153-.826-2.174-3.28zm-2.56-6.02c.56-.68.94-1.62.84-2.554-.81.032-1.78.54-2.36 1.22-.52.6-.98 1.56-.81 2.48.96.075 1.77-.49 2.33-1.146z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="font-semibold text-base leading-tight">App Store</div>
                </div>
              </Link>
              <Link
                href="https://play.google.com/store/apps/details?id=xxxxxxxx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-2 rounded-full bg-black hover:bg-gray-900 transition text-white shadow-lg"
                aria-label="Get it on Google Play"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" className="mr-2">
                  <g>
                    <polygon fill="#FFD400" points="3.89,1.44 14.53,12.08 3.89,22.72" />
                    <polygon fill="#FF3333" points="3.89,1.44 20.11,12.08 14.53,12.08" />
                    <polygon fill="#48FF48" points="3.89,22.72 20.11,12.08 14.53,12.08" />
                    <polygon fill="#3BCCFF" points="20.11,12.08 21.5,12.91 14.53,17.09" />
                  </g>
                </svg>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="font-semibold text-base leading-tight">Google Play</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="DeepLove Logo" width={32} height={32} />
                <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  DeepLove AI
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                Create your own exclusive character and experience the magic of AI-powered conversations.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-500 hover:text-purple-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-500 hover:text-purple-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>Onesoft Technology Limited</li>
                <li>RM DO7,8/F KAI TAK FTY BLDG</li>
                <li>NO 99 KING FUK ST</li>
                <li>SAN PO KONG, HONG KONG</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>
                  <a href="mailto:dxhong1230@gmail.com" className="hover:text-purple-600 transition-colors">
                    dxhong1230@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                ©2025 DeepLove AI. All Rights Reserved
              </p>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-gray-500 hover:text-purple-600 transition-colors text-sm">
                  Privacy
                </Link>
                <Link href="/terms" className="text-gray-500 hover:text-purple-600 transition-colors text-sm">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
