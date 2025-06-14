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

const categories = [
  { value: 'work', label: 'Work', color: '#3b82f6', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  { value: 'personal', label: 'Personal', color: '#8b5cf6', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  { value: 'health', label: 'Health', color: '#10b981', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  { value: 'finance', label: 'Finance', color: '#f59e0b', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { value: 'learning', label: 'Learning', color: '#06b6d4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
  { value: 'shopping', label: 'Shopping', color: '#ec4899', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
  { value: 'travel', label: 'Travel', color: '#84cc16', bgColor: 'bg-lime-100', textColor: 'text-lime-700' },
  { value: 'other', label: 'Other', color: '#6b7280', bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
]

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [editingProject, setEditingProject] = useState(null)
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  })
const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false)
  const [workflows, setWorkflows] = useState([])
  const [editingWorkflow, setEditingWorkflow] = useState(null)
  const [activeWorkflowId, setActiveWorkflowId] = useState('default')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [workflowFormData, setWorkflowFormData] = useState({
    name: '',
    description: '',
    stages: [],
    transitions: {}
  })
const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    category: 'personal',
    tags: [],
    subtasks: [],
    workflowId: 'default',
    stage: 'todo'
  })

// Default workflow templates
  const defaultWorkflows = {
    basic: {
      id: 'default',
      name: 'Basic Workflow',
      description: 'Simple three-stage workflow',
      stages: [
        { id: 'todo', name: 'To Do', color: '#6b7280', icon: 'Circle' },
        { id: 'in-progress', name: 'In Progress', color: '#f59e0b', icon: 'Clock' },
        { id: 'completed', name: 'Completed', color: '#10b981', icon: 'CheckCircle2' }
      ],
      transitions: {
        'todo': ['in-progress'],
        'in-progress': ['completed', 'todo'],
        'completed': ['todo']
      }
    },
    kanban: {
      id: 'kanban',
      name: 'Kanban Board',
      description: 'Classic Kanban workflow with backlog and review',
      stages: [
        { id: 'backlog', name: 'Backlog', color: '#6b7280', icon: 'FileText' },
        { id: 'todo', name: 'To Do', color: '#3b82f6', icon: 'Circle' },
        { id: 'in-progress', name: 'In Progress', color: '#f59e0b', icon: 'Clock' },
        { id: 'review', name: 'Review', color: '#8b5cf6', icon: 'Eye' },
        { id: 'completed', name: 'Done', color: '#10b981', icon: 'CheckCircle2' }
      ],
      transitions: {
        'backlog': ['todo'],
        'todo': ['in-progress', 'backlog'],
        'in-progress': ['review', 'todo'],
        'review': ['completed', 'in-progress'],
        'completed': ['todo']
      }
    },
    development: {
      id: 'development',
      name: 'Software Development',
      description: 'Complete software development lifecycle',
      stages: [
        { id: 'planning', name: 'Planning', color: '#6b7280', icon: 'FileText' },
        { id: 'development', name: 'Development', color: '#3b82f6', icon: 'Code' },
        { id: 'testing', name: 'Testing', color: '#f59e0b', icon: 'TestTube' },
        { id: 'review', name: 'Code Review', color: '#8b5cf6', icon: 'Eye' },
        { id: 'deployment', name: 'Deployment', color: '#10b981', icon: 'Rocket' },
        { id: 'completed', name: 'Completed', color: '#059669', icon: 'CheckCircle2' }
      ],
      transitions: {
        'planning': ['development'],
        'development': ['testing', 'planning'],
        'testing': ['review', 'development'],
        'review': ['deployment', 'development'],
        'deployment': ['completed', 'testing'],
        'completed': ['planning']
      }
    }
  }

  // Load tasks, projects, and workflows from localStorage on component mount
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
      localStorage.setItem('taskflow-projects', JSON.stringify([defaultProject]))
    }

const savedWorkflows = localStorage.getItem('taskflow-workflows')
    if (savedWorkflows) {
      setWorkflows(JSON.parse(savedWorkflows))
    } else {
      // Initialize with default workflows
      const initialWorkflows = Object.values(defaultWorkflows)
      setWorkflows(initialWorkflows)
      localStorage.setItem('taskflow-workflows', JSON.stringify(initialWorkflows))
    }

    const savedActiveWorkflow = localStorage.getItem('taskflow-active-workflow')
    if (savedActiveWorkflow) {
      setActiveWorkflowId(savedActiveWorkflow)
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

// Save workflows to localStorage whenever workflows change
  useEffect(() => {
    localStorage.setItem('taskflow-workflows', JSON.stringify(workflows))
    setRefreshTrigger(prev => prev + 1)
  }, [workflows])

  // Save active workflow to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taskflow-active-workflow', activeWorkflowId)
    setRefreshTrigger(prev => prev + 1)
  }, [activeWorkflowId])

  // Force refresh when refresh trigger changes
  useEffect(() => {
    // This ensures component re-renders when workflows change
  }, [refreshTrigger])
const resetForm = () => {
    const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0]
    const firstStage = activeWorkflow?.stages[0]?.id || 'todo'
    
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: firstStage,
      dueDate: '',
      category: 'personal',
      tags: [],
      subtasks: [],
      workflowId: activeWorkflowId,
      stage: firstStage
    })
  }

  // Get available stages from active workflow
  const getWorkflowStages = () => {
    const activeWorkflow = workflows.find(w => w.id === activeWorkflowId)
    if (activeWorkflow && activeWorkflow.stages) {
      return activeWorkflow.stages.map(stage => ({
        value: stage.id,
        label: stage.name,
        icon: stage.icon,
        color: stage.color
      }))
    }
    return statuses
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

    const activeWorkflow = workflows.find(w => w.id === activeWorkflowId)
    const newTask = {
      id: Date.now().toString(),
      ...formData,
      workflowId: activeWorkflowId,
      stage: formData.stage || formData.status,
      status: formData.stage || formData.status, // Keep for backward compatibility
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setTasks(prev => [newTask, ...prev])
    setIsCreateModalOpen(false)
    resetForm()
    toast.success(`Task created successfully in ${activeWorkflow?.name || 'workflow'}!`)
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
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const taskWorkflow = workflows.find(w => w.id === (task.workflowId || activeWorkflowId))
    if (!taskWorkflow) {
      toast.error('Workflow not found')
      return
    }

    // Get current stage and validate transition
    const currentStage = task.stage || task.status
    const allowedTransitions = taskWorkflow.transitions?.[currentStage] || []
    
    if (currentStage !== newStatus && !allowedTransitions.includes(newStatus)) {
      const currentStageName = taskWorkflow.stages.find(s => s.id === currentStage)?.name || currentStage
      const newStageName = taskWorkflow.stages.find(s => s.id === newStatus)?.name || newStatus
      toast.error(`Cannot transition from "${currentStageName}" to "${newStageName}" in this workflow`)
      return
    }

    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { 
            ...t, 
            status: newStatus, 
            stage: newStatus,
            updatedAt: new Date().toISOString() 
          }
        : t
    ))
    
    const newStageName = taskWorkflow.stages.find(s => s.id === newStatus)?.name || newStatus
    if (newStatus === 'completed' || newStageName.toLowerCase().includes('done') || newStageName.toLowerCase().includes('complete')) {
      toast.success('Task completed! 🎉')
    } else {
      toast.success(`Task moved to "${newStageName}"`)
    }
  }

  // Get next available stage for quick transition
  const getNextStage = (task) => {
    const taskWorkflow = workflows.find(w => w.id === (task.workflowId || activeWorkflowId))
    if (!taskWorkflow) return null

    const currentStage = task.stage || task.status
    const allowedTransitions = taskWorkflow.transitions?.[currentStage] || []
    
    if (allowedTransitions.length > 0) {
      return allowedTransitions[0]
    }
    
    return null
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
      category: task.category || 'personal',
      tags: task.tags || [],
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

  // Workflow management functions
  const resetWorkflowForm = () => {
    setWorkflowFormData({
      name: '',
      description: '',
      stages: [],
      transitions: {}
    })
  }

  const handleCreateWorkflow = (e) => {
    e.preventDefault()
    if (!workflowFormData.name.trim()) {
      toast.error('Workflow name is required')
      return
    }

    const newWorkflow = {
      id: Date.now().toString(),
      ...workflowFormData,
      createdAt: new Date().toISOString()
    }

    setWorkflows(prev => [newWorkflow, ...prev])
    resetWorkflowForm()
    toast.success('Workflow created successfully!')
  }

  const handleUpdateWorkflow = (e) => {
    e.preventDefault()
    if (!workflowFormData.name.trim()) {
      toast.error('Workflow name is required')
      return
    }

    setWorkflows(prev => prev.map(workflow => 
      workflow.id === editingWorkflow.id 
        ? { ...workflow, ...workflowFormData }
        : workflow
    ))
    setEditingWorkflow(null)
    resetWorkflowForm()
    toast.success('Workflow updated successfully!')
  }

  const handleDeleteWorkflow = (workflowId) => {
    if (workflowId === activeWorkflowId) {
      toast.error('Cannot delete the active workflow')
      return
    }
    
    setWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId))
    toast.success('Workflow deleted successfully!')
  }

  const addStageToWorkflow = (stageName) => {
    if (!stageName.trim()) return
    
    const newStage = {
      id: Date.now().toString(),
      name: stageName.trim(),
      color: '#6366f1',
      icon: 'Circle'
    }
    
    setWorkflowFormData(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }))
  }

  const removeStageFromWorkflow = (stageId) => {
    setWorkflowFormData(prev => ({
      ...prev,
      stages: prev.stages.filter(stage => stage.id !== stageId),
      transitions: Object.fromEntries(
        Object.entries(prev.transitions).filter(([key]) => key !== stageId)
          .map(([key, value]) => [key, value.filter(id => id !== stageId)])
      )
    }))
  }

  const updateStageTransitions = (stageId, targetStageIds) => {
    setWorkflowFormData(prev => ({
      ...prev,
      transitions: {
        ...prev.transitions,
        [stageId]: targetStageIds
      }
    }))
  }
// Tag management functions
  const addTagToForm = (tag) => {
    if (!tag.trim()) return
    const normalizedTag = tag.trim().toLowerCase()
    
    if (!formData.tags.some(t => t.toLowerCase() === normalizedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
  }

  const removeTagFromForm = (tagIndex) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== tagIndex)
    }))
  }

const getFilteredTasks = () => {
    let filtered = tasks

    if (filter !== 'all') {
      filtered = filtered.filter(task => {
        const taskStage = task.stage || task.status
        return taskStage === filter
      })
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter)
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

  // Get available filter options based on active workflow
  const getFilterOptions = () => {
    const activeWorkflow = workflows.find(w => w.id === activeWorkflowId)
    if (activeWorkflow && activeWorkflow.stages) {
      return [
        { value: 'all', label: 'All Tasks' },
        ...activeWorkflow.stages.map(stage => ({
          value: stage.id,
          label: stage.name
        }))
      ]
    }
    return [
      { value: 'all', label: 'All Tasks' },
      { value: 'todo', label: 'To Do' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' }
    ]
  }

  const getAllTags = () => {
    const allTags = tasks.flatMap(task => task.tags || [])
    return [...new Set(allTags)].sort()
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

  const getCategoryConfig = (category) => {
    return categories.find(c => c.value === category) || categories.find(c => c.value === 'other')
  }

const getStatusConfig = (status, workflowId) => {
    const workflow = workflows.find(w => w.id === (workflowId || activeWorkflowId))
    if (workflow && workflow.stages) {
      const stage = workflow.stages.find(s => s.id === status)
      if (stage) {
        return {
          value: stage.id,
          label: stage.name,
          icon: stage.icon,
          color: `text-[${stage.color}]`
        }
      }
    }
    return statuses.find(s => s.value === status) || statuses[0]
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
                onChange={(e) => {
                  setFilter(e.target.value)
                  setRefreshTrigger(prev => prev + 1)
                }}
                className="border border-surface-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                key={`filter-${activeWorkflowId}-${refreshTrigger}`}
              >
                {getFilterOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div className="flex items-center space-x-2">
              <ApperIcon name="FolderOpen" className="w-4 h-4 text-surface-500" />
              <select
                value={formData.projectId || 'all'}
                onChange={(e) => {
                  const projectId = e.target.value === 'all' ? null : e.target.value
                  setFormData(prev => ({ ...prev, projectId }))
                }}
                className="border border-surface-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <ApperIcon name="Tag" className="w-4 h-4 text-surface-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-surface-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
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

          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProjectModalOpen(true)}
              className="btn-secondary flex items-center space-x-2 justify-center sm:justify-start"
            >
              <ApperIcon name="FolderOpen" className="w-4 h-4" />
              <span>Projects</span>
            </motion.button>
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
              const categoryConfig = getCategoryConfig(task.category)
              const statusConfig = getStatusConfig(task.stage || task.status, task.workflowId)
              const dateLabel = getDateLabel(task.dueDate)
              const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
              return (
                <motion.div
                  key={`${task.id}-${activeWorkflowId}-${refreshTrigger}`}
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
                        const nextStage = getNextStage(task)
                        if (nextStage) {
                          handleStatusChange(task.id, nextStage)
                        } else {
                          // Fallback to first stage if no transitions available
                          const taskWorkflow = workflows.find(w => w.id === (task.workflowId || activeWorkflowId))
                          const firstStage = taskWorkflow?.stages[0]?.id
                          if (firstStage && firstStage !== (task.stage || task.status)) {
                            handleStatusChange(task.id, firstStage)
                          }
                        }
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

                            {/* Category */}
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${categoryConfig.textColor} ${categoryConfig.bgColor}`}>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryConfig.color }}></div>
                              <span>{categoryConfig.label}</span>
                            </span>

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.tags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-200 text-surface-700">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
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
                      onChange={(e) => setFormData({ ...formData, status: e.target.value, stage: e.target.value })}
                      className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      {getWorkflowStages().map(stage => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
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

                {/* Project & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Project
                    </label>
                    <select
                      value={formData.projectId || 'default'}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div className="grid grid-cols-1 gap-4">

<div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Tags
                    </label>
                    <div className="space-y-2">
                      {/* Existing Tags */}
                      {formData.tags && formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-surface-200 text-surface-700">
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeTagFromForm(index)}
                                className="ml-1 hover:text-red-500"
                              >
                                <ApperIcon name="X" className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Add Tag Input */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Add a tag..."
                          list="existing-tags"
                          className="flex-1 border border-surface-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTagToForm(e.target.value)
                              e.target.value = ''
                            }
                          }}
                        />
                        <datalist id="existing-tags">
                          {getAllTags().map((tag, index) => (
                            <option key={index} value={tag} />
                          ))}
                        </datalist>
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.target.parentElement.querySelector('input')
                            if (input && input.value) {
                              addTagToForm(input.value)
                              input.value = ''
                            }
                          }}
                          className="px-3 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Plus" className="w-4 h-4 text-surface-600" />
                        </button>
                      </div>
                    </div>
                  </div>
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

      {/* Workflow Management Modal */}
      <AnimatePresence>
        {isWorkflowModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsWorkflowModalOpen(false)
                setEditingWorkflow(null)
                resetWorkflowForm()
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-surface-900">
                  Workflow Management
                </h2>
                <button
                  onClick={() => {
                    setIsWorkflowModalOpen(false)
                    setEditingWorkflow(null)
                    resetWorkflowForm()
                  }}
                  className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Workflow Creation/Editing */}
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">
                    {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
                  </h3>
                  
                  {/* Quick Templates */}
                  {!editingWorkflow && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-surface-700 mb-3">Quick Start Templates</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.values(defaultWorkflows).map(template => (
                          <button
                            key={template.id}
                            onClick={() => {
                              setWorkflowFormData({
                                name: template.name + ' (Copy)',
                                description: template.description,
                                stages: [...template.stages],
                                transitions: { ...template.transitions }
                              })
                            }}
                            className="text-left p-3 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                          >
                            <div className="font-medium text-surface-900">{template.name}</div>
                            <div className="text-sm text-surface-600">{template.description}</div>
                            <div className="flex items-center space-x-1 mt-2">
                              {template.stages.slice(0, 4).map(stage => (
                                <div
                                  key={stage.id}
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: stage.color }}
                                ></div>
                              ))}
                              {template.stages.length > 4 && (
                                <span className="text-xs text-surface-500">+{template.stages.length - 4}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={editingWorkflow ? handleUpdateWorkflow : handleCreateWorkflow} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Workflow Name *
                      </label>
                      <input
                        type="text"
                        value={workflowFormData.name}
                        onChange={(e) => setWorkflowFormData({ ...workflowFormData, name: e.target.value })}
                        className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Enter workflow name..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={workflowFormData.description}
                        onChange={(e) => setWorkflowFormData({ ...workflowFormData, description: e.target.value })}
                        className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                        rows="3"
                        placeholder="Enter workflow description..."
                      />
                    </div>

                    {/* Stages Management */}
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Workflow Stages
                      </label>
                      <div className="space-y-2 mb-3">
                        {workflowFormData.stages.map((stage, index) => (
                          <div key={stage.id} className="flex items-center space-x-3 p-3 bg-surface-50 rounded-lg">
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="color"
                                value={stage.color}
                                onChange={(e) => {
                                  const updatedStages = [...workflowFormData.stages]
                                  updatedStages[index] = { ...stage, color: e.target.value }
                                  setWorkflowFormData({ ...workflowFormData, stages: updatedStages })
                                }}
                                className="w-8 h-8 border border-surface-300 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={stage.name}
                                onChange={(e) => {
                                  const updatedStages = [...workflowFormData.stages]
                                  updatedStages[index] = { ...stage, name: e.target.value }
                                  setWorkflowFormData({ ...workflowFormData, stages: updatedStages })
                                }}
                                className="flex-1 border border-surface-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="Stage name"
                              />
                              <select
                                value={stage.icon}
                                onChange={(e) => {
                                  const updatedStages = [...workflowFormData.stages]
                                  updatedStages[index] = { ...stage, icon: e.target.value }
                                  setWorkflowFormData({ ...workflowFormData, stages: updatedStages })
                                }}
                                className="border border-surface-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                              >
                                <option value="Circle">Circle</option>
                                <option value="Clock">Clock</option>
                                <option value="CheckCircle2">Check</option>
                                <option value="FileText">File</option>
                                <option value="Code">Code</option>
                                <option value="TestTube">Test</option>
                                <option value="Eye">Eye</option>
                                <option value="Rocket">Rocket</option>
                                <option value="Settings">Settings</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStageFromWorkflow(stage.id)}
                              className="p-1 rounded hover:bg-surface-200 transition-colors"
                            >
                              <ApperIcon name="X" className="w-4 h-4 text-surface-400 hover:text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Add a stage..."
                          className="flex-1 border border-surface-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addStageToWorkflow(e.target.value)
                              e.target.value = ''
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.target.parentElement.querySelector('input')
                            if (input && input.value) {
                              addStageToWorkflow(input.value)
                              input.value = ''
                            }
                          }}
                          className="px-3 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Plus" className="w-4 h-4 text-surface-600" />
                        </button>
                      </div>
                    </div>

                    {/* Stage Transitions */}
                    {workflowFormData.stages.length > 1 && (
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          Stage Transitions
                        </label>
                        <div className="space-y-3">
                          {workflowFormData.stages.map(stage => (
                            <div key={stage.id} className="p-3 border border-surface-200 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: stage.color }}
                                ></div>
                                <span className="font-medium text-sm text-surface-900">{stage.name}</span>
                                <span className="text-xs text-surface-500">can transition to:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {workflowFormData.stages.filter(s => s.id !== stage.id).map(targetStage => (
                                  <label key={targetStage.id} className="flex items-center space-x-1">
                                    <input
                                      type="checkbox"
                                      checked={(workflowFormData.transitions[stage.id] || []).includes(targetStage.id)}
                                      onChange={(e) => {
                                        const currentTransitions = workflowFormData.transitions[stage.id] || []
                                        const newTransitions = e.target.checked
                                          ? [...currentTransitions, targetStage.id]
                                          : currentTransitions.filter(id => id !== targetStage.id)
                                        updateStageTransitions(stage.id, newTransitions)
                                      }}
                                      className="rounded border-surface-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs text-surface-700">{targetStage.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

<div className="flex space-x-3">
                      {editingWorkflow && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWorkflow(null)
                            resetWorkflowForm()
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
                        {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Workflows */}
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Existing Workflows</h3>
                  
                  {/* Active Workflow Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Active Workflow
                    </label>
<select
                      value={activeWorkflowId}
                      onChange={(e) => {
                        setActiveWorkflowId(e.target.value)
                        localStorage.setItem('taskflow-active-workflow', e.target.value)
                        setRefreshTrigger(prev => prev + 1)
                        // Reset filter to 'all' when switching workflows
                        setFilter('all')
                        toast.success(`Switched to ${workflows.find(w => w.id === e.target.value)?.name || 'workflow'}`)
                      }}
                      className="w-full border border-surface-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      {workflows.map(workflow => (
                        <option key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {workflows.map(workflow => (
                      <div key={workflow.id} className={`p-4 border rounded-lg ${workflow.id === activeWorkflowId ? 'border-primary bg-primary/5' : 'border-surface-200 bg-surface-50'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-surface-900">{workflow.name}</h4>
                              {workflow.id === activeWorkflowId && (
                                <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Active</span>
                              )}
                            </div>
                            {workflow.description && (
                              <p className="text-sm text-surface-600 mt-1">{workflow.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingWorkflow(workflow)
                                setWorkflowFormData({
                                  name: workflow.name,
                                  description: workflow.description,
                                  stages: [...workflow.stages],
                                  transitions: { ...workflow.transitions }
                                })
                              }}
                              className="p-2 rounded-lg hover:bg-surface-200 transition-colors"
                            >
                              <ApperIcon name="Edit2" className="w-4 h-4 text-surface-500" />
                            </button>
                            {!Object.values(defaultWorkflows).find(dw => dw.id === workflow.id) && (
                              <button
                                onClick={() => handleDeleteWorkflow(workflow.id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Workflow Stages Preview */}
                        <div className="flex items-center space-x-2 mb-2">
                          {workflow.stages.map((stage, index) => (
                            <div key={stage.id} className="flex items-center space-x-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: stage.color }}
                              ></div>
                              <span className="text-xs text-surface-700">{stage.name}</span>
                              {index < workflow.stages.length - 1 && (
                                <ApperIcon name="ChevronRight" className="w-3 h-3 text-surface-400" />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-xs text-surface-500">
                          {workflow.stages.length} stages • {Object.keys(workflow.transitions || {}).length} transition rules
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
</motion.div>
          </motion.div>
        )}
      </AnimatePresence>

{/* Debug Info - Workflow Status */}
      {typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
          Active: {workflows.find(w => w.id === activeWorkflowId)?.name || 'None'} | 
          Tasks: {tasks.length} | 
          Refresh: {refreshTrigger}
        </div>
      )}
{/* Management Buttons */}
      <div className="fixed bottom-4 left-4 flex flex-col space-y-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsProjectModalOpen(true)}
          className="bg-secondary text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Manage Projects"
        >
          <ApperIcon name="FolderOpen" className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsWorkflowModalOpen(true)}
          className="bg-primary text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Manage Workflows"
        >
          <ApperIcon name="Settings" className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}

export default MainFeature