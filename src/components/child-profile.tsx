import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { IOSCard, IOSCardHeader, IOSCardTitle, IOSCardContent } from '@/components/ui/ios-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Edit, 
  BookOpen, 
  Brain, 
  Calendar, 
  Scale, 
  Ruler, 
  Heart,
  Sparkles,
  Save,
  Plus,
  Shield
} from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// import ZAI from 'z-ai-web-dev-sdk';

interface ChildProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  birthWeight: number; // in kg
  birthHeight: number; // in cm
  currentWeight?: number;
  currentHeight?: number;
  bloodType?: string;
  allergies: string[];
  medicalConditions: string[];
  pediatrician: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EducationalContent {
  id: string;
  title: string;
  content: string;
  category: 'development' | 'health' | 'nutrition' | 'safety' | 'sleep';
  ageRange: string;
  tags: string[];
  createdAt: Date;
}

interface ChildProfileProps {
  babyId: string;
  currentAge: number; // in months
}

export default function ChildProfile({ babyId, currentAge }: ChildProfileProps) {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [educationalContent, setEducationalContent] = useState<EducationalContent[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ChildProfile>>({});

  useEffect(() => {
    const profileRef = doc(db, 'babies', babyId, 'profile', 'main');
    const unsubscribe = onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfile({
          id: doc.id,
          ...data,
          birthDate: data.birthDate,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as ChildProfile);
        setEditForm(data);
      }
    });

    return () => unsubscribe();
  }, [babyId]);

  useEffect(() => {
    loadEducationalContent();
  }, [currentAge]);

  const loadEducationalContent = async () => {
    try {
      const contentRef = doc(db, 'babies', babyId, 'educationalContent', 'current');
      const docSnap = await getDoc(contentRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEducationalContent(data.content || []);
      } else {
        // Generate initial content
        await generateEducationalContent();
      }
    } catch (error) {
      console.error('Error loading educational content:', error);
    }
  };

  const generateEducationalContent = async () => {
    setIsGeneratingContent(true);
    try {
      // Mock educational content for demo purposes since ZAI SDK is server-side only
      const mockContent = [
        {
          category: 'development',
          title: `${currentAge}-Month Developmental Milestones`,
          content: `At ${currentAge} months, your baby is developing new skills rapidly. Most babies this age can sit up without support, may be starting to crawl, and are becoming more interactive. They're also developing their fine motor skills and may be able to pick up small objects.`,
          tags: ['development', 'milestones', 'motor skills']
        },
        {
          category: 'health',
          title: 'Common Health Concerns',
          content: `At ${currentAge} months, it's important to watch for signs of illness such as fever, unusual fussiness, or changes in eating habits. Keep up with regular check-ups and vaccinations, and always consult your pediatrician if you have concerns.`,
          tags: ['health', 'wellness', 'check-ups']
        },
        {
          category: 'nutrition',
          title: 'Feeding Guidelines',
          content: `Your ${currentAge}-month-old should be eating a variety of solid foods 3-4 times per day, along with breast milk or formula. Introduce new foods one at a time and watch for allergic reactions. Avoid honey, cow's milk, and choking hazards.`,
          tags: ['nutrition', 'feeding', 'solid foods']
        },
        {
          category: 'safety',
          title: 'Babyproofing Your Home',
          content: `As your baby becomes more mobile at ${currentAge} months, it's crucial to babyproof your home. Cover electrical outlets, secure furniture to walls, install safety gates, and keep small objects out of reach. Never leave your baby unattended on elevated surfaces.`,
          tags: ['safety', 'babyproofing', 'prevention']
        },
        {
          category: 'sleep',
          title: 'Sleep Patterns and Tips',
          content: `At ${currentAge} months, most babies need 12-16 hours of sleep per day, including naps. Establish a consistent bedtime routine and create a sleep-conducive environment. Most babies this age can sleep through the night but may still wake occasionally.`,
          tags: ['sleep', 'routine', 'rest']
        }
      ];
      
      const educationalContentWithIds: EducationalContent[] = mockContent.map((item: any, index: number) => ({
        id: `content-${Date.now()}-${index}`,
        ...item,
        ageRange: `${currentAge} months`,
        createdAt: new Date()
      }));

      setEducationalContent(educationalContentWithIds);
      
      // Save to Firestore
      await setDoc(doc(db, 'babies', babyId, 'educationalContent', 'current'), {
        content: educationalContentWithIds,
        generatedAt: new Date(),
        ageMonths: currentAge
      });
    } catch (error) {
      console.error('Error generating educational content:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const updatedProfile = {
        ...profile,
        ...editForm,
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'babies', babyId, 'profile', 'main'), updatedProfile);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30.44);
    const days = diffDays % 30;
    return `${months} months, ${days} days`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'development': return <Brain className="h-4 w-4" />;
      case 'health': return <Heart className="h-4 w-4" />;
      case 'nutrition': return <Scale className="h-4 w-4" />;
      case 'safety': return <Shield className="h-4 w-4" />;
      case 'sleep': return <Calendar className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'development': return 'bg-purple-500';
      case 'health': return 'bg-red-500';
      case 'nutrition': return 'bg-green-500';
      case 'safety': return 'bg-blue-500';
      case 'sleep': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  if (!profile) {
    return (
      <IOSCard variant="glass" intensity="medium">
        <IOSCardContent className="text-center py-8">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No profile set up yet</p>
          <Button className="mt-4" onClick={() => setIsEditDialogOpen(true)}>
            Create Profile
          </Button>
        </IOSCardContent>
      </IOSCard>
    );
  }
  console.log(isEditDialogOpen)

  return (
    <div className="space-y-6">
      {/* Child Profile Card */}
      <IOSCard variant="glass" intensity="medium">
        <IOSCardHeader>
          <IOSCardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Child Profile</span>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Child Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="Enter child's name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="birthDate">Birth Date *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={editForm.birthDate || ''}
                      onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={editForm.gender} onValueChange={(value) => setEditForm({...editForm, gender: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthWeight">Birth Weight (kg)</Label>
                      <Input
                        id="birthWeight"
                        type="number"
                        step="0.01"
                        value={editForm.birthWeight || ''}
                        onChange={(e) => setEditForm({...editForm, birthWeight: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthHeight">Birth Height (cm)</Label>
                      <Input
                        id="birthHeight"
                        type="number"
                        step="0.1"
                        value={editForm.birthHeight || ''}
                        onChange={(e) => setEditForm({...editForm, birthHeight: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Input
                      id="bloodType"
                      value={editForm.bloodType || ''}
                      onChange={(e) => setEditForm({...editForm, bloodType: e.target.value})}
                      placeholder="e.g., A+, O-, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pediatrician">Pediatrician</Label>
                    <Input
                      id="pediatrician"
                      value={editForm.pediatrician || ''}
                      onChange={(e) => setEditForm({...editForm, pediatrician: e.target.value})}
                      placeholder="Dr. Name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                    <Input
                      id="allergies"
                      value={editForm.allergies?.join(', ') || ''}
                      onChange={(e) => setEditForm({...editForm, allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)})}
                      placeholder="e.g., Peanuts, Dairy, Eggs"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      placeholder="Any additional notes..."
                      rows={3}
                    />
                  </div>
                  
                  <Button onClick={handleSaveProfile} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{profile.gender}</span>
                  <span>•</span>
                  <span>{calculateAge(profile.birthDate)}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-background/40 rounded-lg">
                <Scale className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Birth Weight</p>
                <p className="font-medium">{profile.birthWeight} kg</p>
              </div>
              <div className="text-center p-3 bg-background/40 rounded-lg">
                <Ruler className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Birth Height</p>
                <p className="font-medium">{profile.birthHeight} cm</p>
              </div>
              <div className="text-center p-3 bg-background/40 rounded-lg">
                <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Blood Type</p>
                <p className="font-medium">{profile.bloodType || 'Not set'}</p>
              </div>
              <div className="text-center p-3 bg-background/40 rounded-lg">
                <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Allergies</p>
                <p className="font-medium">{profile.allergies.length || 'None'}</p>
              </div>
            </div>
            
            {profile.pediatrician && (
              <div className="p-3 bg-background/40 rounded-lg">
                <p className="text-sm font-medium mb-1">Pediatrician</p>
                <p className="text-sm text-muted-foreground">{profile.pediatrician}</p>
              </div>
            )}
            
            {profile.notes && (
              <div className="p-3 bg-background/40 rounded-lg">
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">{profile.notes}</p>
              </div>
            )}
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Educational Content Card */}
      <IOSCard variant="glass" intensity="medium">
        <IOSCardHeader>
          <IOSCardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Educational Content</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateEducationalContent}
              disabled={isGeneratingContent}
            >
              {isGeneratingContent ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent>
          <div className="space-y-4">
            {educationalContent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No educational content available</p>
                <Button className="mt-4" onClick={generateEducationalContent} disabled={isGeneratingContent}>
                  Generate Content
                </Button>
              </div>
            ) : (
              educationalContent.map((content) => (
                <div key={content.id} className="p-4 rounded-lg bg-background/40">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(content.category)}`}>
                      {getCategoryIcon(content.category)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{content.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {content.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {content.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {content.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Age: {content.ageRange}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </IOSCardContent>
      </IOSCard>
    </div>
  );
}