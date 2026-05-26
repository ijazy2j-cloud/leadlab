export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center px-4 min-h-[40px] rounded-md text-sm font-medium transition-colors duration-150 ease active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 select-none';

  const variants = {
    primary: 'bg-hsbc-red text-white hover:bg-[#c4000f] focus-visible:ring-hsbc-red disabled:opacity-40 disabled:cursor-not-allowed',
    secondary: 'bg-white border border-hsbc-border text-hsbc-black hover:border-hsbc-grey focus-visible:ring-hsbc-grey disabled:opacity-40 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-hsbc-grey hover:text-hsbc-black focus-visible:ring-hsbc-grey disabled:opacity-40 disabled:cursor-not-allowed',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
