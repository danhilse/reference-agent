import Image from "next/image";
import ReferenceSearch from "~/components/reference-search";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-background)]">
      <div className="container-acton py-8">
        <div className="mb-8 flex flex-col items-center gap-6">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-QeR7XHkv78gXqGGllmqPRBmwwBJUl5.svg"
            alt="Act-On Logo"
            width={150}
            height={55}
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[var(--text)]">
              Customer Reference Agent
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
