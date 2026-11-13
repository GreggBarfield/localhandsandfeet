import Image from "next/image";
import Link from "next/link";
import { Hammer, House, Trees } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Hammer,
    title: "Small Construction & Home Repair",
    body: "Minor home repairs, such as fixing fences, patching drywall, painting, replacing damaged boards, and other basic maintenance tasks.",
  },
  {
    icon: House,
    title: "General Home Maintenance",
    body: "Light interior and exterior clean-up, including organizing spaces, decluttering, minor weatherproofing, or other small tasks.",
  },
  {
    icon: Trees,
    title: "Lawn & Garden",
    body: "Yard maintenance, including mowing, trimming, raking leaves, planting flowers, spreading mulch, and pulling weeds.",
  },
];

const ctaClass = "bg-amber-400 text-black hover:bg-amber-300";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden text-white">
        <Image
          src="/images/home_banner_2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-top"
        />
        <div className="absolute inset-0 -z-10 bg-black/50" />
        <div className="mx-auto w-full max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-serif text-4xl italic md:text-5xl">Come Together to</p>
            <h1 className="text-6xl font-bold md:text-8xl">Help People.</h1>
            <p className="mb-8 mt-4 text-xl text-white/90">
              Sharing the Love of Christ by creating local partnerships between volunteers and those in need.
            </p>
            <Button asChild size="lg" className="bg-zinc-900 text-white hover:bg-zinc-800">
              <Link href="/volunteer">Volunteer Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="rounded-3xl bg-white p-8 shadow-lg md:p-12">
            <div className="grid gap-10 md:grid-cols-3">
              {services.map(({ icon: Icon, title, body }) => (
                <div key={title} className="text-center">
                  <Icon className="mx-auto size-12 text-[#364E08]" aria-hidden />
                  <h2 className="mt-4 pb-2 text-lg font-bold">{title}</h2>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 space-y-4">
              <p>
                We are blessed to be able to serve our community by offering volunteer-based projects that provide
                much-needed assistance to individuals and families. While some projects may be beyond the scope of what
                our volunteers can accomplish, we encourage you to reach out and let us know your needs. If we are
                unable to complete a project ourselves, we will do our best to connect you with the appropriate
                resources, organizations, or skilled professionals who may be able to help.
              </p>
              <p>
                Above all, we believe in the power of community and faith. No challenge is too big for God to handle,
                and together, we can make a meaningful impact in the lives of those around us. If you or someone you
                know could use a helping hand, please don’t hesitate to reach out!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission + Faith in Action */}
      <section className="py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-20 px-5 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="pb-3 text-4xl font-bold">Advancing our Mission</h2>
              <p className="text-lg">
                Local Hands and Feet is a faith-driven initiative led by members of{" "}
                <a
                  href="https://fmcbryan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline underline-offset-4"
                >
                  First Methodist Church in Bryan, TX
                </a>
                , dedicated to matching volunteers with meaningful service opportunities in the Brazos Valley. Rooted in
                Christ’s call to serve others, this initiative seeks to embody the love of Jesus through tangible acts
                of kindness. Our mission is twofold:
              </p>
              <ol className="mt-4 list-decimal space-y-3 pl-6">
                <li>
                  <b>Missions</b> – Providing assistance to those in need who may have no other means of receiving help.
                  This includes projects such as minor home repairs, wheelchair ramp construction, yard maintenance, and other essential home
                  improvements.
                </li>
                <li>
                  <b>Evangelism</b> – Creating opportunities to connect with individuals by showcasing the love of
                  Christ through service. By fostering relationships through these efforts, we hope to introduce more
                  people to Jesus Christ and encourage deeper spiritual engagement.
                </li>
              </ol>
              <Image
                src="/images/FMC Logo w Text.png"
                alt="First Methodist Church Bryan"
                width={160}
                height={160}
                className="mt-6"
              />
            </div>
            <Image
              src="/images/non_profit_2.jpg"
              alt="Volunteers serving the community"
              width={1252}
              height={836}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full rounded-2xl"
            />
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Image
              src="/images/faith_in_action.jpg"
              alt="A volunteer team at work"
              width={1252}
              height={836}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full rounded-2xl"
            />
            <div>
              <h2 className="pb-3 text-4xl font-bold">Faith in Action</h2>
              <p className="text-lg">Our vision for Local Hands and Feet is grounded in scripture:</p>
              <ul className="mt-4 list-disc space-y-3 pl-6">
                <li>
                  <i>“Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.”</i>{" "}
                  – Matthew 5:16
                </li>
                <li>
                  <i>“For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.”</i>{" "}
                  – Mark 10:45
                </li>
              </ul>
              <p className="mt-4 text-lg">
                We believe that service is one of the most powerful ways to demonstrate God’s love. Through this
                initiative, we aim to be the hands and feet of Jesus, reaching out to our community with compassion,
                humility, and generosity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How You Can Help */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid overflow-hidden rounded-3xl bg-amber-100 lg:grid-cols-2">
            <Image
              src="/images/how_to_help.jpg"
              alt="How to help"
              width={1160}
              height={1356}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-full w-full object-cover"
            />
            <div className="p-8 md:p-12">
              <h2 className="pb-8 text-4xl font-bold md:text-5xl">How You Can Help</h2>
              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-bold">Volunteer</h3>
                  <p className="mb-5 mt-2 text-muted-foreground">
                    Make a difference in your local community by serving others as an expression of Jesus’ love.
                    Whether it’s feeding the hungry, caring for the elderly, or supporting families in need, your time
                    and kindness can be a light in someone’s life. Join us in living out Christ’s calling to love and
                    serve—because together, we can bring hope and healing to those around us.
                  </p>
                  <Button asChild size="lg" className={ctaClass}>
                    <Link href="/volunteer">Volunteer Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
