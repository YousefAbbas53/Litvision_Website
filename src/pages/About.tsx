import Layout from "@/components/Layout";
import { BookOpen, Heart, Users, Globe } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <BookOpen className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">About Livision</h1>
          <p className="text-lg text-muted-foreground">
            Your gateway to endless stories and captivating narratives.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 mb-8">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            At Livision, we believe that stories have the power to transform lives, inspire creativity, 
            and connect people across cultures. Our mission is to make reading accessible, enjoyable, 
            and immersive for everyone.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether you're looking for thrilling adventures, heartwarming romances, mind-bending mysteries, 
            or thought-provoking literature, Livision has something for every reader.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl border border-border p-6 text-center hover-lift">
            <Heart className="w-10 h-10 text-accent mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Curated Content</h3>
            <p className="text-sm text-muted-foreground">
              Hand-picked books for quality reading experience
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 text-center hover-lift">
            <Users className="w-10 h-10 text-accent mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Community</h3>
            <p className="text-sm text-muted-foreground">
              Connect with fellow readers worldwide
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 text-center hover-lift">
            <Globe className="w-10 h-10 text-accent mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Accessible</h3>
            <p className="text-sm text-muted-foreground">
              Read anywhere, anytime on any device
            </p>
          </div>
        </div>

        
      </div>
    </Layout>
  );
};

export default About;
