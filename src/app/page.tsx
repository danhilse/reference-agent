import Image from "next/image";
import ReferenceSearch from "~/components/reference-search";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col items-center gap-6">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-QeR7XHkv78gXqGGllmqPRBmwwBJUl5.svg"
            alt="Act-On Logo"
            width={150}
            height={55}
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
              Reference Search
            </h1>
            <p className="mt-1 text-[var(--text-light)]">
              Find customer quotes and references for sales conversations
            </p>
          </div>
        </div>
        <ReferenceSearch />
      </div>
    </main>
  );
}
