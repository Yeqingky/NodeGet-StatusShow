export function Background() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden>
      <img
        src="https://api.yppp.net/api.php"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-background/30 dark:bg-background/50 backdrop-blur-sm" />
    </div>
  )
}
