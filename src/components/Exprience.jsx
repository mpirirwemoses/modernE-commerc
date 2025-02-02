const Exprience = ({title,description,period}) => {
    return (   <div className="bg-purple-800  hover:scale-110  transition-transform hover:text-blue-600 p-6 rounded-lg shadow-md text-white">
        <h3 className="text-3xl font-bold mb-2">{title}</h3>
        <p className="text-2xl">{description}</p>
        <span className="block mt-4 text-xl text-gray-400">{period}</span>
      </div> );
}
 
export default Exprience;