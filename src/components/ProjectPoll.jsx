import { useState } from 'react'

function ProjectPoll({ poll, currentUserId, isFounder, onVote, onClose, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const myVote = poll.voters?.[currentUserId]
  const hasVoted = myVote !== undefined
  const canManage = currentUserId === poll.created_by || isFounder

  const handleVote = (optionIndex) => {
    if (poll.is_closed) return
    onVote(poll.id, optionIndex)
  }

  return (
    <div className="bg-[#0f172a] border border-purple-500/30 rounded-xl p-4 my-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-sm font-semibold">Poll</span>
          {poll.is_closed && (
            <span className="text-[10px] px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full">Closed</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600">by {poll.creatorName}</span>
          {canManage && !poll.is_closed && (
            <button onClick={() => onClose(poll.id)}
              className="text-[10px] text-gray-500 hover:text-yellow-400 transition-colors">Close</button>
          )}
          {canManage && !confirmDelete && (
            <button onClick={() => setConfirmDelete(true)}
              className="text-[10px] text-gray-500 hover:text-red-400 transition-colors">Delete</button>
          )}
          {confirmDelete && (
            <div className="flex gap-1">
              <button onClick={() => { onDelete(poll.id); setConfirmDelete(false) }}
                className="text-[10px] text-red-400 font-medium">Confirm</button>
              <button onClick={() => setConfirmDelete(false)}
                className="text-[10px] text-gray-500">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-white mb-3">{poll.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map((option, i) => {
          const count = poll.voteCounts?.[i] || 0
          const pct = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0
          const isMyVote = myVote === i
          const showResults = hasVoted || poll.is_closed

          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={poll.is_closed}
              className={`w-full text-left relative rounded-lg border transition-all overflow-hidden ${
                isMyVote
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-gray-700 hover:border-gray-600'
              } ${poll.is_closed ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Progress bar background */}
              {showResults && (
                <div
                  className={`absolute inset-0 transition-all duration-500 ${isMyVote ? 'bg-green-500/15' : 'bg-gray-700/30'}`}
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  {isMyVote && (
                    <svg className="w-3.5 h-3.5 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`text-sm ${isMyVote ? 'text-white font-medium' : 'text-gray-300'}`}>{option}</span>
                </div>
                {showResults && (
                  <span className="text-xs text-gray-500 shrink-0 ml-2">{count} ({pct}%)</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-gray-600">{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</span>
        {hasVoted && !poll.is_closed && (
          <span className="text-[10px] text-gray-600">Click another option to change your vote</span>
        )}
      </div>
    </div>
  )
}

export default ProjectPoll
