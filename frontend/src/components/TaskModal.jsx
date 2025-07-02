import React, { useState, useCallback, useEffect } from 'react'
import { baseControlClasses, DEFAULT_TASK, priorityStyles } from '../assets/dummy'
import { AlignLeft, Calendar1Icon, CheckCircle, Flag, PlusCircle, Save, X } from 'lucide-react'
import { toast } from 'react-toastify'

const API_BASE = import.meta.env.VITE_API_URL + '/api/tasks';

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if(!isOpen) return;
    if(taskToEdit) {
      const normalized = taskToEdit.completed === "Yes" || taskToEdit.completed === true ? "Yes" : "No";
      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'Low',
        dueDate: taskToEdit.dueDate?.split('T')[0] || '',
        completed: normalized,
        id: taskToEdit._id,
      });
    }
    else {
      setTaskData(DEFAULT_TASK)
    }
    setError(null)
  }, [isOpen, taskToEdit])

  const handleChange = useCallback((e) => {
    const {name, value} = e.target;
    setTaskData(prev => ({...prev, [name]: value}))
  }, [])  

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token')
    if(!token) throw new Error("No auth token found")
      return{
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (taskData.dueDate < today) {
      setError('Due date cannot be in the past.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isEdit = Boolean(taskData.id);
      const url = isEdit ? `${API_BASE}/${taskData.id}/gp` : `${API_BASE}/gp`;

      const resp = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });
      
      if(!resp.ok) {
        if(resp.status === 401) return onLogout?.();
        const err = await resp.json();
        throw new Error(err.message || 'Failed to save task')
      }
      
      const saved = await resp.json();
      onSave?.(saved);
      
      return saved;
    } catch (error) {
      console.error(error)
      setError(error.message || 'An unexpected error occurred')
      throw error; 
    } finally {
      setLoading(false)
    }
  }, [taskData, today, getHeaders, onLogout, onSave])

  const handleFormSubmit = async (e) => {
    try {
      await handleSubmit(e);

      if (!taskData.id) {
        setTaskData(DEFAULT_TASK);
      }
      onClose();
    } catch (error) {
      console.error(error)
      toast.error(error)
    }
  }

  if(!isOpen) return null

  return (
    <div className='fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4'>
      <div className='bg-white border border-purple-100 rounded-xl max-w-md w-full shadow-lg p-6 animate-fadeIn'>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {taskData.id ? (
              <Save className="text-purple-500 w-5 h-5" />
            ) : (
              <PlusCircle className="text-purple-500 w-5 h-5" />
            )}
            {taskData.id ? 'Edit Task' : 'Create New Task'}
          </h2>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-500 hover:text-purple-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM TO FILL TO CREATE */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <div className="flex items-center border border-purple-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200">
              <input 
                type="text" 
                className='w-full focus:outline-none text-sm' 
                name='title'
                onChange={handleChange}
                placeholder='Enter title task' 
                required 
                value={taskData.title}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium mb-1 text-gray-700">
              <AlignLeft className='w-5 h-5 text-purple-500 mr-2' /> Description
            </label>
            <textarea 
              name="description" 
              rows="3"
              onChange={handleChange} 
              value={taskData.description}
              className={baseControlClasses} 
              placeholder='Add description about your task' 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Flag className="w-4 h-4 text-purple-500" />
                Priority
              </label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className={`${baseControlClasses} ${priorityStyles[taskData.priority]}`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Calendar1Icon className="w-4 h-4 text-purple-500" />
                Deadline
              </label>
              <input 
                type="date" 
                name="dueDate" 
                required 
                min={today} 
                value={taskData.dueDate}
                onChange={handleChange}
                className={baseControlClasses} 
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              Status
            </label>
            <div className='flex gap-4'>
              {[{val: "Yes", label: "Completed"},
                {val: "No", label: "In Progress"}
              ].map(({val, label}) => (
                <label 
                  key={val} 
                  className='flex items-center'
                >
                  <input 
                    type='radio' 
                    name='completed' 
                    value={val}
                    checked={taskData.completed === val}
                    onChange={handleChange}
                    className='h-4 w-4 text-purple-600 focus:ring-purple-500 bg-gray-300 rounded'
                  />
                  <span className='ml-2 text-sm text-gray-700'>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md transition-all duration-200"
          >
            {loading ? (
              'Saving...'
            ) : taskData.id ? (
              <>
                <Save className="w-4 h-4" />
                Update Task
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Create Task
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TaskModal