export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white border border-hsbc-border rounded-md p-5 transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
