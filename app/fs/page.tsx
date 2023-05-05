"use client";
import React from 'react'

const FileSystem = () => {
  const [files, setFiles ] = React.useState([])
  const getFiles = async () => {
    const files = await fetch('api/fs').then(res => res.json())
    console.log(files)
    setFiles(files)
  }
  return (
    <div>
      <button onClick={getFiles} className='rounded bg-slate-100 p-2 hover:bg-slate-300'>Get Files</button>
      <div className="container text-slate-100 my-4 p-4 border border-stone-400">
        {/* List all files */}
        {files.map((file, i) => (
          <div key={i} className="flex justify-between items-center p-2 border-b border-slate-100">
            <span>{file}</span>
            </div>
        ))}

      </div>
    </div>
  )
}

export default FileSystem
