import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft"
        >
          <ApperIcon name="AlertTriangle" className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-6xl sm:text-8xl font-bold text-primary mb-4"
        >
          404
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl sm:text-2xl font-semibold text-surface-900 dark:text-white mb-2"
        >
          Page Not Found
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-surface-600 dark:text-surface-300 mb-8 text-sm sm:text-base"
        >
          The task you're looking for seems to have wandered off. Let's get you back on track.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft"
          >
            <ApperIcon name="Home" className="w-4 h-4" />
            <span>Back to Tasks</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound