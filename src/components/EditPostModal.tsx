'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import PostForm from './PostForm'
import { Category, PostWithCategory } from '@/types/database'

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  post: PostWithCategory
  onPostUpdated: () => void
}

export default function EditPostModal({ 
  isOpen, 
  onClose, 
  categories, 
  post,
  onPostUpdated 
}: EditPostModalProps) {

  const handlePostUpdated = () => {
    onPostUpdated()
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl max-h-[90vh] transform overflow-hidden rounded-2xl bg-white p-0 text-left align-middle shadow-2xl border border-gray-200 transition-all flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <Dialog.Title as="h3" className="text-xl font-bold text-gray-900">
                    Edit Post
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  <PostForm
                    categories={categories}
                    selectedCategoryId={post.category_id || undefined}
                    onPostCreated={handlePostUpdated}
                    isModal={true}
                    editingPost={post}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}