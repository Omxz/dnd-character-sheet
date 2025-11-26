import Link from "next/link";
import { Dices, Users, Shield, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dices className="w-8 h-8 text-amber-500" />
            <span className="text-xl font-bold">D&D Sheets</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Your Adventure
            <br />
            <span className="text-amber-500">Awaits</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Create and manage your D&D 5e characters with ease. Track your stats,
            spells, and inventory. Roll dice with animated effects. Share with your party.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-amber-600 hover:bg-amber-700 rounded-lg text-lg font-medium transition-colors"
            >
              Create Your Character
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Dices className="w-8 h-8" />}
              title="Animated Dice"
              description="Roll dice with satisfying animations and sound effects. Click any stat to roll instantly."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Character Builder"
              description="Step-by-step character creation using official 2024 Player's Handbook rules."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Party System"
              description="Create parties and share characters. See real-time updates during sessions."
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Spell Management"
              description="Track spell slots, prepared spells, and cast with a single click."
            />
          </div>
        </section>

        {/* Supported Content */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-gray-800/50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">
              Powered by 2024 Player&apos;s Handbook
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-amber-500 mb-2">12</div>
                <div className="text-gray-400">Classes</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-500 mb-2">10+</div>
                <div className="text-gray-400">Races</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-500 mb-2">300+</div>
                <div className="text-gray-400">Spells</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Roll?</h2>
          <p className="text-gray-400 mb-8">
            Create your free account and start building your character today.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-amber-600 hover:bg-amber-700 rounded-lg text-lg font-medium transition-colors"
          >
            Get Started Free
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Dices className="w-5 h-5" />
            <span>D&D Sheets</span>
          </div>
          <p className="text-gray-500 text-sm">
            Not affiliated with Wizards of the Coast. D&D content used under OGL.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-600/20 text-amber-500 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
