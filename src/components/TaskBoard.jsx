import { useState } from 'react'

const STATUS_COLS = [
  { key: 'open', label: 'Open', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  { key: 'in_progress', label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'review', label: 'Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { key: 'done', label: 'Done', color: 'text-green-400', bg: 'bg-green-500/10' },
]

const PRIORITY_COLORS = { low: 'bg-gray-500', medium: 'bg-yellow-500', high: 'bg-red-500' }

function TaskBoard({ tasks, members, currentUserId, isFounder, onCreateTask, onUpdateTask, onDeleteTask, onAssignTask }) {
  const [mobileTab, setMobileTab] = useState('open')
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState('medium')

  const handleAddTask = async () => {
    if (!newTitle.trim()) return
    await onCreateTask(newTitle.trim(), newDesc.trim(), newPriority)
    setNewTitle('')
    setNewDesc('')
    setNewPriority('medium')
    setShowAddTask(false)
  }

  const tasksByStatus = {}
  STATUS_COLS.forEach((col) => { tasksByStatus[col.key] = tasks.filter((t) => t.status === col.key) })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Tasks ({tasks.length})</h3>
        {isFounder && (
          <button onClick={() => setShowAddTask(!showAddTask)}
            className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
            + Add Task
          </button>
        )}
      </div>

      {/* Add task form */}
      {showAddTask && (
        <div className="bg-[#0f172a] border border-gray-700 rounded-lg p-4 mb-4 space-y-3">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title..."
            className="w-full bg-[#1e293b] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2}
            className="w-full bg-[#1e293b] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none" />
          <div className="flex items-center gap-3">
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}
              className="bg-[#1e293b] text-gray-300 border border-gray-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-green-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setShowAddTask(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleAddTask} className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: 4 columns */}
      <div className="hidden md:grid md:grid-cols-4 gap-3">
        {STATUS_COLS.map((col) => (
          <div key={col.key} className={`${col.bg} rounded-lg p-3 min-h-[200px]`}>
            <h4 className={`text-xs font-semibold ${col.color} mb-3 uppercase tracking-wide`}>
              {col.label} ({tasksByStatus[col.key].length})
            </h4>
            <div className="space-y-2">
              {tasksByStatus[col.key].map((task) => (
                <TaskCard key={task.id} task={task} members={members} currentUserId={currentUserId}
                  isFounder={isFounder} onUpdate={onUpdateTask} onDelete={onDeleteTask} onAssign={onAssignTask} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: tabbed */}
      <div className="md:hidden">
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {STATUS_COLS.map((col) => (
            <button key={col.key} onClick={() => setMobileTab(col.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors shrink-0 ${mobileTab === col.key ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-gray-700 text-gray-400'}`}>
              {col.label} ({tasksByStatus[col.key].length})
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {tasksByStatus[mobileTab].map((task) => (
            <TaskCard key={task.id} task={task} members={members} currentUserId={currentUserId}
              isFounder={isFounder} onUpdate={onUpdateTask} onDelete={onDeleteTask} onAssign={onAssignTask} />
          ))}
          {tasksByStatus[mobileTab].length === 0 && (
            <p className="text-xs text-gray-600 text-center py-6">No tasks here</p>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task, members, currentUserId, isFounder, onUpdate, onDelete, onAssign }) {
  const [expanded, setExpanded] = useState(false)
  const canManage = isFounder || task.assigned_to === currentUserId

  const nextStatus = {
    open: 'in_progress',
    in_progress: 'review',
    review: 'done',
    done: null,
  }

  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-3 text-xs">
      <div className="flex items-start gap-2">
        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${PRIORITY_COLORS[task.priority]}`} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium cursor-pointer" onClick={() => setExpanded(!expanded)}>{task.title}</p>
          {task.assigneeName ? (
            <span className="text-gray-500 mt-0.5 block">{task.assigneeName}</span>
          ) : (
            <span className="text-gray-600 mt-0.5 block italic">Unassigned</span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
          {task.description && <p className="text-gray-400">{task.description}</p>}

          {/* Assign dropdown (founder only) */}
          {isFounder && (
            <div>
              <label className="text-gray-500 block mb-1">Assign to:</label>
              <select value={task.assigned_to || ''} onChange={(e) => onAssign(task.id, e.target.value || null)}
                className="w-full bg-[#0f172a] text-gray-300 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-500">
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.profile?.display_name || 'Unknown'}</option>
                ))}
              </select>
            </div>
          )}

          {/* Status change */}
          {canManage && nextStatus[task.status] && (
            <button onClick={() => onUpdate(task.id, { status: nextStatus[task.status] })}
              className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Move to {nextStatus[task.status].replace('_', ' ')} →
            </button>
          )}

          {/* Delete (founder only) */}
          {isFounder && (
            <button onClick={() => onDelete(task.id)} className="text-red-400 hover:text-red-300 transition-colors block">
              Delete task
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskBoard
