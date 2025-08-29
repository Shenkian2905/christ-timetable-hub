import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GenerationOptions {
  academic_year: string;
  week_type: 'odd' | 'even';
}

interface GenerationResult {
  success: boolean;
  message: string;
  conflicts?: string[];
}

export const useTimetableGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateTimetable = async (options: GenerationOptions): Promise<GenerationResult> => {
    setIsGenerating(true);
    
    try {
      console.log('Starting timetable generation with options:', options);
      
      const { data, error } = await supabase.functions.invoke('generate-timetable', {
        body: options
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        toast({
          title: "Timetable Generated Successfully",
          description: data.message,
        });

        if (data.conflicts && data.conflicts.length > 0) {
          toast({
            title: "Generation Conflicts Detected",
            description: `${data.conflicts.length} conflicts found. Check the dashboard for details.`,
            variant: "destructive",
          });
        }
      } else {
        throw new Error(data.error || 'Generation failed');
      }

      return data;
      
    } catch (error) {
      console.error('Timetable generation failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        message: errorMessage
      };
      
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateTimetable,
    isGenerating
  };
};