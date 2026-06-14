export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety information</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cancellation options</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our COVID-19 Response</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Supporting people with disabilities</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">DarkBnb.org: disaster relief housing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support Afghan refugees</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Combating discrimination</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Hosting</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Try hosting</a></li>
              <li><a href="#" className="hover:text-white transition-colors">DarkBnb-friendly apartments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Host an Online Experience</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Responsible hosting</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">About</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Learn about new features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Letter from our founders</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Investors</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© 2024 DarkBnb, Inc. · Privacy · Terms · Sitemap · Company details</p>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15v-4H9l3-6 3 6h-2v4h-2z"/></svg>
              English (US)
            </button>
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              $ USD
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
