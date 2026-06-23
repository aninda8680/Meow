import LandingNavbar from "@/components/LandingNavbar";
import LandingHero from "@/components/LandingHero";
import LandingFeatures from "@/components/LandingFeatures";
import LandingHowTo from "@/components/LandingHowTo";
import LandingFooter from "@/components/LandingFooter";

export const metadata = {
    title: "Meow - Your Productivity Companion",
    description: "A cool, animated productivity companion focused on deep work and activity tracking.",
};

export default function LandingPage() {
    return (
        <div className="relative min-h-screen text-foreground overflow-x-hidden bg-background">
            <LandingNavbar />

            {/* Hero Section */}
            <section id="hero" className="w-full">
                <LandingHero />
            </section>

            {/* Main Content Sections */}
            <main className="relative z-10 bg-background">
                <div id="features">
                    <LandingFeatures />
                </div>
                <div id="how-to">
                    <LandingHowTo />
                </div>
            </main>

            {/* Footer */}
            <LandingFooter />
        </div>
    );
}
