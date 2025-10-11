"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  SquareCheck,
  Plus,
  Edit,
  X,
  ShoppingBag,
  Shirt,
  ChefHat,
  Home,
  Heart,
  Book,
  Car,
  Stethoscope,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { IOSCard, IOSCardContent } from "@/components/ui/ios-card";

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  tag: string;
  completed: boolean;
  createdAt: Date;
  userId: string;
}

const TAGS = [
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'bg-sky-100 text-sky-800' },
  { value: 'laundry', label: 'Laundry', icon: Shirt, color: 'bg-green-100 text-green-800' },
  { value: 'meal-prep', label: 'Meal Prep', icon: ChefHat, color: 'bg-orange-100 text-orange-800' },
  { value: 'household', label: 'Household', icon: Home, color: 'bg-amber-100 text-amber-800' },
  { value: 'baby-care', label: 'Baby Care', icon: Heart, color: 'bg-pink-100 text-pink-800' },
  { value: 'learning', label: 'Learning', icon: Book, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'transportation', label: 'Transportation', icon: Car, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'medical', label: 'Medical', icon: Stethoscope, color: 'bg-red-100 text-red-800' },
];

export default function TodoPage() {
  const [user, setUser] = useState<any>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const { toast } = useToast();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('shopping');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTodos(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTodos = async (userId: string) => {
    const q = query(collection(db, "users", userId, "todos"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const todosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as TodoItem[];

    // Sort by creation date (newest first)
    todosData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    setTodos(todosData);
  };

  const addTodo = async () => {
    if (!user || !title.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "todos"), {
        title: title.trim(),
        description: description.trim(),
        tag,
        completed: false,
        createdAt: new Date(),
        userId: user.uid
      });

      setTodos(prev => [{
        id: docRef.id,
        title: title.trim(),
        description: description.trim(),
        tag,
        completed: false,
        createdAt: new Date(),
        userId: user.uid
      }, ...prev]);

      setIsDialogOpen(false);
      resetForm();

      // Show success toast
      toast({
        title: "Task Added!",
        description: "New task has been added to your to-do list.",
      });
    } catch (error) {
      console.error("Error adding todo: ", error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateTodo = async (id: string, updates: Partial<TodoItem>) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid, "todos", id), updates);
      setTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      ));

      // Show success toast for completion toggle
      if ('completed' in updates) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
          toast({
            title: updates.completed ? "Task Completed!" : "Task Reopened!",
            description: updates.completed
              ? "Great job! Task marked as completed."
              : "Task has been marked as active.",
          });
        }
      }
    } catch (error) {
      console.error("Error updating todo: ", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const todoToDelete = todos.find(t => t.id === id);
      await deleteDoc(doc(db, "users", user.uid, "todos", id));
      setTodos(prev => prev.filter(todo => todo.id !== id));

      // Show success toast
      if (todoToDelete) {
        toast({
          title: "Task Deleted!",
          description: `"${todoToDelete.title}" has been removed from your to-do list.`,
        });
      }
    } catch (error) {
      console.error("Error deleting todo: ", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      updateTodo(id, { completed: !todo.completed });
    }
  };

  const openEditDialog = (todo: TodoItem) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description || '');
    setTag(todo.tag);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTag('shopping');
    setEditingTodo(null);
  };

  const getTagInfo = (tagValue: string) => {
    return TAGS.find(t => t.value === tagValue) || TAGS[0];
  };

  const filteredTodos = todos.filter(todo => {
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed);

    const matchesTag = selectedTag === 'all' || todo.tag === selectedTag;

    return matchesFilter && matchesTag;
  });

  const getTagStats = () => {
    const stats: { [key: string]: { total: number; completed: number } } = {};

    TAGS.forEach(tag => {
      stats[tag.value] = { total: 0, completed: 0 };
    });

    todos.forEach(todo => {
      if (stats[todo.tag]) {
        stats[todo.tag].total++;
        if (todo.completed) {
          stats[todo.tag].completed++;
        }
      }
    });

    return stats;
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <SquareCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please sign in to view your to-do list.</p>
        </div>
      </div>
    );
  }

  const tagStats = getTagStats();

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-amber-600 rounded-full flex items-center justify-center">
                <SquareCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-amber-600 bg-clip-text text-transparent">
                  To-Do List
                </h1>
                <p className="text-muted-foreground">Manage your parenting tasks and activities</p>
              </div>
            </div>

            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-sky-600 to-amber-600 hover:from-sky-700 hover:to-amber-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <IOSCard variant="glass" className="h-full flex justify-center items-center">
              <IOSCardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1 text-sky-600">{todos.length}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </IOSCardContent>
            </IOSCard>
            <IOSCard variant="glass" className="h-full flex justify-center items-center">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1 text-green-600">
                  {todos.filter(t => t.completed).length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </IOSCard>
            <IOSCard variant="glass" className="h-full flex justify-center items-center">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1 text-orange-600">
                  {todos.filter(t => !t.completed).length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </CardContent>
            </IOSCard>
            <IOSCard variant="glass" className="h-full flex justify-center items-center">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1 text-amber-600">
                  {Math.round((todos.filter(t => t.completed).length / todos.length) * 100) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </CardContent>
            </IOSCard>
          </div>

          {/* Tag Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {TAGS.map((tagInfo) => (
              <IOSCard key={tagInfo.value} variant="glass" className="bg-background/60 backdrop-blur-sm border-border/40">
                <IOSCardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <tagInfo.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-grow">
                      <div className="font-medium text-sm">{tagInfo.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {tagStats[tagInfo.value].completed} / {tagStats[tagInfo.value].total}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {tagStats[tagInfo.value].total > 0
                          ? Math.round((tagStats[tagInfo.value].completed / tagStats[tagInfo.value].total) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${tagInfo.color.split(' ')[0]}`}
                      style={{
                        width: tagStats[tagInfo.value].total > 0
                          ? `${(tagStats[tagInfo.value].completed / tagStats[tagInfo.value].total) * 100}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </IOSCardContent>
              </IOSCard>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex space-x-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                ].map((filterOption) => (
                  <Button
                    key={filterOption.value}
                    variant={filter === filterOption.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(filterOption.value as any)}
                    className="text-xs"
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Tag:</span>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {TAGS.map(tag => (
                    <SelectItem key={tag.value} value={tag.value}>
                      {tag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Todo List */}
          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <IOSCard variant="glass" className="h-full flex justify-center items-center">
                <CardContent className="text-center py-12">
                  <SquareCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground mb-6">Add your first parenting task to get started</p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-sky-600 to-amber-600 hover:from-sky-700 hover:to-amber-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Task
                  </Button>
                </CardContent>
              </IOSCard>
            ) : (
              filteredTodos.map((todo) => {
                const tagInfo = getTagInfo(todo.tag);
                return (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <IOSCard variant="glass" className={`bg-background/60 backdrop-blur-sm border-border/40 transition-all duration-200 ${todo.completed ? 'opacity-75' : ''
                      }`}>
                      <IOSCardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTodo(todo.id)}
                            className={`mt-1 p-2 h-8 w-8 rounded-full ${todo.completed
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                          >
                            {todo.completed ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />}
                          </Button>

                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {todo.title}
                              </h3>
                              <Badge className={tagInfo.color}>
                                <tagInfo.icon className="h-3 w-3 mr-1" />
                                {tagInfo.label}
                              </Badge>
                            </div>

                            {todo.description && (
                              <p className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                                {todo.description}
                              </p>
                            )}

                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span>Created: {todo.createdAt.toLocaleDateString()}</span>
                              {todo.completed && (
                                <span className="text-green-600">Completed</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(todo)}
                              className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTodo(todo.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </IOSCardContent>
                    </IOSCard>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Todo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md bg-transparent p-0">
        <IOSCard variant="glass" className="w-full h-full p-6">
            <DialogHeader>
              <DialogTitle>
                {editingTodo ? 'Edit Task' : 'Add New Task'}
              </DialogTitle>
              <DialogDescription>
                {editingTodo ? 'Update your task details' : 'Add a new task to your to-do list'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add task description (optional)..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tag</label>
                <Select value={tag} onValueChange={setTag}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAGS.map(tagInfo => (
                      <SelectItem key={tagInfo.value} value={tagInfo.value}>
                        <div className="flex items-center space-x-2">
                          <tagInfo.icon className="h-4 w-4" />
                          <span>{tagInfo.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => {
                    if (editingTodo) {
                      updateTodo(editingTodo.id, { title: title.trim(), description: description.trim(), tag });
                    } else {
                      addTodo();
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-sky-600 to-amber-600 hover:from-sky-700 hover:to-amber-700"
                  disabled={!title.trim()}
                >
                  {editingTodo ? 'Update Task' : 'Add Task'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
        </IOSCard>
          </DialogContent>
      </Dialog>
    </div>
  );
}