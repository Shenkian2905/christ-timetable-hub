import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TimetableSlot {
  day_of_week: number;
  time_slot: string;
  subject_code: string;
  teacher_id: string;
  room_id: string;
  class_group_id: string;
  is_block_hour: boolean;
}

interface GenerationResult {
  success: boolean;
  message: string;
  conflicts?: string[];
  timetable?: TimetableSlot[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { academic_year, week_type } = await req.json();

    if (!academic_year || !week_type) {
      throw new Error('Academic year and week type are required');
    }

    console.log(`Generating timetable for ${academic_year} - ${week_type} week`);

    // Clear existing timetable for this academic year and week type
    await supabase
      .from('timetable_entries')
      .delete()
      .eq('academic_year', academic_year)
      .eq('week_type', week_type);

    // Fetch all necessary data
    const [subjectsResult, teachersResult, roomsResult, classGroupsResult] = await Promise.all([
      supabase.from('subjects').select('*'),
      supabase.from('teachers').select('*'),
      supabase.from('rooms').select('*').order('capacity', { ascending: false }),
      supabase.from('class_groups').select('*')
    ]);

    if (subjectsResult.error || teachersResult.error || roomsResult.error || classGroupsResult.error) {
      throw new Error('Failed to fetch required data');
    }

    const subjects = subjectsResult.data;
    const teachers = teachersResult.data;
    const rooms = roomsResult.data;
    const classGroups = classGroupsResult.data;

    // Define time slots (avoiding lunch break)
    const timeSlots = [
      '08:00-09:00',
      '09:00-10:00', 
      '10:00-11:00',
      '11:15-12:15', // After morning break
      '12:15-13:15',
      '14:15-15:15', // After lunch
      '15:15-16:15'
    ];

    const blockTimeSlots = [
      '08:00-10:00',
      '10:15-12:15',
      '14:15-16:15'
    ];

    const days = [1, 2, 3, 4, 5]; // Monday to Friday
    const saturdays = week_type === 'odd' ? [6] : []; // Only odd weeks have Saturday classes

    const allDays = [...days, ...saturdays];
    const generatedSlots: TimetableSlot[] = [];
    const conflicts: string[] = [];

    // Track daily subject hours to enforce max 3 hours per subject per day
    const dailySubjectHours = new Map<string, number>();

    // Track weekly subject hours to ensure 5 hours total (3 single + 1 block)
    const weeklySubjectHours = new Map<string, number>();

    // Initialize tracking for each class group and subject combination
    for (const group of classGroups) {
      for (const subjectCode of group.subject_codes) {
        weeklySubjectHours.set(`${group.id}-${subjectCode}`, 0);
      }
    }

    function canScheduleSubject(
      day: number, 
      subjectCode: string, 
      groupId: string, 
      isBlock: boolean
    ): boolean {
      const dayKey = `${day}-${groupId}-${subjectCode}`;
      const currentDayHours = dailySubjectHours.get(dayKey) || 0;
      const hoursToAdd = isBlock ? 2 : 1;
      
      // Check constraint: max 3 hours per subject per day
      return currentDayHours + hoursToAdd <= 3;
    }

    function isTeacherAvailable(
      teacherId: string, 
      day: number, 
      timeSlot: string
    ): boolean {
      return !generatedSlots.some(slot => 
        slot.teacher_id === teacherId && 
        slot.day_of_week === day && 
        slot.time_slot === timeSlot
      );
    }

    function isRoomAvailable(
      roomId: string, 
      day: number, 
      timeSlot: string
    ): boolean {
      return !generatedSlots.some(slot => 
        slot.room_id === roomId && 
        slot.day_of_week === day && 
        slot.time_slot === timeSlot
      );
    }

    function findBestRoom(
      subjectCode: string, 
      studentCount: number, 
      day: number, 
      timeSlot: string
    ): string | null {
      const subject = subjects.find(s => s.code === subjectCode);
      const preferredType = subject?.name.includes('Computer') ? 'computer_lab' : 
                           (subject?.name.includes('Biology') || subject?.name.includes('Chemistry') || subject?.name.includes('Physics')) ? 'lab' : 
                           'classroom';

      // First try to find rooms of preferred type with notice board
      let availableRooms = rooms.filter(room => 
        room.room_type === preferredType &&
        room.has_notice_board &&
        room.capacity >= studentCount &&
        isRoomAvailable(room.id, day, timeSlot)
      );

      if (availableRooms.length === 0) {
        // Then try any room type with notice board
        availableRooms = rooms.filter(room => 
          room.has_notice_board &&
          room.capacity >= studentCount &&
          isRoomAvailable(room.id, day, timeSlot)
        );
      }

      if (availableRooms.length === 0) {
        // Finally, any available room with sufficient capacity
        availableRooms = rooms.filter(room => 
          room.capacity >= studentCount &&
          isRoomAvailable(room.id, day, timeSlot)
        );
      }

      return availableRooms.length > 0 ? availableRooms[0].id : null;
    }

    function hasTeacherConflict(
      teacherId: string, 
      subjectCode: string, 
      day: number, 
      timeSlot: string
    ): boolean {
      const teacher = teachers.find(t => t.id === teacherId);
      if (!teacher || !teacher.teaches_both_years) return false;

      const subject = subjects.find(s => s.code === subjectCode);
      if (!subject) return false;

      // Check if teacher has conflicting classes with other year group
      const conflictingYearGroup = subject.year_group === 1 ? 2 : 1;
      const conflictingSubjects = subjects.filter(s => 
        s.year_group === conflictingYearGroup && 
        teacher.subjects.includes(s.code)
      );

      return generatedSlots.some(slot => {
        const slotSubject = subjects.find(s => s.code === slot.subject_code);
        return slot.teacher_id === teacherId && 
               slot.day_of_week === day && 
               slot.time_slot === timeSlot &&
               slotSubject &&
               conflictingSubjects.some(cs => cs.code === slotSubject.code);
      });
    }

    // Phase 1: Schedule block hours (constraint: no blocks on Saturday)
    for (const group of classGroups) {
      for (const subjectCode of group.subject_codes) {
        const subject = subjects.find(s => s.code === subjectCode);
        if (!subject) continue;

        const availableTeachers = teachers.filter(t => t.subjects.includes(subjectCode));
        if (availableTeachers.length === 0) {
          conflicts.push(`No teacher available for ${subject.name}`);
          continue;
        }

        let blockScheduled = false;

        // Try to schedule one block hour (avoid Saturday)
        for (const day of days) { // Only weekdays for block hours
          if (blockScheduled) break;

          for (const timeSlot of blockTimeSlots) {
            if (blockScheduled) break;

            if (!canScheduleSubject(day, subjectCode, group.id, true)) continue;

            for (const teacher of availableTeachers) {
              if (isTeacherAvailable(teacher.id, day, timeSlot) && 
                  !hasTeacherConflict(teacher.id, subjectCode, day, timeSlot)) {
                
                const roomId = findBestRoom(subjectCode, group.student_count, day, timeSlot);
                if (roomId) {
                  generatedSlots.push({
                    day_of_week: day,
                    time_slot: timeSlot,
                    subject_code: subjectCode,
                    teacher_id: teacher.id,
                    room_id: roomId,
                    class_group_id: group.id,
                    is_block_hour: true
                  });

                  // Update tracking
                  const dayKey = `${day}-${group.id}-${subjectCode}`;
                  dailySubjectHours.set(dayKey, (dailySubjectHours.get(dayKey) || 0) + 2);
                  weeklySubjectHours.set(`${group.id}-${subjectCode}`, 2);
                  
                  blockScheduled = true;
                  console.log(`Scheduled block: ${subject.name} for ${group.group_name} on day ${day}`);
                  break;
                }
              }
            }
          }
        }

        if (!blockScheduled) {
          conflicts.push(`Could not schedule block hour for ${subject.name} - ${group.group_name}`);
        }
      }
    }

    // Phase 2: Schedule single hours (3 per subject)
    for (const group of classGroups) {
      for (const subjectCode of group.subject_codes) {
        const subject = subjects.find(s => s.code === subjectCode);
        if (!subject) continue;

        const availableTeachers = teachers.filter(t => t.subjects.includes(subjectCode));
        const currentWeeklyHours = weeklySubjectHours.get(`${group.id}-${subjectCode}`) || 0;
        const requiredSingleHours = 3;
        let scheduledSingleHours = 0;

        for (const day of allDays) {
          if (scheduledSingleHours >= requiredSingleHours) break;

          for (const timeSlot of timeSlots) {
            if (scheduledSingleHours >= requiredSingleHours) break;

            if (!canScheduleSubject(day, subjectCode, group.id, false)) continue;

            for (const teacher of availableTeachers) {
              if (isTeacherAvailable(teacher.id, day, timeSlot) && 
                  !hasTeacherConflict(teacher.id, subjectCode, day, timeSlot)) {
                
                const roomId = findBestRoom(subjectCode, group.student_count, day, timeSlot);
                if (roomId) {
                  generatedSlots.push({
                    day_of_week: day,
                    time_slot: timeSlot,
                    subject_code: subjectCode,
                    teacher_id: teacher.id,
                    room_id: roomId,
                    class_group_id: group.id,
                    is_block_hour: false
                  });

                  // Update tracking
                  const dayKey = `${day}-${group.id}-${subjectCode}`;
                  dailySubjectHours.set(dayKey, (dailySubjectHours.get(dayKey) || 0) + 1);
                  weeklySubjectHours.set(`${group.id}-${subjectCode}`, currentWeeklyHours + scheduledSingleHours + 1);
                  
                  scheduledSingleHours++;
                  console.log(`Scheduled single: ${subject.name} for ${group.group_name} on day ${day}`);
                  break;
                }
              }
            }
          }
        }

        if (scheduledSingleHours < requiredSingleHours) {
          conflicts.push(`Only scheduled ${scheduledSingleHours}/3 single hours for ${subject.name} - ${group.group_name}`);
        }
      }
    }

    // Save generated timetable to database
    if (generatedSlots.length > 0) {
      const { error: insertError } = await supabase
        .from('timetable_entries')
        .insert(
          generatedSlots.map(slot => ({
            ...slot,
            academic_year,
            week_type
          }))
        );

      if (insertError) {
        throw new Error(`Failed to save timetable: ${insertError.message}`);
      }
    }

    const result: GenerationResult = {
      success: true,
      message: `Generated ${generatedSlots.length} timetable entries${conflicts.length > 0 ? ` with ${conflicts.length} conflicts` : ''}`,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      timetable: generatedSlots
    };

    console.log('Generation completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Timetable generation error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})