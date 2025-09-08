"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FolderOpen, TrendingUp, Users, Shield, Zap } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user) {
      console.log('🔍 Root page: User is authenticated, redirecting to dashboard')
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Only render this page if we're actually on the root path
  if (pathname !== '/') {
    return null;
  }

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '48px', width: '48px', borderBottom: '2px solid #2563eb', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show landing page if user is authenticated
  if (user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '48px', width: '48px', borderBottom: '2px solid #2563eb', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Track time spent on projects and tasks with precision and ease.",
    },
    {
      icon: FolderOpen,
      title: "Project Management",
      description: "Organize and manage projects with intuitive tools and workflows.",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reports",
      description: "Get insights into your productivity and project performance.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with your team members.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security.",
    },
    {
      icon: Zap,
      title: "Fast & Responsive",
      description: "Built with modern technology for the best user experience.",
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #e0e7ff)' }}>
      {/* Navigation */}
      <nav style={{ padding: '1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
            Taskr
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/pricing">
              <Button variant="outline">Pricing</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
            Manage Projects,{" "}
            <span style={{ color: '#2563eb' }}>Track Time</span>,{" "}
            <br />
            Boost Productivity
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '32rem', margin: '0 auto' }}>
            Taskr is the all-in-one platform for project management and time tracking. 
            Stay organized, meet deadlines, and understand how you spend your time.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/auth/signup">
              <Button size="lg" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '5rem 1.5rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Everything you need to succeed
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#6b7280', maxWidth: '48rem', margin: '0 auto' }}>
              Powerful features designed to help you and your team work more efficiently 
              and deliver projects on time.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} style={{ textAlign: 'center', transition: 'box-shadow 0.2s' }}>
                  <CardHeader>
                    <div style={{ margin: '0 auto', width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <Icon style={{ width: '24px', height: '24px', color: '#2563eb' }} />
                    </div>
                    <CardTitle style={{ fontSize: '1.25rem' }}>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription style={{ fontSize: '1rem' }}>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: '#2563eb' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#bfdbfe', marginBottom: '2rem', maxWidth: '32rem', margin: '0 auto' }}>
            Join thousands of teams who are already using Taskr to manage their projects 
            and track their time more effectively.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 1.5rem', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '1rem' }}>
            Taskr
          </div>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Making project management and time tracking simple and effective.
          </p>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            © 2024 Taskr. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
