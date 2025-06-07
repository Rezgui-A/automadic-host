
import { supabase } from '../integrations/supabase/client';
import { Action } from '../context/RoutineContext';

export interface Habit {
  id: string;
  user_id: string;
  stack_id: string;
  text: string;
  completed: boolean;
  skipped: boolean;
  streak: number;
  created_at?: string;
  updated_at?: string;
}

export const HabitService = {
  // Convert Actions to Habits for storage
  convertActionToHabit: (action: Action, stackId: string, userId: string): Omit<Habit, 'created_at' | 'updated_at'> => {
    return {
      id: action.id,
      user_id: userId,
      stack_id: stackId,
      text: action.text,
      completed: action.completed,
      skipped: action.skipped,
      streak: action.streak
    };
  },

  // Convert Habits to Actions for the app
  convertHabitToAction: (habit: Habit): Action => {
    return {
      id: habit.id,
      text: habit.text,
      completed: habit.completed,
      skipped: habit.skipped,
      streak: habit.streak
    };
  },

  // Fetch all habits for a specific stack
  getHabitsByStackId: async (stackId: string): Promise<Action[]> => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('stack_id', stackId);

      if (error) {
        console.error('Error fetching habits:', error);
        return [];
      }

      // Convert database habits to application actions
      return data.map(habit => HabitService.convertHabitToAction(habit));
    } catch (error) {
      console.error('Error in getHabitsByStackId:', error);
      return [];
    }
  },

  // Create or update a habit
  saveHabit: async (habit: Omit<Habit, 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('habits')
        .upsert({
          id: habit.id,
          user_id: habit.user_id,
          stack_id: habit.stack_id,
          text: habit.text,
          completed: habit.completed,
          skipped: habit.skipped,
          streak: habit.streak
        });

      if (error) {
        console.error('Error saving habit:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveHabit:', error);
      return false;
    }
  },

  // Delete a habit
  deleteHabit: async (habitId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) {
        console.error('Error deleting habit:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteHabit:', error);
      return false;
    }
  },

  // Batch save multiple habits
  saveHabits: async (habits: Omit<Habit, 'created_at' | 'updated_at'>[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('habits')
        .upsert(habits);

      if (error) {
        console.error('Error batch saving habits:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveHabits:', error);
      return false;
    }
  },

  // Delete all habits for a specific stack
  deleteHabitsByStackId: async (stackId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('stack_id', stackId);

      if (error) {
        console.error('Error deleting habits for stack:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteHabitsByStackId:', error);
      return false;
    }
  }
};
