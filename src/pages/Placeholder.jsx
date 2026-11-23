
export default function Placeholder({ title }) {
  return (
    <div className="flex-1 border-r border-border min-h-screen md:ml-20 xl:ml-64 max-w-[600px] w-full">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-border">
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="flex flex-col items-center justify-center h-[50vh] text-secondary">
        <p className="text-2xl font-bold text-white mb-2">Coming Soon</p>
        <p>The {title} feature is currently under development.</p>
      </div>
    </div>
  )
}
