import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IOSCard, IOSCardHeader, IOSCardTitle, IOSCardContent } from '@/components/ui/ios-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Star, 
  Camera, 
  Upload,
  X,
  Play,
  Pause
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage, db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';

interface TimelineItem {
  id: string;
  type: 'photo' | 'video' | 'milestone';
  title: string;
  description: string;
  fileUrl: string;
  thumbnailUrl?: string;
  timestamp: Date;
  tags: string[];
  relatedActivityId?: string;
}

interface VisualTimelineProps {
  babyId: string;
  activities: any[];
}

export default function VisualTimeline({ babyId, activities }: VisualTimelineProps) {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'babies', babyId, 'timeline'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate()
        } as TimelineItem;
      }));
      
      // Sort by timestamp, newest first
      setTimelineItems(items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    });

    return () => unsubscribe();
  }, [babyId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    setLoading(true);
    try {
      // Upload file to Firebase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, `babies/${babyId}/timeline/${fileName}`);
      await uploadBytes(storageRef, selectedFile);
      
      // Get download URL
      const fileUrl = await getDownloadURL(storageRef);
      
      // Generate thumbnail for videos
      let thumbnailUrl:string | undefined = undefined;
      if (selectedFile.type.startsWith('video/')) {
        // For videos, we'll use a placeholder thumbnail
        // In a real app, you'd generate a proper thumbnail
        thumbnailUrl = '/video-thumbnail-placeholder.png';
      }

      // Add to Firestore
      await addDoc(collection(db, 'babies', babyId, 'timeline'), {
        type: selectedFile.type.startsWith('image/') ? 'photo' : 'video',
        title: title.trim(),
        description: description.trim(),
        fileUrl,
        thumbnailUrl,
        timestamp: new Date(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        relatedActivityId: selectedActivityId || undefined
      });

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setTitle('');
      setDescription('');
      setTags('');
      setSelectedActivityId('');
      setIsDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string, fileUrl: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'babies', babyId, 'timeline', itemId));
      
      // Delete from Storage
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting timeline item:', error);
    }
  };

  const toggleVideoPlay = (itemId: string) => {
    if (playingVideo === itemId) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setPlayingVideo(null);
    } else {
      setPlayingVideo(itemId);
    }
  };

  const formatTags = (tags: string[]) => {
    return tags.slice(0, 3).map(tag => (
      <Badge key={tag} variant="secondary" className="text-xs">
        {tag}
      </Badge>
    ));
  };

  const getRelatedActivity = (activityId: string) => {
    return activities.find(a => a.id === activityId);
  };

  return (
    <IOSCard variant="glass" intensity="medium">
      <IOSCardHeader>
        <IOSCardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Visual Timeline</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Memory
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add to Timeline</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Photo or Video</Label>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                
                {previewUrl && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="mt-2 rounded-lg overflow-hidden">
                      {selectedFile?.type.startsWith('image/') ? (
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <video 
                          src={previewUrl} 
                          className="w-full h-48 object-cover"
                          controls={false}
                        />
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for this memory"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this moment..."
                    className="w-full p-2 border border-border rounded-md bg-background min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., milestone, cute, first-time"
                  />
                </div>
                
                <div>
                  <Label htmlFor="activity">Related Activity (optional)</Label>
                  <select
                    id="activity"
                    title='Related activity'
                    value={selectedActivityId}
                    onChange={(e) => setSelectedActivityId(e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="">Select an activity</option>
                    {activities.slice(0, 10).map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.type} - {new Date(activity.timestamp).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || !title.trim() || loading}
                  className="w-full"
                >
                  {loading ? 'Uploading...' : 'Upload to Timeline'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </IOSCardTitle>
      </IOSCardHeader>
      <IOSCardContent>
        <div className="space-y-4">
          {timelineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No memories yet</p>
              <p className="text-sm mt-2">Add photos and videos to create a beautiful timeline</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timelineItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group relative"
                >
                  <IOSCard variant="glass" intensity="low" className="overflow-hidden">
                    <div className="aspect-square relative overflow-hidden">
                      {item.type === 'photo' ? (
                        <img 
                          src={item.fileUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video
                            ref={playingVideo === item.id ? videoRef : undefined}
                            src={item.fileUrl}
                            className="w-full h-full object-cover"
                            controls={false}
                            onPlay={() => setPlayingVideo(item.id)}
                            onPause={() => setPlayingVideo(null)}
                          />
                          {playingVideo !== item.id && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="lg"
                                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30"
                                onClick={() => toggleVideoPlay(item.id)}
                              >
                                <Play className="h-8 w-8 text-white" />
                              </Button>
                            </div>
                          )}
                          {playingVideo === item.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                              onClick={() => toggleVideoPlay(item.id)}
                            >
                              <Pause className="h-4 w-4 text-white" />
                            </Button>
                          )}
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.type === 'photo' ? (
                            <ImageIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <Video className="h-3 w-3 mr-1" />
                          )}
                          {item.type}
                        </Badge>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-destructive/20 hover:bg-destructive/30 text-destructive"
                        onClick={() => handleDelete(item.id, item.fileUrl)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <IOSCardContent className="p-3">
                      <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {formatTags(item.tags)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      
                      {item.relatedActivityId && (
                        <div className="mt-2 pt-2 border-t border-border/20">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-muted-foreground">
                              Related to {getRelatedActivity(item.relatedActivityId)?.type || 'activity'}
                            </span>
                          </div>
                        </div>
                      )}
                    </IOSCardContent>
                  </IOSCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </IOSCardContent>
    </IOSCard>
  );
}