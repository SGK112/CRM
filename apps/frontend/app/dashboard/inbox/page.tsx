export const metadata = {
  title: 'Inbox',
};

export default function InboxPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="text-sm text-gray-500">All messages and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search mail"
            className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Compose</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 space-y-2 sm:col-span-3">
          <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-gray-50">
            <span>All mail</span>
            <span className="text-xs text-gray-500">0</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-gray-50">
            <span>Unread</span>
            <span className="text-xs text-gray-500">0</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-gray-50">
            <span>Starred</span>
            <span className="text-xs text-gray-500">0</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-gray-50">
            <span>Archived</span>
            <span className="text-xs text-gray-500">0</span>
          </button>
        </aside>
        <section className="col-span-12 sm:col-span-9">
          <div className="rounded-md border border-dashed p-10 text-center text-sm text-gray-500">
            Empty inbox. Start by composing a new message.
          </div>
        </section>
      </div>
    </div>
  );
}
