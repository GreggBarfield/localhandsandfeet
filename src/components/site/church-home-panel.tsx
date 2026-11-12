import Image from "next/image";

export function ChurchHomePanel() {
  return (
    <div>
      <h2 className="mb-3 text-2xl font-bold">Looking for a Church Home?</h2>
      <Image
        src="/images/FMC Logo w Text.png"
        alt="First Methodist Church Bryan"
        width={96}
        height={96}
        className="float-right mb-2 ml-4"
      />
      <p>
        We&apos;d love for you to visit{" "}
        <a href="https://fmcbryan.org" target="_blank" rel="noopener noreferrer" className="underline">
          First Methodist Church in Bryan
        </a>{" "}
        and experience a welcoming community where faith, family, and purpose come together. There are three worship
        options:
      </p>
      <ul className="my-3 list-disc space-y-1 pl-6">
        <li>Traditional Services - 8:30 AM &amp; 11:00 AM - Sanctuary</li>
        <li>The River (Contemporary Service) - 9:00 AM - Gym</li>
        <li>El Rio de Dios (Hispanic Service) - 11:00 AM - Fellowship Hall</li>
      </ul>
      <p className="mb-3">
        <b>Something for Everyone:</b> From engaging kids&apos; programs and dynamic youth groups to meaningful
        connections for adults of all ages, there&apos;s a place for you here!
      </p>
      <p className="mb-3">
        <b>Find Us:</b> 506 E. 28th St., Bryan. TX 77803 [
        <a href="https://maps.app.goo.gl/hBnkZCCfEEGiD7p59" target="_blank" rel="noopener noreferrer" className="underline">
          Here&apos;s a Map
        </a>
        ]
      </p>
      <p className="mb-3">
        <b>Have questions?</b> Call the church at (979) 779-1324 or{" "}
        <a href="https://fmcbryan.org/contact-us" className="underline">Contact Us</a>.
      </p>
      <p>
        <b>We can&apos;t wait to meet you!</b>
      </p>
    </div>
  );
}
