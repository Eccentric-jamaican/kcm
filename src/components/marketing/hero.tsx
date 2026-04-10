import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
)

const PlayIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)

const StarIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#24A1DE">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const socialProofAvatars = [
  { name: "Alicia", initials: "AL", src: "https://i.pravatar.cc/80?img=32" },
  { name: "Brandon", initials: "BK", src: "https://i.pravatar.cc/80?img=15" },
  { name: "Camila", initials: "CM", src: "https://i.pravatar.cc/80?img=48" },
  { name: "Darius", initials: "DT", src: "https://i.pravatar.cc/80?img=57" },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-white pt-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-bull/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-bear/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <Link 
            href="https://t.me/yourtelegramgroup" 
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-bull/20 bg-bull/5 px-4 py-2 text-xs font-medium uppercase tracking-wider text-bull backdrop-blur-sm transition-colors hover:bg-bull/10"
          >
            <TelegramIcon />
            <span>Join telegram group</span>
          </Link>

          <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
            Explode your trading skills
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Learn a stress free trading strategy that aligns with your time schedule, allows time away from the charts and drives consistency
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" className="h-12 bg-bull px-8 text-sm font-semibold text-bull-foreground shadow-lg shadow-bull/25 transition-all hover:bg-bull/90 hover:shadow-bull/40 hover:-translate-y-0.5">
              <Link href="https://app.kcmtrades.com" className="flex items-center gap-2">
                Start Learning
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 border-border/50 bg-white/50 px-8 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/80 hover:-translate-y-0.5">
              <Link href="#courses" className="flex items-center gap-2">
                <PlayIcon />
                Explore Courses
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <AvatarGroup>
              {socialProofAvatars.map((person) => (
                <Avatar key={person.initials} size="lg" className="shadow-sm">
                  <AvatarImage src={person.src} alt={`${person.name} student profile`} />
                  <AvatarFallback className="bg-gradient-to-br from-muted to-muted/80 text-xs font-semibold text-foreground">
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+400</AvatarGroupCount>
            </AvatarGroup>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="h-3.5 w-3.5 text-bull" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Trusted by <span className="font-semibold text-foreground">400+</span> students
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
