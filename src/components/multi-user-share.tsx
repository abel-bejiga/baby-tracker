import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IOSCard, IOSCardHeader, IOSCardTitle, IOSCardContent } from '@/components/ui/ios-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, UserMinus, Mail, User as UserIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SharedUser {
  id: string;
  email: string;
  role: 'parent' | 'caregiver' | 'grandparent';
  addedBy: string;
  addedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

interface MultiUserShareProps {
  babyId: string;
  currentUserId: string;
}

export default function MultiUserShare({ babyId, currentUserId }: MultiUserShareProps) {
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'parent' | 'caregiver' | 'grandparent'>('caregiver');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'babies', babyId, 'sharedUsers'), where('status', '==', 'accepted'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt.toDate()
      })) as SharedUser[];
      setSharedUsers(users);
    });

    return () => unsubscribe();
  }, [babyId]);

  const handleAddUser = async () => {
    if (!newUserEmail || !auth.currentUser) return;

    setLoading(true);
    try {
      // Add shared user to Firestore
      await addDoc(collection(db, 'babies', babyId, 'sharedUsers'), {
        email: newUserEmail.toLowerCase(),
        role: newUserRole,
        addedBy: currentUserId,
        addedAt: new Date(),
        status: 'pending'
      });

      // Here you would typically send an email invitation
      // For now, we'll just show a success message
      setNewUserEmail('');
      setNewUserRole('caregiver');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding shared user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'babies', babyId, 'sharedUsers', userId));
    } catch (error) {
      console.error('Error removing shared user:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'parent': return 'bg-blue-500';
      case 'caregiver': return 'bg-green-500';
      case 'grandparent': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <IOSCard variant="glass" intensity="medium">
      <IOSCardHeader>
        <IOSCardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>Shared With</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share with Caregiver</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    title='Role'
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="parent">Parent</option>
                    <option value="caregiver">Caregiver</option>
                    <option value="grandparent">Grandparent</option>
                  </select>
                </div>
                <Button 
                  onClick={handleAddUser} 
                  disabled={!newUserEmail || loading}
                  className="w-full"
                >
                  {loading ? 'Sending invitation...' : 'Send Invitation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </IOSCardTitle>
      </IOSCardHeader>
      <IOSCardContent>
        <div className="space-y-3">
          {sharedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shared users yet</p>
          ) : (
            sharedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-background/40">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Added by {user.addedBy === currentUserId ? 'you' : 'someone else'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </IOSCardContent>
    </IOSCard>
  );
}