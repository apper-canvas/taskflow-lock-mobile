import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-blue-500', textColor: 'text-blue-600' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'bg-orange-500', textColor: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500', textColor: 'text-red-600' }
]

const statuses = [
  { value: 'todo', label: 'To Do', icon: 'Circle', color: 'text-surface-500' },
  { value: 'in-progress', label: 'In Progress', icon: 'Clock', color: 'text-yellow-600' },
  { value: 'completed', label: 'Completed', icon: 'CheckCircle2', color: 'text-green-600' }
]

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [editingProject, setEditingProject] = useState(null)
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  })
const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    subtasks: []
  })

// Load tasks and projects from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
    
    const savedProjects = localStorage.getItem('taskflow-projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    } else {
      // Initialize with default project
      const defaultProject = {
        id: 'default',
        name: 'Personal',
        description: 'Personal tasks and projects',
        color: '#6366f1',
        createdAt: new Date().toISOString()
      }
      setProjects([defaultProject])
    }
  }, [])

// Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('taskflow-projects', JSON.stringify(projects))
  }, [projects])

const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      subtasks: []
    })
  }

  const resetProjectForm = () => {
    setProjectFormData({
      name: '',
      description: '',
      color: '#6366f1'
    })
  }

  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const newTask = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setTasks(prev => [newTask, ...prev])
    setIsCreateModalOpen(false)
    resetForm()
    toast.success('Task created successfully!')
  }

  const handleUpdateTask = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...formData, updatedAt: new Date().toISOString() }
        : task
    ))
    setEditingTask(null)
    resetForm()
    toast.success('Task updated successfully!')
  }

const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    toast.success('Task deleted successfully!')
  }

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ))
    
    if (newStatus === 'completed') {
      toast.success('Task completed! 🎉')
    }
  }

  // Subtask management functions
  const handleAddSubtask = (taskId, subtaskTitle) => {
    if (!subtaskTitle.trim()) {
      toast.error('Subtask title is required')
      return
    }

    const newSubtask = {
      id: Date.now().toString(),
      title: subtaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }

    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: [...(task.subtasks || []), newSubtask],
            updatedAt: new Date().toISOString()
          }
        : task
    ))
    
    toast.success('Subtask added successfully!')
  }

  const handleDeleteSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: (task.subtasks || []).filter(subtask => subtask.id !== subtaskId),
            updatedAt: new Date().toISOString()
          }
        : task
    ))
    
    toast.success('Subtask deleted successfully!')
  }

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: (task.subtasks || []).map(subtask =>
              subtask.id === subtaskId 
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            ),
            updatedAt: new Date().toISOString()
          }
        : task
    ))
  }

  const getSubtaskProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0
    const completed = subtasks.filter(subtask => subtask.completed).length
    return Math.round((completed / subtasks.length) * 100)
  }

  const addSubtaskToForm = (title) => {
    if (!title.trim()) return
    
    const newSubtask = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setFormData(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), newSubtask]
    }))
  }

  const removeSubtaskFromForm = (subtaskId) => {
    setFormData(prev => ({
      ...prev,
      subtasks: (prev.subtasks || []).filter(subtask => subtask.id !== subtaskId)
    }))
  }
const openEditModal = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      subtasks: task.subtasks || []
    })
  }

  const openProjectEditModal = (project) => {
    setEditingProject(project)
    setProjectFormData({
      name: project.name,
      description: project.description,
      color: project.color
    })
  }

  const handleCreateProject = (e) => {
    e.preventDefault()
    if (!projectFormData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    const newProject = {
      id: Date.now().toString(),
      ...projectFormData,
      createdAt: new Date().toISOString()
    }

    setProjects(prev => [newProject, ...prev])
    resetProjectForm()
    toast.success('Project created successfully!')
  }

  const handleUpdateProject = (e) => {
    e.preventDefault()
    if (!projectFormData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setProjects(prev => prev.map(project => 
      project.id === editingProject.id 
        ? { ...project, ...projectFormData }
        : project
    ))
    setEditingProject(null)
    resetProjectForm()
    toast.success('Project updated successfully!')
  }

  const handleDeleteProject = (projectId) => {
    if (projectId === 'default') {
      toast.error('Cannot delete the default project')
      return
    }
    
    setProjects(prev => prev.filter(project => project.id !== projectId))
    // Move tasks from deleted project to default project
    setTasks(prev => prev.map(task => 
      task.projectId === projectId 
        ? { ...task, projectId: 'default' }
        : task
    ))
    toast.success('Project deleted successfully!')
  }

  const getProjectTaskCount = (projectId) => {
    return tasks.filter(task => task.projectId === projectId).length
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    if (filter !== 'all') {
      filtered = filtered.filter(task => task.status === filter)
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return 0
      }
    })

    return filtered
  }

  const getDateLabel = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isPast(date)) return 'Overdue'
    return format(date, 'MMM d')
  }

  const getPriorityConfig = (priority) => {
    return priorities.find(p => p.value === priority)
  }

  const getStatusConfig = (status) => {
    return statuses.find(s => s.value === status)
  }

  const filteredTasks = getFilteredTasks()
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'completed').length
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {[
          { label: 'Total Tasks', value: taskStats.total, icon: 'FileText', color: 'primary' },
          { label: 'Completed', value: taskStats.completed, icon: 'CheckCircle', color: 'secondary' },
          { label: 'In Progress', value: taskStats.inProgress, icon: 'Clock', color: 'accent' },
          { label: 'Overdue', value: taskStats.overdue, icon: 'AlertTriangle', color: 'red-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-soft border border-surface-200 hover:shadow-card transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-600 font-medium">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-surface-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                <ApperIcon name={stat.icon} className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-soft border border-surface-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <ApperIcon name="Filter" className="w-4 h-4 text-surface-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-surface-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="all">All Tasks</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <ApperIcon name="ArrowUpDown" className="w-4 h-4 text-surface-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-surface-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="created">Created Date</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center space-x-2 justify-center sm:justify-start"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            <span>Create Task</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Task List */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-3 sm:space-y-4"
      >
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-soft border border-surface-200"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="CheckSquare" className="w-8 h-8 sm:w-10 sm:h-10 text-surface-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-surface-900 mb-2">No tasks found</h3>
              <p className="text-surface-600 mb-6">
                {filter === 'all' ? 'Create your first task to get started!' : `No ${filter.replace('-', ' ')} tasks yet.`}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                Create Your First Task
              </button>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => {
              const priorityConfig = getPriorityConfig(task.priority)
              const statusConfig = getStatusConfig(task.status)
              const dateLabel = getDateLabel(task.dueDate)
              const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="task-card group"
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    {/* Status Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        const nextStatus = task.status === 'todo' ? 'in-progress' : 
                                         task.status === 'in-progress' ? 'completed' : 'todo'
                        handleStatusChange(task.id, nextStatus)
                      }}
                      className="flex-shrink-0 mt-1"
                    >
                      <ApperIcon 
                        name={statusConfig.icon} 
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${statusConfig.color} hover:scale-110 transition-transform`} 
                      />
                    </motion.button>

{/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-surface-900 ${task.status === 'completed' ? 'line-through opacity-75' : ''} text-sm sm:text-base`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-surface-600 text-sm mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          {/* Subtasks Progress */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-2 mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-surface-600">
                                  Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                                </span>
                                <span className="text-xs text-surface-600">
                                  {getSubtaskProgress(task.subtasks)}%
                                </span>
                              </div>
                              <div className="w-full bg-surface-200 rounded-full h-2">
                                <div 
                                  className="bg-primary rounded-full h-2 transition-all duration-300"
                                  style={{ width: `${getSubtaskProgress(task.subtasks)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Subtasks List */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {task.subtasks.slice(0, 3).map((subtask) => (
                                <div key={subtask.id} className="flex items-center space-x-2 text-xs">
                                  <button
                                    onClick={() => handleToggleSubtask(task.id, subtask.id)}
                                    className="flex-shrink-0"
                                  >
                                    <ApperIcon 
                                      name={subtask.completed ? "CheckCircle2" : "Circle"} 
                                      className={`w-3 h-3 ${subtask.completed ? 'text-green-600' : 'text-surface-400'}`} 
                                    />
                                  </button>
                                  <span className={`flex-1 ${subtask.completed ? 'line-through text-surface-400' : 'text-surface-600'}`}>
                                    {subtask.title}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteSubtask(task.id, subtask.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ApperIcon name="X" className="w-3 h-3 text-surface-400 hover:text-red-500" />
                                  </button>
                                </div>
                              ))}
                              {task.subtasks.length > 3 && (
                                <div className="text-xs text-surface-500 pl-5">
                                  +{task.subtasks.length - 3} more subtasks
                                </div>
                              )}
                            </div>
                          )}

                          {/* Add Subtask Input */}
                          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Add subtask..."
                                className="flex-1 text-xs border border-surface-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddSubtask(task.id, e.target.value)
                                    e.target.value = ''
                                  }
                                }}
/>
                              <button
                                onClick={(e) => {
                                  const input = e.target.parentElement.querySelector('input')
                                  if (input && input.value) {
                                    handleAddSubtask(task.id, input.value)
                                    input.value = ''
                                  }
                                }}
                                className="p-1 rounded-md hover:bg-surface-100 transition-colors"
                              >
                                <ApperIcon name="Plus" className="w-3 h-3 text-surface-500" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {/* Priority */}
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${priorityConfig.textColor} bg-${priorityConfig.value === 'low' ? 'blue' : priorityConfig.value === 'medium' ? 'yellow' : priorityConfig.value === 'high' ? 'orange' : 'red'}-100`}>
                              <div className={`w-2 h-2 rounded-full ${priorityConfig.color}`}></div>
                              <span>{priorityConfig.label}</span>
                            </span>

                            {/* Due Date */}
                            {dateLabel && (
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
                                isOverdue ? 'text-red-600 bg-red-100' : 
                                dateLabel === 'Today' ? 'text-orange-600 bg-orange-100' :
                                'text-surface-600 bg-surface-100'
                              }`}>
                                <ApperIcon name="Calendar" className="w-3 h-3" />
                                <span>{dateLabel}</span>
                              </span>
                            )}

                            {/* Status */}
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${statusConfig.color} bg-surface-100`}>
                              <span>{statusConfig.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(task)}
                            className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4 text-surface-500" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || editingTask) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsCreateModalOpen(false)
                setEditingTask(null)
                resetForm()
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-surface-900">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setEditingTask(null)
                    resetForm()
                  }}
                  className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    rows="3"
                    placeholder="Enter task description..."
                  />
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
</div>

                {/* Subtasks Section */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Subtasks
                  </label>
                  <div className="space-y-2 mb-3">
                    {(formData.subtasks || []).map((subtask) => (
                      <div key={subtask.id} className="flex items-center space-x-2 p-2 bg-surface-50 rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              subtasks: prev.subtasks.map(s => 
                                s.id === subtask.id ? { ...s, completed: !s.completed } : s
                              )
                            }))
                          }}
                          className="flex-shrink-0"
                        >
                          <ApperIcon 
                            name={subtask.completed ? "CheckCircle2" : "Circle"} 
                            className={`w-4 h-4 ${subtask.completed ? 'text-green-600' : 'text-surface-400'}`} 
                          />
                        </button>
                        <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-surface-400' : 'text-surface-700'}`}>
                          {subtask.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSubtaskFromForm(subtask.id)}
                          className="flex-shrink-0 p-1 rounded hover:bg-surface-200 transition-colors"
                        >
                          <ApperIcon name="X" className="w-3 h-3 text-surface-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a subtask..."
                      className="flex-1 border border-surface-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSubtaskToForm(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
<button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.parentElement.querySelector('input')
                        if (input && input.value) {
                          addSubtaskToForm(input.value)
                          input.value = ''
                        }
                      }}
                      className="px-3 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Plus" className="w-4 h-4 text-surface-600" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false)
                      setEditingTask(null)
                      resetForm()
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
)}
      </AnimatePresence>

      {/* Project Management Modal */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsProjectModalOpen(false)
                setEditingProject(null)
                resetProjectForm()
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-surface-900">
                  Project Management
                </h2>
                <button
                  onClick={() => {
                    setIsProjectModalOpen(false)
                    setEditingProject(null)
                    resetProjectForm()
                  }}
                  className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              {/* Create/Edit Project Form */}
              <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={projectFormData.name}
                      onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                      className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Enter project name..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={projectFormData.color}
                        onChange={(e) => setProjectFormData({ ...projectFormData, color: e.target.value })}
                        className="w-12 h-10 border border-surface-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={projectFormData.color}
                        onChange={(e) => setProjectFormData({ ...projectFormData, color: e.target.value })}
                        className="flex-1 border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    rows="3"
                    placeholder="Enter project description..."
                  />
                </div>

                <div className="flex space-x-3">
                  {editingProject && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(null)
                        resetProjectForm()
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>

              {/* Existing Projects List */}
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Existing Projects</h3>
                <div className="space-y-3">
                  {projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        ></div>
                        <div>
                          <h4 className="font-medium text-surface-900">{project.name}</h4>
                          {project.description && (
                            <p className="text-sm text-surface-600">{project.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-surface-500">
                              {getProjectTaskCount(project.id)} tasks
                            </span>
                            <span className="text-xs text-surface-500">
                              Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openProjectEditModal(project)}
                          className="p-2 rounded-lg hover:bg-surface-200 transition-colors"
                        >
                          <ApperIcon name="Edit2" className="w-4 h-4 text-surface-500" />
                        </button>
                        {project.id !== 'default' && (
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
</div>
  )
}

export default MainFeature