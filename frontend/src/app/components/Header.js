import Link from 'next/link';

export function Header () {
  return (
    <header className="header">
      <Link href="/">
        <img src="/logo.JPG" alt="Wild Threads" className="header-image cursor-pointer" />
      </Link>
    </header>
  );
};


