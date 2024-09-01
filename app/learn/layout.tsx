export default function Layout({
  children,
  avatarai,
  chat
}: {
  children: React.ReactNode
  avatarai: React.ReactNode
  chat: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex' }}>
      <div>{avatarai}</div>
      <div>{chat}</div>
    </div>
  )
}
