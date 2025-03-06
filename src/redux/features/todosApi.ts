import { ITodo } from '@/lib/models/todo'
import { WithId } from '@/utils/types'
import api from '../api'

const rootApi = '/todos'

const todosApi = api.injectEndpoints({
  endpoints: builder => ({
    getTodos: builder.query<{ todos: WithId<ITodo>[] }, void>({
      query: () => ({
        url: rootApi
      }),
      providesTags: ['todos']
    }),
    addTodo: builder.mutation<WithId<ITodo>, ITodo>({
      query: todo => ({
        url: rootApi,
        method: 'POST',
        body: todo
      }),
      invalidatesTags: ['todos']
    }),
    updateTodo: builder.mutation<WithId<ITodo>, ITodo>({
      query: todo => ({
        url: `${rootApi}/${todo._id}`,
        method: 'PUT',
        body: todo
      }),
      invalidatesTags: ['todos']
    }),
    deleteTodo: builder.mutation<WithId<ITodo>, ITodo>({
      query: todo => ({
        url: `${rootApi}/${todo._id}`,
        method: 'DELETE',
        body: todo
      }),
      invalidatesTags: ['todos']
    })
  })
})

export const {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation
} = todosApi
