export default function AllTodos() {
  return (
    <div className='flex-grow overflow-y-auto my-4 pr-1'>
      <div className='space-y-1 relative'>
        {loading && todos.length === 0 && (
          <div className='flex justify-center items-center py-8'>
            <IconLoader2 size={24} className='animate-spin text-gray-400' />
          </div>
        )}

        {!loading && todos.length === 0 ? (
          <p className='text-center text-gray-500 dark:text-gray-400 py-4 italic'>
            No todos yet. Add one below!
          </p>
        ) : (
          todos.map(todo => (
            <Todo
              key={todo._id}
              id={todo._id}
              text={todo.text}
              completed={todo.completed}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              isToggling={togglingTodo === todo._id}
              isDeleting={deletingTodo === todo._id}
            />
          ))
        )}
      </div>

      {/* Clear All Button */}
      {todos.length > 0 && (
        <div className='mt-4 text-center'>
          <button
            onClick={clearTodos}
            className='flex items-center gap-2 text-red-500 hover:text-red-600 text-sm mx-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            disabled={clearingTodos}
          >
            {clearingTodos ? (
              <IconLoader2 size={16} className='animate-spin' />
            ) : (
              <IconTrash size={16} />
            )}
            Clear All Todos
          </button>
        </div>
      )}
    </div>
  )
}
