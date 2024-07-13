export default function Home() {
  return (
    <div className="w-full">
      <div className="text-gray-700">
        <label 
          htmlFor="search"
        >
          Pesquisar pergunta:
        </label>
        <input 
          type="text" 
          name="search" 
          placeholder="Como eu faço...?"
          className="w-full p-4 mt-2 mb-6 text-gray-800 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500" 
        />
      </div>
    </div>
  );
}
