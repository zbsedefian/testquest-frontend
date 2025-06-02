import React from "react";

export default function StyleGuide() {
  return (
    <div className="p-8 space-y-8 text-gray-800 dark:text-white">
      <h1 className="text-4xl font-bold text-center">UI Style Guide</h1>

      {/* Colors */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Colors</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="w-24 h-24 bg-blue-500 rounded shadow-md"></div>
          <div className="w-24 h-24 bg-green-500 rounded shadow-md"></div>
          <div className="w-24 h-24 bg-yellow-500 rounded shadow-md"></div>
          <div className="w-24 h-24 bg-red-500 rounded shadow-md"></div>
          <div className="w-24 h-24 bg-gray-800 rounded shadow-md"></div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Typography</h2>
        <p className="text-sm">Small text</p>
        <p className="text-base">Base text</p>
        <p className="text-lg font-medium">Large medium text</p>
        <p className="text-xl font-semibold">Extra large semi-bold text</p>
        <p className="text-2xl font-bold">2XL bold text</p>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Primary</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Success</button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Warning</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Danger</button>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="text-lg font-bold">Card Title</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Card description goes here.</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="text-lg font-bold">Card Title</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Card description goes here.</p>
          </div>
        </div>
      </section>

      {/* Form Inputs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Form Inputs</h2>
        <form className="space-y-4">
          <input className="block w-full px-4 py-2 border rounded shadow-sm dark:bg-gray-700 dark:text-white" placeholder="Text input" />
          <select className="block w-full px-4 py-2 border rounded shadow-sm dark:bg-gray-700 dark:text-white">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
        </form>
      </section>
    </div>
  );
}
