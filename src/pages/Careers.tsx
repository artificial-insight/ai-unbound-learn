import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import { MapPin, Briefcase, Clock, DollarSign, Users, Heart, Rocket, Award } from 'lucide-react';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
}

const jobPostings: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    salary: '$140k - $180k',
    description: 'Join our engineering team to build the next generation of online learning platforms.',
    requirements: ['5+ years React/Node.js experience', 'Strong TypeScript skills', 'Experience with cloud platforms'],
  },
  {
    id: '2',
    title: 'Product Designer',
    department: 'Design',
    location: 'New York, NY / Remote',
    type: 'Full-time',
    salary: '$120k - $150k',
    description: 'Create beautiful, intuitive experiences for millions of learners worldwide.',
    requirements: ['3+ years product design experience', 'Figma expertise', 'Strong portfolio'],
  },
  {
    id: '3',
    title: 'Content Strategist',
    department: 'Content',
    location: 'Remote',
    type: 'Full-time',
    salary: '$90k - $120k',
    description: 'Shape our content strategy and help educators create engaging learning experiences.',
    requirements: ['Educational content experience', 'Strong writing skills', 'SEO knowledge'],
  },
  {
    id: '4',
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'London, UK',
    type: 'Full-time',
    salary: '£60k - £80k',
    description: 'Help our enterprise customers succeed and grow with our platform.',
    requirements: ['B2B SaaS experience', 'Excellent communication', 'Problem-solving mindset'],
  },
];

const benefits = [
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision insurance' },
  { icon: DollarSign, title: 'Competitive Salary', description: 'Above-market compensation with equity options' },
  { icon: Clock, title: 'Flexible Schedule', description: 'Work when you\'re most productive with flexible hours' },
  { icon: MapPin, title: 'Remote First', description: 'Work from anywhere with our remote-first culture' },
  { icon: Rocket, title: 'Growth Opportunities', description: 'Professional development budget and learning resources' },
  { icon: Award, title: 'Recognition', description: 'Regular recognition and performance bonuses' },
];

const Careers = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const departments = ['all', ...new Set(jobPostings.map(job => job.department))];
  const filteredJobs = selectedDepartment === 'all' 
    ? jobPostings 
    : jobPostings.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us build the future of education and empower millions of learners worldwide
            </p>
          </div>

          {/* Company Culture */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Our Culture</CardTitle>
              <CardDescription>What makes us different</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Collaborative</h3>
                  <p className="text-sm text-muted-foreground">
                    Work with talented people who are passionate about education
                  </p>
                </div>
                <div className="text-center">
                  <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Innovative</h3>
                  <p className="text-sm text-muted-foreground">
                    Push boundaries and experiment with new technologies
                  </p>
                </div>
                <div className="text-center">
                  <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Impact-Driven</h3>
                  <p className="text-sm text-muted-foreground">
                    Make a real difference in people's lives through education
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Benefits & Perks</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <benefit.icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
            
            <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedDepartment}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {departments.map(dept => (
                  <TabsTrigger key={dept} value={dept} className="capitalize">
                    {dept === 'all' ? 'All Jobs' : dept}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedDepartment} className="space-y-4 mt-6">
                {filteredJobs.map(job => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">
                              <Briefcase className="w-3 h-3 mr-1" />
                              {job.department}
                            </Badge>
                            <Badge variant="secondary">
                              <MapPin className="w-3 h-3 mr-1" />
                              {job.location}
                            </Badge>
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              {job.type}
                            </Badge>
                            <Badge variant="secondary">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {job.salary}
                            </Badge>
                          </div>
                        </div>
                        <Button>Apply Now</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{job.description}</p>
                      <div>
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {job.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* CTA */}
          <Card className="text-center">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">Don't see a role that fits?</h3>
              <p className="text-muted-foreground mb-6">
                We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
              </p>
              <Button size="lg">Send Your Resume</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Careers;
