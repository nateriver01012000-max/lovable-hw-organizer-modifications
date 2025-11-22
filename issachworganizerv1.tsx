import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Assignment } from "@/types/assignment";
import Header from "@/components/Header";
import AssignmentCard from "@/components/AssignmentCard";
import AddAssignmentDialog from "@/components/AddAssignmentDialog";
import CalendarView from "@/components/CalendarView";
import AIHelpDialog from "@/components/AIHelpDialog";
import { useToast } from "@/hooks/use-toast";
import { ThemeProvider } from "next-themes";

const Index = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load assignments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("homework-assignments");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAssignments(
        parsed.map((a: any) => ({
          ...a,
          deadline: new Date(a.deadline),
          createdAt: new Date(a.createdAt),
        }))
      );
    }
  }, []);

  // Save assignments to localStorage
  useEffect(() => {
    if (assignments.length > 0) {
      localStorage.setItem("homework-assignments", JSON.stringify(assignments));
    }
  }, [assignments]);

  const handleAddAssignment = (newAssignment: Omit<Assignment, "id" | "completed" | "createdAt">) => {
    const assignment: Assignment = {
      ...newAssignment,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date(),
    };
    
    setAssignments((prev) => [...prev, assignment]);
    toast({
      title: "Assignment added",
      description: `${assignment.name} has been added to your homework list.`,
    });
  };

  const handleToggleComplete = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    toast({
      title: "Assignment deleted",
      description: "The assignment has been removed.",
    });
  };

  const sortedAssignments = [...assignments].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return a.deadline.getTime() - b.deadline.getTime();
  });

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-background">
        <Header
          onCalendarClick={() => setCalendarOpen(true)}
          onAIClick={() => setAIDialogOpen(true)}
        />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {assignments.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-accent flex items-center justify-center">
                  <Plus className="h-10 w-10 text-accent-foreground" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                No assignments yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first assignment
              </p>
              <Button onClick={() => setAddDialogOpen(true)} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Assignment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onToggle={handleToggleComplete}
                  onDelete={handleDeleteAssignment}
                />
              ))}
            </div>
          )}
        </main>

        {/* Floating Action Button */}
        {assignments.length > 0 && (
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        <AddAssignmentDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAdd={handleAddAssignment}
        />

        <CalendarView
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          assignments={assignments}
        />

        <AIHelpDialog open={aiDialogOpen} onOpenChange={setAIDialogOpen} />
      </div>
    </ThemeProvider>
  );
};

export default Index;
