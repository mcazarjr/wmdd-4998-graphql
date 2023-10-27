const IconButton = ({ onClick, children, className }) => {
  return (
    <button
      className={`font-bold py-2 px-2 text-gray-300 rounded ${className}`}
      onClick={onClick}
    >
      {children ?? "Button"}
    </button>
  );
};

export default IconButton;
