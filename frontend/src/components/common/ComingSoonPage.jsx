export default function ComingSoonPage({ title, description }) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{description || "This section is ready in the project structure and can be implemented next."}</p>
    </section>
  );
}
