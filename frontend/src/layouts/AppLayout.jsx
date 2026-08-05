export default function AppLayout({ title, children }) {
  return (
    <main>
      {title ? <h1>{title}</h1> : null}
      {children}
    </main>
  );
}
