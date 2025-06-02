import { useState } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-surface-200/50 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-soft">
                <ApperIcon name="CheckSquare" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </motion.div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 sm:p-3 rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors"
              >
                <ApperIcon 
                  name={isDarkMode ? "Sun" : "Moon"} 
                  className="w-4 h-4 sm:w-5 sm:h-5 text-surface-600" 
                />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors shadow-soft"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                <span className="font-medium">New Task</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-2">
            Welcome to Your Workspace
          </h2>
          <p className="text-surface-600 dark:text-surface-300 text-base sm:text-lg max-w-2xl">
            Organize your tasks, track progress, and boost productivity with our intuitive task management system.
          </p>
        </motion.div>

        <MainFeature />
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16 sm:mt-20 border-t border-surface-200 bg-surface-50/50 px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-surface-600 text-sm sm:text-base">
            © 2024 TaskFlow. Designed for productivity enthusiasts.
          </p>
        </div>
      </motion.footer>
    </div>
  )
}

export default Home