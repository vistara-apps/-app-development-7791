import React from 'react'
import { 
  Camera, 
  FileImage, 
  BarChart3, 
  Settings, 
  User, 
  CreditCard,
  Search,
  Bell,
  Menu
} from 'lucide-react'

const AppShell = ({ children, user }) => {
  const navItems = [
    { icon: Camera, label: 'Claims', active: true },
    { icon: FileImage, label: 'Photo Library' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: CreditCard, label: 'Billing' },
    { icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 glass-effect border-r border-white/20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">ClaimSnap AI</h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-gray-400">{user.subscriptionTier} Plan</p>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {user.photosThisMonth}/{user.photoLimit} photos this month
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(user.photosThisMonth / user.photoLimit) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass-effect border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden">
                <Menu className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-xl font-semibold text-white">Claims Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search claims..."
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="relative">
                <Bell className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell